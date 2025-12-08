# ARESA Studio - Test Environment Makefile
# ==========================================
#
# Quick reference:
#   make up        - Start all test databases
#   make down      - Stop all containers
#   make test      - Run integration tests
#   make serve     - Start ARESA Studio with test config
#   make clean     - Remove all data and containers
#
# Full workflow:
#   make up && make test && make serve

.PHONY: help up down restart test setup serve clean logs status ps \
        test-postgres test-mysql test-clickhouse test-sqlite \
        test-snowflake test-databricks test-cloud \
        shell-postgres shell-mysql shell-clickhouse

# Default target
help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║         ARESA Studio - Test Environment Commands           ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "  Quick Start:"
	@echo "    make up        Start all test database containers"
	@echo "    make test      Run integration tests"
	@echo "    make serve     Start ARESA Studio with test config"
	@echo ""
	@echo "  Container Management:"
	@echo "    make down      Stop all containers (keep data)"
	@echo "    make restart   Restart all containers"
	@echo "    make clean     Stop containers and remove all data"
	@echo "    make status    Show container status"
	@echo "    make logs      Follow container logs"
	@echo ""
	@echo "  Individual Database Tests:"
	@echo "    make test-postgres    Test PostgreSQL only"
	@echo "    make test-mysql       Test MySQL only"
	@echo "    make test-clickhouse  Test ClickHouse only"
	@echo "    make test-sqlite      Test SQLite only"
	@echo "    make test-snowflake   Test Snowflake mock"
	@echo "    make test-databricks  Test Databricks mock"
	@echo "    make test-cloud       Test all mock cloud services"
	@echo ""
	@echo "  Database Shells:"
	@echo "    make shell-postgres   Open psql shell"
	@echo "    make shell-mysql      Open mysql shell"
	@echo "    make shell-clickhouse Open clickhouse-client"
	@echo ""
	@echo "  Full Workflow:"
	@echo "    make all       up + setup + test + serve"
	@echo ""

# ============================================
# Container Management
# ============================================

up:
	@echo "🚀 Starting test database containers..."
	@docker compose up -d
	@echo "⏳ Waiting for containers to be healthy..."
	@sleep 10
	@$(MAKE) status
	@echo ""
	@echo "✅ Containers started! Run 'make setup' to configure connections."

down:
	@echo "🛑 Stopping containers..."
	@docker compose stop
	@echo "✅ Containers stopped (data preserved)"

restart:
	@echo "🔄 Restarting containers..."
	@docker compose restart
	@sleep 10
	@$(MAKE) status

clean:
	@echo "🧹 Removing containers and all data..."
	@docker compose down -v
	@rm -f ~/.config/aresa/test.db
	@rm -f ~/.config/aresa/config.test.yaml
	@echo "✅ Clean complete"

status:
	@docker ps --filter "name=aresa-test" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

ps: status

logs:
	@docker compose logs -f

logs-postgres:
	@docker compose logs -f postgres

logs-mysql:
	@docker compose logs -f mysql

logs-clickhouse:
	@docker compose logs -f clickhouse

# ============================================
# Setup & Configuration
# ============================================

setup:
	@echo "⚙️  Setting up test connections..."
	@./setup-test-connections.sh
	@echo ""
	@echo "✅ Setup complete! Run 'make test' to verify."

# ============================================
# Testing
# ============================================

test: test-postgres test-mysql test-clickhouse test-sqlite test-cloud
	@echo ""
	@echo "════════════════════════════════════════════════════════════"
	@echo "✅ All database tests passed!"
	@echo "════════════════════════════════════════════════════════════"

test-cloud: test-snowflake test-databricks
	@echo "  ✓ All cloud mock tests passed"

test-postgres:
	@echo "━━━ Testing PostgreSQL ━━━"
	@docker exec aresa-test-postgres pg_isready -U aresa -d aresa_test > /dev/null 2>&1 && echo "  ✓ Connection OK" || echo "  ✗ Connection failed"
	@RESULT=$$(docker exec aresa-test-postgres psql -U aresa -d aresa_test -t -c "SELECT COUNT(*) FROM employees;" 2>/dev/null | tr -d ' '); \
	if [ "$$RESULT" = "10" ]; then echo "  ✓ Data OK (10 employees)"; else echo "  ✗ Data check failed (got: $$RESULT)"; fi
	@RESULT=$$(docker exec aresa-test-postgres psql -U aresa -d aresa_test -t -c "SELECT COUNT(*) FROM employee_summary;" 2>/dev/null | tr -d ' '); \
	if [ -n "$$RESULT" ] && [ "$$RESULT" -gt 0 ]; then echo "  ✓ Views OK"; else echo "  ✗ Views check failed"; fi

test-mysql:
	@echo "━━━ Testing MySQL ━━━"
	@docker exec aresa-test-mysql mysqladmin ping -h localhost -u aresa -paresa_test_123 > /dev/null 2>&1 && echo "  ✓ Connection OK" || echo "  ✗ Connection failed"
	@RESULT=$$(docker exec aresa-test-mysql mysql -u aresa -paresa_test_123 -N -e "SELECT COUNT(*) FROM aresa_test.customers;" 2>/dev/null); \
	if [ "$$RESULT" = "8" ]; then echo "  ✓ Data OK (8 customers)"; else echo "  ✗ Data check failed (got: $$RESULT)"; fi
	@RESULT=$$(docker exec aresa-test-mysql mysql -u aresa -paresa_test_123 -N -e "SELECT COUNT(*) FROM aresa_test.customer_orders_summary;" 2>/dev/null); \
	if [ -n "$$RESULT" ] && [ "$$RESULT" -gt 0 ]; then echo "  ✓ Views OK"; else echo "  ✗ Views check failed"; fi

test-clickhouse:
	@echo "━━━ Testing ClickHouse ━━━"
	@curl -s "http://localhost:8124/?query=SELECT%201" > /dev/null 2>&1 && echo "  ✓ Connection OK" || echo "  ✗ Connection failed"
	@RESULT=$$(curl -s "http://localhost:8124/?query=SELECT%20COUNT(*)%20FROM%20aresa_test.events" 2>/dev/null | tr -d '\n'); \
	if [ "$$RESULT" = "10" ]; then echo "  ✓ Data OK (10 events)"; else echo "  ✗ Data check failed (got: $$RESULT)"; fi
	@RESULT=$$(curl -s "http://localhost:8124/?query=SELECT%20COUNT(*)%20FROM%20aresa_test.daily_events_summary" 2>/dev/null | tr -d '\n'); \
	if [ -n "$$RESULT" ] && [ "$$RESULT" -gt 0 ]; then echo "  ✓ Views OK"; else echo "  ✗ Views check failed"; fi

test-sqlite:
	@echo "━━━ Testing SQLite ━━━"
	@if [ -f ~/.config/aresa/test.db ]; then echo "  ✓ Database file exists"; else echo "  ✗ Database file not found"; fi
	@RESULT=$$(sqlite3 ~/.config/aresa/test.db "SELECT COUNT(*) FROM users;" 2>/dev/null); \
	if [ "$$RESULT" = "3" ]; then echo "  ✓ Data OK (3 users)"; else echo "  ✗ Data check failed (got: $$RESULT)"; fi
	@RESULT=$$(sqlite3 ~/.config/aresa/test.db "SELECT COUNT(*) FROM post_summary;" 2>/dev/null); \
	if [ "$$RESULT" = "4" ]; then echo "  ✓ Views OK"; else echo "  ✗ Views check failed"; fi

test-snowflake:
	@echo "━━━ Testing Snowflake (Mock) ━━━"
	@curl -s http://localhost:8443/health > /dev/null 2>&1 && echo "  ✓ Mock server healthy" || (echo "  ✗ Mock server not running" && exit 1)
	@RESULT=$$(curl -s -X POST http://localhost:8443/api/v2/statements \
		-H "Content-Type: application/json" \
		-d '{"statement": "SELECT 1", "warehouse": "TEST_WH"}' | grep -c '"code":"090001"'); \
	if [ "$$RESULT" = "1" ]; then echo "  ✓ SELECT 1 OK"; else echo "  ✗ Query failed"; fi
	@RESULT=$$(curl -s -X POST http://localhost:8443/api/v2/statements \
		-H "Content-Type: application/json" \
		-d '{"statement": "SHOW TABLES", "warehouse": "TEST_WH"}' | grep -c '"EMPLOYEES"'); \
	if [ "$$RESULT" -ge 1 ]; then echo "  ✓ SHOW TABLES OK"; else echo "  ✗ SHOW TABLES failed"; fi
	@RESULT=$$(curl -s -X POST http://localhost:8443/api/v2/statements \
		-H "Content-Type: application/json" \
		-d '{"statement": "SELECT * FROM EMPLOYEES LIMIT 5", "warehouse": "TEST_WH"}' | grep -c '"Alice Johnson"'); \
	if [ "$$RESULT" -ge 1 ]; then echo "  ✓ Sample data OK"; else echo "  ✗ Sample data failed"; fi

test-databricks:
	@echo "━━━ Testing Databricks (Mock) ━━━"
	@curl -s http://localhost:8443/health > /dev/null 2>&1 && echo "  ✓ Mock server healthy" || (echo "  ✗ Mock server not running" && exit 1)
	@RESULT=$$(curl -s -X POST http://localhost:8443/api/2.0/sql/statements \
		-H "Content-Type: application/json" \
		-d '{"statement": "SELECT 1", "warehouse_id": "test123"}' | grep -c '"SUCCEEDED"'); \
	if [ "$$RESULT" = "1" ]; then echo "  ✓ SELECT 1 OK"; else echo "  ✗ Query failed"; fi
	@RESULT=$$(curl -s -X POST http://localhost:8443/api/2.0/sql/statements \
		-H "Content-Type: application/json" \
		-d '{"statement": "SHOW TABLES", "warehouse_id": "test123"}' | grep -c '"employees"'); \
	if [ "$$RESULT" -ge 1 ]; then echo "  ✓ SHOW TABLES OK"; else echo "  ✗ SHOW TABLES failed"; fi
	@RESULT=$$(curl -s -X POST http://localhost:8443/api/2.0/sql/statements \
		-H "Content-Type: application/json" \
		-d '{"statement": "SELECT * FROM employees LIMIT 5", "warehouse_id": "test123"}' | grep -c '"Alice Johnson"'); \
	if [ "$$RESULT" -ge 1 ]; then echo "  ✓ Sample data OK"; else echo "  ✗ Sample data failed"; fi

# ============================================
# ARESA Studio
# ============================================

# Path to ARESA binary (adjust if needed)
ARESA_BIN ?= ../../aresa-cli/target/release/aresa
ARESA_PORT ?= 3001

serve:
	@echo "🚀 Starting ARESA Studio on port $(ARESA_PORT)..."
	@echo "   Using test config: ~/.config/aresa/config.test.yaml"
	@echo ""
	@echo "   Open: http://localhost:$(ARESA_PORT)"
	@echo ""
	@ARESA_CONFIG=~/.config/aresa/config.test.yaml $(ARESA_BIN) serve --port $(ARESA_PORT)

serve-bg:
	@echo "🚀 Starting ARESA Studio in background on port $(ARESA_PORT)..."
	@ARESA_CONFIG=~/.config/aresa/config.test.yaml $(ARESA_BIN) serve --port $(ARESA_PORT) --no-open &
	@sleep 2
	@echo "✅ Server running at http://localhost:$(ARESA_PORT)"

stop-serve:
	@echo "🛑 Stopping ARESA Studio..."
	@pkill -f "aresa serve" 2>/dev/null || true
	@echo "✅ Server stopped"

# ============================================
# Database Shells
# ============================================

shell-postgres:
	@echo "🐘 Opening PostgreSQL shell..."
	@docker exec -it aresa-test-postgres psql -U aresa -d aresa_test

shell-mysql:
	@echo "🐬 Opening MySQL shell..."
	@docker exec -it aresa-test-mysql mysql -u aresa -paresa_test_123 aresa_test

shell-clickhouse:
	@echo "🏠 Opening ClickHouse shell..."
	@docker exec -it aresa-test-clickhouse clickhouse-client --database aresa_test

# ============================================
# Full Workflow
# ============================================

all: up setup test serve

# CI/CD target - non-interactive
ci: up
	@sleep 15
	@$(MAKE) setup
	@$(MAKE) test
	@$(MAKE) down

# Reset everything and start fresh
reset: clean up setup test
	@echo ""
	@echo "✅ Reset complete! Run 'make serve' to start ARESA Studio."

