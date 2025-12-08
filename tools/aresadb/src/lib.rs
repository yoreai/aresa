//! # AresaDB - High-Performance Multi-Model Database Engine
//!
//! AresaDB is a blazing-fast database that supports Key/Value, Graph,
//! and Relational data models through a unified property graph architecture.
//!
//! ## Features
//!
//! - **Multi-Model**: Store and query data as KV pairs, graphs, or relational tables
//! - **Pure SQL**: Standard SQL interface - use any LLM to generate queries from natural language
//! - **Blazing Fast**: Lock-free reads, parallel traversal, zero-copy serialization
//! - **Cloud-Ready**: Seamless sync between local storage and S3/GCS buckets
//! - **ACID Compliant**: Full transaction support with MVCC
//! - **Distributed**: Sharding, replication, and WAL for production deployments
//!
//! ## Architecture
//!
//! ```text
//! ┌─────────────────────────────────────────────────────────────────┐
//! │                         CLI / SDK                                │
//! ├─────────────────────────────────────────────────────────────────┤
//! │                      Query Engine                                │
//! │   ├── SQL Parser (sqlparser-rs)                                 │
//! │   ├── Query Planner & Optimizer                                 │
//! │   └── Parallel Graph Traversal                                  │
//! ├─────────────────────────────────────────────────────────────────┤
//! │                   Unified Storage Engine                         │
//! │   ├── Node Store (properties, indexes)                          │
//! │   ├── Edge Store (relationships, graph traversal)              │
//! │   └── MVCC Transaction Manager                                  │
//! ├─────────────────────────────────────────────────────────────────┤
//! │                   Distributed Layer (V2)                         │
//! │   ├── Sharding (consistent hashing)                             │
//! │   ├── Replication (leader election)                             │
//! │   └── Write-Ahead Log (crash recovery)                          │
//! ├─────────────────────────────────────────────────────────────────┤
//! │                    Storage Backends                              │
//! │   ├── Local: redb with B+ tree indexes                          │
//! │   └── Bucket: S3/GCS with caching                               │
//! └─────────────────────────────────────────────────────────────────┘
//! ```
//!
//! ## Quick Start
//!
//! ```rust,ignore
//! use aresadb::storage::Database;
//!
//! #[tokio::main]
//! async fn main() -> anyhow::Result<()> {
//!     // Create a new database
//!     let db = Database::create("./mydata", "myapp").await?;
//!
//!     // Insert a node
//!     let user = db.insert_node("user", serde_json::json!({
//!         "name": "Alice",
//!         "email": "alice@example.com"
//!     })).await?;
//!
//!     // Query nodes
//!     let users = db.get_all_by_type("user", Some(10)).await?;
//!
//!     Ok(())
//! }
//! ```
//!
//! ## SQL Interface
//!
//! AresaDB provides a standard SQL interface. Since external LLMs can generate
//! SQL from natural language (using schema documentation), there's no need for
//! built-in NLP - keeping the database focused and fast.
//!
//! ```sql
//! -- Create data
//! INSERT INTO users (name, email, age) VALUES ('Alice', 'alice@example.com', 30);
//!
//! -- Query data
//! SELECT * FROM users WHERE age > 25 ORDER BY name LIMIT 10;
//!
//! -- Update data
//! UPDATE users SET age = 31 WHERE name = 'Alice';
//!
//! -- Delete data
//! DELETE FROM users WHERE age < 18;
//! ```

#![warn(missing_docs)]
#![warn(rustdoc::missing_crate_level_docs)]

// Core modules
pub mod storage;
pub mod query;
pub mod schema;
pub mod output;
pub mod cli;

// V2: Distributed modules
pub mod distributed;

// RAG (Retrieval-Augmented Generation) utilities
pub mod rag;

// V2: Server/Client modules (behind feature flags)
#[cfg(feature = "server")]
pub mod server;

#[cfg(feature = "server")]
pub mod client;

// Re-exports for convenience
pub use storage::{
    Database, DatabaseConfig, DatabaseStatus,
    Node, Edge, NodeId, EdgeId, Value, Timestamp,
    LocalStorage, BucketStorage, CacheLayer,
    GraphView, KvView, SyncStats,
    ParallelExecutor, ParallelTraversalResult, SnapshotReader,
    VectorIndex, IndexStats,
};

pub use query::{
    QueryParser, QueryEngine, QueryResult, TraversalResult,
    ParsedQuery, QueryOperation, Condition, Operator, OrderBy,
};

pub use schema::{
    Schema, SchemaField, FieldType, SchemaManager,
    Migration, MigrationAction, MigrationGenerator,
};

pub use distributed::{
    BloomFilter, CountingBloomFilter,
    Compressor, CompressionStats,
    ShardManager, ShardConfig,
    WriteAheadLog, WalEntry, WalEntryType,
    ReplicaSet, ReplicaConfig, ReplicaState,
    ResultStream, StreamSender, Cursor,
};

pub use rag::{
    Chunker, ChunkStrategy, DocumentChunk,
    ContextRetriever, RetrievedContext, ContextChunk,
    EmbeddingManager, EmbeddingProvider, OpenAIModel,
    HybridSearch, HybridSearchConfig, HybridSearchResult,
};

#[cfg(feature = "server")]
pub use server::{Server, ServerConfig};

#[cfg(feature = "server")]
pub use client::{Client, ClientBuilder};

/// Database format version for compatibility checking
pub const FORMAT_VERSION: u32 = 1;

/// Maximum number of nodes to return in a single query by default
pub const DEFAULT_QUERY_LIMIT: usize = 1000;

/// Default cache size in bytes (100MB)
pub const DEFAULT_CACHE_SIZE: usize = 100 * 1024 * 1024;

/// Default number of shards
pub const DEFAULT_SHARD_COUNT: usize = 16;

/// Prelude module for convenient imports
pub mod prelude {
    //! Common types for working with AresaDB

    pub use crate::storage::{
        Database, Node, Edge, NodeId, EdgeId, Value, Timestamp,
    };

    pub use crate::query::{QueryEngine, QueryResult, TraversalResult};

    pub use crate::schema::{Schema, SchemaManager};

    pub use crate::distributed::{BloomFilter, Compressor, ShardManager};

    #[cfg(feature = "server")]
    pub use crate::{Server, Client};
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version() {
        assert_eq!(FORMAT_VERSION, 1);
    }

    #[test]
    fn test_constants() {
        assert!(DEFAULT_QUERY_LIMIT > 0);
        assert!(DEFAULT_CACHE_SIZE > 0);
        assert!(DEFAULT_SHARD_COUNT > 0);
    }
}
