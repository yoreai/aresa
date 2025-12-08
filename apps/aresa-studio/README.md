# ARESA Studio

**Beautiful web UI for ARESA CLI** - Universal database management in your browser!

## Overview

ARESA Studio is a React-based web interface that provides visual database management capabilities for ARESA CLI. It embeds directly into the `aresa` binary for a seamless experience.

## Features

- 📊 **Dashboard** - Overview of all connections, recent queries, and quick actions
- 🎯 **SQL Editor** - Monaco-powered editor with syntax highlighting
- 🗂️ **Schema Explorer** - Browse tables and columns with search & filtering
- 📜 **Query History** - Search, filter, and re-run past queries
- ⚙️ **Connection Manager** - Add, test, and manage database connections
- 💻 **Terminal** - Embedded PTY shell with full CLI access
- 📚 **Help & Docs** - CLI reference with copy-to-clipboard examples

## Architecture

```
Browser (http://localhost:3001)
    ↓ HTTP / WebSocket
Axum Server (Rust)
    ↓
ARESA Connectors
    ├── BigQuery (REST API)
    ├── PostgreSQL (SQLx)
    ├── MySQL (SQLx)
    ├── SQLite (SQLx)
    ├── ClickHouse (HTTP)
    └── DuckDB (Native)
```

## Quick Start

### Run with ARESA CLI

```bash
# Build CLI with UI support
cd ../aresa-cli
cargo build --release --features ui

# Start the server
./target/release/aresa serve
# Opens browser to http://localhost:3001
```

### Development Mode

```bash
cd aresa-studio
npm install
npm run dev
# Frontend on http://localhost:3000

# In another terminal - start backend
cd ../aresa-cli
cargo run --features ui -- serve --port 3001 --no-open
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Radix UI primitives
- **Icons:** Lucide React
- **Editor:** Monaco Editor
- **Tables:** AG Grid Community
- **Animations:** Framer Motion

## Project Structure

```
aresa-studio/
├── app/
│   ├── page.tsx           # Dashboard
│   ├── query/             # SQL Editor
│   ├── schema/            # Schema Explorer
│   ├── history/           # Query History
│   ├── connections/       # Connection Manager
│   ├── terminal/          # Embedded Terminal
│   ├── help/              # CLI Reference
│   ├── settings/          # Settings
│   └── layout.tsx         # Main layout
├── components/
│   ├── Sidebar.tsx        # Collapsible navigation
│   ├── Terminal.tsx       # xterm.js wrapper
│   ├── ResultsTable.tsx   # Query results
│   └── ...
├── lib/
│   ├── api.ts             # API client
│   └── connection-state.ts # Shared state
├── test-env/              # Docker test environment
│   ├── docker-compose.yml
│   ├── Makefile
│   └── README.md
└── out/                   # Static build output
```

## API Endpoints

The Rust backend provides these REST endpoints:

| Endpoint                            | Method    | Purpose                     |
| ----------------------------------- | --------- | --------------------------- |
| `/api/connections`                  | GET       | List all configured sources |
| `/api/connections`                  | POST      | Add a new connection        |
| `/api/connections/:name`            | DELETE    | Remove a connection         |
| `/api/connections/:name/ping`       | GET       | Test connection health      |
| `/api/query`                        | POST      | Execute SQL query           |
| `/api/history`                      | GET       | Get query history           |
| `/api/schema/:source/tables`        | GET       | List tables/views           |
| `/api/schema/:source/tables/:table` | GET       | Get table schema            |
| `/ws/terminal`                      | WebSocket | Terminal PTY stream         |

### Example: Add Connection via API

```bash
# Add a SQLite connection
curl -X POST http://localhost:3001/api/connections \
  -H "Content-Type: application/json" \
  -d '{"name": "mydb", "type": "sqlite", "uri": "/path/to/db.sqlite"}'

# Add a BigQuery connection
curl -X POST http://localhost:3001/api/connections \
  -H "Content-Type: application/json" \
  -d '{"name": "prod-bq", "type": "bigquery", "project": "my-gcp-project"}'
```

## Test Environment

A Docker-based test environment is included for integration testing:

```bash
cd test-env

# Start all databases
make up

# Set up test connections in ARESA
make setup

# Run tests
make test

# Stop everything
make down
```

See [test-env/README.md](test-env/README.md) for full documentation.

## Design Principles

- **Dark mode first** - Easy on the eyes for long sessions
- **Keyboard friendly** - Navigate without leaving the keyboard
- **Terminal aesthetic** - Familiar feel for developers
- **Fast & responsive** - No unnecessary loading states
- **Connection persistent** - Your selection stays as you navigate

## Screenshots

### Dashboard

Quick overview with connection status and recent activity.

### Query Editor

Monaco editor with syntax highlighting and instant results.

### Schema Explorer

Browse tables, search, and filter by type.

### Help & Docs

Copy-paste CLI commands for any database.

## Future Enhancements

- [ ] Visual query builder (drag & drop)
- [ ] ER diagram generator
- [ ] Data visualization / charting
- [ ] Query performance analysis
- [ ] Saved queries / snippets
- [ ] Multi-tab query editor
- [ ] Export to Parquet/Arrow

## License

MIT - Part of the ARESA project
