//! ARESA CLI - Universal Database Interface
//!
//! Fast, beautiful interface to query any database.
//! No magic, no AI - just direct SQL with gorgeous output.

use anyhow::{Context, Result};
use clap::{CommandFactory, Parser, Subcommand};
use clap_complete::{generate, Shell};
use colored::Colorize;
use std::io;

mod config;
mod connectors;
mod output;

#[cfg(feature = "ui")]
mod server;

#[cfg(feature = "ui")]
mod terminal;

#[cfg(feature = "ui")]
mod history;

use config::ConfigManager;
use output::OutputRenderer;

/// ARESA CLI - Universal Database Interface
#[derive(Parser)]
#[command(name = "aresa")]
#[command(author = "Yevheniy Chuba <yevheniyc@gmail.com>")]
#[command(version)]
#[command(about = "Fast, beautiful interface to query any database", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Output format
    #[arg(short, long, default_value = "table", global = true)]
    format: OutputFormat,

    /// Limit number of results
    #[arg(short, long, global = true)]
    limit: Option<usize>,
}

#[derive(Subcommand)]
enum Commands {
    /// Query BigQuery
    #[command(visible_alias = "bq")]
    Bigquery {
        /// Named source from config OR SQL query (if no source specified)
        #[arg(value_name = "SOURCE_OR_QUERY")]
        source_or_query: Option<String>,

        /// SQL query (when source is specified first)
        #[arg(value_name = "QUERY")]
        query: Option<String>,

        /// List all datasets
        #[arg(long)]
        datasets: bool,

        /// List tables in a dataset
        #[arg(long)]
        tables: Option<String>,

        /// Show schema of a table (dataset.table format)
        #[arg(long)]
        schema: Option<String>,

        /// Project ID (overrides source config)
        #[arg(short, long)]
        project: Option<String>,
    },

    /// Query PostgreSQL
    #[command(visible_alias = "pg")]
    Postgres {
        /// Connection name from config
        source: String,

        /// SQL query to execute (omit for discovery commands)
        query: Option<String>,

        /// List all tables
        #[arg(long)]
        tables: bool,

        /// Show schema of a table
        #[arg(long)]
        schema: Option<String>,
    },

    /// Query SQLite database
    Sqlite {
        /// Path to SQLite database file
        path: String,

        /// SQL query to execute (omit for discovery commands)
        query: Option<String>,

        /// List all tables
        #[arg(long)]
        tables: bool,

        /// Show schema of a table
        #[arg(long)]
        schema: Option<String>,
    },

    /// Query MySQL
    Mysql {
        /// Connection name from config
        source: String,

        /// SQL query to execute
        query: Option<String>,

        /// List all tables
        #[arg(long)]
        tables: bool,

        /// Show schema of a table
        #[arg(long)]
        schema: Option<String>,
    },

    /// Query DuckDB database
    Duckdb {
        /// Path to DuckDB database file
        path: String,

        /// SQL query to execute (omit for discovery commands)
        query: Option<String>,

        /// List all tables
        #[arg(long)]
        tables: bool,

        /// Show schema of a table
        #[arg(long)]
        schema: Option<String>,
    },

    /// Query ClickHouse
    #[command(visible_alias = "ch")]
    Clickhouse {
        /// Connection name from config
        source: String,

        /// SQL query to execute (omit for discovery commands)
        query: Option<String>,

        /// List all tables
        #[arg(long)]
        tables: bool,

        /// Show schema of a table
        #[arg(long)]
        schema: Option<String>,
    },

    /// Browse and search AWS S3 buckets
    S3 {
        /// Connection name from config
        source: String,

        /// List objects in bucket
        #[arg(long)]
        list: bool,

        /// Search for objects matching pattern
        #[arg(long)]
        search: Option<String>,

        /// Prefix/folder to list or search within
        #[arg(long)]
        prefix: Option<String>,
    },

    /// Browse and search Google Cloud Storage buckets
    Gcs {
        /// Connection name from config
        source: String,

        /// List objects in bucket
        #[arg(long)]
        list: bool,

        /// Search for objects matching pattern
        #[arg(long)]
        search: Option<String>,

        /// Prefix/folder to list or search within
        #[arg(long)]
        prefix: Option<String>,
    },

    /// Search filesystem
    Files {
        /// Search pattern (glob or regex)
        pattern: String,

        /// Directory to search in
        #[arg(short, long, default_value = ".")]
        path: String,

        /// Search file contents instead of names
        #[arg(short, long)]
        content: bool,
    },

    /// Manage data source configurations
    Config {
        #[command(subcommand)]
        action: ConfigAction,
    },

    /// List configured data sources
    Sources,

    /// Start web UI server
    #[cfg(feature = "ui")]
    Serve {
        /// Port to run server on
        #[arg(short, long, default_value = "3001")]
        port: u16,

        /// Don't auto-open browser
        #[arg(long)]
        no_open: bool,
    },

    /// Test connection to a data source
    Ping {
        /// Source name to test (use --all to test all)
        source: Option<String>,

        /// Test all configured sources
        #[arg(long)]
        all: bool,
    },

    /// Explore schema of a data source
    Schema {
        /// Source name from config
        source: String,

        /// Table name to describe (omit to list all tables)
        table: Option<String>,

        /// Show detailed column info
        #[arg(long, short)]
        detailed: bool,
    },

    /// Generate shell completions
    Completions {
        /// Shell to generate completions for
        #[arg(value_enum)]
        shell: Shell,
    },
}

#[derive(Subcommand)]
enum ConfigAction {
    /// Add a new data source
    Add {
        /// Type: bigquery, postgres, mysql, sqlite, duckdb, clickhouse, s3, gcs
        #[arg(value_enum)]
        source_type: SourceType,
        /// Name for this connection
        name: String,
        /// Connection URI (for postgres/mysql/sqlite)
        #[arg(long)]
        uri: Option<String>,
        /// Project ID (for BigQuery/GCS)
        #[arg(long)]
        project: Option<String>,
        /// Bucket name (for S3/GCS)
        #[arg(long)]
        bucket: Option<String>,
        /// AWS region (for S3)
        #[arg(long)]
        region: Option<String>,
        /// Host (for ClickHouse)
        #[arg(long)]
        host: Option<String>,
        /// Port (for ClickHouse)
        #[arg(long)]
        port: Option<u16>,
        /// Path to credentials file
        #[arg(long)]
        credentials: Option<String>,
    },
    /// Remove a data source
    #[command(visible_alias = "delete", visible_alias = "rm")]
    Remove { name: String },
    /// List all configured sources
    List,
    /// Test connection
    Test { name: String },
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, clap::ValueEnum)]
enum SourceType {
    Bigquery,
    Postgres,
    Mysql,
    Sqlite,
    Duckdb,
    Clickhouse,
    S3,
    Gcs,
}

/// Re-export OutputFormat from output module with clap derive
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, clap::ValueEnum)]
pub enum OutputFormat {
    #[default]
    Table,
    Json,
    Csv,
}

impl From<OutputFormat> for output::OutputFormat {
    fn from(f: OutputFormat) -> Self {
        match f {
            OutputFormat::Table => output::OutputFormat::Table,
            OutputFormat::Json => output::OutputFormat::Json,
            OutputFormat::Csv => output::OutputFormat::Csv,
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let config = ConfigManager::load()?;
    let renderer = OutputRenderer::new(cli.format.into());
    let limit = cli.limit;

    match cli.command {
        Commands::Bigquery { source_or_query, query, datasets, tables, schema, project } => {
            handle_bigquery(source_or_query, query, datasets, tables, schema, project, &config, &renderer, limit).await?
        }
        Commands::Postgres { source, query, tables, schema } => {
            handle_postgres(&source, query, tables, schema, &config, &renderer, limit).await?
        }
        Commands::Sqlite { path, query, tables, schema } => {
            handle_sqlite(&path, query, tables, schema, &renderer, limit).await?
        }
        Commands::Mysql { source, query, tables, schema } => {
            handle_mysql(&source, query, tables, schema, &config, &renderer, limit).await?
        }
        Commands::Duckdb { path, query, tables, schema } => {
            handle_duckdb(&path, query, tables, schema, &renderer, limit).await?
        }
        Commands::Clickhouse { source, query, tables, schema } => {
            handle_clickhouse(&source, query, tables, schema, &config, &renderer, limit).await?
        }
        Commands::S3 { source, list, search, prefix } => {
            handle_s3(&source, list, search, prefix, &config, &renderer, limit).await?
        }
        Commands::Gcs { source, list, search, prefix } => {
            handle_gcs(&source, list, search, prefix, &config, &renderer, limit).await?
        }
        Commands::Files { pattern, path, content } => {
            handle_files(&pattern, &path, content, &renderer, limit).await?
        }
        Commands::Config { action } => handle_config(action, &config).await?,
        Commands::Sources => handle_sources(&config)?,
        #[cfg(feature = "ui")]
        Commands::Serve { port, no_open } => {
            if !no_open {
                let url = format!("http://localhost:{}", port);
                println!("🌐 Opening browser to {}", url);
                let _ = std::process::Command::new("open").arg(&url).spawn();
            }
            server::ui_server::serve(config, port).await?;
        }
        Commands::Ping { source, all } => handle_ping(source, all, &config).await?,
        Commands::Schema { source, table, detailed } => {
            handle_schema(&source, table, detailed, &config, &renderer).await?
        }
        Commands::Completions { shell } => {
            generate(shell, &mut Cli::command(), "aresa", &mut io::stdout());
        }
    }

    Ok(())
}

async fn handle_bigquery(
    source_or_query: Option<String>,
    query: Option<String>,
    datasets: bool,
    tables: Option<String>,
    schema: Option<String>,
    project_override: Option<String>,
    config: &ConfigManager,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::bigquery::BigQueryConnector;

    // Figure out if first arg is a source name or a query
    let (source_name, sql_query) = match (&source_or_query, &query) {
        // aresa bq abridge "SELECT ..." - source + query
        (Some(first), Some(second)) => (Some(first.clone()), Some(second.clone())),
        // aresa bq "SELECT ..." or aresa bq abridge --datasets
        (Some(first), None) => {
            // Check if it's a configured source name
            if config.get_source(first).is_some() {
                (Some(first.clone()), None)
            } else {
                // It's a query
                (None, Some(first.clone()))
            }
        }
        // aresa bq --datasets (no positional args)
        (None, None) => (None, None),
        // Shouldn't happen
        (None, Some(q)) => (None, Some(q.clone())),
    };

    // Get project from: override > source config > any bigquery source > error
    let project_id = project_override
        .or_else(|| {
            source_name.as_ref()
                .and_then(|name| config.get_source(name))
                .and_then(|s| s.project.clone())
        })
        .or_else(|| {
            config.sources()
                .values()
                .find(|s| matches!(s.source_type, config::SourceType::BigQuery))
                .and_then(|s| s.project.clone())
        })
        .context("No BigQuery project specified. Use --project, specify a source name, or configure with:\n  aresa config add bigquery <name> --project <project-id>")?;

    // Show which project we're using
    if let Some(name) = &source_name {
        println!("{} Using source '{}' (project: {})", "→".bright_blue(), name.bright_cyan(), project_id.dimmed());
    }

    let connector = BigQueryConnector::new(&project_id, None).await?;

    let sql = if datasets {
        "SELECT schema_name FROM INFORMATION_SCHEMA.SCHEMATA ORDER BY schema_name".to_string()
    } else if let Some(dataset) = tables {
        format!("SELECT table_name, table_type FROM `{}`.INFORMATION_SCHEMA.TABLES ORDER BY table_name", dataset)
    } else if let Some(table) = schema {
        let parts: Vec<&str> = table.split('.').collect();
        if parts.len() != 2 {
            anyhow::bail!("Table must be in dataset.table format");
        }
        format!(
            "SELECT column_name, data_type, is_nullable FROM `{}`.INFORMATION_SCHEMA.COLUMNS WHERE table_name = '{}' ORDER BY ordinal_position",
            parts[0], parts[1]
        )
    } else if let Some(q) = sql_query {
        q
    } else {
        anyhow::bail!("Provide a query or use --datasets, --tables <dataset>, or --schema <dataset.table>")
    };

    let start = std::time::Instant::now();
    let (columns, rows) = connector.execute_sql(&sql, limit).await?;
    let elapsed = start.elapsed();

    renderer.render_query_results_simple(&columns, &rows)?;
    println!(
        "\n{} {} rows in {:.2}s",
        "→".bright_blue(),
        rows.len(),
        elapsed.as_secs_f64()
    );

    Ok(())
}

async fn handle_postgres(
    source: &str,
    query: Option<String>,
    tables: bool,
    schema: Option<String>,
    config: &ConfigManager,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::postgres::PostgresConnector;

    let uri = config.get_uri(source)?;
    let connector = PostgresConnector::new(&uri).await?;

    let sql = if tables {
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name".to_string()
    } else if let Some(table) = schema {
        format!(
            "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{}' ORDER BY ordinal_position",
            table
        )
    } else if let Some(q) = query {
        q
    } else {
        anyhow::bail!("Provide a query or use --tables or --schema <table>")
    };

    let start = std::time::Instant::now();
    let (columns, rows) = connector.execute_sql(&sql, limit).await?;
    let elapsed = start.elapsed();

    renderer.render_query_results_simple(&columns, &rows)?;
    println!(
        "\n{} {} rows in {:.2}s",
        "→".bright_blue(),
        rows.len(),
        elapsed.as_secs_f64()
    );

    Ok(())
}

async fn handle_sqlite(
    path: &str,
    query: Option<String>,
    tables: bool,
    schema: Option<String>,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::sqlite::SqliteConnector;

    let connector = SqliteConnector::new(path).await?;

    let sql = if tables {
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name".to_string()
    } else if let Some(table) = schema {
        format!("PRAGMA table_info({})", table)
    } else if let Some(q) = query {
        q
    } else {
        anyhow::bail!("Provide a query or use --tables or --schema <table>")
    };

    let start = std::time::Instant::now();
    let (columns, rows) = connector.execute_sql(&sql, limit).await?;
    let elapsed = start.elapsed();

    renderer.render_query_results_simple(&columns, &rows)?;
    println!(
        "\n{} {} rows in {:.2}s",
        "→".bright_blue(),
        rows.len(),
        elapsed.as_secs_f64()
    );

    Ok(())
}

async fn handle_mysql(
    source: &str,
    query: Option<String>,
    tables: bool,
    schema: Option<String>,
    config: &ConfigManager,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::mysql::MySqlConnector;

    let uri = config.get_uri(source)?;
    let connector = MySqlConnector::new(&uri).await?;

    let sql = if tables {
        "SHOW TABLES".to_string()
    } else if let Some(table) = schema {
        format!("DESCRIBE {}", table)
    } else if let Some(q) = query {
        q
    } else {
        anyhow::bail!("Provide a query or use --tables or --schema <table>")
    };

    let start = std::time::Instant::now();
    let (columns, rows) = connector.execute_sql(&sql, limit).await?;
    let elapsed = start.elapsed();

    renderer.render_query_results_simple(&columns, &rows)?;
    println!(
        "\n{} {} rows in {:.2}s",
        "→".bright_blue(),
        rows.len(),
        elapsed.as_secs_f64()
    );

    Ok(())
}

async fn handle_duckdb(
    path: &str,
    query: Option<String>,
    tables: bool,
    schema: Option<String>,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::duckdb::DuckDbConnector;

    let connector = DuckDbConnector::new(Some(path)).await?;

    let sql = if tables {
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'".to_string()
    } else if let Some(table) = schema {
        format!(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{}'",
            table
        )
    } else if let Some(q) = query {
        q
    } else {
        anyhow::bail!("Provide a query or use --tables or --schema <table>")
    };

    let start = std::time::Instant::now();
    let (columns, rows) = connector.execute_sql(&sql, limit).await?;
    let elapsed = start.elapsed();

    renderer.render_query_results_simple(&columns, &rows)?;
    println!(
        "\n{} {} rows in {:.2}s",
        "→".bright_blue(),
        rows.len(),
        elapsed.as_secs_f64()
    );

    Ok(())
}

async fn handle_clickhouse(
    source: &str,
    query: Option<String>,
    tables: bool,
    schema: Option<String>,
    config: &ConfigManager,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::clickhouse::ClickHouseConnector;

    let source_config = config.get_source(source)
        .context(format!("ClickHouse source '{}' not found", source))?;

    let host = source_config.host.as_deref().unwrap_or("localhost");
    let port = source_config.port;
    let database = source_config.database.as_deref();
    let username = source_config.username.as_deref();
    let password = source_config.password.as_deref();

    let connector = ClickHouseConnector::new(host, port, database, username, password).await?;

    let sql = if tables {
        "SHOW TABLES".to_string()
    } else if let Some(table) = schema {
        format!("DESCRIBE TABLE {}", table)
    } else if let Some(q) = query {
        q
    } else {
        anyhow::bail!("Provide a query or use --tables or --schema <table>")
    };

    let start = std::time::Instant::now();
    let (columns, rows) = connector.execute_sql(&sql, limit).await?;
    let elapsed = start.elapsed();

    renderer.render_query_results_simple(&columns, &rows)?;
    println!(
        "\n{} {} rows in {:.2}s",
        "→".bright_blue(),
        rows.len(),
        elapsed.as_secs_f64()
    );

    Ok(())
}

async fn handle_s3(
    source: &str,
    list: bool,
    search: Option<String>,
    prefix: Option<String>,
    config: &ConfigManager,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::s3::S3Connector;

    let source_config = config.get_source(source)
        .context(format!("S3 source '{}' not found", source))?;

    let bucket = source_config.bucket.as_ref()
        .context("S3 bucket not configured for this source")?;
    let region = source_config.region.as_deref();

    println!("{} Using S3 bucket '{}' in {}", "→".bright_blue(), bucket.bright_cyan(), region.unwrap_or("us-east-1").dimmed());

    // S3 auth via environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) or IAM role
    let connector = S3Connector::new(bucket, region, None, None).await?;
    let start = std::time::Instant::now();

    let (columns, rows) = if let Some(pattern) = search {
        let objects = connector.search(&pattern, limit).await?;
        let columns = vec!["key".to_string(), "size".to_string(), "last_modified".to_string()];
        let rows: Vec<std::collections::HashMap<String, String>> = objects
            .into_iter()
            .map(|obj| {
                let mut row = std::collections::HashMap::new();
                row.insert("key".to_string(), obj.key);
                row.insert("size".to_string(), humansize::format_size(obj.size, humansize::BINARY));
                row.insert("last_modified".to_string(), obj.last_modified.format("%Y-%m-%d %H:%M:%S").to_string());
                row
            })
            .collect();
        (columns, rows)
    } else if list {
        connector.list_as_results(prefix.as_deref(), limit).await?
    } else {
        anyhow::bail!("Use --list to list objects or --search <pattern> to search")
    };

    let elapsed = start.elapsed();
    renderer.render_query_results_simple(&columns, &rows)?;
    println!(
        "\n{} {} objects in {:.2}s",
        "→".bright_blue(),
        rows.len(),
        elapsed.as_secs_f64()
    );

    Ok(())
}

async fn handle_gcs(
    source: &str,
    list: bool,
    search: Option<String>,
    prefix: Option<String>,
    config: &ConfigManager,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::gcs::GcsConnector;

    let source_config = config.get_source(source)
        .context(format!("GCS source '{}' not found", source))?;

    let bucket = source_config.bucket.as_ref()
        .context("GCS bucket not configured for this source")?;
    let credentials = source_config.credentials_path.as_deref();

    println!("{} Using GCS bucket '{}'", "→".bright_blue(), bucket.bright_cyan());

    let connector = GcsConnector::new(bucket, credentials).await?;
    let start = std::time::Instant::now();

    let (columns, rows) = if let Some(pattern) = search {
        let objects = connector.search(&pattern, limit).await?;
        let columns = vec!["name".to_string(), "size".to_string(), "updated".to_string()];
        let rows: Vec<std::collections::HashMap<String, String>> = objects
            .into_iter()
            .map(|obj| {
                let mut row = std::collections::HashMap::new();
                row.insert("name".to_string(), obj.name);
                row.insert("size".to_string(), humansize::format_size(obj.size, humansize::BINARY));
                row.insert("updated".to_string(), obj.updated.format("%Y-%m-%d %H:%M:%S").to_string());
                row
            })
            .collect();
        (columns, rows)
    } else if list {
        connector.list_as_results(prefix.as_deref(), limit).await?
    } else {
        anyhow::bail!("Use --list to list objects or --search <pattern> to search")
    };

    let elapsed = start.elapsed();
    renderer.render_query_results_simple(&columns, &rows)?;
    println!(
        "\n{} {} objects in {:.2}s",
        "→".bright_blue(),
        rows.len(),
        elapsed.as_secs_f64()
    );

    Ok(())
}

async fn handle_files(
    pattern: &str,
    path: &str,
    content: bool,
    renderer: &OutputRenderer,
    limit: Option<usize>,
) -> Result<()> {
    use connectors::filesystem::FilesystemConnector;

    let connector = FilesystemConnector::new();
    let start = std::time::Instant::now();

    if content {
        let results = connector.search_content(path, pattern, limit).await?;
        renderer.render_file_results(&results)?;
        println!(
            "\n{} {} matches in {:.2}s",
            "→".bright_blue(),
            results.iter().map(|r| r.matches.as_ref().map(|m| m.len()).unwrap_or(0)).sum::<usize>(),
            start.elapsed().as_secs_f64()
        );
    } else {
        let results = connector.search_files(path, pattern, limit).await?;
        renderer.render_file_results(&results)?;
        println!(
            "\n{} {} files in {:.2}s",
            "→".bright_blue(),
            results.len(),
            start.elapsed().as_secs_f64()
        );
    }

    Ok(())
}

async fn handle_config(action: ConfigAction, config: &ConfigManager) -> Result<()> {
    match action {
        ConfigAction::Add { source_type, name, uri, project, bucket, region, host, port, credentials } => {
            let st = match source_type {
                SourceType::Bigquery => "bigquery",
                SourceType::Postgres => "postgres",
                SourceType::Mysql => "mysql",
                SourceType::Sqlite => "sqlite",
                SourceType::Duckdb => "duckdb",
                SourceType::Clickhouse => "clickhouse",
                SourceType::S3 => "s3",
                SourceType::Gcs => "gcs",
            };
            config.add_source_full(
                &name,
                st,
                uri.as_deref(),
                project.as_deref(),
                bucket.as_deref(),
                region.as_deref(),
                host.as_deref(),
                port,
                credentials.as_deref(),
            )?;
            println!("{} Added {} connection '{}'", "✓".bright_green(), st.bright_cyan(), name.bright_yellow());
        }
        ConfigAction::Remove { name } => {
            config.remove_source(&name)?;
            println!("{} Removed '{}'", "✓".bright_green(), name.bright_yellow());
        }
        ConfigAction::List => {
            config.list_sources()?;
        }
        ConfigAction::Test { name } => {
            print!("{} Testing '{}'... ", "●".bright_blue(), name.bright_yellow());
            match config.test_connection(&name).await {
                Ok(_) => println!("{}", "connected!".bright_green()),
                Err(e) => println!("{} {}", "failed:".bright_red(), e),
            }
        }
    }
    Ok(())
}

fn handle_sources(config: &ConfigManager) -> Result<()> {
    config.list_sources()
}

async fn handle_ping(source: Option<String>, all: bool, config: &ConfigManager) -> Result<()> {
    if all {
        // Ping all sources
        let sources = config.sources();
        if sources.is_empty() {
            println!("{} No sources configured. Use 'aresa config add' to add one.", "!".bright_yellow());
            return Ok(());
        }

        println!("{} Testing {} connection(s)...\n", "●".bright_blue(), sources.len());

        let mut success_count = 0;
        let mut fail_count = 0;

        for (name, _source) in sources {
            print!("  {} {}... ", "→".dimmed(), name.bright_cyan());
            let start = std::time::Instant::now();

            match config.test_connection(name).await {
                Ok(_) => {
                    let elapsed = start.elapsed();
                    println!("{} ({:.0}ms)", "✓ connected".bright_green(), elapsed.as_millis());
                    success_count += 1;
                }
                Err(e) => {
                    println!("{} {}", "✗ failed:".bright_red(), e.to_string().dimmed());
                    fail_count += 1;
                }
            }
        }

        println!();
        if fail_count == 0 {
            println!("{} All {} connections healthy!", "✓".bright_green(), success_count);
        } else {
            println!(
                "{} {}/{} connections healthy",
                if fail_count > 0 { "!".bright_yellow() } else { "✓".bright_green() },
                success_count,
                success_count + fail_count
            );
        }
    } else if let Some(name) = source {
        // Ping single source
        print!("{} Testing '{}'... ", "●".bright_blue(), name.bright_cyan());
        let start = std::time::Instant::now();

        match config.test_connection(&name).await {
            Ok(_) => {
                let elapsed = start.elapsed();
                println!("{} ({:.0}ms)", "✓ connected".bright_green(), elapsed.as_millis());
            }
            Err(e) => {
                println!("{} {}", "✗ failed:".bright_red(), e);
                std::process::exit(1);
            }
        }
    } else {
        anyhow::bail!("Specify a source name or use --all to test all connections");
    }

    Ok(())
}

async fn handle_schema(
    source: &str,
    table: Option<String>,
    detailed: bool,
    config: &ConfigManager,
    renderer: &OutputRenderer,
) -> Result<()> {
    let source_config = config.get_source(source)
        .context(format!("Source '{}' not found. Use 'aresa sources' to list available sources.", source))?;

    println!("{} Schema for '{}' ({})\n", "●".bright_blue(), source.bright_cyan(), format!("{}", source_config.source_type).dimmed());

    let start = std::time::Instant::now();

    match source_config.source_type {
        config::SourceType::BigQuery => {
            handle_schema_bigquery(source_config, table, detailed, renderer).await?;
        }
        config::SourceType::Postgres => {
            handle_schema_postgres(source_config, table, detailed, renderer).await?;
        }
        config::SourceType::MySQL => {
            handle_schema_mysql(source_config, table, detailed, renderer).await?;
        }
        config::SourceType::SQLite => {
            handle_schema_sqlite(source_config, table, detailed, renderer).await?;
        }
        config::SourceType::DuckDB => {
            handle_schema_duckdb(source_config, table, detailed, renderer).await?;
        }
        config::SourceType::ClickHouse => {
            handle_schema_clickhouse(source_config, table, detailed, renderer).await?;
        }
        config::SourceType::Snowflake => {
            handle_schema_snowflake(source_config, table, detailed, renderer).await?;
        }
        config::SourceType::Databricks => {
            handle_schema_databricks(source_config, table, detailed, renderer).await?;
        }
        config::SourceType::S3 | config::SourceType::GCS => {
            anyhow::bail!("Schema exploration not available for cloud storage. Use --list to browse objects.");
        }
    }

    let elapsed = start.elapsed();
    println!("\n{} Completed in {:.2}s", "→".bright_blue(), elapsed.as_secs_f64());

    Ok(())
}

async fn handle_schema_bigquery(
    source: &config::DataSource,
    table: Option<String>,
    detailed: bool,
    renderer: &OutputRenderer,
) -> Result<()> {
    use connectors::bigquery::BigQueryConnector;

    let project = source.project.as_ref()
        .context("BigQuery source missing project ID")?;

    let connector = BigQueryConnector::new(project, None).await?;

    if let Some(table_ref) = table {
        // Show table schema
        let parts: Vec<&str> = table_ref.split('.').collect();
        if parts.len() != 2 {
            anyhow::bail!("Table must be in dataset.table format (e.g., my_dataset.my_table)");
        }

        let sql = if detailed {
            format!(
                "SELECT column_name, data_type, is_nullable, is_partitioning_column, clustering_ordinal_position
                 FROM `{}`.INFORMATION_SCHEMA.COLUMNS
                 WHERE table_name = '{}'
                 ORDER BY ordinal_position",
                parts[0], parts[1]
            )
        } else {
            format!(
                "SELECT column_name, data_type, is_nullable
                 FROM `{}`.INFORMATION_SCHEMA.COLUMNS
                 WHERE table_name = '{}'
                 ORDER BY ordinal_position",
                parts[0], parts[1]
            )
        };

        let (columns, rows) = connector.execute_sql(&sql, None).await?;
        println!("  {} Table: {}.{}\n", "→".dimmed(), parts[0].bright_yellow(), parts[1].bright_white());
        renderer.render_query_results_simple(&columns, &rows)?;
    } else {
        // List all datasets and tables
        let datasets_sql = "SELECT schema_name FROM INFORMATION_SCHEMA.SCHEMATA ORDER BY schema_name";
        let (_, datasets) = connector.execute_sql(datasets_sql, None).await?;

        for dataset in &datasets {
            if let Some(name) = dataset.get("schema_name") {
                println!("  {} {}", "📁".dimmed(), name.bright_yellow());

                // Get tables in this dataset
                let tables_sql = format!(
                    "SELECT table_name, table_type FROM `{}`.INFORMATION_SCHEMA.TABLES ORDER BY table_name",
                    name
                );
                if let Ok((_, tables)) = connector.execute_sql(&tables_sql, Some(10)).await {
                    for t in &tables {
                        let tname = t.get("table_name").map(|s| s.as_str()).unwrap_or("?");
                        let ttype = t.get("table_type").map(|s| s.as_str()).unwrap_or("");
                        let type_badge = if ttype == "VIEW" { "(view)" } else { "" };
                        println!("      {} {}", tname, type_badge.dimmed());
                    }
                    if tables.len() == 10 {
                        println!("      {} ...", "".dimmed());
                    }
                }
            }
        }
    }

    Ok(())
}

async fn handle_schema_postgres(
    source: &config::DataSource,
    table: Option<String>,
    detailed: bool,
    renderer: &OutputRenderer,
) -> Result<()> {
    use connectors::postgres::PostgresConnector;

    let uri = source.uri.as_ref()
        .context("Postgres source missing URI")?;

    let connector = PostgresConnector::new(uri).await?;

    if let Some(table_name) = table {
        let sql = if detailed {
            format!(
                "SELECT c.column_name, c.data_type, c.is_nullable, c.column_default,
                        CASE WHEN pk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END as is_primary_key
                 FROM information_schema.columns c
                 LEFT JOIN (
                     SELECT ku.column_name
                     FROM information_schema.table_constraints tc
                     JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
                     WHERE tc.table_name = '{}' AND tc.constraint_type = 'PRIMARY KEY'
                 ) pk ON c.column_name = pk.column_name
                 WHERE c.table_name = '{}' AND c.table_schema = 'public'
                 ORDER BY c.ordinal_position",
                table_name, table_name
            )
        } else {
            format!(
                "SELECT column_name, data_type, is_nullable
                 FROM information_schema.columns
                 WHERE table_name = '{}' AND table_schema = 'public'
                 ORDER BY ordinal_position",
                table_name
            )
        };

        let (columns, rows) = connector.execute_sql(&sql, None).await?;
        println!("  {} Table: {}\n", "→".dimmed(), table_name.bright_white());
        renderer.render_query_results_simple(&columns, &rows)?;
    } else {
        // List all tables
        let sql = "SELECT table_name, table_type FROM information_schema.tables
                   WHERE table_schema = 'public' ORDER BY table_name";
        let (_, tables) = connector.execute_sql(sql, None).await?;

        for t in &tables {
            let name = t.get("table_name").map(|s| s.as_str()).unwrap_or("?");
            let ttype = t.get("table_type").map(|s| s.as_str()).unwrap_or("");
            let icon = if ttype == "VIEW" { "👁" } else { "📋" };
            println!("  {} {}", icon, name);
        }

        println!("\n  {} Use 'aresa schema {} <table>' to see columns", "tip:".dimmed(), source.uri.as_deref().unwrap_or("source"));
    }

    Ok(())
}

async fn handle_schema_mysql(
    source: &config::DataSource,
    table: Option<String>,
    detailed: bool,
    renderer: &OutputRenderer,
) -> Result<()> {
    use connectors::mysql::MySqlConnector;

    let uri = source.uri.as_ref()
        .context("MySQL source missing URI")?;

    let connector = MySqlConnector::new(uri).await?;

    if let Some(table_name) = table {
        let sql = if detailed {
            format!("SHOW FULL COLUMNS FROM {}", table_name)
        } else {
            format!("DESCRIBE {}", table_name)
        };

        let (columns, rows) = connector.execute_sql(&sql, None).await?;
        println!("  {} Table: {}\n", "→".dimmed(), table_name.bright_white());
        renderer.render_query_results_simple(&columns, &rows)?;
    } else {
        let (_, tables) = connector.execute_sql("SHOW TABLES", None).await?;
        for t in &tables {
            if let Some((_, name)) = t.iter().next() {
                println!("  📋 {}", name);
            }
        }
    }

    Ok(())
}

async fn handle_schema_sqlite(
    source: &config::DataSource,
    table: Option<String>,
    _detailed: bool,
    renderer: &OutputRenderer,
) -> Result<()> {
    use connectors::sqlite::SqliteConnector;

    let path = source.uri.as_ref()
        .context("SQLite source missing path")?;

    let connector = SqliteConnector::new(path).await?;

    if let Some(table_name) = table {
        let sql = format!("PRAGMA table_info({})", table_name);
        let (columns, rows) = connector.execute_sql(&sql, None).await?;
        println!("  {} Table: {}\n", "→".dimmed(), table_name.bright_white());
        renderer.render_query_results_simple(&columns, &rows)?;
    } else {
        let (_, tables) = connector.execute_sql(
            "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name",
            None
        ).await?;

        for t in &tables {
            let name = t.get("name").map(|s| s.as_str()).unwrap_or("?");
            let ttype = t.get("type").map(|s| s.as_str()).unwrap_or("");
            let icon = if ttype == "view" { "👁" } else { "📋" };
            println!("  {} {}", icon, name);
        }
    }

    Ok(())
}

async fn handle_schema_duckdb(
    source: &config::DataSource,
    table: Option<String>,
    _detailed: bool,
    renderer: &OutputRenderer,
) -> Result<()> {
    use connectors::duckdb::DuckDbConnector;

    let path = source.uri.as_ref().map(|s| s.as_str());
    let connector = DuckDbConnector::new(path).await?;

    if let Some(table_name) = table {
        let sql = format!(
            "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{}'",
            table_name
        );
        let (columns, rows) = connector.execute_sql(&sql, None).await?;
        println!("  {} Table: {}\n", "→".dimmed(), table_name.bright_white());
        renderer.render_query_results_simple(&columns, &rows)?;
    } else {
        let (_, tables) = connector.execute_sql(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'",
            None
        ).await?;

        for t in &tables {
            if let Some(name) = t.get("table_name") {
                println!("  📋 {}", name);
            }
        }
    }

    Ok(())
}

async fn handle_schema_clickhouse(
    source: &config::DataSource,
    table: Option<String>,
    detailed: bool,
    renderer: &OutputRenderer,
) -> Result<()> {
    use connectors::clickhouse::ClickHouseConnector;

    let host = source.host.as_deref().unwrap_or("localhost");
    let port = source.port;
    let database = source.database.as_deref();
    let username = source.username.as_deref();
    let password = source.password.as_deref();

    let connector = ClickHouseConnector::new(host, port, database, username, password).await?;

    if let Some(table_name) = table {
        let sql = if detailed {
            format!("DESCRIBE TABLE {} FORMAT TabSeparatedWithNames", table_name)
        } else {
            format!("DESCRIBE TABLE {}", table_name)
        };
        let (columns, rows) = connector.execute_sql(&sql, None).await?;
        println!("  {} Table: {}\n", "→".dimmed(), table_name.bright_white());
        renderer.render_query_results_simple(&columns, &rows)?;
    } else {
        let (_, tables) = connector.execute_sql("SHOW TABLES", None).await?;
        for t in &tables {
            if let Some((_, name)) = t.iter().next() {
                println!("  📋 {}", name);
            }
        }
    }

    Ok(())
}

async fn handle_schema_snowflake(
    source: &config::DataSource,
    table: Option<String>,
    _detailed: bool,
    renderer: &OutputRenderer,
) -> Result<()> {
    use connectors::snowflake::SnowflakeConnector;

    let account = source.account.as_ref()
        .context("Snowflake source missing account")?;
    let username = source.username.as_ref()
        .context("Snowflake source missing username")?;
    let password = source.password.as_ref()
        .context("Snowflake source missing password")?;
    let warehouse = source.warehouse.as_ref()
        .context("Snowflake source missing warehouse")?;

    let connector = SnowflakeConnector::new(
        account,
        username,
        password,
        warehouse,
        source.database.as_deref(),
        source.schema.as_deref(),
    ).await?;

    if let Some(table_name) = table {
        let rows = connector.describe_table(&table_name).await?;
        println!("  {} Table: {}\n", "→".dimmed(), table_name.bright_white());
        let columns: Vec<String> = if let Some(first) = rows.first() {
            first.keys().cloned().collect()
        } else {
            vec![]
        };
        renderer.render_query_results_simple(&columns, &rows)?;
    } else {
        let tables = connector.list_tables().await?;
        for t in &tables {
            if let Some(name) = t.get("name") {
                println!("  📋 {}", name);
            }
        }
    }

    Ok(())
}

async fn handle_schema_databricks(
    source: &config::DataSource,
    table: Option<String>,
    _detailed: bool,
    renderer: &OutputRenderer,
) -> Result<()> {
    use connectors::databricks::DatabricksConnector;

    let host = source.host.as_ref()
        .context("Databricks source missing host")?;
    let warehouse = source.warehouse.as_ref()
        .context("Databricks source missing warehouse_id")?;
    let token = source.token.as_ref()
        .context("Databricks source missing token")?;

    let connector = DatabricksConnector::new(
        host,
        warehouse,
        token,
        source.catalog.as_deref(),
        source.schema.as_deref(),
    ).await?;

    if let Some(table_name) = table {
        let rows = connector.describe_table(&table_name).await?;
        println!("  {} Table: {}\n", "→".dimmed(), table_name.bright_white());
        let columns: Vec<String> = if let Some(first) = rows.first() {
            first.keys().cloned().collect()
        } else {
            vec![]
        };
        renderer.render_query_results_simple(&columns, &rows)?;
    } else {
        let tables = connector.list_tables().await?;
        for t in &tables {
            if let Some(name) = t.get("tableName") {
                println!("  📋 {}", name);
            }
        }
    }

    Ok(())
}
