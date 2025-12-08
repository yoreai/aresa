#!/usr/bin/env python3
"""
Mock server for Snowflake and Databricks REST APIs.
Used for local testing without cloud credentials.
"""

from flask import Flask, request, jsonify
import json
import uuid
from datetime import datetime

app = Flask(__name__)

# ============== Sample Data ==============

SAMPLE_EMPLOYEES = [
    {"id": "1", "name": "Alice Johnson", "email": "alice@example.com", "department": "Engineering", "salary": "95000"},
    {"id": "2", "name": "Bob Smith", "email": "bob@example.com", "department": "Marketing", "salary": "75000"},
    {"id": "3", "name": "Carol Williams", "email": "carol@example.com", "department": "Engineering", "salary": "105000"},
    {"id": "4", "name": "David Brown", "email": "david@example.com", "department": "Sales", "salary": "85000"},
    {"id": "5", "name": "Eve Davis", "email": "eve@example.com", "department": "Engineering", "salary": "92000"},
]

SAMPLE_PRODUCTS = [
    {"product_id": "P001", "name": "Widget Pro", "category": "Electronics", "price": "299.99", "stock": "150"},
    {"product_id": "P002", "name": "Gadget Plus", "category": "Electronics", "price": "199.99", "stock": "200"},
    {"product_id": "P003", "name": "Super Tool", "category": "Tools", "price": "49.99", "stock": "500"},
]

SAMPLE_TABLES = [
    {"schema_name": "PUBLIC", "name": "EMPLOYEES", "kind": "TABLE", "rows": "5"},
    {"schema_name": "PUBLIC", "name": "PRODUCTS", "kind": "TABLE", "rows": "3"},
    {"schema_name": "PUBLIC", "name": "EMPLOYEE_SUMMARY", "kind": "VIEW", "rows": "0"},
]

SAMPLE_COLUMNS = {
    "EMPLOYEES": [
        {"name": "ID", "type": "NUMBER", "null?": "NO"},
        {"name": "NAME", "type": "VARCHAR", "null?": "NO"},
        {"name": "EMAIL", "type": "VARCHAR", "null?": "YES"},
        {"name": "DEPARTMENT", "type": "VARCHAR", "null?": "YES"},
        {"name": "SALARY", "type": "NUMBER", "null?": "YES"},
    ],
    "PRODUCTS": [
        {"name": "PRODUCT_ID", "type": "VARCHAR", "null?": "NO"},
        {"name": "NAME", "type": "VARCHAR", "null?": "NO"},
        {"name": "CATEGORY", "type": "VARCHAR", "null?": "YES"},
        {"name": "PRICE", "type": "DECIMAL", "null?": "YES"},
        {"name": "STOCK", "type": "NUMBER", "null?": "YES"},
    ],
}

# ============== Snowflake API ==============

@app.route('/api/v2/statements', methods=['POST'])
def snowflake_execute():
    """Snowflake SQL Statement Execution API"""
    data = request.json
    statement = data.get('statement', '').upper().strip()

    # Parse the SQL and return appropriate mock data
    if 'SELECT 1' in statement:
        return jsonify({
            "resultSetMetaData": {
                "numRows": 1,
                "rowType": [{"name": "1", "type": "FIXED", "nullable": False}]
            },
            "data": [["1"]],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
            "message": "Statement executed successfully."
        })

    elif 'SHOW TABLES' in statement:
        return jsonify({
            "resultSetMetaData": {
                "numRows": len(SAMPLE_TABLES),
                "rowType": [
                    {"name": "schema_name", "type": "TEXT", "nullable": True},
                    {"name": "name", "type": "TEXT", "nullable": False},
                    {"name": "kind", "type": "TEXT", "nullable": True},
                    {"name": "rows", "type": "FIXED", "nullable": True},
                ]
            },
            "data": [[t["schema_name"], t["name"], t["kind"], t["rows"]] for t in SAMPLE_TABLES],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
        })

    elif 'SHOW VIEWS' in statement:
        views = [t for t in SAMPLE_TABLES if t["kind"] == "VIEW"]
        return jsonify({
            "resultSetMetaData": {
                "numRows": len(views),
                "rowType": [
                    {"name": "schema_name", "type": "TEXT", "nullable": True},
                    {"name": "name", "type": "TEXT", "nullable": False},
                ]
            },
            "data": [[v["schema_name"], v["name"]] for v in views],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
        })

    elif 'SHOW DATABASES' in statement:
        return jsonify({
            "resultSetMetaData": {
                "numRows": 2,
                "rowType": [{"name": "name", "type": "TEXT", "nullable": False}]
            },
            "data": [["MOCK_DB"], ["SAMPLE_DATA"]],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
        })

    elif 'SHOW SCHEMAS' in statement:
        return jsonify({
            "resultSetMetaData": {
                "numRows": 2,
                "rowType": [{"name": "name", "type": "TEXT", "nullable": False}]
            },
            "data": [["PUBLIC"], ["INFORMATION_SCHEMA"]],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
        })

    elif 'DESCRIBE TABLE' in statement:
        # Extract table name
        table_name = "EMPLOYEES"
        for t in SAMPLE_COLUMNS.keys():
            if t in statement:
                table_name = t
                break

        cols = SAMPLE_COLUMNS.get(table_name, SAMPLE_COLUMNS["EMPLOYEES"])
        return jsonify({
            "resultSetMetaData": {
                "numRows": len(cols),
                "rowType": [
                    {"name": "name", "type": "TEXT", "nullable": False},
                    {"name": "type", "type": "TEXT", "nullable": False},
                    {"name": "null?", "type": "TEXT", "nullable": False},
                ]
            },
            "data": [[c["name"], c["type"], c["null?"]] for c in cols],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
        })

    elif 'FROM EMPLOYEES' in statement or 'FROM PUBLIC.EMPLOYEES' in statement:
        # Handle LIMIT
        limit = 10
        if 'LIMIT' in statement:
            try:
                limit = int(statement.split('LIMIT')[1].strip().split()[0])
            except:
                pass

        data = SAMPLE_EMPLOYEES[:limit]
        return jsonify({
            "resultSetMetaData": {
                "numRows": len(data),
                "rowType": [
                    {"name": "id", "type": "FIXED", "nullable": False},
                    {"name": "name", "type": "TEXT", "nullable": False},
                    {"name": "email", "type": "TEXT", "nullable": True},
                    {"name": "department", "type": "TEXT", "nullable": True},
                    {"name": "salary", "type": "FIXED", "nullable": True},
                ]
            },
            "data": [[e["id"], e["name"], e["email"], e["department"], e["salary"]] for e in data],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
        })

    elif 'FROM PRODUCTS' in statement or 'FROM PUBLIC.PRODUCTS' in statement:
        limit = 10
        if 'LIMIT' in statement:
            try:
                limit = int(statement.split('LIMIT')[1].strip().split()[0])
            except:
                pass

        data = SAMPLE_PRODUCTS[:limit]
        return jsonify({
            "resultSetMetaData": {
                "numRows": len(data),
                "rowType": [
                    {"name": "product_id", "type": "TEXT", "nullable": False},
                    {"name": "name", "type": "TEXT", "nullable": False},
                    {"name": "category", "type": "TEXT", "nullable": True},
                    {"name": "price", "type": "DECIMAL", "nullable": True},
                    {"name": "stock", "type": "FIXED", "nullable": True},
                ]
            },
            "data": [[p["product_id"], p["name"], p["category"], p["price"], p["stock"]] for p in data],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
        })

    elif 'COUNT(*)' in statement or 'COUNT(1)' in statement:
        return jsonify({
            "resultSetMetaData": {
                "numRows": 1,
                "rowType": [{"name": "COUNT(*)", "type": "FIXED", "nullable": False}]
            },
            "data": [["5"]],
            "code": "090001",
            "statementHandle": str(uuid.uuid4()),
        })

    # Default: empty result
    return jsonify({
        "resultSetMetaData": {
            "numRows": 0,
            "rowType": []
        },
        "data": [],
        "code": "090001",
        "statementHandle": str(uuid.uuid4()),
        "message": "Statement executed successfully (no results)."
    })


# ============== Databricks API ==============

@app.route('/api/2.0/sql/statements', methods=['POST'])
def databricks_execute():
    """Databricks SQL Statement Execution API"""
    data = request.json
    statement = data.get('statement', '').upper().strip()
    statement_id = str(uuid.uuid4())

    # Parse the SQL and return appropriate mock data
    if 'SELECT 1' in statement:
        return jsonify({
            "statement_id": statement_id,
            "status": {"state": "SUCCEEDED"},
            "manifest": {
                "schema": {"columns": [{"name": "1", "type_name": "INT"}]},
                "total_row_count": 1
            },
            "result": {"data_array": [[1]]}
        })

    elif 'SHOW TABLES' in statement:
        return jsonify({
            "statement_id": statement_id,
            "status": {"state": "SUCCEEDED"},
            "manifest": {
                "schema": {"columns": [
                    {"name": "database", "type_name": "STRING"},
                    {"name": "tableName", "type_name": "STRING"},
                    {"name": "isTemporary", "type_name": "BOOLEAN"},
                ]},
                "total_row_count": 3
            },
            "result": {"data_array": [
                ["default", "employees", False],
                ["default", "products", False],
                ["default", "employee_summary", True],
            ]}
        })

    elif 'SHOW CATALOGS' in statement:
        return jsonify({
            "statement_id": statement_id,
            "status": {"state": "SUCCEEDED"},
            "manifest": {
                "schema": {"columns": [{"name": "catalog", "type_name": "STRING"}]},
                "total_row_count": 2
            },
            "result": {"data_array": [["main"], ["hive_metastore"]]}
        })

    elif 'SHOW SCHEMAS' in statement:
        return jsonify({
            "statement_id": statement_id,
            "status": {"state": "SUCCEEDED"},
            "manifest": {
                "schema": {"columns": [{"name": "databaseName", "type_name": "STRING"}]},
                "total_row_count": 2
            },
            "result": {"data_array": [["default"], ["information_schema"]]}
        })

    elif 'DESCRIBE TABLE' in statement:
        return jsonify({
            "statement_id": statement_id,
            "status": {"state": "SUCCEEDED"},
            "manifest": {
                "schema": {"columns": [
                    {"name": "col_name", "type_name": "STRING"},
                    {"name": "data_type", "type_name": "STRING"},
                    {"name": "comment", "type_name": "STRING"},
                ]},
                "total_row_count": 5
            },
            "result": {"data_array": [
                ["id", "bigint", "Primary key"],
                ["name", "string", "Employee name"],
                ["email", "string", "Email address"],
                ["department", "string", "Department name"],
                ["salary", "decimal(10,2)", "Annual salary"],
            ]}
        })

    elif 'FROM EMPLOYEES' in statement or 'FROM DEFAULT.EMPLOYEES' in statement:
        limit = 10
        if 'LIMIT' in statement:
            try:
                limit = int(statement.split('LIMIT')[1].strip().split()[0])
            except:
                pass

        data = SAMPLE_EMPLOYEES[:limit]
        return jsonify({
            "statement_id": statement_id,
            "status": {"state": "SUCCEEDED"},
            "manifest": {
                "schema": {"columns": [
                    {"name": "id", "type_name": "BIGINT"},
                    {"name": "name", "type_name": "STRING"},
                    {"name": "email", "type_name": "STRING"},
                    {"name": "department", "type_name": "STRING"},
                    {"name": "salary", "type_name": "DECIMAL"},
                ]},
                "total_row_count": len(data)
            },
            "result": {"data_array": [[e["id"], e["name"], e["email"], e["department"], e["salary"]] for e in data]}
        })

    elif 'FROM PRODUCTS' in statement or 'FROM DEFAULT.PRODUCTS' in statement:
        limit = 10
        if 'LIMIT' in statement:
            try:
                limit = int(statement.split('LIMIT')[1].strip().split()[0])
            except:
                pass

        data = SAMPLE_PRODUCTS[:limit]
        return jsonify({
            "statement_id": statement_id,
            "status": {"state": "SUCCEEDED"},
            "manifest": {
                "schema": {"columns": [
                    {"name": "product_id", "type_name": "STRING"},
                    {"name": "name", "type_name": "STRING"},
                    {"name": "category", "type_name": "STRING"},
                    {"name": "price", "type_name": "DECIMAL"},
                    {"name": "stock", "type_name": "BIGINT"},
                ]},
                "total_row_count": len(data)
            },
            "result": {"data_array": [[p["product_id"], p["name"], p["category"], p["price"], p["stock"]] for p in data]}
        })

    elif 'COUNT(*)' in statement or 'COUNT(1)' in statement:
        return jsonify({
            "statement_id": statement_id,
            "status": {"state": "SUCCEEDED"},
            "manifest": {
                "schema": {"columns": [{"name": "count(1)", "type_name": "BIGINT"}]},
                "total_row_count": 1
            },
            "result": {"data_array": [[5]]}
        })

    # Default: empty result
    return jsonify({
        "statement_id": statement_id,
        "status": {"state": "SUCCEEDED"},
        "manifest": {
            "schema": {"columns": []},
            "total_row_count": 0
        },
        "result": {"data_array": []}
    })


# Get statement status (for polling)
@app.route('/api/2.0/sql/statements/<statement_id>', methods=['GET'])
def databricks_get_statement(statement_id):
    """Get statement execution status"""
    return jsonify({
        "statement_id": statement_id,
        "status": {"state": "SUCCEEDED"},
        "manifest": {
            "schema": {"columns": [{"name": "result", "type_name": "STRING"}]},
            "total_row_count": 1
        },
        "result": {"data_array": [["OK"]]}
    })


# ============== Health Checks ==============

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})


@app.route('/oauth/token-request', methods=['POST'])
def snowflake_auth():
    """Mock Snowflake OAuth endpoint"""
    return jsonify({
        "access_token": "mock_snowflake_token_" + str(uuid.uuid4()),
        "token_type": "Bearer",
        "expires_in": 3600
    })


if __name__ == '__main__':
    print("🧊 Mock Cloud Server starting...")
    print("   Snowflake API: http://localhost:8443/api/v2/statements")
    print("   Databricks API: http://localhost:8443/api/2.0/sql/statements")
    print("   Health: http://localhost:8443/health")
    app.run(host='0.0.0.0', port=8443, debug=False)






