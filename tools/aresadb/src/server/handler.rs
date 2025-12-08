//! Request Handler
//!
//! Processes incoming requests and interacts with storage.

use anyhow::Result;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};

use super::protocol::{Request, Response, ErrorCode};
use crate::storage::{Database, Node, Edge, Value};
use crate::distributed::ShardManager;

/// Request handler for processing client requests
pub struct RequestHandler {
    /// Database (single node mode)
    db: Option<Database>,
    /// Shard manager (distributed mode)
    shards: Option<ShardManager>,
    /// Active transactions
    transactions: RwLock<HashMap<u64, Transaction>>,
    /// Transaction ID counter
    tx_counter: AtomicU64,
}

struct Transaction {
    // For future use with actual transaction support
    #[allow(dead_code)]
    started_at: std::time::Instant,
}

impl RequestHandler {
    /// Create handler with a database
    pub fn new(db: Database) -> Self {
        Self {
            db: Some(db),
            shards: None,
            transactions: RwLock::new(HashMap::new()),
            tx_counter: AtomicU64::new(1),
        }
    }

    /// Create handler with shards
    pub fn with_shards(shards: ShardManager) -> Self {
        Self {
            db: None,
            shards: Some(shards),
            transactions: RwLock::new(HashMap::new()),
            tx_counter: AtomicU64::new(1),
        }
    }

    /// Handle a request
    pub async fn handle(&self, request: Request) -> Response {
        match request {
            Request::Ping => Response::Pong,
            Request::Disconnect => Response::Goodbye,

            Request::InsertNode { node_type, properties } => {
                self.handle_insert_node(&node_type, properties).await
            }

            Request::GetNode { id } => {
                self.handle_get_node(&id).await
            }

            Request::UpdateNode { id, properties } => {
                self.handle_update_node(&id, properties).await
            }

            Request::DeleteNode { id } => {
                self.handle_delete_node(&id).await
            }

            Request::GetNodesByType { node_type, limit } => {
                self.handle_get_nodes_by_type(&node_type, limit).await
            }

            Request::CreateEdge { from_id, to_id, edge_type, properties } => {
                self.handle_create_edge(&from_id, &to_id, &edge_type, properties).await
            }

            Request::GetEdgesFrom { node_id, edge_type } => {
                self.handle_get_edges_from(&node_id, edge_type.as_deref()).await
            }

            Request::GetEdgesTo { node_id, edge_type } => {
                self.handle_get_edges_to(&node_id, edge_type.as_deref()).await
            }

            Request::DeleteEdge { edge_id } => {
                self.handle_delete_edge(&edge_id).await
            }

            Request::Query { sql, limit } => {
                self.handle_query(&sql, limit).await
            }

            Request::Traverse { start_id, depth, edge_types } => {
                self.handle_traverse(&start_id, depth, edge_types).await
            }

            Request::Status => {
                self.handle_status().await
            }

            Request::BeginTransaction => {
                self.handle_begin_transaction()
            }

            Request::CommitTransaction { tx_id } => {
                self.handle_commit_transaction(tx_id)
            }

            Request::RollbackTransaction { tx_id } => {
                self.handle_rollback_transaction(tx_id)
            }
        }
    }

    async fn handle_insert_node(&self, node_type: &str, properties: Value) -> Response {
        let props_json = properties.to_json();

        let result = if let Some(ref db) = self.db {
            db.insert_node(node_type, props_json).await
        } else if let Some(ref shards) = self.shards {
            let node = Node::new(node_type, properties);
            shards.insert_node(&node).await.map(|_| node)
        } else {
            return Response::error(ErrorCode::InternalError, "No storage configured");
        };

        match result {
            Ok(node) => Response::Node(node),
            Err(e) => Response::error(ErrorCode::InternalError, e.to_string()),
        }
    }

    async fn handle_get_node(&self, id: &str) -> Response {
        let result = if let Some(ref db) = self.db {
            db.get_node(id).await
        } else if let Some(ref shards) = self.shards {
            match crate::storage::NodeId::parse(id) {
                Ok(node_id) => shards.get_node(&node_id).await,
                Err(e) => return Response::error(ErrorCode::InvalidRequest, e.to_string()),
            }
        } else {
            return Response::error(ErrorCode::InternalError, "No storage configured");
        };

        match result {
            Ok(node) => Response::MaybeNode(node),
            Err(e) => Response::error(ErrorCode::InternalError, e.to_string()),
        }
    }

    async fn handle_update_node(&self, id: &str, properties: Value) -> Response {
        let props_json = properties.to_json();

        let result = if let Some(ref db) = self.db {
            db.update_node(id, props_json).await
        } else if let Some(ref shards) = self.shards {
            match crate::storage::NodeId::parse(id) {
                Ok(node_id) => shards.update_node(&node_id, properties).await,
                Err(e) => return Response::error(ErrorCode::InvalidRequest, e.to_string()),
            }
        } else {
            return Response::error(ErrorCode::InternalError, "No storage configured");
        };

        match result {
            Ok(node) => Response::Node(node),
            Err(e) => Response::error(ErrorCode::NodeNotFound, e.to_string()),
        }
    }

    async fn handle_delete_node(&self, id: &str) -> Response {
        let result = if let Some(ref db) = self.db {
            db.delete_node(id).await
        } else if let Some(ref shards) = self.shards {
            match crate::storage::NodeId::parse(id) {
                Ok(node_id) => shards.delete_node(&node_id).await,
                Err(e) => return Response::error(ErrorCode::InvalidRequest, e.to_string()),
            }
        } else {
            return Response::error(ErrorCode::InternalError, "No storage configured");
        };

        match result {
            Ok(_) => Response::Ok,
            Err(e) => Response::error(ErrorCode::NodeNotFound, e.to_string()),
        }
    }

    async fn handle_get_nodes_by_type(&self, node_type: &str, limit: Option<usize>) -> Response {
        let result = if let Some(ref db) = self.db {
            db.get_all_by_type(node_type, limit).await
        } else if let Some(ref shards) = self.shards {
            shards.get_nodes_by_type(node_type, limit).await
        } else {
            return Response::error(ErrorCode::InternalError, "No storage configured");
        };

        match result {
            Ok(nodes) => Response::Nodes(nodes),
            Err(e) => Response::error(ErrorCode::InternalError, e.to_string()),
        }
    }

    async fn handle_create_edge(
        &self,
        from_id: &str,
        to_id: &str,
        edge_type: &str,
        properties: Option<Value>,
    ) -> Response {
        let props_json = properties.map(|p| p.to_json());

        let result = if let Some(ref db) = self.db {
            db.create_edge(from_id, to_id, edge_type, props_json).await
        } else if let Some(ref shards) = self.shards {
            let from = match crate::storage::NodeId::parse(from_id) {
                Ok(id) => id,
                Err(e) => return Response::error(ErrorCode::InvalidRequest, e.to_string()),
            };
            let to = match crate::storage::NodeId::parse(to_id) {
                Ok(id) => id,
                Err(e) => return Response::error(ErrorCode::InvalidRequest, e.to_string()),
            };
            let edge = Edge::new(from, to, edge_type, properties.unwrap_or(Value::Null));
            shards.insert_edge(&edge).await.map(|_| edge)
        } else {
            return Response::error(ErrorCode::InternalError, "No storage configured");
        };

        match result {
            Ok(edge) => Response::Edge(edge),
            Err(e) => Response::error(ErrorCode::InternalError, e.to_string()),
        }
    }

    async fn handle_get_edges_from(&self, node_id: &str, edge_type: Option<&str>) -> Response {
        let result = if let Some(ref db) = self.db {
            db.get_edges_from(node_id, edge_type).await
        } else if let Some(ref shards) = self.shards {
            match crate::storage::NodeId::parse(node_id) {
                Ok(id) => shards.get_edges_from(&id, edge_type).await,
                Err(e) => return Response::error(ErrorCode::InvalidRequest, e.to_string()),
            }
        } else {
            return Response::error(ErrorCode::InternalError, "No storage configured");
        };

        match result {
            Ok(edges) => Response::Edges(edges),
            Err(e) => Response::error(ErrorCode::InternalError, e.to_string()),
        }
    }

    async fn handle_get_edges_to(&self, node_id: &str, edge_type: Option<&str>) -> Response {
        let result = if let Some(ref db) = self.db {
            db.get_edges_to(node_id, edge_type).await
        } else {
            return Response::error(ErrorCode::InternalError, "Sharded mode doesn't support edges_to");
        };

        match result {
            Ok(edges) => Response::Edges(edges),
            Err(e) => Response::error(ErrorCode::InternalError, e.to_string()),
        }
    }

    async fn handle_delete_edge(&self, _edge_id: &str) -> Response {
        // TODO: Implement edge deletion
        Response::error(ErrorCode::InternalError, "Not implemented")
    }

    async fn handle_query(&self, _sql: &str, _limit: Option<usize>) -> Response {
        // TODO: Implement query execution
        Response::error(ErrorCode::InternalError, "Query execution not implemented")
    }

    async fn handle_traverse(
        &self,
        _start_id: &str,
        _depth: u32,
        _edge_types: Option<Vec<String>>,
    ) -> Response {
        // TODO: Implement traversal
        Response::error(ErrorCode::InternalError, "Traversal not implemented")
    }

    async fn handle_status(&self) -> Response {
        if let Some(ref db) = self.db {
            match db.status().await {
                Ok(status) => Response::Status {
                    name: status.name,
                    node_count: status.node_count,
                    edge_count: status.edge_count,
                    size_bytes: status.size_bytes,
                },
                Err(e) => Response::error(ErrorCode::InternalError, e.to_string()),
            }
        } else if let Some(ref shards) = self.shards {
            match shards.stats().await {
                Ok(stats) => Response::Status {
                    name: "sharded".to_string(),
                    node_count: stats.total_nodes,
                    edge_count: stats.total_edges,
                    size_bytes: stats.total_size,
                },
                Err(e) => Response::error(ErrorCode::InternalError, e.to_string()),
            }
        } else {
            Response::error(ErrorCode::InternalError, "No storage configured")
        }
    }

    fn handle_begin_transaction(&self) -> Response {
        let tx_id = self.tx_counter.fetch_add(1, Ordering::SeqCst);
        self.transactions.write().insert(tx_id, Transaction {
            started_at: std::time::Instant::now(),
        });
        Response::TransactionStarted { tx_id }
    }

    fn handle_commit_transaction(&self, tx_id: u64) -> Response {
        if self.transactions.write().remove(&tx_id).is_some() {
            Response::TransactionCommitted
        } else {
            Response::error(ErrorCode::TransactionError, "Transaction not found")
        }
    }

    fn handle_rollback_transaction(&self, tx_id: u64) -> Response {
        if self.transactions.write().remove(&tx_id).is_some() {
            Response::TransactionRolledBack
        } else {
            Response::error(ErrorCode::TransactionError, "Transaction not found")
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_handler_ping() {
        let temp = TempDir::new().unwrap();
        let db = Database::create(temp.path(), "test").await.unwrap();
        let handler = RequestHandler::new(db);

        let response = handler.handle(Request::Ping).await;
        assert!(matches!(response, Response::Pong));
    }

    #[tokio::test]
    async fn test_handler_insert_get_node() {
        let temp = TempDir::new().unwrap();
        let db = Database::create(temp.path(), "test").await.unwrap();
        let handler = RequestHandler::new(db);

        // Insert
        let response = handler.handle(Request::InsertNode {
            node_type: "user".to_string(),
            properties: Value::from_json(serde_json::json!({"name": "Alice"})).unwrap(),
        }).await;

        let node_id = match response {
            Response::Node(node) => node.id.to_string(),
            _ => panic!("Expected Node response"),
        };

        // Get
        let response = handler.handle(Request::GetNode { id: node_id }).await;
        match response {
            Response::MaybeNode(Some(node)) => {
                assert_eq!(node.node_type, "user");
            }
            _ => panic!("Expected MaybeNode response"),
        }
    }

    #[tokio::test]
    async fn test_handler_transaction() {
        let temp = TempDir::new().unwrap();
        let db = Database::create(temp.path(), "test").await.unwrap();
        let handler = RequestHandler::new(db);

        // Begin
        let response = handler.handle(Request::BeginTransaction).await;
        let tx_id = match response {
            Response::TransactionStarted { tx_id } => tx_id,
            _ => panic!("Expected TransactionStarted response"),
        };

        // Commit
        let response = handler.handle(Request::CommitTransaction { tx_id }).await;
        assert!(matches!(response, Response::TransactionCommitted));
    }
}
