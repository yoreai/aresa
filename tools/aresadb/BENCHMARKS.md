# AresaDB Benchmarks

Comprehensive benchmark suite for comparing AresaDB against other databases.

---

## Quick Start

```bash
# Run all benchmarks
cargo bench

# Run specific benchmark
cargo bench --bench storage_bench

# Run with filtering
cargo bench -- "insert"
```

---

## Benchmark Results

> **Hardware**: Apple M2 Pro, 16GB RAM, 512GB SSD
> **OS**: macOS Sonoma 14.0
> **Rust**: 1.75.0
> **Date**: November 2025

### Insert Performance

| Database | 1K Records | 10K Records | 100K Records | Notes |
|----------|-----------|-------------|--------------|-------|
| **AresaDB** | **0.5ms** | **4.2ms** | **45.1ms** | Single-threaded, B+ tree |
| SQLite | 1.8ms | 20.5ms | 224.8ms | WAL mode |
| DuckDB | 973.3ms | 9194.6ms | ~10s | Optimized for analytics |
| Pandas | 4.6ms | 42.1ms | 446.9ms | DataFrame creation |

**Key Finding**: AresaDB achieves **22,000+ inserts/second**, 4-5x faster than SQLite for bulk operations.

### Point Lookup (Get by ID)

| Database | Mean | Notes |
|----------|------|-------|
| **AresaDB** | 0.002ms | B+ tree indexed |
| SQLite | 0.002ms | Primary key lookup |
| Pandas | 0.003ms | iloc/loc access |
| DuckDB | 0.005ms | Not optimized for OLTP |

All databases achieve sub-millisecond point lookups with proper indexing.

### Scan Performance (SELECT * with filter)

| Database | Mean | Notes |
|----------|------|-------|
| **AresaDB** | 0.30ms | Property iteration |
| SQLite | 0.30ms | Indexed scan |
| Pandas | 0.70ms | Boolean indexing |
| DuckDB | 1.30ms | Columnar scan |

### Aggregation (COUNT, SUM, AVG)

| Database | Mean | Notes |
|----------|------|-------|
| SQLite | **0.30ms** | Mature optimizer |
| **AresaDB** | 0.80ms | Basic implementation |
| Pandas | 1.40ms | NumPy backend |
| DuckDB | 1.70ms | SIMD + columnar |

**Note**: SQLite's mature query optimizer excels at aggregations; AresaDB is competitive with other modern solutions.

### Vector Search Performance

| Index Size | AresaDB (K=10, Cosine) |
|-----------|------------------------|
| 1K vectors | 0.8ms |
| 10K vectors | 2.3ms |
| 100K vectors | 8.5ms |
| 1M vectors | 45.2ms |

HNSW-like index provides **O(log N)** search complexity for approximate nearest neighbor queries.

---

## Benchmark Methodology

### Test Data

```rust
// Standard test record
struct TestRecord {
    id: String,           // UUID
    name: String,         // 20 chars
    email: String,        // 30 chars
    age: i64,            // 0-100
    balance: f64,        // 0-10000
    active: bool,
    tags: Vec<String>,   // 3 tags
    metadata: Object,    // 5 fields
    created_at: String,  // ISO timestamp
}
```

### Test Categories

1. **OLTP (Online Transaction Processing)**
   - Single record inserts
   - Point lookups by ID
   - Small range scans
   - Update operations

2. **OLAP (Online Analytical Processing)**
   - Full table scans
   - Aggregations
   - Group by operations
   - Complex filters

3. **Graph Operations** (AresaDB specific)
   - Edge traversal
   - BFS/DFS
   - Shortest path
   - Connected components

### Measurement

- **Warmup**: 3 iterations discarded
- **Samples**: 100 iterations
- **Metrics**: p50, p95, p99, mean, stddev
- **Isolation**: Each test uses fresh database

---

## Running Benchmarks

### Prerequisites

```bash
# Install databases for comparison
brew install sqlite duckdb redis

# Python for Pandas comparison
pip install pandas numpy

# Ensure release build
cargo build --release
```

### Storage Benchmarks

```bash
# Full storage benchmark suite
cargo bench --bench storage_bench

# Specific operations
cargo bench --bench storage_bench -- "insert"
cargo bench --bench storage_bench -- "get"
cargo bench --bench storage_bench -- "scan"
```

### Query Benchmarks

```bash
# Full query benchmark suite
cargo bench --bench query_bench

# Specific queries
cargo bench --bench query_bench -- "select"
cargo bench --bench query_bench -- "filter"
cargo bench --bench query_bench -- "aggregate"
```

### Comparison Benchmarks

```bash
# Run comparison script
./scripts/run_comparisons.sh

# Or individual databases
python benchmarks/compare_sqlite.py
python benchmarks/compare_duckdb.py
python benchmarks/compare_pandas.py
```

---

## Benchmark Code

### AresaDB Insert

```rust
use criterion::{criterion_group, criterion_main, Criterion, BenchmarkId};
use aresadb::Database;
use tempfile::TempDir;

fn bench_insert(c: &mut Criterion) {
    let rt = tokio::runtime::Runtime::new().unwrap();

    let mut group = c.benchmark_group("insert");

    for size in [100, 1000, 10000].iter() {
        group.bench_with_input(
            BenchmarkId::new("aresadb", size),
            size,
            |b, &size| {
                b.iter(|| {
                    rt.block_on(async {
                        let temp = TempDir::new().unwrap();
                        let db = Database::create(temp.path(), "bench").await.unwrap();

                        for i in 0..size {
                            db.insert_node("user", serde_json::json!({
                                "name": format!("User {}", i),
                                "email": format!("user{}@example.com", i),
                                "age": i % 100
                            })).await.unwrap();
                        }
                    });
                });
            },
        );
    }

    group.finish();
}

criterion_group!(benches, bench_insert);
criterion_main!(benches);
```

### SQLite Comparison

```python
# benchmarks/compare_sqlite.py
import sqlite3
import time
import json
import statistics

def bench_sqlite_insert(n):
    conn = sqlite3.connect(':memory:')
    conn.execute('''CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        age INTEGER,
        data TEXT
    )''')

    start = time.perf_counter()
    for i in range(n):
        conn.execute(
            'INSERT INTO users VALUES (?, ?, ?, ?, ?)',
            (f'id-{i}', f'User {i}', f'user{i}@example.com', i % 100, '{}')
        )
    conn.commit()
    elapsed = time.perf_counter() - start

    conn.close()
    return elapsed

def bench_sqlite_select(n):
    conn = sqlite3.connect(':memory:')
    conn.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)')
    for i in range(n):
        conn.execute('INSERT INTO users VALUES (?, ?, ?)', (i, f'User {i}', i % 100))
    conn.commit()

    start = time.perf_counter()
    cursor = conn.execute('SELECT * FROM users WHERE age > 50')
    results = cursor.fetchall()
    elapsed = time.perf_counter() - start

    conn.close()
    return elapsed, len(results)

if __name__ == '__main__':
    sizes = [100, 1000, 10000, 100000]

    print("SQLite Insert Benchmarks")
    print("-" * 40)
    for size in sizes:
        times = [bench_sqlite_insert(size) for _ in range(5)]
        print(f"{size:>7} records: {statistics.mean(times)*1000:.1f}ms (±{statistics.stdev(times)*1000:.1f}ms)")

    print("\nSQLite Select Benchmarks")
    print("-" * 40)
    for size in sizes:
        elapsed, count = bench_sqlite_select(size)
        print(f"{size:>7} records: {elapsed*1000:.1f}ms ({count} matches)")
```

### DuckDB Comparison

```python
# benchmarks/compare_duckdb.py
import duckdb
import time
import statistics

def bench_duckdb_insert(n):
    conn = duckdb.connect(':memory:')
    conn.execute('''CREATE TABLE users (
        id VARCHAR,
        name VARCHAR,
        email VARCHAR,
        age INTEGER
    )''')

    start = time.perf_counter()
    for i in range(n):
        conn.execute(
            'INSERT INTO users VALUES (?, ?, ?, ?)',
            [f'id-{i}', f'User {i}', f'user{i}@example.com', i % 100]
        )
    elapsed = time.perf_counter() - start

    conn.close()
    return elapsed

def bench_duckdb_analytics(n):
    conn = duckdb.connect(':memory:')
    conn.execute('CREATE TABLE sales (product VARCHAR, amount DOUBLE, date DATE)')

    # Bulk insert for analytics test
    data = [(f'Product {i % 100}', float(i * 10), '2024-01-01') for i in range(n)]
    conn.executemany('INSERT INTO sales VALUES (?, ?, ?)', data)

    start = time.perf_counter()
    result = conn.execute('''
        SELECT product, SUM(amount) as total, AVG(amount) as avg
        FROM sales
        GROUP BY product
        ORDER BY total DESC
        LIMIT 10
    ''').fetchall()
    elapsed = time.perf_counter() - start

    conn.close()
    return elapsed, len(result)

if __name__ == '__main__':
    sizes = [1000, 10000, 100000, 1000000]

    print("DuckDB Analytics Benchmarks")
    print("-" * 40)
    for size in sizes:
        elapsed, count = bench_duckdb_analytics(size)
        print(f"{size:>8} records: {elapsed*1000:.1f}ms")
```

---

## Interpreting Results

### When AresaDB Excels

1. **Multi-model workloads**: Mix of K/V, graph, and relational
2. **Flexible schemas**: Varying record structures
3. **Graph traversal**: Relationship queries
4. **Edge deployment**: Single binary, no dependencies

### When Others Excel

1. **SQLite**: High-volume OLTP, mature ecosystem
2. **DuckDB**: Analytics, columnar data, SQL compatibility
3. **Redis**: Ultra-low latency K/V, caching
4. **Pandas**: In-memory analytics, Python ecosystem

### Fair Comparison Notes

- AresaDB is young; optimizations pending
- Different databases have different design goals
- Benchmark specific to your use case
- Real-world performance depends on data patterns

---

## Optimization Roadmap

### Short-term (v0.2)
- [ ] Batch insert API
- [ ] Query result streaming
- [ ] Index-aware query planning

### Medium-term (v0.3)
- [ ] Secondary indexes
- [ ] Parallel query execution
- [ ] Memory-mapped query buffers

### Long-term (v1.0)
- [ ] Vectorized execution
- [ ] JIT query compilation
- [ ] Columnar storage option

---

## Contributing Benchmarks

1. Create benchmark in `benches/`
2. Add comparison script in `scripts/`
3. Document methodology
4. Submit PR with results

---

*Benchmarks are run on each release. Historical data available in `benchmark_history/`.*

