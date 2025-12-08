# AresaDB

<div align="center">

**High-Performance Multi-Model Database Engine**

*Key-Value • Graph • Relational — All in One*

[![Rust](https://img.shields.io/badge/rust-1.75+-orange.svg)](https://www.rust-lang.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-passing-green.svg)](#testing)

</div>

---

## Overview

AresaDB is a blazing-fast, multi-model database built in Rust that unifies key-value, graph, and relational data models under a single **property graph** foundation. Designed for researchers, data scientists, and developers who need:

- **Extreme Speed**: Sub-millisecond lookups, 300+ records/sec import rate
- **Flexibility**: Store data as nodes with properties, query with SQL
- **Scalability**: Local storage + cloud bucket sync (S3/GCS)
- **Simplicity**: Single binary, zero configuration, schema-optional

```
┌─────────────────────────────────────────────────────────────────┐
│                         AresaDB CLI                             │
│              SQL Queries → Graph Engine → Results               │
├─────────────────────────────────────────────────────────────────┤
│                      Query Engine                               │
│   ├── SQL Parser (sqlparser-rs)                                │
│   ├── Query Planner & Optimizer                                │
│   └── Parallel Executor (multi-threaded traversal)             │
├─────────────────────────────────────────────────────────────────┤
│                   Unified Storage Engine                        │
│   ├── Node Store (properties, B+ tree indexes)                 │
│   ├── Edge Store (relationships, graph traversal)              │
│   └── MVCC Transaction Manager                                 │
├─────────────────────────────────────────────────────────────────┤
│                    Storage Backends                             │
│   ├── Local: redb (embedded B+ tree, ACID)                     │
│   └── Cloud: S3/GCS via object_store                           │
├─────────────────────────────────────────────────────────────────┤
│                  Vector/Embedding Support                       │
│   ├── Native Vector type for ML embeddings                     │
│   ├── Similarity Search (Cosine, Euclidean, Dot, Manhattan)    │
│   └── RAG-ready architecture                                   │
├─────────────────────────────────────────────────────────────────┤
│                  Distributed Features (V2)                      │
│   ├── Write-Ahead Log (WAL) for durability                     │
│   ├── Bloom Filters for fast negative lookups                  │
│   ├── LZ4 Compression                                          │
│   └── Consistent Hashing for sharding                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Installation

**From Source:**
```bash
cd aresa/tools/aresadb
cargo build --release

# Binary will be at ./target/release/aresadb
```

**Using Docker:**
```bash
# Build image
docker build -t aresadb .

# Run interactive REPL
docker run -it -v $(pwd)/data:/data aresadb

# Run with docker-compose (includes optional studio & monitoring)
docker-compose up -d
docker-compose --profile studio up -d       # With web UI
docker-compose --profile monitoring up -d   # With Prometheus/Grafana
```

### Basic Usage

```bash
# Initialize a new database
aresadb init ./mydata --name myapp

# Insert data
aresadb -d ./mydata insert user --props '{"name": "John", "email": "john@example.com", "age": 30}'
aresadb -d ./mydata insert user --props '{"name": "Jane", "email": "jane@example.com", "age": 28}'

# Query with SQL
aresadb -d ./mydata query "SELECT * FROM user"
aresadb -d ./mydata query "SELECT name, email FROM user WHERE age > 25"
aresadb -d ./mydata query "SELECT * FROM user ORDER BY age DESC"

# View data in different formats
aresadb -d ./mydata view user --as table
aresadb -d ./mydata view user --as kv
aresadb -d ./mydata -f json query "SELECT * FROM user"

# Check database status
aresadb -d ./mydata status

# Push to cloud storage
aresadb -d ./mydata push s3://mybucket/mydata
```

---

## Core Concepts

### Data Model

AresaDB uses a **property graph model** as its unified foundation:

```rust
// Every piece of data is a Node
Node {
    id: UUID,                              // Auto-generated unique ID
    node_type: String,                     // e.g., "user", "order", "product"
    properties: Map<String, Value>,        // Flexible key-value properties
    created_at: Timestamp,
    updated_at: Timestamp,
}

// Relationships are Edges
Edge {
    id: UUID,
    from: NodeId,
    to: NodeId,
    edge_type: String,                     // e.g., "purchased", "follows"
    properties: Map<String, Value>,
}

// Values support multiple types (including vectors for ML)
Value = String | Integer | Float | Boolean | Array | Object | Vector | Null
```

### Views

The same data can be viewed as:

| View | Description | Use Case |
|------|-------------|----------|
| **Table** | Relational rows/columns | SQL queries, reports |
| **Key-Value** | ID → JSON object | Fast lookups, caching |
| **Graph** | Nodes + Edges | Relationship analysis |

---

## CLI Reference

### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Create new database | `aresadb init ./db --name myapp` |
| `insert` | Insert a node | `aresadb insert user --props '{...}'` |
| `get` | Get node by ID | `aresadb get <uuid>` |
| `delete` | Delete a node | `aresadb delete <uuid>` |
| `query` | Execute SQL query | `aresadb query "SELECT * FROM users"` |
| `view` | View data (table/kv/graph) | `aresadb view users --as table` |
| `status` | Database statistics | `aresadb status` |
| `push` | Push to cloud | `aresadb push s3://bucket/path` |
| `connect` | Connect to remote | `aresadb connect s3://bucket/path` |
| `sync` | Sync with remote | `aresadb sync s3://bucket/path` |
| `traverse` | Graph traversal | `aresadb traverse <id> --depth 3` |
| `embed` | Insert with embedding | `aresadb embed doc --props '{...}' --vector '[...]'` |
| `search` | Vector similarity search | `aresadb search doc --vector '[...]' --k 10` |
| `chunk` | Split document for RAG | `aresadb chunk --text "..." --strategy fixed` |
| `context` | Retrieve RAG context | `aresadb context "query" --vector '[...]'` |
| `ingest` | Chunk + embed + store | `aresadb ingest --file doc.txt --provider local` |
| `repl` | Interactive shell | `aresadb repl` |

### Global Options

| Option | Description |
|--------|-------------|
| `-d, --database <PATH>` | Database path (default: current directory) |
| `-f, --format <FORMAT>` | Output format: `table`, `json`, `csv` |
| `-v, --verbose` | Enable verbose output |
| `-l, --limit <N>` | Limit number of results |

### SQL Support

AresaDB supports standard SQL queries:

```sql
-- Basic SELECT
SELECT * FROM users;
SELECT name, email FROM users WHERE age > 25;

-- Filtering
SELECT * FROM orders WHERE status = 'pending' AND amount > 100;

-- Ordering
SELECT * FROM products ORDER BY price DESC;

-- Limiting
SELECT * FROM logs LIMIT 100;

-- Column selection
SELECT id, name FROM users;
```

### Vector/Embeddings (RAG Support)

AresaDB includes native support for vector embeddings, making it suitable for RAG (Retrieval-Augmented Generation) systems:

```bash
# Insert documents with embeddings
aresadb embed document \
  --props '{"title": "Machine Learning Intro", "content": "ML is a field of AI"}' \
  --vector '[0.9, 0.1, 0.0, 0.0]' \
  --field embedding

aresadb embed document \
  --props '{"title": "Cooking Recipes", "content": "Italian pasta dishes"}' \
  --vector '[0.0, 0.0, 0.9, 0.1]' \
  --field embedding

# Similarity search via CLI
aresadb search document \
  --vector '[1.0, 0.0, 0.0, 0.0]' \
  --k 10 \
  --metric cosine

# Similarity search via SQL
aresadb query "VECTOR SEARCH document FIELD embedding FOR [1.0, 0.0, 0.0, 0.0] METRIC cosine LIMIT 10"

# Output:
#   #    Node ID                    Score        Distance
#   ──────────────────────────────────────────────────────────
#   1    abc123...                  0.9939       0.0061
#        "ML is a field of AI"
#   2    def456...                  0.0000       1.0000
#        "Italian pasta dishes"
```

**Supported Distance Metrics:**
- `cosine` - Cosine similarity (default, best for semantic search)
- `euclidean` - L2 distance
- `dot` - Dot product
- `manhattan` - L1 distance

**Programmatic Usage (Rust):**
```rust
// Insert with embedding
db.insert_with_embedding(
    "document",
    serde_json::json!({"content": "Hello world"}),
    "embedding",
    vec![0.1, 0.2, 0.3, 0.4],
).await?;

// Similarity search
let results = db.similarity_search(
    &[1.0, 0.0, 0.0, 0.0],  // query vector
    "document",             // node type
    "embedding",            // field name
    10,                     // top-k
    DistanceMetric::Cosine,
).await?;

for result in results {
    println!("Node: {}, Score: {:.4}", result.node_id, result.score);
}
```

---

## Library Usage (Rust)

```rust
use aresadb::{Database, Value};
use std::path::Path;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Create or open database
    let db = Database::create(Path::new("./mydata"), "myapp").await?;

    // Insert a node
    let user = db.insert_node("user", serde_json::json!({
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30
    })).await?;

    println!("Created user: {}", user.id);

    // Query nodes by type
    let users = db.get_all_by_type("user", Some(100)).await?;
    for user in users {
        println!("{}: {:?}", user.id, user.properties);
    }

    // Get node by ID
    if let Some(node) = db.get_node(&user.id.to_string()).await? {
        println!("Found: {:?}", node);
    }

    // Create edges (relationships)
    let order = db.insert_node("order", serde_json::json!({
        "amount": 150.50,
        "status": "pending"
    })).await?;

    db.create_edge(
        &user.id.to_string(),
        &order.id.to_string(),
        "placed",
        None
    ).await?;

    // Get database status
    let status = db.status().await?;
    println!("Nodes: {}, Edges: {}", status.node_count, status.edge_count);

    Ok(())
}
```

---

## Cloud Storage

### AWS S3

```bash
# Set credentials
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1

# Push database to S3
aresadb -d ./mydata push s3://mybucket/databases/myapp

# Connect to remote database
aresadb connect s3://mybucket/databases/myapp --readonly

# Sync changes
aresadb -d ./mydata sync s3://mybucket/databases/myapp
```

### Google Cloud Storage

```bash
# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Push to GCS
aresadb -d ./mydata push gs://mybucket/databases/myapp

# Connect to remote
aresadb connect gs://mybucket/databases/myapp
```

---

## Performance

### Benchmarks (Local Testing)

| Operation | Performance |
|-----------|-------------|
| **Insert** | ~300 records/sec |
| **Point Lookup** | < 1ms |
| **Scan (25K nodes)** | ~380ms |
| **Aggregation** | ~5ms |
| **Status Check** | ~113µs |

### Real-World Test: Fire Safety Dataset

Successfully imported 25,000 fire dispatch records from Vercel Blob:

```
Records imported:    25,000
Database size:       43.2 MB
Import rate:         312 records/sec
Zero errors:         ✓
```

---

## Architecture

### Project Structure

```
aresadb/
├── src/
│   ├── lib.rs              # Library root
│   ├── main.rs             # CLI entry point
│   ├── cli/                # CLI commands
│   │   ├── mod.rs
│   │   ├── commands.rs     # Subcommand definitions
│   │   ├── repl.rs         # Interactive REPL
│   │   └── config.rs       # Configuration management
│   ├── storage/            # Storage engine
│   │   ├── mod.rs          # Database struct
│   │   ├── node.rs         # Node/Edge data structures
│   │   ├── local.rs        # Local redb backend
│   │   ├── bucket.rs       # S3/GCS backend
│   │   ├── cache.rs        # LRU cache layer
│   │   └── parallel.rs     # Parallel execution
│   ├── query/              # Query engine
│   │   ├── mod.rs
│   │   ├── parser.rs       # SQL parsing
│   │   ├── planner.rs      # Query planning
│   │   └── executor.rs     # Query execution
│   ├── schema/             # Schema management
│   │   ├── mod.rs
│   │   ├── registry.rs     # Schema definitions
│   │   └── migration.rs    # Auto-migrations
│   ├── distributed/        # V2 distributed features
│   │   ├── mod.rs
│   │   ├── bloom.rs        # Bloom filters
│   │   ├── compression.rs  # LZ4 compression
│   │   ├── shard.rs        # Consistent hashing
│   │   ├── wal.rs          # Write-ahead log
│   │   ├── replication.rs  # Leader election
│   │   └── streaming.rs    # Streaming results
│   └── output/             # Output formatting
│       ├── mod.rs
│       ├── table.rs        # Table rendering
│       ├── graph_viz.rs    # Graph visualization
│       └── json.rs         # JSON output
├── tests/                  # Test suite
│   ├── integration_tests.rs
│   ├── property_tests.rs
│   ├── stress_tests.rs
│   └── common/
├── benches/                # Benchmarks
│   ├── storage_bench.rs
│   ├── query_bench.rs
│   └── distributed_bench.rs
└── examples/
    └── fire_safety_test.rs # Real-world data test
```

### Key Dependencies

| Crate | Purpose |
|-------|---------|
| `redb` | Embedded B+ tree storage (ACID) |
| `rkyv` | Zero-copy serialization |
| `object_store` | S3/GCS abstraction |
| `sqlparser` | SQL parsing |
| `petgraph` | Graph algorithms |
| `tokio` | Async runtime |
| `moka` | High-performance cache |
| `lz4_flex` | Fast compression |
| `siphasher` | Bloom filter hashing |

---

## Testing

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Run specific test
cargo test test_insert_and_get_node

# Run benchmarks
cargo bench

# Run example
cargo run --example fire_safety_test --release
```

---

## Configuration

Database configuration is stored in `.aresadb/config.toml`:

```toml
name = "myapp"
version = 1
created_at = "2024-01-01T00:00:00Z"
bucket_url = "s3://mybucket/myapp"  # Optional
```

Global CLI configuration at `~/.config/aresadb/config.toml`:

```toml
[defaults]
format = "table"
limit = 100
```

---

## Status & Roadmap

### Completed ✅

- [x] Core database engine (nodes, edges, properties)
- [x] SQL query engine (sqlparser-rs)
- [x] Vector embeddings & RAG support
- [x] Performance benchmarks (SQLite, DuckDB, Pandas)
- [x] Web UI dashboard (AresaDB Studio)
- [x] Docker containerization
- [x] CI/CD pipeline (GitHub Actions)
- [x] Technical publication

### In Progress 🔄

- [ ] Cloud storage integration (S3/GCS)
- [ ] Distributed mode (sharding, replication)

See [TODO.md](TODO.md) for the complete development roadmap.

---

## Documentation & Publications

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical deep-dive into the system design
- **[BENCHMARKS.md](BENCHMARKS.md)** - Performance methodology and results
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute getting started guide
- **[Technical Report](../../../apps/aresalab/public/publications/pdf/AresaDB--A-High-Performance-Multi-Model-Database-in-Rust.pdf)** - Full research publication with benchmarks

---

## Contributing

Contributions welcome! Please see our development guidelines:

1. Fork the repository
2. Create a feature branch
3. Run tests: `cargo test`
4. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by [Aresa Lab](https://github.com/aresa-lab)**

*Part of the Aresa research toolkit*

</div>
