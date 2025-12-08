# ARESA

**Autonomous Research Engineering & Synthesis Architecture**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Quarto](https://img.shields.io/badge/Made%20with-Quarto-blue)](https://quarto.org)
[![Rust](https://img.shields.io/badge/Rust-1.75+-orange.svg)](https://www.rust-lang.org)
[![Python](https://img.shields.io/badge/Python-3.9+-blue)](https://python.org)

---

## Vision

**Building self-improving, self-evaluating AI systems that advance STEM research autonomously.**

As AI capabilities advance with world models and cutting-edge research, humans are becoming the bottleneck of research progress. ARESA is building the scaffolding for scientifically controlled, empirically proven autonomous research—starting with human-in-the-loop collaboration and evolving toward independent discovery.

**Dual Mandate:**
- **Open Science**: Publishing validated research and tools that advance human knowledge
- **Engineering Solutions**: Deploying discoveries as production-ready systems

---

## Repository Structure

```
aresa/
├── apps/                          # Deployable Web Applications
│   ├── aresalab/                  # Main hub - research & publications
│   │   └── → aresalab.vercel.app
│   ├── fire-safety/               # Fire dispatch analytics (930K+ records)
│   │   └── → fire-safety.vercel.app
│   ├── aresadb-studio/            # AresaDB web interface
│   │   └── → aresadb-studio.vercel.app
│   ├── aresa-studio/              # Universal database management UI
│   │   └── → aresa-studio.vercel.app
│   └── cortex/                    # [WIP] AI agent framework
│
├── tools/                         # Development Tools & Libraries
│   ├── aresa-cli/                 # Rust CLI for any database
│   │   ├── → brew install aresa-cli
│   │   └── Supports: PostgreSQL, MySQL, BigQuery, SQLite,
│   │       ClickHouse, DuckDB, Snowflake, Databricks
│   └── aresadb/                   # High-performance multi-model database
│       └── Key-Value • Graph • Relational • Vector
│
├── publications/                  # Research papers (.qmd → PDF)
│   ├── spotify_popularity/        # ML: Genre×audio interactions
│   ├── manufacturing_analytics/   # Industrial: Cyclical failure discovery
│   ├── fire_safety_dashboard/     # Policy: $225M impact quantified
│   ├── network_analysis/          # Network: Centrality analysis
│   ├── aresadb_technical_report/  # DB: Architecture & benchmarks
│   └── ... more papers
│
├── notebooks/                     # Source analytical work
├── courses/                       # Educational content
└── scripts/                       # Build utilities
```

---

## Applications

### ARESA Lab
**Main research hub** — [aresalab.vercel.app](https://aresalab.vercel.app)

Publications, books, and documentation for the ARESA ecosystem.

### Fire Safety Analytics
**Public safety analytics** — [fire-safety.vercel.app](https://fire-safety.vercel.app)

Interactive dashboard analyzing 930K+ fire dispatch records across US cities. Features:
- Real-time map visualization
- Temporal analysis (seasonal, hourly patterns)
- False alarm detection ($225M annual impact)

### AresaDB Studio
**Database exploration UI** — [aresadb-studio.vercel.app](https://aresadb-studio.vercel.app)

Web interface for the AresaDB multi-model database with:
- SQL query editor
- Vector similarity search
- RAG playground
- Benchmark comparisons

### ARESA Studio
**Universal database management** — [aresa-studio.vercel.app](https://aresa-studio.vercel.app)

Beautiful web UI to query any database:
- PostgreSQL, MySQL, SQLite
- BigQuery, ClickHouse, DuckDB
- Snowflake, Databricks
- Schema explorer with search
- Query history & re-run
- Connection management

---

## Tools

### ARESA CLI

Fast, beautiful interface to query any database from the terminal.

```bash
# Install
brew tap yoreai/tap
brew install aresa-cli

# Add connections
aresa config add postgres mydb --uri "postgresql://user:pass@localhost:5432/db"
aresa config add bigquery prod --project my-gcp-project

# Query
aresa query mydb "SELECT * FROM users LIMIT 10"
aresa query prod "SELECT * FROM dataset.table" --format json

# Web UI
aresa serve  # Opens browser to http://localhost:3001
```

**Supported Databases:**
| Database | Connection | Status |
|----------|------------|--------|
| PostgreSQL | SQLx | ✅ |
| MySQL | SQLx | ✅ |
| SQLite | SQLx | ✅ |
| BigQuery | REST API | ✅ |
| ClickHouse | HTTP | ✅ |
| DuckDB | Native | ✅ |
| Snowflake | REST API | ✅ |
| Databricks | REST API | ✅ |

### AresaDB

High-performance multi-model database engine in Rust.

```bash
# Initialize
aresadb init ./mydata --name myapp

# Insert
aresadb insert user --props '{"name": "John", "age": 30}'

# Query with SQL
aresadb query "SELECT * FROM user WHERE age > 25"

# Vector search (RAG-ready)
aresadb search document --vector '[0.9, 0.1, ...]' --k 10
```

**Features:**
- Multi-model: Key-Value, Graph, Relational, Vector
- Sub-millisecond lookups
- Cloud sync (S3/GCS)
- Native vector embeddings for RAG
- Docker & docker-compose support

---

## Publications

| Domain | Paper | Key Contribution |
|--------|-------|------------------|
| **Machine Learning** | Spotify Popularity Prediction | Genre×audio interactions, ROC AUC 0.675 |
| **Industrial Engineering** | Manufacturing Analytics | Cyclical failure discovery, 5-source integration |
| **Public Policy** | Fire Safety Analytics | 930K records, $225M impact quantified |
| **Network Science** | College Football Networks | Degree vs. betweenness centrality |
| **Database Systems** | AresaDB Technical Report | Multi-model architecture, benchmarks |

**Build Publications:**
```bash
make pdf                    # Build all
make pdf spotify_popularity # Build specific
```

---

## Development

### Prerequisites

```bash
# macOS
brew install --cask quarto
brew install uv rust

# Verify
quarto --version
cargo --version
uv --version
```

### Build Everything

```bash
# Build ARESA CLI (with Web UI)
cd tools/aresa-cli
cargo build --release --features ui

# Build AresaDB
cd tools/aresadb
cargo build --release

# Build apps (Next.js)
cd apps/aresalab && npm install && npm run build
cd apps/fire-safety && npm install && npm run build
cd apps/aresadb-studio && npm install && npm run build
cd apps/aresa-studio && npm install && npm run build
```

### Test Environment

```bash
# Start test databases (Postgres, MySQL, ClickHouse, SQLite)
cd apps/aresa-studio/test-env
make up      # Start Docker containers
make setup   # Configure test connections
make test    # Run integration tests
make down    # Stop containers
```

---

## Roadmap

**Phase 1: Foundation** ✅
- Reproducible publication infrastructure
- Cross-domain synthesis demonstrations
- Production-ready database tools

**Phase 2: Automation** (Current)
- Agentic paper generation
- Cloud compute integration
- Automated app deployment

**Phase 3: Self-Improvement** (Future)
- Pattern library extraction
- Hypothesis generation
- Closed-loop feedback

---

## License

MIT License — Open research and tools for the community.

---

<div align="center">

**ARESA**: *Engineering the future of autonomous discovery.*

[ARESA Lab](https://aresalab.vercel.app) •
[Fire Safety](https://fire-safety.vercel.app) •
[AresaDB Studio](https://aresadb-studio.vercel.app) •
[ARESA Studio](https://aresa-studio.vercel.app)

</div>
