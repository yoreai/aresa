# ARESA CLI

**Fast, beautiful interface to query any database. Terminal + Web UI.**

Choose your interface:
- 🖥️ **Terminal mode** - Direct CLI queries with gorgeous output
- 🌐 **Web UI mode** - Beautiful browser interface (ARESA Studio)

No magic, no AI – just direct SQL with your choice of interface.

## Installation

```bash
# Homebrew (macOS/Linux)
brew tap yoreai/tap
brew install aresa-cli

# From source (CLI only)
cargo build --release

# With Web UI
cargo build --release --features ui

# Then run
./target/release/aresa --help      # CLI mode
./target/release/aresa serve       # Web UI mode 🌐
```

## Shell Completions

Enable tab-completion for your shell:

```bash
# Bash
aresa completions bash >> ~/.bashrc

# Zsh
aresa completions zsh >> ~/.zshrc

# Fish
aresa completions fish > ~/.config/fish/completions/aresa.fish
```

## Quick Start

### 1. Add a Connection

```bash
# BigQuery
aresa config add bigquery prod --project my-gcp-project

# PostgreSQL
aresa config add postgres mydb --uri "postgresql://user:pass@localhost:5432/database"

# MySQL
aresa config add mysql shop --uri "mysql://user:pass@localhost:3306/database"

# SQLite
aresa config add sqlite local --uri "/path/to/database.db"

# ClickHouse
aresa config add clickhouse analytics --host localhost --port 8123
```

### 2. Run Queries

```bash
# General format
aresa query <connection> "SQL QUERY"

# Examples
aresa query prod "SELECT * FROM dataset.table LIMIT 10"
aresa query mydb "SELECT COUNT(*) FROM users WHERE active = true"
aresa query local "SELECT * FROM sqlite_master WHERE type='table'"
```

### 3. Export Results

```bash
# Table (default - beautiful ASCII)
aresa query mydb "SELECT * FROM users" --format table

# JSON (pipe to jq)
aresa query mydb "SELECT * FROM users" --format json | jq '.[] | .name'

# CSV (export to file)
aresa query mydb "SELECT * FROM orders" --format csv > orders.csv

# Markdown (for documentation)
aresa query mydb "SELECT * FROM users" --format markdown
```

## Web UI Mode 🌐

```bash
# Start the web interface
aresa serve

# Opens browser automatically to http://localhost:3001
# Features:
# - Visual SQL Editor with Monaco
# - Schema Explorer with search
# - Query History with re-run
# - Connection Manager
# - Embedded Terminal
# - Help & CLI Reference
```

## Commands Reference

### `aresa query` - Execute SQL

```bash
aresa query <SOURCE> [QUERY] [OPTIONS]

Arguments:
  SOURCE    Connection name (from config)
  QUERY     SQL query to execute

Options:
  -l, --limit <N>      Limit results
  -f, --format <FMT>   Output: table, json, csv, markdown
  -h, --help           Show help
```

### `aresa config` - Manage Connections

```bash
# Add connections
aresa config add <TYPE> <NAME> [OPTIONS]

Types:
  bigquery   --project <PROJECT_ID>
  postgres   --uri <CONNECTION_URI>
  mysql      --uri <CONNECTION_URI>
  sqlite     --uri <FILE_PATH>
  clickhouse --host <HOST> [--port <PORT>]
  duckdb     --uri <FILE_PATH>

# List all connections
aresa config list

# Test a connection
aresa config test <NAME>

# Test all connections
aresa config check

# Remove a connection
aresa config remove <NAME>
```

### `aresa schema` - Explore Database Schema

```bash
# List all tables/views in a connection
aresa schema <SOURCE>

# Show columns for a specific table
aresa schema <SOURCE> <TABLE>

# Show detailed info (indexes, defaults)
aresa schema <SOURCE> <TABLE> --detailed

# BigQuery requires dataset.table format
aresa schema mybq dbt_prod.dimUser
```

### `aresa serve` - Start Web UI

```bash
aresa serve [OPTIONS]

Options:
  -p, --port <PORT>   Port number (default: 3001)
  --no-open           Don't open browser automatically
```

### Legacy Shortcuts

For convenience, database-specific shortcuts still work:

```bash
# BigQuery
aresa bq --datasets                           # List datasets
aresa bq --tables <DATASET>                   # List tables
aresa bq --schema <DATASET.TABLE>             # Show schema
aresa bq "SELECT * FROM dataset.table"        # Run query

# PostgreSQL
aresa pg <SOURCE> --tables                    # List tables
aresa pg <SOURCE> "SELECT * FROM users"       # Run query

# SQLite
aresa sqlite <PATH> --tables                  # List tables
aresa sqlite <PATH> "SELECT * FROM events"    # Run query
```

## Configuration

Config is stored at `~/.config/aresa/config.toml`

```toml
# Example config
[sources.prod]
type = "bigquery"
project = "my-gcp-project"

[sources.mydb]
type = "postgres"
uri = "postgresql://user:pass@localhost:5432/mydb"

[sources.analytics]
type = "clickhouse"
host = "localhost"
port = 8123
```

## Supported Databases

| Database | Connection Type | Status |
|----------|----------------|--------|
| BigQuery | REST API | ✅ Full support |
| PostgreSQL | SQLx | ✅ Full support |
| MySQL | SQLx | ✅ Full support |
| SQLite | SQLx | ✅ Full support |
| ClickHouse | HTTP | ✅ Full support |
| DuckDB | Native | ✅ Full support |

## Examples

### BigQuery

```bash
# List all datasets
aresa bq --datasets
╭────────────────────╮
│ dataset_name       │
├────────────────────┤
│ dbt_prod           │
│ dbt_staging        │
│ analytics          │
╰────────────────────╯

# Query with limit
aresa query prod "SELECT * FROM dbt_prod.users WHERE active = true" --limit 5
```

### PostgreSQL

```bash
# Explore schema
aresa schema mydb users
╭─────────────┬───────────┬──────────╮
│ column_name │ data_type │ nullable │
├─────────────┼───────────┼──────────┤
│ id          │ integer   │ NO       │
│ email       │ varchar   │ NO       │
│ name        │ varchar   │ YES      │
│ created_at  │ timestamp │ NO       │
╰─────────────┴───────────┴──────────╯
```

### Export Pipeline

```bash
# Export to JSON and process with jq
aresa query mydb "SELECT * FROM orders" --format json | jq '.[].total' | sort -n

# Generate CSV report
aresa query prod "SELECT date, revenue FROM sales" --format csv > report.csv
```

## Why ARESA?

- ⚡ **Fast** – Direct database queries, no middleware
- 🎯 **Predictable** – You write SQL, you know what you get
- 🎨 **Beautiful** – Gorgeous output in terminal and browser
- 🔧 **Universal** – One tool for BigQuery, Postgres, MySQL, SQLite, ClickHouse
- 💰 **Free** – No API costs, no subscriptions
- 🔄 **Scriptable** – Works in pipelines with JSON/CSV output
- 🌐 **Visual** – Full web UI when you need it

## Development

```bash
# Run tests
cargo test

# Build with UI (aresa-studio is now in apps/)
cd ../../apps/aresa-studio && npm run build
cd ../../tools/aresa-cli && cargo build --release --features ui

# Test environment (Docker)
cd ../../apps/aresa-studio/test-env
make up      # Start Postgres, MySQL, ClickHouse, SQLite, Mock cloud
make setup   # Configure test connections
make test    # Run integration tests
make down    # Stop containers
```

## License

MIT
