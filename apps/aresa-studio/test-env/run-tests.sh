#!/bin/bash

# ARESA Studio - Integration Test Runner
# Runs automated tests against all configured test databases
#
# Usage: ./run-tests.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test results
PASSED=0
FAILED=0
TESTS=()

# Test helper functions
test_start() {
    echo -ne "  Testing: $1... "
    TESTS+=("$1")
}

test_pass() {
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
}

test_fail() {
    echo -e "${RED}FAIL${NC}"
    if [ -n "$1" ]; then
        echo -e "    ${RED}Error: $1${NC}"
    fi
    ((FAILED++))
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          ARESA Studio - Integration Test Suite             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Detect ARESA binary location
ARESA_BIN=$(which aresa 2>/dev/null || echo "")
if [ -z "$ARESA_BIN" ]; then
    # Try local build
    ARESA_BIN="../../aresa-cli/target/release/aresa"
fi

if [ ! -f "$ARESA_BIN" ] && [ ! -x "$ARESA_BIN" ]; then
    echo -e "${RED}Error: ARESA binary not found${NC}"
    echo "Please build ARESA first: cd aresa-cli && cargo build --release --features ui"
    exit 1
fi

echo -e "${CYAN}Using ARESA: ${ARESA_BIN}${NC}"
echo ""

# ============================================
# PostgreSQL Tests
# ============================================
echo -e "${YELLOW}━━━ PostgreSQL Tests ━━━${NC}"

test_start "PostgreSQL connection"
if $ARESA_BIN -c test-postgres ping 2>/dev/null | grep -q "OK\|success\|connected"; then
    test_pass
else
    # Try direct connection test
    if docker exec aresa-test-postgres pg_isready -U aresa -d aresa_test >/dev/null 2>&1; then
        test_pass
    else
        test_fail "Cannot connect to PostgreSQL"
    fi
fi

test_start "PostgreSQL query - employees table"
RESULT=$(docker exec aresa-test-postgres psql -U aresa -d aresa_test -t -c "SELECT COUNT(*) FROM employees;" 2>/dev/null | tr -d ' ')
if [ "$RESULT" = "10" ]; then
    test_pass
else
    test_fail "Expected 10 employees, got: $RESULT"
fi

test_start "PostgreSQL query - departments view"
RESULT=$(docker exec aresa-test-postgres psql -U aresa -d aresa_test -t -c "SELECT COUNT(*) FROM employee_summary;" 2>/dev/null | tr -d ' ')
if [ -n "$RESULT" ] && [ "$RESULT" -gt 0 ]; then
    test_pass
else
    test_fail "View query failed"
fi

test_start "PostgreSQL JSON data"
RESULT=$(docker exec aresa-test-postgres psql -U aresa -d aresa_test -t -c "SELECT metadata->>'level' FROM employees WHERE employee_id='EMP001';" 2>/dev/null | tr -d ' ')
if [ "$RESULT" = "Senior" ]; then
    test_pass
else
    test_fail "JSON query failed, got: $RESULT"
fi

echo ""

# ============================================
# MySQL Tests
# ============================================
echo -e "${YELLOW}━━━ MySQL Tests ━━━${NC}"

test_start "MySQL connection"
if docker exec aresa-test-mysql mysqladmin ping -h localhost -u aresa -paresa_test_123 >/dev/null 2>&1; then
    test_pass
else
    test_fail "Cannot connect to MySQL"
fi

test_start "MySQL query - customers table"
RESULT=$(docker exec aresa-test-mysql mysql -u aresa -paresa_test_123 -N -e "SELECT COUNT(*) FROM aresa_test.customers;" 2>/dev/null)
if [ "$RESULT" = "8" ]; then
    test_pass
else
    test_fail "Expected 8 customers, got: $RESULT"
fi

test_start "MySQL query - products with ENUM"
RESULT=$(docker exec aresa-test-mysql mysql -u aresa -paresa_test_123 -N -e "SELECT COUNT(DISTINCT category) FROM aresa_test.products;" 2>/dev/null)
if [ "$RESULT" -gt 0 ]; then
    test_pass
else
    test_fail "ENUM query failed"
fi

test_start "MySQL view - customer_orders_summary"
RESULT=$(docker exec aresa-test-mysql mysql -u aresa -paresa_test_123 -N -e "SELECT COUNT(*) FROM aresa_test.customer_orders_summary;" 2>/dev/null)
if [ -n "$RESULT" ] && [ "$RESULT" -gt 0 ]; then
    test_pass
else
    test_fail "View query failed"
fi

echo ""

# ============================================
# ClickHouse Tests
# ============================================
echo -e "${YELLOW}━━━ ClickHouse Tests ━━━${NC}"

test_start "ClickHouse connection"
if curl -s "http://localhost:8124/?query=SELECT%201" | grep -q "1"; then
    test_pass
else
    test_fail "Cannot connect to ClickHouse"
fi

test_start "ClickHouse query - events table"
RESULT=$(curl -s "http://localhost:8124/?query=SELECT%20COUNT(*)%20FROM%20aresa_test.events" 2>/dev/null | tr -d '\n')
if [ "$RESULT" = "10" ]; then
    test_pass
else
    test_fail "Expected 10 events, got: $RESULT"
fi

test_start "ClickHouse MergeTree partitioning"
RESULT=$(curl -s "http://localhost:8124/?query=SELECT%20COUNT(DISTINCT%20toYYYYMM(event_date))%20FROM%20aresa_test.events" 2>/dev/null | tr -d '\n')
if [ -n "$RESULT" ] && [ "$RESULT" -gt 0 ]; then
    test_pass
else
    test_fail "Partitioning query failed"
fi

test_start "ClickHouse aggregation - sales_by_region"
RESULT=$(curl -s "http://localhost:8124/?query=SELECT%20COUNT(*)%20FROM%20aresa_test.sales_by_region" 2>/dev/null | tr -d '\n')
if [ -n "$RESULT" ] && [ "$RESULT" -gt 0 ]; then
    test_pass
else
    test_fail "Aggregation view failed"
fi

echo ""

# ============================================
# SQLite Tests
# ============================================
echo -e "${YELLOW}━━━ SQLite Tests ━━━${NC}"

SQLITE_DB="${HOME}/.config/aresa/test.db"

test_start "SQLite database exists"
if [ -f "$SQLITE_DB" ]; then
    test_pass
else
    test_fail "Database file not found"
fi

test_start "SQLite query - users table"
RESULT=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM users;" 2>/dev/null)
if [ "$RESULT" = "3" ]; then
    test_pass
else
    test_fail "Expected 3 users, got: $RESULT"
fi

test_start "SQLite query - posts with joins"
RESULT=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM post_summary;" 2>/dev/null)
if [ "$RESULT" = "4" ]; then
    test_pass
else
    test_fail "Expected 4 posts in summary, got: $RESULT"
fi

echo ""

# ============================================
# API Tests (if server is running)
# ============================================
API_URL="http://localhost:3001"

if curl -s "$API_URL/api/connections" >/dev/null 2>&1; then
    echo -e "${YELLOW}━━━ API Tests ━━━${NC}"

    test_start "GET /api/connections"
    if curl -s "$API_URL/api/connections" | grep -q "name"; then
        test_pass
    else
        test_fail "Unexpected response"
    fi

    test_start "GET /api/schema endpoint exists"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/schema/test-postgres/tables")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        test_pass
    else
        test_fail "HTTP $HTTP_CODE"
    fi

    test_start "POST /api/query endpoint exists"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/query" -H "Content-Type: application/json" -d '{}')
    if [ "$HTTP_CODE" != "000" ]; then
        test_pass
    else
        test_fail "Endpoint not responding"
    fi

    echo ""
else
    echo -e "${YELLOW}━━━ API Tests (Skipped - Server not running) ━━━${NC}"
    echo "  Start server with: aresa serve --port 3001"
    echo ""
fi

# ============================================
# Summary
# ============================================
echo "════════════════════════════════════════════════════════════"
TOTAL=$((PASSED + FAILED))
echo -e "Tests: ${TOTAL} | ${GREEN}Passed: ${PASSED}${NC} | ${RED}Failed: ${FAILED}${NC}"
echo "════════════════════════════════════════════════════════════"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi

