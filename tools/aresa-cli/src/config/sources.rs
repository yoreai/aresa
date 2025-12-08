//! Data source definitions

use serde::{Deserialize, Serialize};

/// Type of data source
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SourceType {
    Postgres,
    MySQL,
    SQLite,
    DuckDB,
    ClickHouse,
    BigQuery,
    Snowflake,
    Databricks,
    S3,
    GCS,
}

/// A configured data source
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSource {
    /// Type of the data source
    pub source_type: SourceType,
    /// Connection URI (for SQL databases)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uri: Option<String>,
    /// Host (for ClickHouse, Databricks)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub host: Option<String>,
    /// Port (for ClickHouse)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub port: Option<u16>,
    /// Database name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub database: Option<String>,
    /// Schema name (for Snowflake, Databricks)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub schema: Option<String>,
    /// Username
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    /// Password (stored in keychain for security)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    /// Project ID (for BigQuery/GCS)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project: Option<String>,
    /// Bucket name (for S3/GCS)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bucket: Option<String>,
    /// Region (for S3)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub region: Option<String>,
    /// Path to credentials file (for cloud services)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub credentials_path: Option<String>,
    /// Account identifier (for Snowflake)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub account: Option<String>,
    /// Warehouse (for Snowflake, Databricks)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub warehouse: Option<String>,
    /// Catalog (for Databricks Unity Catalog)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub catalog: Option<String>,
    /// Access token (for Databricks)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
}

impl std::fmt::Display for SourceType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SourceType::Postgres => write!(f, "postgres"),
            SourceType::MySQL => write!(f, "mysql"),
            SourceType::SQLite => write!(f, "sqlite"),
            SourceType::DuckDB => write!(f, "duckdb"),
            SourceType::ClickHouse => write!(f, "clickhouse"),
            SourceType::BigQuery => write!(f, "bigquery"),
            SourceType::Snowflake => write!(f, "snowflake"),
            SourceType::Databricks => write!(f, "databricks"),
            SourceType::S3 => write!(f, "s3"),
            SourceType::GCS => write!(f, "gcs"),
        }
    }
}

impl SourceType {
    /// Get a human-readable description
    pub fn description(&self) -> &'static str {
        match self {
            SourceType::Postgres => "PostgreSQL database",
            SourceType::MySQL => "MySQL database",
            SourceType::SQLite => "SQLite database",
            SourceType::DuckDB => "DuckDB database",
            SourceType::ClickHouse => "ClickHouse OLAP database",
            SourceType::BigQuery => "Google BigQuery",
            SourceType::Snowflake => "Snowflake Data Warehouse",
            SourceType::Databricks => "Databricks SQL Warehouse",
            SourceType::S3 => "AWS S3 bucket",
            SourceType::GCS => "Google Cloud Storage bucket",
        }
    }

    /// Check if this source type supports SQL queries
    pub fn supports_sql(&self) -> bool {
        matches!(
            self,
            SourceType::Postgres
                | SourceType::MySQL
                | SourceType::SQLite
                | SourceType::DuckDB
                | SourceType::ClickHouse
                | SourceType::BigQuery
                | SourceType::Snowflake
                | SourceType::Databricks
        )
    }
}


