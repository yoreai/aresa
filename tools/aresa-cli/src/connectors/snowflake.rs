//! Snowflake connector
//!
//! Connect to Snowflake data warehouse via REST API.

use anyhow::{Context, Result};
use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Snowflake connector using SQL REST API
pub struct SnowflakeConnector {
    account: String,
    warehouse: String,
    database: Option<String>,
    schema: Option<String>,
    token: String,
    client: reqwest::Client,
}

#[derive(Serialize)]
struct SnowflakeRequest {
    statement: String,
    timeout: u32,
    database: Option<String>,
    schema: Option<String>,
    warehouse: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    parameters: Option<HashMap<String, String>>,
}

#[derive(Deserialize, Debug)]
struct SnowflakeResponse {
    #[serde(rename = "resultSetMetaData")]
    result_set_meta_data: Option<ResultSetMetaData>,
    data: Option<Vec<Vec<serde_json::Value>>>,
    code: Option<String>,
    message: Option<String>,
    #[serde(rename = "statementHandle")]
    statement_handle: Option<String>,
    #[serde(rename = "statementStatusUrl")]
    _statement_status_url: Option<String>,
}

#[derive(Deserialize, Debug)]
struct ResultSetMetaData {
    #[serde(rename = "numRows")]
    _num_rows: Option<i64>,
    #[serde(rename = "rowType")]
    row_type: Vec<ColumnType>,
}

#[derive(Deserialize, Debug)]
struct ColumnType {
    name: String,
    #[serde(rename = "type")]
    _data_type: String,
    nullable: bool,
}

impl SnowflakeConnector {
    /// Create a new Snowflake connector
    ///
    /// # Arguments
    /// * `account` - Snowflake account identifier (e.g., "xy12345.us-east-1")
    /// * `username` - Snowflake username
    /// * `password` - Snowflake password
    /// * `warehouse` - Compute warehouse name
    /// * `database` - Optional default database
    /// * `schema` - Optional default schema
    pub async fn new(
        account: &str,
        username: &str,
        password: &str,
        warehouse: &str,
        database: Option<&str>,
        schema: Option<&str>,
    ) -> Result<Self> {
        // Get OAuth token via key-pair or password authentication
        let token = Self::get_token(account, username, password).await?;

        let connector = Self {
            account: account.to_string(),
            warehouse: warehouse.to_string(),
            database: database.map(String::from),
            schema: schema.map(String::from),
            token,
            client: reqwest::Client::new(),
        };

        // Test connection
        connector.test_connection().await?;

        Ok(connector)
    }

    /// Get authentication token
    async fn get_token(account: &str, username: &str, password: &str) -> Result<String> {
        let client = reqwest::Client::new();
        let url = format!(
            "https://{}.snowflakecomputing.com/oauth/token-request",
            account
        );

        // Use Basic auth to get a session token
        let auth = STANDARD.encode(format!("{}:{}", username, password));

        let response = client
            .post(&url)
            .header("Authorization", format!("Basic {}", auth))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body("grant_type=password")
            .send()
            .await;

        // If OAuth endpoint doesn't work, fall back to session token approach
        match response {
            Ok(resp) if resp.status().is_success() => {
                let json: serde_json::Value = resp.json().await?;
                Ok(json["access_token"]
                    .as_str()
                    .unwrap_or("")
                    .to_string())
            }
            _ => {
                // Fall back to using Basic auth directly with the SQL API
                Ok(STANDARD.encode(format!("{}:{}", username, password)))
            }
        }
    }

    /// Get the SQL API URL
    fn api_url(&self) -> String {
        format!(
            "https://{}.snowflakecomputing.com/api/v2/statements",
            self.account
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

        let request_body = SnowflakeRequest {
            statement: query,
            timeout: 60,
            database: self.database.clone(),
            schema: self.schema.clone(),
            warehouse: self.warehouse.clone(),
            parameters: None,
        };

        let response = self
            .client
            .post(&self.api_url())
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .header("X-Snowflake-Authorization-Token-Type", "KEYPAIR_JWT")
            .json(&request_body)
            .send()
            .await
            .context("Failed to send request to Snowflake")?;

        if !response.status().is_success() {
            let status = response.status();
            let error = response.text().await.unwrap_or_default();
            anyhow::bail!("Snowflake API error ({}): {}", status, error);
        }

        let result: SnowflakeResponse = response
            .json()
            .await
            .context("Failed to parse Snowflake response")?;

        // Check for error
        if let Some(code) = &result.code {
            if code != "090001" && code != "000000" {
                anyhow::bail!(
                    "Snowflake error ({}): {}",
                    code,
                    result.message.unwrap_or_default()
                );
            }
        }

        // Extract columns
        let columns: Vec<String> = result
            .result_set_meta_data
            .as_ref()
            .map(|meta| meta.row_type.iter().map(|c| c.name.clone()).collect())
            .unwrap_or_default();

        // Convert data to string map
        let rows: Vec<HashMap<String, String>> = result
            .data
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

    /// Test connection
    pub async fn test_connection(&self) -> Result<()> {
        self.execute_sql("SELECT 1", None).await?;
        Ok(())
    }

    /// List databases
    pub async fn list_databases(&self) -> Result<Vec<String>> {
        let (_, rows) = self.execute_sql("SHOW DATABASES", None).await?;
        Ok(rows
            .into_iter()
            .filter_map(|r| r.get("name").cloned())
            .collect())
    }

    /// List schemas in current database
    pub async fn list_schemas(&self) -> Result<Vec<String>> {
        let (_, rows) = self.execute_sql("SHOW SCHEMAS", None).await?;
        Ok(rows
            .into_iter()
            .filter_map(|r| r.get("name").cloned())
            .collect())
    }

    /// List tables in current schema
    pub async fn list_tables(&self) -> Result<Vec<HashMap<String, String>>> {
        let (_, rows) = self.execute_sql("SHOW TABLES", None).await?;
        Ok(rows)
    }

    /// List views in current schema
    pub async fn list_views(&self) -> Result<Vec<HashMap<String, String>>> {
        let (_, rows) = self.execute_sql("SHOW VIEWS", None).await?;
        Ok(rows)
    }

    /// Get table schema
    pub async fn describe_table(&self, table: &str) -> Result<Vec<HashMap<String, String>>> {
        let (_, rows) = self
            .execute_sql(&format!("DESCRIBE TABLE {}", table), None)
            .await?;
        Ok(rows)
    }

    /// Get current warehouse
    pub fn warehouse(&self) -> &str {
        &self.warehouse
    }

    /// Get current database
    pub fn database(&self) -> Option<&str> {
        self.database.as_deref()
    }
}






