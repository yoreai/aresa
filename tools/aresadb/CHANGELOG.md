# Changelog

All notable changes to AresaDB will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Vector embeddings support for RAG
- Web UI dashboard
- Python client library
- Full-text search indexing

---

## [0.1.0] - 2024-11-28

### Added

#### Core Database
- Property graph data model with Nodes and Edges
- Flexible Value types: String, Integer, Float, Boolean, Array, Object, Null
- Local storage backend using redb (embedded B+ tree, ACID)
- Zero-copy serialization with rkyv
- CRUD operations for nodes and edges
- Type-based indexing for fast queries
- Edge traversal (from/to relationships)

#### Query Engine
- SQL parser integration (sqlparser-rs)
- SELECT queries with column selection
- WHERE clause filtering (=, !=, <, >, <=, >=)
- ORDER BY sorting (ASC, DESC)
- LIMIT clause support
- Query planning and basic optimization

#### CLI
- `init` - Initialize new databases
- `insert` - Insert nodes with JSON properties
- `get` - Retrieve nodes by UUID
- `delete` - Delete nodes
- `query` - Execute SQL queries
- `view` - Multiple view formats (table, kv, graph)
- `status` - Database statistics
- `push` / `connect` / `sync` - Cloud storage commands
- `repl` - Interactive shell with history
- `traverse` - Graph traversal from a node
- Multiple output formats: table, json, csv

#### Cloud Storage
- S3 support via object_store
- GCS support via object_store
- Push/sync functionality structure
- Cache layer for remote data

#### Distributed Features (V2)
- Write-Ahead Log (WAL) for durability
- Bloom filters for fast negative lookups
- LZ4 compression
- Consistent hashing for sharding
- Connection pooling structure
- Streaming results structure
- Leader election structure (Raft-like)

#### Testing
- Unit tests for core modules
- Integration tests
- Property-based tests (proptest)
- Stress/concurrency tests
- Real-world data test (550K fire safety records)

#### Documentation
- README.md with usage guide
- ARCHITECTURE.md with technical details
- TODO.md development roadmap

### Performance
- ~300 records/sec insert rate
- Sub-millisecond point lookups
- ~380ms for 25K node scan
- ~5ms aggregation queries

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.1.0 | 2024-11-28 | Initial release with core functionality |

---

## Upgrade Guide

### From Pre-release to 0.1.0

This is the initial release. No migration needed.

### Future Migrations

Database format changes will be documented here with migration scripts.

---

## Contributors

- Yevheniy Chuba ([@yevheniyc](https://github.com/yevheniyc)) - Creator

---

[Unreleased]: https://github.com/aresa-lab/aresadb/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/aresa-lab/aresadb/releases/tag/v0.1.0

