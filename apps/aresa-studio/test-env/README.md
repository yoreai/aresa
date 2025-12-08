# ARESA Studio - Integration Test Environment

A comprehensive Docker-based test environment for ARESA Studio with all supported database types pre-configured with sample data, including **mock servers for cloud platforms** (Snowflake, Databricks).

## 🚀 Quick Start

```bash
cd test-env

# Start everything with one command
make all

# Or step by step:
make up       # Start database containers
make setup    # Configure test connections
make serve    # Start ARESA Studio
```

### Using Makefile (Recommended)

```bash
make up       # Start all database containers
make down     # Stop all containers
make restart  # Restart all containers
make clean    # Stop and remove all data
make status   # Show container status
make logs     # Follow all logs
make test     # Run integration tests
```

## 📦 What's Included

### Database Containers

| Database   | Port  | User    | Password        | Database    |
|------------|-------|---------|-----------------|-------------|
| PostgreSQL | 5433  | aresa   | aresa_test_123  | aresa_test  |
| MySQL      | 3307  | aresa   | aresa_test_123  | aresa_test  |
| ClickHouse | 8124  | aresa   | aresa_test_123  | aresa_test  |

### Mock Cloud Services

| Service     | Port | Description                              |
|-------------|------|------------------------------------------|
| Mock Cloud  | 8443 | Simulates Snowflake + Databricks REST APIs |

The mock server provides realistic API responses for testing without cloud credentials:
- **Snowflake API**: `/api/v2/statements` - SQL execution, schema queries
- **Databricks API**: `/api/2.0/sql/statements` - SQL execution, catalog queries

### Test Connections

After running `setup-test-connections.sh`:

- **test-postgres** - PostgreSQL with employees, departments, orders, products
- **test-mysql** - MySQL with customers, products, orders, order_details
- **test-clickhouse** - ClickHouse with analytics events, page_views, sales
- **test-sqlite** - Local SQLite with users, posts, comments
- **test-snowflake** - Mock Snowflake with EMPLOYEES, PRODUCTS tables
- **test-databricks** - Mock Databricks with employees, products tables

## 📊 Sample Data

### PostgreSQL Tables

| Table       | Description                    | Rows |
|-------------|--------------------------------|------|
| employees   | Employee records with JSON     | 10   |
| departments | Department info with budgets   | 5    |
| orders      | Orders with items array        | 5    |
| products    | Products with attributes JSON  | 5    |

**Views:** `employee_summary`, `order_stats`

### MySQL Tables

| Table          | Description                | Rows |
|----------------|----------------------------|------|
| customers      | Customer master data       | 8    |
| products       | Product catalog with ENUM  | 8    |
| orders         | Order headers              | 5    |
| order_details  | Order line items           | 9    |
| inventory_log  | Stock movements            | 5    |

**Views:** `customer_orders_summary`, `product_sales`

### ClickHouse Tables

| Table          | Description                    | Rows |
|----------------|--------------------------------|------|
| events         | User events (MergeTree)        | 10   |
| page_views     | Page view analytics            | 6    |
| user_metrics   | Aggregated metrics (Summing)   | 6    |
| sales          | Sales transactions             | 5    |
| server_metrics | Time series metrics            | 6    |

**Views:** `daily_events_summary`, `sales_by_region`

### SQLite Tables

| Table    | Description        | Rows |
|----------|--------------------|------|
| users    | User accounts      | 3    |
| posts    | Blog posts         | 4    |
| comments | Post comments      | 4    |

**Views:** `post_summary`

### Mock Snowflake Tables

| Table           | Description               | Rows |
|-----------------|---------------------------|------|
| EMPLOYEES       | Employee records          | 5    |
| PRODUCTS        | Product catalog           | 3    |

**Views:** `EMPLOYEE_SUMMARY`

### Mock Databricks Tables

| Table           | Description               | Rows |
|-----------------|---------------------------|------|
| employees       | Employee records          | 5    |
| products        | Product catalog           | 3    |

**Views:** `employee_summary`

## 🧪 Test Scenarios

### 1. Connection Testing

```bash
# Test each connection
aresa ping test-postgres
aresa ping test-mysql
aresa ping test-clickhouse
aresa ping test-sqlite
aresa ping test-snowflake   # Uses mock server
aresa ping test-databricks  # Uses mock server
```

### 2. Schema Explorer Testing

Open ARESA Studio and verify:
- [ ] All connections appear in Schema Explorer
- [ ] Tables and views load for each database
- [ ] Column details display correctly
- [ ] Search/filter works

### 3. Query Execution Testing

```sql
-- PostgreSQL
SELECT * FROM employees WHERE salary > 80000;
SELECT * FROM employee_summary;

-- MySQL
SELECT * FROM customers WHERE country = 'USA';
SELECT * FROM customer_orders_summary;

-- ClickHouse
SELECT * FROM aresa_test.events WHERE event_type = 'purchase';
SELECT * FROM aresa_test.sales_by_region;

-- SQLite
SELECT * FROM users;
SELECT * FROM post_summary;

-- Snowflake (Mock)
SELECT * FROM EMPLOYEES WHERE DEPARTMENT = 'Engineering';
SELECT * FROM PRODUCTS LIMIT 5;

-- Databricks (Mock)
SELECT * FROM employees WHERE department = 'Engineering';
SELECT * FROM products LIMIT 5;
```

### 4. Data Type Testing

Each database includes various data types to test rendering:

- **Strings**: VARCHAR, TEXT, CHAR
- **Numbers**: INT, DECIMAL, FLOAT
- **Dates**: DATE, DATETIME, TIMESTAMP
- **Booleans**: BOOLEAN
- **JSON**: JSONB (Postgres), JSON (MySQL)
- **Arrays**: Array types (Postgres, ClickHouse)
- **Enums**: ENUM types (MySQL, ClickHouse)

## 🔧 Management Commands

### With Makefile (Recommended)

```bash
make up              # Start all containers
make down            # Stop all containers
make restart         # Restart containers
make clean           # Stop + remove all data
make status          # Show container status
make logs            # Follow all logs

# Individual database tests
make test-postgres   # Test PostgreSQL only
make test-mysql      # Test MySQL only
make test-clickhouse # Test ClickHouse only
make test-sqlite     # Test SQLite only
make test-snowflake  # Test Snowflake mock
make test-databricks # Test Databricks mock
make test-cloud      # Test all cloud mocks

# Database shells
make shell-postgres  # psql shell
make shell-mysql     # mysql shell
make shell-clickhouse # clickhouse-client
```

### Direct Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers (keep data)
docker-compose stop

# Stop and remove containers + volumes
docker-compose down -v

# View logs
docker-compose logs -f postgres
docker-compose logs -f mysql
docker-compose logs -f clickhouse

# Connect directly to databases
docker exec -it aresa-test-postgres psql -U aresa -d aresa_test
docker exec -it aresa-test-mysql mysql -u aresa -paresa_test_123 aresa_test
docker exec -it aresa-test-clickhouse clickhouse-client --database aresa_test
```

## 🔄 Resetting Test Data

To reset all data to initial state:

```bash
docker-compose down -v
docker-compose up -d
./setup-test-connections.sh
```

## 🧩 Adding to CI/CD

Example GitHub Actions workflow:

```yaml
name: ARESA Studio Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Start test databases
        run: |
          cd aresa-studio/test-env
          docker-compose up -d
          sleep 30  # Wait for containers

      - name: Setup test connections
        run: |
          cd aresa-studio/test-env
          ./setup-test-connections.sh

      - name: Run integration tests
        run: |
          cargo test --features ui

      - name: Stop containers
        if: always()
        run: |
          cd aresa-studio/test-env
          docker-compose down -v
```

## 📁 File Structure

```
test-env/
├── docker-compose.yml          # Container definitions
├── Makefile                    # Convenient commands
├── setup-test-connections.sh   # Connection setup script
├── README.md                   # This file
├── postgres/
│   └── init.sql               # PostgreSQL schema + data
├── mysql/
│   └── init.sql               # MySQL schema + data
├── clickhouse/
│   ├── init.sql               # ClickHouse schema + data
│   └── users.xml              # ClickHouse auth config
├── mock-cloud/
│   ├── server.py              # Mock Snowflake + Databricks APIs
│   ├── Dockerfile             # Container definition
│   └── requirements.txt       # Python dependencies
├── sqlite/                     # (created by setup script)
└── duckdb/                     # (future expansion)
```

## ☁️ Mock Cloud Services

The mock server simulates Snowflake and Databricks REST APIs for local testing without cloud credentials.

### Supported Operations

| Operation           | Snowflake Endpoint          | Databricks Endpoint            |
|--------------------|-----------------------------|---------------------------------|
| Execute SQL        | POST /api/v2/statements     | POST /api/2.0/sql/statements   |
| Health Check       | GET /health                 | GET /health                     |

### Sample Queries (via curl)

```bash
# Snowflake - Execute query
curl -X POST http://localhost:8443/api/v2/statements \
  -H "Content-Type: application/json" \
  -d '{"statement": "SELECT * FROM EMPLOYEES LIMIT 5", "warehouse": "TEST_WH"}'

# Databricks - Execute query
curl -X POST http://localhost:8443/api/2.0/sql/statements \
  -H "Content-Type: application/json" \
  -d '{"statement": "SELECT * FROM employees LIMIT 5", "warehouse_id": "test123"}'

# Health check
curl http://localhost:8443/health
```

### Mock Data

The mock server returns realistic data for common queries:
- `SELECT 1` - Connection test
- `SHOW TABLES` / `SHOW DATABASES` / `SHOW SCHEMAS` - Schema discovery
- `SELECT * FROM EMPLOYEES` - Sample employee data
- `SELECT * FROM PRODUCTS` - Sample product data
- `DESCRIBE TABLE ...` - Column metadata

### Extending the Mock Server

To add new mock responses, edit `mock-cloud/server.py`:

```python
# In snowflake_execute() or databricks_execute():
elif 'YOUR_CUSTOM_QUERY' in statement:
    return jsonify({
        "resultSetMetaData": {"numRows": 1, ...},
        "data": [["your", "data", "here"]],
        ...
    })
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs postgres
```

### Connection refused

- Ensure containers are running: `docker-compose ps`
- Check if ports are available: `lsof -i :5433`
- Wait for health checks to pass

### Data not loading

- Check init.sql for syntax errors
- View container logs: `docker-compose logs -f`
- Rebuild: `docker-compose down -v && docker-compose up -d`

### Permission denied on setup script

```bash
chmod +x setup-test-connections.sh
```

### Mock cloud server not responding

```bash
# Check if container is running
docker ps | grep mock-cloud

# View logs
docker logs aresa-test-mock-cloud

# Rebuild the container
docker-compose build mock-cloud
docker-compose up -d mock-cloud

# Test health endpoint
curl http://localhost:8443/health
```

### Mock server returns empty results

The mock server only responds to specific SQL patterns. Check `mock-cloud/server.py` for supported queries. For unsupported queries, it returns empty results (which is valid behavior).

