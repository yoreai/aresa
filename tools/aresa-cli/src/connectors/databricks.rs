//! Databricks connector
//!
//! Connect to Databricks SQL Warehouse via REST API.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Databricks connector using SQL Statement Execution API
pub struct DatabricksConnector {
    host: String,
    warehouse_id: String,
    token: String,
    catalog: Option<String>,
    schema: Option<String>,
    client: reqwest::Client,
}

#[derive(Serialize)]
struct StatementRequest {
    statement: String,
    warehouse_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    catalog: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    schema: Option<String>,
    wait_timeout: String,
    on_wait_timeout: String,
}

#[derive(Deserialize, Debug)]
struct StatementResponse {
    statement_id: Option<String>,
    status: StatementStatus,
    manifest: Option<Manifest>,
    result: Option<StatementResult>,
}

#[derive(Deserialize, Debug)]
struct StatementStatus {
    state: String,
    error: Option<ErrorInfo>,
}

#[derive(Deserialize, Debug)]
struct ErrorInfo {
    message: String,
    error_code: Option<String>,
}

#[derive(Deserialize, Debug)]
struct Manifest {
    schema: ManifestSchema,
    total_row_count: Option<i64>,
}

#[derive(Deserialize, Debug)]
struct ManifestSchema {
    columns: Vec<ColumnSchema>,
}

#[derive(Deserialize, Debug)]
struct ColumnSchema {
    name: String,
    type_name: String,
    #[serde(default)]
    _nullable: bool,
}

#[derive(Deserialize, Debug)]
struct StatementResult {
    data_array: Option<Vec<Vec<serde_json::Value>>>,
}

impl DatabricksConnector {
    /// Create a new Databricks connector
    ///
    /// # Arguments
    /// * `host` - Databricks workspace host (e.g., "adb-1234567890.1.azuredatabricks.net")
    /// * `warehouse_id` - SQL Warehouse ID
    /// * `token` - Personal Access Token
    /// * `catalog` - Optional Unity Catalog name
    /// * `schema` - Optional default schema
    pub async fn new(
        host: &str,
        warehouse_id: &str,
        token: &str,
        catalog: Option<&str>,
        schema: Option<&str>,
    ) -> Result<Self> {
        let connector = Self {
            host: host.trim_end_matches('/').to_string(),
            warehouse_id: warehouse_id.to_string(),
            token: token.to_string(),
            catalog: catalog.map(String::from),
            schema: schema.map(String::from),
            client: reqwest::Client::new(),
        };

        // Test connection
        connector.test_connection().await?;

        Ok(connector)
    }

    /// Get the SQL Statement API URL
    fn api_url(&self) -> String {
        format!(
            "https://{}/api/2.0/sql/statements",
            self.host
        )
    }

    /// Execute a SQL query
    pub async fn execute_sql(
        &self,
        query: &str,
        limit: Option<usize>,
    ) -> Result<(Vec<String>, Vec<HashMap<String, String>>)> {
        // Add LIMIT if specified
        let query = if let Some(limit) = limit {
            if !query.to_lowercase().contains("limit") {
                format!("{} LIMIT {}", query.trim_end_matches(';'), limit)
            } else {
                query.to_string()
            }
        } else {
            query.to_string()
        };

        let request_body = StatementRequest {
            statement: query,
            warehouse_id: self.warehouse_id.clone(),
            catalog: self.catalog.clone(),
            schema: self.schema.clone(),
            wait_timeout: "30s".to_string(),
            on_wait_timeout: "CANCEL".to_string(),
        };

        let response = self
            .client
            .post(&self.api_url())
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await
            .context("Failed to send request to Databricks")?;

        if !response.status().is_success() {
            let status = response.status();
            let error = response.text().await.unwrap_or_default();
            anyhow::bail!("Databricks API error ({}): {}", status, error);
        }

        let result: StatementResponse = response
            .json()
            .await
            .context("Failed to parse Databricks response")?;

        // Check for errors
        if result.status.state == "FAILED" {
            if let Some(error) = result.status.error {
                anyhow::bail!(
                    "Databricks SQL error{}: {}",
                    error.error_code.map(|c| format!(" ({})", c)).unwrap_or_default(),
                    error.message
                );
            }
            anyhow::bail!("Databricks query failed");
        }

        // Handle pending state - poll for results
        if result.status.state == "PENDING" || result.status.state == "RUNNING" {
            if let Some(statement_id) = result.statement_id {
                return self.poll_statement(&statement_id).await;
            }
        }

        // Extract columns
        let columns: Vec<String> = result
            .manifest
            .as_ref()
            .map(|m| m.schema.columns.iter().map(|c| c.name.clone()).collect())
            .unwrap_or_default();

        // Convert data to string map
        let rows: Vec<HashMap<String, String>> = result
            .result
            .and_then(|r| r.data_array)
            .unwrap_or_default()
            .into_iter()
            .map(|row| {
                columns
                    .iter()
                    .zip(row.iter())
                    .map(|(col, val)| {
                        let value = match val {
                            serde_json::Value::String(s) => s.clone(),
                            serde_json::Value::Number(n) => n.to_string(),
                            serde_json::Value::Bool(b) => b.to_string(),
                            serde_json::Value::Null => "NULL".to_string(),
                            _ => val.to_string(),
                        };
                        (col.clone(), value)
                    })
                    .collect()
            })
            .collect();

        Ok((columns, rows))
    }

    /// Poll for statement results
    async fn poll_statement(
        &self,
        statement_id: &str,
    ) -> Result<(Vec<String>, Vec<HashMap<String, String>>)> {
        let url = format!("{}/{}", self.api_url(), statement_id);

        // Poll up to 60 times (30 seconds with 500ms intervals)
        for _ in 0..60 {
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

            let response = self
                .client
                .get(&url)
                .header("Authorization", format!("Bearer {}", self.token))
                .send()
                .await?;

            if !response.status().is_success() {
                continue;
            }

            let result: StatementResponse = response.json().await?;

            match result.status.state.as_str() {
                "SUCCEEDED" => {
                    let columns: Vec<String> = result
                        .manifest
                        .as_ref()
                        .map(|m| m.schema.columns.iter().map(|c| c.name.clone()).collect())
                        .unwrap_or_default();

                    let rows: Vec<HashMap<String, String>> = result
                        .result
                        .and_then(|r| r.data_array)
                        .unwrap_or_default()
                        .into_iter()
                        .map(|row| {
                            columns
                                .iter()
                                .zip(row.iter())
                                .map(|(col, val)| {
                                    let value = match val {
                                        serde_json::Value::String(s) => s.clone(),
                                        serde_json::Value::Number(n) => n.to_string(),
                                        serde_json::Value::Bool(b) => b.to_string(),
                                        serde_json::Value::Null => "NULL".to_string(),
                                        _ => val.to_string(),
                                    };
                                    (col.clone(), value)
                                })
                                .collect()
                        })
                        .collect();

                    return Ok((columns, rows));
                }
                "FAILED" | "CANCELED" | "CLOSED" => {
                    if let Some(error) = result.status.error {
                        anyhow::bail!("Databricks query failed: {}", error.message);
                    }
                    anyhow::bail!("Databricks query failed with state: {}", result.status.state);
                }
                _ => continue,
            }
        }

        anyhow::bail!("Databricks query timed out")
    }

    /// Test connection
    pub async fn test_connection(&self) -> Result<()> {
        self.execute_sql("SELECT 1", None).await?;
        Ok(())
    }

    /// List catalogs (Unity Catalog)
    pub async fn list_catalogs(&self) -> Result<Vec<String>> {
        let (_, rows) = self.execute_sql("SHOW CATALOGS", None).await?;
        Ok(rows
            .into_iter()
            .filter_map(|r| r.get("catalog").cloned())
            .collect())
    }

    /// List schemas in current catalog
    pub async fn list_schemas(&self) -> Result<Vec<String>> {
        let (_, rows) = self.execute_sql("SHOW SCHEMAS", None).await?;
        Ok(rows
            .into_iter()
            .filter_map(|r| r.get("databaseName").or(r.get("namespace")).cloned())
            .collect())
    }

    /// List tables in current schema
    pub async fn list_tables(&self) -> Result<Vec<HashMap<String, String>>> {
        let (_, rows) = self.execute_sql("SHOW TABLES", None).await?;
        Ok(rows)
    }

    /// Get table schema
    pub async fn describe_table(&self, table: &str) -> Result<Vec<HashMap<String, String>>> {
        let (_, rows) = self
            .execute_sql(&format!("DESCRIBE TABLE {}", table), None)
            .await?;
        Ok(rows)
    }

    /// Get current catalog
    pub fn catalog(&self) -> Option<&str> {
        self.catalog.as_deref()
    }

    /// Get current schema
    pub fn schema(&self) -> Option<&str> {
        self.schema.as_deref()
    }
}






