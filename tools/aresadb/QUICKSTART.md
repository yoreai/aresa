# AresaDB Quick Start Guide

Get up and running with AresaDB in 5 minutes.

---

## Installation

### From Source (Recommended)

```bash
# Clone and build
cd aresa/tools/aresadb
cargo build --release

# Add to PATH (optional)
export PATH="$PATH:$(pwd)/target/release"

# Verify installation
aresadb --version
```

### Pre-built Binaries

Coming soon! Check [Releases](https://github.com/aresa-lab/aresadb/releases).

---

## Your First Database

### 1. Initialize

```bash
# Create a new database
aresadb init ./mydata --name "My First DB"
```

### 2. Insert Data

```bash
# Insert some users
aresadb -d ./mydata insert user --props '{
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}'

aresadb -d ./mydata insert user --props '{
  "name": "Bob",
  "email": "bob@example.com",
  "role": "user"
}'
```

### 3. Query Data

```bash
# View all users
aresadb -d ./mydata view user

# SQL query
aresadb -d ./mydata query "SELECT * FROM user"

# Filter
aresadb -d ./mydata query "SELECT * FROM user WHERE role = 'admin'"
```

### 4. Check Status

```bash
aresadb -d ./mydata status
```

---

## 5-Minute Demo

```bash
# Create demo database
aresadb init ./demo --name "Quick Demo"

# Add products
for i in 1 2 3 4 5; do
  aresadb -d ./demo insert product --props "{
    \"sku\": \"SKU-$i\",
    \"name\": \"Product $i\",
    \"price\": $((i * 100)),
    \"in_stock\": true
  }"
done

# Query products
aresadb -d ./demo query "SELECT * FROM product"
aresadb -d ./demo query "SELECT * FROM product WHERE price > 200"
aresadb -d ./demo query "SELECT * FROM product ORDER BY price DESC LIMIT 3"

# JSON output for APIs
aresadb -d ./demo -f json query "SELECT * FROM product"

# Database stats
aresadb -d ./demo status
```

---

## Common Operations

### Insert

```bash
aresadb -d ./db insert <type> --props '<json>'
```

### Query (SQL)

```bash
aresadb -d ./db query "SELECT * FROM <type> WHERE <condition>"
```

### View (formatted)

```bash
aresadb -d ./db view <type>           # Table format
aresadb -d ./db view <type> --as kv   # Key-value format
aresadb -d ./db view <type> --as json # JSON format
```

### Delete

```bash
aresadb -d ./db delete <uuid>
```

---

## Output Formats

```bash
# Table (default)
aresadb -d ./db query "SELECT * FROM users"

# JSON
aresadb -d ./db -f json query "SELECT * FROM users"

# CSV
aresadb -d ./db -f csv query "SELECT * FROM users" > users.csv
```

---

## Cloud Storage (Preview)

```bash
# Push to S3
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
aresadb -d ./db push s3://bucket/path

# Connect to remote
aresadb connect s3://bucket/path --readonly
```

---

## Interactive Mode (REPL)

```bash
aresadb -d ./db repl
```

```
aresadb> SELECT * FROM users
aresadb> INSERT INTO users VALUES (...)
aresadb> .status
aresadb> .help
aresadb> .exit
```

---

## Next Steps

- 📖 [Full README](README.md) - Complete documentation
- 🏗️ [Architecture](ARCHITECTURE.md) - Technical deep-dive
- 📚 [Examples](EXAMPLES.md) - Real-world use cases
- 🔒 [Security](SECURITY.md) - Best practices

---

## Getting Help

```bash
# Command help
aresadb --help
aresadb <command> --help

# Version info
aresadb --version
```

Questions? [Open an issue](https://github.com/aresa-lab/aresadb/issues)!

---

*Happy querying! 🚀*

