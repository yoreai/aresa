# AresaDB Architecture

> Technical deep-dive into AresaDB's internal architecture for developers and contributors.

---

## Overview

AresaDB is a multi-model database that unifies three data paradigms under a single property graph foundation:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │   CLI   │  │  REPL   │  │   SQL   │  │  Library (Rust) │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘ │
└───────┼────────────┼───────────┼─────────────────┼──────────┘
        └────────────┴───────────┴─────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     Query Engine                             │
│  ┌─────────────┐  ┌───────┴──────┐  ┌─────────────────────┐ │
│  │   Parser    │──│   Planner    │──│     Executor        │ │
│  │ (sqlparser) │  │ (optimizer)  │  │ (parallel/async)    │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                   Storage Engine                             │
│  ┌─────────────┐  ┌───────┴──────┐  ┌─────────────────────┐ │
│  │ Node Store  │  │  Edge Store  │  │   Index Store       │ │
│  │ (properties)│  │(relationships│  │  (B+ tree)          │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼──────────────────────┼───────────┘
          └────────────────┴──────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                   Backend Layer                              │
│  ┌─────────────────┐  ┌───┴───────────┐  ┌────────────────┐ │
│  │  Local (redb)   │  │ Cloud (S3/GCS)│  │  Cache (moka)  │ │
│  │  B+ tree, ACID  │  │ object_store  │  │  LRU, async    │ │
│  └─────────────────┘  └───────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Core Entities

#### Node

The fundamental unit of data in AresaDB:

```rust
pub struct Node {
    /// Unique identifier (UUID v4)
    pub id: NodeId,

    /// Type classification (e.g., "user", "order", "product")
    pub node_type: String,

    /// Flexible properties map
    pub properties: BTreeMap<String, Value>,

    /// Timestamps
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}
```

#### Edge

Represents relationships between nodes:

```rust
pub struct Edge {
    /// Unique identifier (UUID v4)
    pub id: EdgeId,

    /// Source node
    pub from: NodeId,

    /// Target node
    pub to: NodeId,

    /// Relationship type (e.g., "purchased", "follows")
    pub edge_type: String,

    /// Edge properties
    pub properties: BTreeMap<String, Value>,

    /// Timestamps
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}
```

#### Value

Supports multiple data types:

```rust
pub enum Value {
    Null,
    Bool(bool),
    Integer(i64),
    Float(f64),
    String(String),
    Array(Vec<Value>),
    Object(BTreeMap<String, Value>),
}
```

### Why Property Graph?

The property graph model naturally supports all three paradigms:

| Paradigm | Mapping |
|----------|---------|
| **Key-Value** | `NodeId → Node` |
| **Relational** | `node_type` as table, properties as columns |
| **Graph** | Nodes + Edges with traversal |

---

## Storage Engine

### Local Storage (redb)

We use [redb](https://github.com/cberner/redb), an embedded B+ tree database:

**Why redb?**
- Pure Rust, no FFI
- ACID transactions
- Memory-mapped I/O
- Zero-copy reads
- Excellent performance

**Table Structure:**

```rust
// Node storage
const NODES: TableDefinition<&[u8], &[u8]> = TableDefinition::new("nodes");

// Edge storage
const EDGES: TableDefinition<&[u8], &[u8]> = TableDefinition::new("edges");

// Type index (node_type → list of node IDs)
const TYPE_INDEX: MultimapTableDefinition<&str, &[u8]> =
    MultimapTableDefinition::new("type_index");

// Edge indexes
const EDGE_FROM_INDEX: MultimapTableDefinition<&[u8], &[u8]> =
    MultimapTableDefinition::new("edge_from");
const EDGE_TO_INDEX: MultimapTableDefinition<&[u8], &[u8]> =
    MultimapTableDefinition::new("edge_to");
```

### Serialization (rkyv)

We use [rkyv](https://github.com/rkyv/rkyv) for zero-copy deserialization:

```rust
#[derive(Archive, Serialize, Deserialize)]
#[archive(check_bytes)]
pub struct Node {
    // ...
}

// Reading a node is nearly free - no parsing needed
let archived = rkyv::check_archived_root::<Node>(&bytes)?;
```

**Benefits:**
- Near-instant deserialization
- Reduced memory allocation
- Cache-friendly

### Cloud Storage

Using [object_store](https://github.com/apache/arrow-rs/tree/master/object_store):

```rust
// S3
let store = AmazonS3Builder::from_env()
    .with_bucket_name("mybucket")
    .build()?;

// GCS
let store = GoogleCloudStorageBuilder::from_env()
    .with_bucket_name("mybucket")
    .build()?;

// Unified interface
store.put(&path, bytes).await?;
let data = store.get(&path).await?.bytes().await?;
```

**Sync Strategy:**
1. Local database is primary
2. Cloud is backup/distribution
3. Bidirectional sync on demand
4. Intelligent chunking for large files

---

## Query Engine

### SQL Parsing

Using [sqlparser-rs](https://github.com/sqlparser-rs/sqlparser-rs):

```rust
let dialect = GenericDialect {};
let ast = Parser::parse_sql(&dialect, sql)?;

// AST is transformed to our internal query representation
let query = QueryParser::parse(ast)?;
```

### Query Planning

```rust
pub struct QueryPlan {
    pub steps: Vec<PlanStep>,
    pub estimated_cost: f64,
}

pub enum PlanStep {
    // Scan all nodes of a type
    TableScan { node_type: String },

    // Use index for specific ID
    IndexLookup { id: NodeId },

    // Filter by condition
    Filter { condition: Condition },

    // Sort results
    Sort { order_by: Vec<OrderBy> },

    // Limit output
    Limit { count: usize },

    // Graph traversal
    Traverse { from: NodeId, edge_type: Option<String>, depth: usize },
}
```

### Query Execution

Parallel execution using Tokio:

```rust
pub struct QueryExecutor {
    storage: Arc<LocalStorage>,
    cache: Arc<CacheLayer>,
}

impl QueryExecutor {
    pub async fn execute(&self, plan: QueryPlan) -> Result<QueryResult> {
        let mut results = Vec::new();

        for step in plan.steps {
            results = match step {
                PlanStep::TableScan { node_type } => {
                    self.storage.get_nodes_by_type(&node_type, None).await?
                }
                PlanStep::Filter { condition } => {
                    self.filter(results, &condition)
                }
                // ...
            };
        }

        Ok(QueryResult::from_nodes(results))
    }
}
```

---

## Distributed Features (V2)

### Write-Ahead Log (WAL)

Ensures durability and enables crash recovery:

```rust
pub struct WriteAheadLog {
    file: BufWriter<File>,
    sequence: AtomicU64,
}

pub enum WalEntry {
    InsertNode { node: Node },
    UpdateNode { id: NodeId, properties: Value },
    DeleteNode { id: NodeId },
    InsertEdge { edge: Edge },
    DeleteEdge { id: EdgeId },
    Checkpoint { sequence: u64 },
}

impl WriteAheadLog {
    pub fn append(&mut self, entry: WalEntry) -> Result<u64> {
        let seq = self.sequence.fetch_add(1, Ordering::SeqCst);
        let data = bincode::serialize(&entry)?;
        let checksum = crc32fast::hash(&data);

        self.file.write_all(&seq.to_le_bytes())?;
        self.file.write_all(&(data.len() as u32).to_le_bytes())?;
        self.file.write_all(&checksum.to_le_bytes())?;
        self.file.write_all(&data)?;
        self.file.flush()?;

        Ok(seq)
    }
}
```

### Bloom Filters

Fast negative lookups before disk access:

```rust
pub struct BloomFilter {
    bits: Vec<AtomicU64>,
    num_hashes: usize,
    size: usize,
}

impl BloomFilter {
    pub fn insert(&self, key: &[u8]) {
        for i in 0..self.num_hashes {
            let hash = self.hash(key, i);
            let idx = hash % self.size;
            let word = idx / 64;
            let bit = idx % 64;
            self.bits[word].fetch_or(1 << bit, Ordering::Relaxed);
        }
    }

    pub fn may_contain(&self, key: &[u8]) -> bool {
        for i in 0..self.num_hashes {
            let hash = self.hash(key, i);
            let idx = hash % self.size;
            let word = idx / 64;
            let bit = idx % 64;
            if self.bits[word].load(Ordering::Relaxed) & (1 << bit) == 0 {
                return false;
            }
        }
        true
    }
}
```

### Consistent Hashing

For sharding across multiple nodes:

```rust
pub struct ConsistentHash {
    ring: BTreeMap<u64, ShardId>,
    virtual_nodes: usize,
}

impl ConsistentHash {
    pub fn get_shard(&self, key: &[u8]) -> ShardId {
        let hash = xxhash_rust::xxh3::xxh3_64(key);

        // Find first node >= hash
        self.ring
            .range(hash..)
            .next()
            .or_else(|| self.ring.iter().next())
            .map(|(_, shard)| *shard)
            .unwrap()
    }
}
```

### Compression (LZ4)

Fast compression for storage efficiency:

```rust
pub struct Compressor;

impl Compressor {
    pub fn compress(&self, data: &[u8]) -> Result<Vec<u8>> {
        Ok(lz4_flex::compress_prepend_size(data))
    }

    pub fn decompress(&self, data: &[u8]) -> Result<Vec<u8>> {
        lz4_flex::decompress_size_prepended(data)
            .map_err(|e| anyhow::anyhow!("Decompression failed: {}", e))
    }
}
```

---

## CLI Architecture

### Command Structure

Using [clap](https://github.com/clap-rs/clap) derive macros:

```rust
#[derive(Parser)]
#[command(name = "aresadb")]
pub struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,

    #[arg(short, long)]
    database: Option<PathBuf>,

    #[arg(short, long, default_value = "table")]
    format: OutputFormat,
}

#[derive(Subcommand)]
enum Commands {
    Init { path: PathBuf, name: String },
    Insert { node_type: String, props: String },
    Query { sql: String },
    // ...
}
```

### REPL Implementation

Interactive shell with history and highlighting:

```rust
pub struct Repl {
    editor: Editor<ReplHelper, FileHistory>,
    db: Arc<Database>,
    format: OutputFormat,
}

impl Repl {
    pub async fn run(&mut self) -> Result<()> {
        loop {
            match self.editor.readline("aresadb> ") {
                Ok(line) => {
                    self.editor.add_history_entry(&line)?;
                    self.execute(&line).await?;
                }
                Err(ReadlineError::Eof) => break,
                Err(e) => eprintln!("Error: {}", e),
            }
        }
        Ok(())
    }
}
```

---

## Performance Optimizations

### Memory Management

1. **Zero-copy reads**: rkyv allows reading directly from memory-mapped files
2. **Arena allocation**: Batch operations use arena allocators
3. **Object pooling**: Reuse buffers for serialization

### Concurrency

1. **Read-write locks**: `parking_lot::RwLock` for hot paths
2. **Lock-free structures**: `DashMap` for concurrent access
3. **Async I/O**: Tokio for non-blocking operations

### Caching

```rust
pub struct CacheLayer {
    node_cache: Cache<NodeId, Node>,
    query_cache: Cache<String, QueryResult>,
}

// Moka cache with TTL and size limits
let cache = Cache::builder()
    .max_capacity(10_000)
    .time_to_live(Duration::from_secs(300))
    .build();
```

### Indexing

1. **Type index**: O(1) lookup by node type
2. **Edge indexes**: O(1) edge traversal
3. **Bloom filters**: Skip disk reads for non-existent keys

---

## File Format

### Database Directory Structure

```
mydb/
├── .aresadb/
│   ├── config.toml      # Database configuration
│   ├── data.redb        # Main data file
│   ├── wal/             # Write-ahead log files
│   │   ├── 0000000001.wal
│   │   └── 0000000002.wal
│   └── cache/           # Local cache files
└── .gitignore           # Ignore cache/wal
```

### Config Format

```toml
name = "myapp"
version = 1
created_at = "2024-01-01T00:00:00Z"
bucket_url = "s3://mybucket/myapp"

[cache]
max_size_mb = 100
ttl_seconds = 300

[compression]
enabled = true
algorithm = "lz4"
```

---

## Testing Strategy

### Test Pyramid

```
         /\
        /  \  E2E Tests (CLI, Integration)
       /----\
      /      \  Integration Tests (Module interactions)
     /--------\
    /          \  Unit Tests (Individual functions)
   /--------------\
```

### Test Categories

1. **Unit Tests**: Each module has `#[cfg(test)]` tests
2. **Integration Tests**: `tests/` directory
3. **Property Tests**: `proptest` for invariant checking
4. **Stress Tests**: Concurrency and load testing
5. **Benchmarks**: Criterion.rs benchmarks

---

## Future Architecture Considerations

### Pluggable Storage

```rust
pub trait StorageBackend: Send + Sync {
    async fn get(&self, key: &[u8]) -> Result<Option<Vec<u8>>>;
    async fn put(&self, key: &[u8], value: &[u8]) -> Result<()>;
    async fn delete(&self, key: &[u8]) -> Result<()>;
    async fn scan(&self, prefix: &[u8]) -> Result<Vec<(Vec<u8>, Vec<u8>)>>;
}
```

### Vector Storage (RAG)

```rust
pub struct VectorIndex {
    // HNSW graph for approximate nearest neighbors
    graph: HnswGraph,
    // Dimension of vectors
    dim: usize,
}

impl VectorIndex {
    pub fn search(&self, query: &[f32], k: usize) -> Vec<(NodeId, f32)> {
        self.graph.search(query, k)
    }
}
```

---

*This document is maintained alongside the codebase. Last updated: November 2024*

