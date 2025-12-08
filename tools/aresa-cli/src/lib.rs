//! ARESA CLI - Universal Database Interface
//!
//! Fast, beautiful interface to query any database.
//!
//! # Supported Databases
//!
//! - **BigQuery**: Google BigQuery via REST API
//! - **PostgreSQL**: Full SQL support with connection pooling
//! - **MySQL**: Full SQL support
//! - **SQLite**: Local database queries
//!
//! # Example
//!
//! ```bash
//! # Query BigQuery
//! aresa bq "SELECT * FROM dataset.table LIMIT 10"
//! aresa bq --datasets
//! aresa bq --tables my_dataset
//! aresa bq --schema my_dataset.my_table
//!
//! # Query PostgreSQL
//! aresa pg mydb "SELECT * FROM users"
//! aresa pg mydb --tables
//!
//! # Search files
//! aresa files "*.rs" --path ~/dev
//! aresa files "TODO" --path ~/dev --content
//! ```

pub mod config;
pub mod connectors;
pub mod output;

#[cfg(feature = "ui")]
pub mod server;

#[cfg(feature = "ui")]
pub mod terminal;

#[cfg(feature = "ui")]
pub mod history;

pub use config::ConfigManager;
pub use output::OutputRenderer;
