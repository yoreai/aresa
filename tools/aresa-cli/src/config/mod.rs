//! Configuration management for ARESA CLI
//!
//! Handles data source configurations and secure credential storage.

mod credentials;
mod sources;

#[cfg(test)]
mod tests;

use anyhow::{Context, Result};
use colored::Colorize;
use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

pub use credentials::CredentialStore;
pub use sources::{DataSource, SourceType};

/// Main configuration manager
#[derive(Debug)]
pub struct ConfigManager {
    config_path: PathBuf,
    config: Config,
    credentials: CredentialStore,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Config {
    /// LLM provider configuration
    pub llm: Option<LlmConfig>,
    /// Configured data sources
    pub sources: HashMap<String, DataSource>,
    /// Default settings
    pub defaults: Defaults,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmConfig {
    pub provider: String,
    pub model: Option<String>,
    pub base_url: Option<String>,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Defaults {
    pub output_format: Option<String>,
    pub limit: Option<usize>,
}

impl ConfigManager {
    /// Load configuration from disk
    pub fn load() -> Result<Self> {
        let config_path = Self::config_path()?;

        let config = if config_path.exists() {
            let content = fs::read_to_string(&config_path)
                .context("Failed to read config file")?;
            toml::from_str(&content)
                .context("Failed to parse config file")?
        } else {
            Config::default()
        };

        let credentials = CredentialStore::new()?;

        Ok(Self {
            config_path,
            config,
            credentials,
        })
    }

    /// Get the configuration file path
    fn config_path() -> Result<PathBuf> {
        let proj_dirs = ProjectDirs::from("ai", "yoreai", "aresa")
            .context("Failed to determine config directory")?;

        let config_dir = proj_dirs.config_dir();
        fs::create_dir_all(config_dir)
            .context("Failed to create config directory")?;

        Ok(config_dir.join("config.toml"))
    }

    /// Save configuration to disk
    pub fn save(&self) -> Result<()> {
        let content = toml::to_string_pretty(&self.config)
            .context("Failed to serialize config")?;
        fs::write(&self.config_path, content)
            .context("Failed to write config file")?;
        Ok(())
    }

    /// Add a new data source (simple version)
    pub fn add_source(
        &self,
        name: &str,
        source_type_str: &str,
        uri: Option<&str>,
        project: Option<&str>,
        bucket: Option<&str>,
        credentials_path: Option<&str>,
    ) -> Result<()> {
        self.add_source_full(name, source_type_str, uri, project, bucket, None, None, None, credentials_path)
    }

    /// Add a new data source (full version with all options)
    pub fn add_source_full(
        &self,
        name: &str,
        source_type_str: &str,
        uri: Option<&str>,
        project: Option<&str>,
        bucket: Option<&str>,
        region: Option<&str>,
        host: Option<&str>,
        port: Option<u16>,
        credentials_path: Option<&str>,
    ) -> Result<()> {
        let source_type = match source_type_str.to_lowercase().as_str() {
            "postgres" => SourceType::Postgres,
            "mysql" => SourceType::MySQL,
            "sqlite" => SourceType::SQLite,
            "duckdb" => SourceType::DuckDB,
            "clickhouse" => SourceType::ClickHouse,
            "bigquery" => SourceType::BigQuery,
            "snowflake" => SourceType::Snowflake,
            "databricks" => SourceType::Databricks,
            "s3" => SourceType::S3,
            "gcs" => SourceType::GCS,
            _ => return Err(anyhow::anyhow!("Unknown source type: {}", source_type_str)),
        };

        let source = DataSource {
            source_type,
            uri: uri.map(String::from),
            host: host.map(String::from),
            port,
            database: None,
            schema: None,
            username: None,
            password: None,
            project: project.map(String::from),
            bucket: bucket.map(String::from),
            region: region.map(String::from),
            credentials_path: credentials_path.map(String::from),
            account: None,
            warehouse: None,
            catalog: None,
            token: None,
        };

        // Store sensitive URI in keychain if provided
        if let Some(uri) = uri {
            self.credentials.store(name, uri)?;
        }

        // Save source config (without sensitive data)
        let mut config = self.config.clone();
        config.sources.insert(name.to_string(), source);

        let content = toml::to_string_pretty(&config)?;
        fs::write(&self.config_path, content)?;

        Ok(())
    }

    /// Remove a data source
    pub fn remove_source(&self, name: &str) -> Result<()> {
        let mut config = self.config.clone();
        config.sources.remove(name);

        // Remove from keychain
        let _ = self.credentials.delete(name);

        let content = toml::to_string_pretty(&config)?;
        fs::write(&self.config_path, content)?;

        Ok(())
    }

    /// List all configured data sources (simple text format)
    pub fn list_sources(&self) -> Result<()> {
        use tabled::{settings::Style, builder::Builder};

        if self.config.sources.is_empty() {
            println!("{}", "No data sources configured.".yellow());
            println!();
            println!("Add one with:");
            println!(
                "  {}",
                "aresa config add bigquery prod --project my-project".bright_cyan()
            );
            println!(
                "  {}",
                "aresa config add postgres mydb --uri postgresql://user:pass@host/db".bright_cyan()
            );
            return Ok(());
        }

        // Build a nice table
        let mut builder = Builder::default();
        builder.push_record(["Name", "Type", "Connection Details", "Command"]);

        for (name, source) in &self.config.sources {
            let type_str = source.source_type.to_string();

            // Build connection details string
            let details = match source.source_type {
                SourceType::BigQuery => {
                    source.project.as_ref()
                        .map(|p| format!("project: {}", p))
                        .unwrap_or_else(|| "(no project)".to_string())
                }
                SourceType::Postgres | SourceType::MySQL => {
                    if source.uri.is_some() || self.credentials.exists(name) {
                        if let Some(uri) = &source.uri {
                            // Parse URI to show host without password
                            Self::mask_uri(uri)
                        } else {
                            "uri: ●●●●●●●●".to_string()
                        }
                    } else {
                        "(no uri)".to_string()
                    }
                }
                SourceType::SQLite | SourceType::DuckDB => {
                    source.uri.as_ref()
                        .map(|u| format!("path: {}", u))
                        .unwrap_or_else(|| "(no path)".to_string())
                }
                SourceType::ClickHouse => {
                    let host = source.host.as_deref().unwrap_or("localhost");
                    let port = source.port.unwrap_or(8123);
                    format!("{}:{}", host, port)
                }
                SourceType::S3 => {
                    let bucket = source.bucket.as_deref().unwrap_or("(no bucket)");
                    let region = source.region.as_deref().unwrap_or("us-east-1");
                    format!("s3://{} ({})", bucket, region)
                }
                SourceType::GCS => {
                    source.bucket.as_ref()
                        .map(|b| format!("gs://{}", b))
                        .unwrap_or_else(|| "(no bucket)".to_string())
                }
                SourceType::Snowflake => {
                    let account = source.account.as_deref().unwrap_or("(no account)");
                    let warehouse = source.warehouse.as_deref().unwrap_or("(no warehouse)");
                    format!("account: {}, warehouse: {}", account, warehouse)
                }
                SourceType::Databricks => {
                    let host = source.host.as_deref().unwrap_or("(no host)");
                    format!("host: {}", host)
                }
            };

            // Build example command
            let cmd = match source.source_type {
                SourceType::BigQuery => format!("aresa bq {} \"SELECT ...\"", name),
                SourceType::Postgres => format!("aresa pg {} \"SELECT ...\"", name),
                SourceType::MySQL => format!("aresa mysql {} \"SELECT ...\"", name),
                SourceType::SQLite => format!("aresa sqlite <path> \"SELECT ...\""),
                SourceType::DuckDB => format!("aresa duckdb <path> \"SELECT ...\""),
                SourceType::ClickHouse => format!("aresa ch {} \"SELECT ...\"", name),
                SourceType::Snowflake => format!("aresa query {} \"SELECT ...\"", name),
                SourceType::Databricks => format!("aresa query {} \"SELECT ...\"", name),
                SourceType::S3 => format!("aresa s3 {} --list", name),
                SourceType::GCS => format!("aresa gcs {} --list", name),
            };

            builder.push_record([name.as_str(), &type_str, &details, &cmd]);
        }

        let mut table = builder.build();
        table.with(Style::rounded());

        println!();
        println!("{}", "📊 Configured Data Sources".bright_yellow().bold());
        println!();
        println!("{table}");
        println!();
        println!(
            "{} {} source{} configured",
            "→".bright_blue(),
            self.config.sources.len(),
            if self.config.sources.len() == 1 { "" } else { "s" }
        );
        println!();

        Ok(())
    }

    /// Mask sensitive parts of a URI
    fn mask_uri(uri: &str) -> String {
        // Try to parse and mask password
        if let Ok(parsed) = url::Url::parse(uri) {
            let host = parsed.host_str().unwrap_or("localhost");
            let port = parsed.port().map(|p| format!(":{}", p)).unwrap_or_default();
            let db = parsed.path().trim_start_matches('/');
            let user = parsed.username();

            if user.is_empty() {
                format!("{}{}/{}", host, port, db)
            } else {
                format!("{}:●●●@{}{}/{}", user, host, port, db)
            }
        } else {
            "●●●●●●●●".to_string()
        }
    }

    /// Test connection to a data source
    pub async fn test_connection(&self, name: &str) -> Result<()> {
        let source = self.config.sources.get(name)
            .context(format!("Data source '{}' not found", name))?;

        match source.source_type {
            SourceType::Postgres => {
                let uri = self.get_uri(name)?;
                let pool = sqlx::PgPool::connect(&uri).await
                    .context("Failed to connect to PostgreSQL")?;
                sqlx::query("SELECT 1").execute(&pool).await?;
            }
            SourceType::MySQL => {
                let uri = self.get_uri(name)?;
                let pool = sqlx::MySqlPool::connect(&uri).await
                    .context("Failed to connect to MySQL")?;
                sqlx::query("SELECT 1").execute(&pool).await?;
            }
            SourceType::SQLite | SourceType::DuckDB => {
                let uri = self.get_uri(name)?;
                let pool = sqlx::SqlitePool::connect(&uri).await
                    .context("Failed to connect to SQLite")?;
                sqlx::query("SELECT 1").execute(&pool).await?;
            }
            SourceType::ClickHouse => {
                let host = source.host.as_ref()
                    .context("ClickHouse host not configured")?;
                let port = source.port.unwrap_or(8123);
                let url = format!("http://{}:{}/ping", host, port);
                let client = reqwest::Client::new();
                client.get(&url).send().await
                    .context("Failed to connect to ClickHouse")?;
            }
            SourceType::BigQuery => {
                // BigQuery connection test would go here
                println!("{}", "BigQuery connection test not yet implemented".yellow());
            }
            SourceType::S3 => {
                // S3 connection test would go here
                println!("{}", "S3 connection test not yet implemented".yellow());
            }
            SourceType::GCS => {
                // GCS connection test would go here
                println!("{}", "GCS connection test not yet implemented".yellow());
            }
            SourceType::Snowflake => {
                let account = source.account.as_ref()
                    .context("Snowflake account not configured")?;
                let username = source.username.as_ref()
                    .context("Snowflake username not configured")?;
                let password = source.password.as_ref()
                    .context("Snowflake password not configured")?;
                let warehouse = source.warehouse.as_ref()
                    .context("Snowflake warehouse not configured")?;
                let connector = crate::connectors::snowflake::SnowflakeConnector::new(
                    account,
                    username,
                    password,
                    warehouse,
                    source.database.as_deref(),
                    source.schema.as_deref(),
                ).await.context("Failed to connect to Snowflake")?;
                connector.test_connection().await?;
            }
            SourceType::Databricks => {
                let host = source.host.as_ref()
                    .context("Databricks host not configured")?;
                let warehouse = source.warehouse.as_ref()
                    .context("Databricks warehouse_id not configured")?;
                let token = source.token.as_ref()
                    .context("Databricks token not configured")?;
                let connector = crate::connectors::databricks::DatabricksConnector::new(
                    host,
                    warehouse,
                    token,
                    source.catalog.as_deref(),
                    source.schema.as_deref(),
                ).await.context("Failed to connect to Databricks")?;
                connector.test_connection().await?;
            }
        }

        Ok(())
    }

    /// Check all connections
    pub async fn check_all_connections(&self) -> Result<()> {
        if self.config.sources.is_empty() {
            println!("{}", "No data sources configured.".yellow());
            return Ok(());
        }

        println!("{}", "Connection Status:".bright_yellow().bold());
        println!();

        for name in self.config.sources.keys() {
            print!(
                "  {} {}... ",
                "●".bright_blue(),
                name.bright_white()
            );

            match self.test_connection(name).await {
                Ok(_) => println!("{}", "✓ connected".bright_green()),
                Err(e) => println!("{} {}", "✗".bright_red(), e.to_string().dimmed()),
            }
        }
        println!();

        Ok(())
    }

    /// Set LLM configuration
    pub fn set_llm_config(&self, provider: &str, api_key: &str) -> Result<()> {
        // Store API key in keychain
        self.credentials.store(&format!("llm_{}", provider), api_key)?;

        // Update config
        let mut config = self.config.clone();
        config.llm = Some(LlmConfig {
            provider: provider.to_string(),
            model: None,
            base_url: None,
        });

        let content = toml::to_string_pretty(&config)?;
        fs::write(&self.config_path, content)?;

        Ok(())
    }

    /// Get LLM configuration
    pub fn get_llm_config(&self) -> Option<&LlmConfig> {
        self.config.llm.as_ref()
    }

    /// Get LLM API key from keychain
    pub fn get_llm_api_key(&self) -> Result<String> {
        let provider = self.config.llm.as_ref()
            .context("No LLM provider configured")?
            .provider.clone();

        self.credentials.get(&format!("llm_{}", provider))
    }

    /// Get URI for a data source (from keychain)
    pub fn get_uri(&self, name: &str) -> Result<String> {
        self.credentials.get(name)
            .or_else(|_| {
                self.config.sources.get(name)
                    .and_then(|s| s.uri.clone())
                    .context(format!("No URI found for '{}'", name))
            })
    }

    /// Get a data source by name
    pub fn get_source(&self, name: &str) -> Option<&DataSource> {
        self.config.sources.get(name)
    }

    /// Get all configured sources
    pub fn sources(&self) -> &HashMap<String, DataSource> {
        &self.config.sources
    }
}

impl Clone for Config {
    fn clone(&self) -> Self {
        Self {
            llm: self.llm.clone(),
            sources: self.sources.clone(),
            defaults: Defaults {
                output_format: self.defaults.output_format.clone(),
                limit: self.defaults.limit,
            },
        }
    }
}

