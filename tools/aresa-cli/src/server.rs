//! ARESA Studio - Web Server
//!
//! Embedded Axum server that serves the React UI and provides REST API endpoints.

#[cfg(feature = "ui")]
pub mod ui_server {
    use anyhow::Result;
    use axum::{
        extract::{Path, State, WebSocketUpgrade, ws::WebSocket},
        http::StatusCode,
        response::{IntoResponse, Json},
        routing::{get, post, delete},
        Router,
    };
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;
    use std::sync::Arc;
    use tower_http::cors::{CorsLayer, Any};
    use tower_http::services::ServeDir;

    use crate::config::ConfigManager;
    use crate::connectors;
    use crate::terminal::pty_manager;
    use crate::history::HistoryTracker;
    use tokio::sync::RwLock;

    #[derive(Clone)]
    struct AppState {
        config: Arc<RwLock<ConfigManager>>,
        history: HistoryTracker,
    }

    #[derive(Serialize)]
    struct ConnectionInfo {
        name: String,
        #[serde(rename = "type")]
        connection_type: String,
        details: String,
        status: String,
    }

    #[derive(Deserialize)]
    struct QueryRequest {
        source: String,
        query: String,
        limit: Option<usize>,
    }

    #[derive(Serialize)]
    struct QueryResponse {
        columns: Vec<String>,
        rows: Vec<HashMap<String, String>>,
        #[serde(rename = "rowCount")]
        row_count: usize,
        #[serde(rename = "executionTimeMs")]
        execution_time_ms: u64,
    }

    /// Start the web server
    pub async fn serve(config: ConfigManager, port: u16) -> Result<()> {
        let state = AppState {
            config: Arc::new(RwLock::new(config)),
            history: HistoryTracker::new(),
        };

        // Determine the static file directory
        // aresa-studio is now in apps/aresa-studio (moved from tools/)
        // Paths: tools/aresa-cli/target/release/aresa -> ../../apps/aresa-studio/out
        let static_dir = std::env::current_exe()
            .ok()
            .and_then(|exe| exe.parent().map(|p| p.join("../../../../apps/aresa-studio/out")))
            .and_then(|p| p.canonicalize().ok())
            .unwrap_or_else(|| {
                // Fallback: try from current directory (when running from tools/aresa-cli)
                std::path::PathBuf::from("../../apps/aresa-studio/out")
                    .canonicalize()
                    .unwrap_or_else(|_| std::path::PathBuf::from("../../apps/aresa-studio/out"))
            });

        println!("📁 Serving static files from: {}", static_dir.display());

        let app = Router::new()
            // API routes
            .route("/api/connections", get(list_connections).post(add_connection))
            .route("/api/connections/:name", delete(remove_connection))
            .route("/api/connections/:name/ping", get(ping_connection))
            .route("/api/query", post(execute_query))
            .route("/api/history", get(get_history))
            .route("/api/history/search", get(search_history))
            .route("/api/schema/:source/tables", get(list_tables))
            .route("/api/schema/:source/tables/:table", get(get_table_schema))
            // WebSocket for terminal
            .route("/api/terminal", get(terminal_websocket))
            // Serve static files from Next.js build
            .nest_service("/", ServeDir::new(static_dir))
            .with_state(state)
            .layer(
                CorsLayer::new()
                    .allow_origin(Any)
                    .allow_methods(Any)
                    .allow_headers(Any),
            );

        let addr = format!("127.0.0.1:{}", port);
        println!("🌐 ARESA Studio running at http://{}", addr);
        println!("   Press Ctrl+C to stop");

        let listener = tokio::net::TcpListener::bind(&addr).await?;
        axum::serve(listener, app).await?;

        Ok(())
    }

    async fn list_connections(
        State(state): State<AppState>,
    ) -> Result<Json<Vec<ConnectionInfo>>, StatusCode> {
        let config = state.config.read().await;
        let connections: Vec<ConnectionInfo> = config
            .sources()
            .iter()
            .map(|(name, source)| ConnectionInfo {
                name: name.clone(),
                connection_type: format!("{:?}", source.source_type).to_lowercase(),
                details: format!("{:?}", source),
                status: "unknown".to_string(),
            })
            .collect();

        Ok(Json(connections))
    }

    async fn ping_connection(
        State(state): State<AppState>,
        Path(name): Path<String>,
    ) -> Result<Json<HashMap<String, serde_json::Value>>, StatusCode> {
        let start = std::time::Instant::now();
        let config = state.config.read().await;

        match config.test_connection(&name).await {
            Ok(_) => {
                let latency = start.elapsed().as_millis() as u64;
                let mut response = HashMap::new();
                response.insert("success".to_string(), serde_json::json!(true));
                response.insert("latencyMs".to_string(), serde_json::json!(latency));
                Ok(Json(response))
            }
            Err(e) => {
                let mut response = HashMap::new();
                response.insert("success".to_string(), serde_json::json!(false));
                response.insert("error".to_string(), serde_json::json!(e.to_string()));
                Ok(Json(response))
            }
        }
    }

    async fn execute_query(
        State(state): State<AppState>,
        Json(req): Json<QueryRequest>,
    ) -> Result<Json<QueryResponse>, (StatusCode, String)> {
        let start = std::time::Instant::now();

        // Get source config
        let config = state.config.read().await;
        let source = config.get_source(&req.source)
            .ok_or_else(|| (StatusCode::NOT_FOUND, format!("Source '{}' not found", req.source)))?
            .clone();
        drop(config); // Release lock early

        // Execute query based on source type
        let result = match source.source_type {
            crate::config::SourceType::Postgres => {
                let uri = source.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let connector = connectors::postgres::PostgresConnector::new(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                connector.execute_sql(&req.query, req.limit)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
            }
            crate::config::SourceType::BigQuery => {
                let project = source.project.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No project configured".to_string()))?;
                let connector = connectors::bigquery::BigQueryConnector::new(project, None)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                connector.execute_sql(&req.query, req.limit)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
            }
            crate::config::SourceType::MySQL => {
                let uri = source.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let connector = connectors::mysql::MySqlConnector::new(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                connector.execute_sql(&req.query, req.limit)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
            }
            crate::config::SourceType::SQLite | crate::config::SourceType::DuckDB => {
                let uri = source.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let connector = connectors::sqlite::SqliteConnector::new(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                connector.execute_sql(&req.query, req.limit)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
            }
            crate::config::SourceType::ClickHouse => {
                let host = source.host.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No host configured".to_string()))?;
                let port = source.port;
                let database = source.database.as_deref();
                let connector = connectors::clickhouse::ClickHouseConnector::new(
                    host,
                    port,
                    database,
                    source.username.as_deref(),
                    source.password.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                connector.execute_sql(&req.query, req.limit)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
            }
            crate::config::SourceType::Snowflake => {
                let account = source.account.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No account configured".to_string()))?;
                let username = source.username.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No username configured".to_string()))?;
                let password = source.password.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No password configured".to_string()))?;
                let warehouse = source.warehouse.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No warehouse configured".to_string()))?;
                let connector = connectors::snowflake::SnowflakeConnector::new(
                    account,
                    username,
                    password,
                    warehouse,
                    source.database.as_deref(),
                    source.schema.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                connector.execute_sql(&req.query, req.limit)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
            }
            crate::config::SourceType::Databricks => {
                let host = source.host.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No host configured".to_string()))?;
                let warehouse = source.warehouse.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No warehouse_id configured".to_string()))?;
                let token = source.token.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No token configured".to_string()))?;
                let connector = connectors::databricks::DatabricksConnector::new(
                    host,
                    warehouse,
                    token,
                    source.catalog.as_deref(),
                    source.schema.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                connector.execute_sql(&req.query, req.limit)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
            }
            _ => {
                Err((StatusCode::NOT_IMPLEMENTED, format!("Source type {:?} not yet supported in API", source.source_type)))
            }
        };

        let elapsed = start.elapsed();
        let duration_ms = elapsed.as_millis() as u64;

        match result {
            Ok((columns, rows)) => {
                // Track successful query
                state.history.add_entry(
                    req.source.clone(),
                    req.query.clone(),
                    true,
                    Some(duration_ms),
                    Some(rows.len()),
                    None,
                ).await;

                Ok(Json(QueryResponse {
                    columns,
                    row_count: rows.len(),
                    rows,
                    execution_time_ms: duration_ms,
                }))
            }
            Err((status, error)) => {
                // Track failed query
                state.history.add_entry(
                    req.source.clone(),
                    req.query.clone(),
                    false,
                    Some(duration_ms),
                    None,
                    Some(error.clone()),
                ).await;

                Err((status, error))
            }
        }
    }

    async fn get_history(
        State(state): State<AppState>,
    ) -> Json<Vec<crate::history::HistoryEntry>> {
        let limit = 50; // Default limit
        let history = state.history.get_history(limit).await;
        Json(history)
    }

    async fn search_history(
        State(state): State<AppState>,
        axum::extract::Query(params): axum::extract::Query<HashMap<String, String>>,
    ) -> Json<Vec<crate::history::HistoryEntry>> {
        let pattern = params.get("q").map(|s| s.as_str()).unwrap_or("");
        let history = state.history.search_history(pattern).await;
        Json(history)
    }

    async fn list_tables(
        State(state): State<AppState>,
        Path(source): Path<String>,
    ) -> Result<Json<Vec<HashMap<String, String>>>, (StatusCode, String)> {
        let config = state.config.read().await;
        let source_config = config.get_source(&source)
            .ok_or_else(|| (StatusCode::NOT_FOUND, format!("Source '{}' not found", source)))?
            .clone();
        drop(config); // Release lock early

        let mut tables = Vec::new();

        match source_config.source_type {
            crate::config::SourceType::Postgres => {
                let uri = source_config.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let connector = connectors::postgres::PostgresConnector::new(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                let query = "SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name";
                let (_, rows) = connector.execute_sql(query, Some(1000))
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for row in rows {
                    let mut table = HashMap::new();
                    table.insert("schema".to_string(), row.get("table_schema").cloned().unwrap_or_default());
                    table.insert("name".to_string(), row.get("table_name").cloned().unwrap_or_default());
                    table.insert("type".to_string(), row.get("table_type").cloned().unwrap_or_default());
                    tables.push(table);
                }
            }
            crate::config::SourceType::BigQuery => {
                let project = source_config.project.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No project configured".to_string()))?;
                let connector = connectors::bigquery::BigQueryConnector::new(project, None)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // Use BigQuery REST API to list datasets (avoids region issues with INFORMATION_SCHEMA)
                let datasets = connector.list_datasets()
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // For each dataset, list tables using dataset-level INFORMATION_SCHEMA
                for dataset in datasets.iter().take(10) {
                    let table_query = format!(
                        "SELECT table_schema, table_name, table_type FROM `{}`.`{}`.INFORMATION_SCHEMA.TABLES LIMIT 100",
                        project, dataset
                    );
                    if let Ok((_, rows)) = connector.execute_sql(&table_query, Some(100)).await {
                        for row in rows {
                            let mut table = HashMap::new();
                            table.insert("schema".to_string(), row.get("table_schema").cloned().unwrap_or_default());
                            table.insert("name".to_string(), row.get("table_name").cloned().unwrap_or_default());
                            table.insert("type".to_string(), row.get("table_type").cloned().unwrap_or_default());
                            tables.push(table);
                        }
                    }
                }
            }
            crate::config::SourceType::MySQL => {
                let uri = source_config.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let pool = sqlx::MySqlPool::connect(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                let rows: Vec<(String, String, String)> = sqlx::query_as(
                    "SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')"
                )
                .fetch_all(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for (schema, name, table_type) in rows {
                    let mut table = HashMap::new();
                    table.insert("schema".to_string(), schema);
                    table.insert("name".to_string(), name);
                    table.insert("type".to_string(), table_type);
                    tables.push(table);
                }
            }
            crate::config::SourceType::SQLite | crate::config::SourceType::DuckDB => {
                let uri = source_config.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let pool = sqlx::SqlitePool::connect(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                let rows: Vec<(String, String)> = sqlx::query_as(
                    "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'"
                )
                .fetch_all(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for (name, table_type) in rows {
                    let mut table = HashMap::new();
                    table.insert("schema".to_string(), "main".to_string());
                    table.insert("name".to_string(), name);
                    table.insert("type".to_string(), table_type);
                    tables.push(table);
                }
            }
            crate::config::SourceType::ClickHouse => {
                let host = source_config.host.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No host configured".to_string()))?;
                let port = source_config.port;
                let database = source_config.database.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No database configured".to_string()))?;

                let connector = connectors::clickhouse::ClickHouseConnector::new(
                    host,
                    port,
                    Some(database),
                    source_config.username.as_deref(),
                    source_config.password.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // List tables from the specified database
                let query = format!(
                    "SELECT database as schema, name, engine as type FROM system.tables WHERE database = '{}'",
                    database
                );
                let (_, rows) = connector.execute_sql(&query, Some(1000))
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for row in rows {
                    let mut table = HashMap::new();
                    table.insert("schema".to_string(), row.get("schema").cloned().unwrap_or_default());
                    table.insert("name".to_string(), row.get("name").cloned().unwrap_or_default());
                    // Map engine to table type
                    let engine = row.get("type").cloned().unwrap_or_default();
                    let table_type = if engine.contains("View") { "VIEW" } else { "BASE TABLE" };
                    table.insert("type".to_string(), table_type.to_string());
                    tables.push(table);
                }
            }
            crate::config::SourceType::Snowflake => {
                let account = source_config.account.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No account configured".to_string()))?;
                let username = source_config.username.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No username configured".to_string()))?;
                let password = source_config.password.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No password configured".to_string()))?;
                let warehouse = source_config.warehouse.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No warehouse configured".to_string()))?;
                let connector = connectors::snowflake::SnowflakeConnector::new(
                    account,
                    username,
                    password,
                    warehouse,
                    source_config.database.as_deref(),
                    source_config.schema.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // List tables
                let table_rows = connector.list_tables()
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for row in table_rows {
                    let mut table = HashMap::new();
                    table.insert("schema".to_string(), row.get("schema_name").cloned().unwrap_or_default());
                    table.insert("name".to_string(), row.get("name").cloned().unwrap_or_default());
                    table.insert("type".to_string(), "BASE TABLE".to_string());
                    tables.push(table);
                }

                // List views
                let view_rows = connector.list_views()
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for row in view_rows {
                    let mut table = HashMap::new();
                    table.insert("schema".to_string(), row.get("schema_name").cloned().unwrap_or_default());
                    table.insert("name".to_string(), row.get("name").cloned().unwrap_or_default());
                    table.insert("type".to_string(), "VIEW".to_string());
                    tables.push(table);
                }
            }
            crate::config::SourceType::Databricks => {
                let host = source_config.host.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No host configured".to_string()))?;
                let warehouse = source_config.warehouse.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No warehouse_id configured".to_string()))?;
                let token = source_config.token.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No token configured".to_string()))?;
                let connector = connectors::databricks::DatabricksConnector::new(
                    host,
                    warehouse,
                    token,
                    source_config.catalog.as_deref(),
                    source_config.schema.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                let table_rows = connector.list_tables()
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for row in table_rows {
                    let mut table = HashMap::new();
                    table.insert("schema".to_string(), row.get("database").or(row.get("namespace")).cloned().unwrap_or_default());
                    table.insert("name".to_string(), row.get("tableName").cloned().unwrap_or_default());
                    let is_temp = row.get("isTemporary").cloned().unwrap_or_default();
                    table.insert("type".to_string(), if is_temp == "true" { "VIEW" } else { "BASE TABLE" }.to_string());
                    tables.push(table);
                }
            }
            _ => {
                return Err((StatusCode::NOT_IMPLEMENTED, format!("Schema listing not yet implemented for {:?}", source_config.source_type)));
            }
        }

        Ok(Json(tables))
    }

    async fn get_table_schema(
        State(state): State<AppState>,
        Path((source, table)): Path<(String, String)>,
    ) -> Result<Json<Vec<HashMap<String, String>>>, (StatusCode, String)> {
        let config = state.config.read().await;
        let source_config = config.get_source(&source)
            .ok_or_else(|| (StatusCode::NOT_FOUND, format!("Source '{}' not found", source)))?
            .clone();
        drop(config); // Release lock early

        let mut columns = Vec::new();

        match source_config.source_type {
            crate::config::SourceType::Postgres => {
                let uri = source_config.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let connector = connectors::postgres::PostgresConnector::new(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // Parse schema.table or just table
                let (schema, table_name) = if table.contains('.') {
                    let parts: Vec<&str> = table.splitn(2, '.').collect();
                    (parts[0].to_string(), parts[1].to_string())
                } else {
                    ("public".to_string(), table)
                };

                let query = format!(
                    "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = '{}' AND table_name = '{}' ORDER BY ordinal_position",
                    schema, table_name
                );
                let (_, rows) = connector.execute_sql(&query, Some(1000))
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                columns = rows;
            }
            crate::config::SourceType::BigQuery => {
                let project = source_config.project.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No project configured".to_string()))?;
                let connector = connectors::bigquery::BigQueryConnector::new(project, None)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // Parse dataset.table
                let (dataset, table_name) = if table.contains('.') {
                    let parts: Vec<&str> = table.splitn(2, '.').collect();
                    (parts[0].to_string(), parts[1].to_string())
                } else {
                    return Err((StatusCode::BAD_REQUEST, "BigQuery table must be in format 'dataset.table'".to_string()));
                };

                let query = format!(
                    "SELECT column_name, data_type, is_nullable FROM `{}`.{}.INFORMATION_SCHEMA.COLUMNS WHERE table_name = '{}'",
                    project, dataset, table_name
                );
                let (_, rows) = connector.execute_sql(&query, Some(1000))
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                columns = rows;
            }
            crate::config::SourceType::MySQL => {
                let uri = source_config.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let pool = sqlx::MySqlPool::connect(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // Parse schema.table or just table
                let (schema, table_name) = if table.contains('.') {
                    let parts: Vec<&str> = table.splitn(2, '.').collect();
                    (parts[0].to_string(), parts[1].to_string())
                } else {
                    let db = source_config.database.as_ref()
                        .ok_or_else(|| (StatusCode::BAD_REQUEST, "No database configured".to_string()))?;
                    (db.clone(), table)
                };

                let rows: Vec<(String, String, String, Option<String>)> = sqlx::query_as(
                    "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position"
                )
                .bind(&schema)
                .bind(&table_name)
                .fetch_all(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for (col_name, data_type, nullable, default_val) in rows {
                    let mut col = HashMap::new();
                    col.insert("column_name".to_string(), col_name);
                    col.insert("data_type".to_string(), data_type);
                    col.insert("is_nullable".to_string(), nullable);
                    col.insert("column_default".to_string(), default_val.unwrap_or_else(|| "NULL".to_string()));
                    columns.push(col);
                }
            }
            crate::config::SourceType::SQLite | crate::config::SourceType::DuckDB => {
                let uri = source_config.uri.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No URI configured".to_string()))?;
                let pool = sqlx::SqlitePool::connect(uri)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // SQLite PRAGMA doesn't use schema prefix - extract just table name
                let table_name = if table.contains('.') {
                    table.splitn(2, '.').last().unwrap_or(&table)
                } else {
                    &table
                };

                let pragma_query = format!("PRAGMA table_info(\"{}\")", table_name);
                let rows: Vec<(i32, String, String, i32, Option<String>, i32)> = sqlx::query_as(&pragma_query)
                    .fetch_all(&pool)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for (_, name, data_type, not_null, default_val, _) in rows {
                    let mut col = HashMap::new();
                    col.insert("column_name".to_string(), name);
                    col.insert("data_type".to_string(), data_type);
                    col.insert("is_nullable".to_string(), if not_null == 0 { "YES".to_string() } else { "NO".to_string() });
                    col.insert("column_default".to_string(), default_val.unwrap_or_else(|| "NULL".to_string()));
                    columns.push(col);
                }
            }
            crate::config::SourceType::ClickHouse => {
                let host = source_config.host.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No host configured".to_string()))?;
                let port = source_config.port;
                let database = source_config.database.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No database configured".to_string()))?;

                let connector = connectors::clickhouse::ClickHouseConnector::new(
                    host,
                    port,
                    Some(database),
                    source_config.username.as_deref(),
                    source_config.password.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                // Parse database.table or just table
                let table_name = if table.contains('.') {
                    table.splitn(2, '.').last().unwrap_or(&table)
                } else {
                    &table
                };

                let query = format!(
                    "SELECT name as column_name, type as data_type, 'YES' as is_nullable FROM system.columns WHERE database = '{}' AND table = '{}'",
                    database, table_name
                );
                let (_, rows) = connector.execute_sql(&query, Some(1000))
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                columns = rows;
            }
            crate::config::SourceType::Snowflake => {
                let account = source_config.account.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No account configured".to_string()))?;
                let username = source_config.username.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No username configured".to_string()))?;
                let password = source_config.password.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No password configured".to_string()))?;
                let warehouse = source_config.warehouse.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No warehouse configured".to_string()))?;
                let connector = connectors::snowflake::SnowflakeConnector::new(
                    account,
                    username,
                    password,
                    warehouse,
                    source_config.database.as_deref(),
                    source_config.schema.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                let rows = connector.describe_table(&table)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for row in rows {
                    let mut col = HashMap::new();
                    col.insert("column_name".to_string(), row.get("name").cloned().unwrap_or_default());
                    col.insert("data_type".to_string(), row.get("type").cloned().unwrap_or_default());
                    col.insert("is_nullable".to_string(), row.get("null?").cloned().unwrap_or("YES".to_string()));
                    columns.push(col);
                }
            }
            crate::config::SourceType::Databricks => {
                let host = source_config.host.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No host configured".to_string()))?;
                let warehouse = source_config.warehouse.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No warehouse_id configured".to_string()))?;
                let token = source_config.token.as_ref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "No token configured".to_string()))?;
                let connector = connectors::databricks::DatabricksConnector::new(
                    host,
                    warehouse,
                    token,
                    source_config.catalog.as_deref(),
                    source_config.schema.as_deref(),
                ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                let rows = connector.describe_table(&table)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

                for row in rows {
                    let mut col = HashMap::new();
                    col.insert("column_name".to_string(), row.get("col_name").cloned().unwrap_or_default());
                    col.insert("data_type".to_string(), row.get("data_type").cloned().unwrap_or_default());
                    col.insert("is_nullable".to_string(), "YES".to_string());
                    columns.push(col);
                }
            }
            _ => {
                return Err((StatusCode::NOT_IMPLEMENTED, format!("Table schema not yet implemented for {:?}", source_config.source_type)));
            }
        }

        Ok(Json(columns))
    }

    // ==================== Connection Management ====================

    #[derive(Deserialize)]
    struct AddConnectionRequest {
        name: String,
        #[serde(rename = "type")]
        connection_type: String,
        // For SQL databases
        uri: Option<String>,
        // For BigQuery
        project: Option<String>,
        // For ClickHouse
        host: Option<String>,
        port: Option<u16>,
        database: Option<String>,
    }

    async fn add_connection(
        State(state): State<AppState>,
        Json(req): Json<AddConnectionRequest>,
    ) -> Result<Json<HashMap<String, String>>, (StatusCode, String)> {
        // Validate name
        if req.name.trim().is_empty() {
            return Err((StatusCode::BAD_REQUEST, "Connection name is required".to_string()));
        }

        // Get write lock
        let config = state.config.read().await;

        // Check if name already exists
        if config.get_source(&req.name).is_some() {
            return Err((StatusCode::CONFLICT, format!("Connection '{}' already exists", req.name)));
        }

        // Add the source based on type
        let result = match req.connection_type.to_lowercase().as_str() {
            "postgres" | "mysql" | "sqlite" | "duckdb" => {
                let uri = req.uri.as_deref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "URI is required for this database type".to_string()))?;
                config.add_source(&req.name, &req.connection_type, Some(uri), None, None, None)
            }
            "bigquery" => {
                let project = req.project.as_deref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "Project ID is required for BigQuery".to_string()))?;
                config.add_source(&req.name, "bigquery", None, Some(project), None, None)
            }
            "clickhouse" => {
                let host = req.host.as_deref()
                    .ok_or_else(|| (StatusCode::BAD_REQUEST, "Host is required for ClickHouse".to_string()))?;
                config.add_source_full(
                    &req.name,
                    "clickhouse",
                    None,
                    None,
                    None,
                    None,
                    Some(host),
                    req.port,
                    None,
                )
            }
            _ => {
                return Err((StatusCode::BAD_REQUEST, format!("Unknown connection type: {}", req.connection_type)));
            }
        };

        result.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        // Reload config to pick up changes
        drop(config);
        let mut config = state.config.write().await;
        *config = ConfigManager::load().map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let mut response = HashMap::new();
        response.insert("success".to_string(), "true".to_string());
        response.insert("message".to_string(), format!("Connection '{}' added successfully", req.name));
        Ok(Json(response))
    }

    async fn remove_connection(
        State(state): State<AppState>,
        Path(name): Path<String>,
    ) -> Result<Json<HashMap<String, String>>, (StatusCode, String)> {
        let config = state.config.read().await;

        // Check if exists
        if config.get_source(&name).is_none() {
            return Err((StatusCode::NOT_FOUND, format!("Connection '{}' not found", name)));
        }

        // Remove it
        config.remove_source(&name)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        // Reload config
        drop(config);
        let mut config = state.config.write().await;
        *config = ConfigManager::load().map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let mut response = HashMap::new();
        response.insert("success".to_string(), "true".to_string());
        response.insert("message".to_string(), format!("Connection '{}' removed successfully", name));
        Ok(Json(response))
    }

    /// WebSocket handler for terminal
    async fn terminal_websocket(
        ws: WebSocketUpgrade,
    ) -> impl IntoResponse {
        ws.on_upgrade(handle_terminal_socket)
    }

    async fn handle_terminal_socket(socket: WebSocket) {
        if let Err(e) = pty_manager::handle_terminal_ws(socket).await {
            eprintln!("Terminal WebSocket error: {}", e);
        }
    }
}

#[cfg(not(feature = "ui"))]
pub mod ui_server {
    use anyhow::Result;
    use crate::config::ConfigManager;

    pub async fn serve(_config: ConfigManager, _port: u16) -> Result<()> {
        anyhow::bail!("UI feature not enabled. Rebuild with: cargo build --features ui")
    }
}

