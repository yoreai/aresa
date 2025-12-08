//! Integration tests for ARESA CLI

use assert_cmd::Command;
use predicates::prelude::*;
use tempfile::TempDir;

/// Get a command pointing to our binary
fn aresa() -> Command {
    Command::cargo_bin("aresa").unwrap()
}

// =============================================================================
// CLI Help & Version Tests
// =============================================================================

#[test]
fn test_help() {
    aresa()
        .arg("--help")
        .assert()
        .success()
        .stdout(predicate::str::contains("Fast, beautiful interface to query any database"))
        .stdout(predicate::str::contains("bigquery"))
        .stdout(predicate::str::contains("postgres"))
        .stdout(predicate::str::contains("sqlite"))
        .stdout(predicate::str::contains("files"));
}

#[test]
fn test_version() {
    aresa()
        .arg("--version")
        .assert()
        .success()
        .stdout(predicate::str::contains("aresa"));
}

#[test]
fn test_bigquery_help() {
    aresa()
        .args(["bq", "--help"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Query BigQuery"))
        .stdout(predicate::str::contains("--datasets"))
        .stdout(predicate::str::contains("--tables"))
        .stdout(predicate::str::contains("--schema"));
}

#[test]
fn test_postgres_help() {
    aresa()
        .args(["pg", "--help"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Query PostgreSQL"))
        .stdout(predicate::str::contains("--tables"))
        .stdout(predicate::str::contains("--schema"));
}

#[test]
fn test_sqlite_help() {
    aresa()
        .args(["sqlite", "--help"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Query SQLite"))
        .stdout(predicate::str::contains("--tables"));
}

#[test]
fn test_files_help() {
    aresa()
        .args(["files", "--help"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Search filesystem"))
        .stdout(predicate::str::contains("--content"))
        .stdout(predicate::str::contains("--path"));
}

#[test]
fn test_config_help() {
    aresa()
        .args(["config", "--help"])
        .assert()
        .success()
        .stdout(predicate::str::contains("add"))
        .stdout(predicate::str::contains("remove"))
        .stdout(predicate::str::contains("list"))
        .stdout(predicate::str::contains("test"));
}

// =============================================================================
// Sources Command Tests
// =============================================================================

#[test]
fn test_sources_command() {
    aresa()
        .arg("sources")
        .assert()
        .success();
}

// =============================================================================
// File Search Tests
// =============================================================================

#[test]
fn test_file_search_rust_files() {
    aresa()
        .args(["files", "*.rs", "--path", "src", "--limit", "5"])
        .assert()
        .success()
        .stdout(predicate::str::contains(".rs"))  // Just check we found Rust files
        .stdout(predicate::str::contains("5 files"));
}

#[test]
fn test_file_search_current_dir() {
    aresa()
        .args(["files", "Cargo.toml"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Cargo.toml"));
}

#[test]
fn test_file_search_no_matches() {
    aresa()
        .args(["files", "*.nonexistent_extension_xyz"])
        .assert()
        .success()
        .stdout(predicate::str::contains("No matches found").or(predicate::str::contains("0 files")));
}

#[test]
fn test_file_content_search() {
    aresa()
        .args(["files", "fn main", "--path", "src", "--content", "--limit", "3"])
        .assert()
        .success();
}

// =============================================================================
// SQLite Tests
// =============================================================================

#[test]
fn test_sqlite_in_memory() {
    aresa()
        .args(["sqlite", ":memory:", "SELECT 1 + 1 as result"])
        .assert()
        .success()
        .stdout(predicate::str::contains("result"))
        .stdout(predicate::str::contains("2"));
}

#[test]
fn test_sqlite_list_tables_empty() {
    aresa()
        .args(["sqlite", ":memory:", "--tables"])
        .assert()
        .success();
}

#[test]
fn test_sqlite_with_temp_db() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");

    // Create a table
    aresa()
        .args(["sqlite", db_path.to_str().unwrap(),
               "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"])
        .assert()
        .success();

    // Insert data
    aresa()
        .args(["sqlite", db_path.to_str().unwrap(),
               "INSERT INTO users (name) VALUES ('Alice'), ('Bob')"])
        .assert()
        .success();

    // Query data
    aresa()
        .args(["sqlite", db_path.to_str().unwrap(),
               "SELECT * FROM users"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Alice"))
        .stdout(predicate::str::contains("Bob"));

    // List tables
    aresa()
        .args(["sqlite", db_path.to_str().unwrap(), "--tables"])
        .assert()
        .success()
        .stdout(predicate::str::contains("users"));

    // Get schema
    aresa()
        .args(["sqlite", db_path.to_str().unwrap(), "--schema", "users"])
        .assert()
        .success()
        .stdout(predicate::str::contains("id"))
        .stdout(predicate::str::contains("name"));
}

// =============================================================================
// Output Format Tests
// =============================================================================

#[test]
fn test_json_output_format() {
    aresa()
        .args(["sqlite", ":memory:", "SELECT 42 as answer", "--format", "json"])
        .assert()
        .success()
        .stdout(predicate::str::contains("["))
        .stdout(predicate::str::contains("answer"))
        .stdout(predicate::str::contains("42"));
}

#[test]
fn test_csv_output_format() {
    aresa()
        .args(["sqlite", ":memory:", "SELECT 1 as a, 2 as b", "--format", "csv"])
        .assert()
        .success()
        .stdout(predicate::str::contains("a,b"))
        .stdout(predicate::str::contains("\"1\",\"2\""));
}

#[test]
fn test_table_output_format() {
    aresa()
        .args(["sqlite", ":memory:", "SELECT 'hello' as greeting", "--format", "table"])
        .assert()
        .success()
        .stdout(predicate::str::contains("greeting"))
        .stdout(predicate::str::contains("hello"))
        .stdout(predicate::str::contains("╭").or(predicate::str::contains("┌")));
}

// =============================================================================
// Limit Tests
// =============================================================================

#[test]
fn test_limit_option() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");

    // Create table with many rows
    aresa()
        .args(["sqlite", db_path.to_str().unwrap(),
               "CREATE TABLE numbers (n INTEGER)"])
        .assert()
        .success();

    aresa()
        .args(["sqlite", db_path.to_str().unwrap(),
               "INSERT INTO numbers VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10)"])
        .assert()
        .success();

    // Query with limit
    aresa()
        .args(["sqlite", db_path.to_str().unwrap(),
               "SELECT * FROM numbers", "--limit", "3"])
        .assert()
        .success()
        .stdout(predicate::str::contains("3 rows"));
}

// =============================================================================
// Error Handling Tests
// =============================================================================

#[test]
fn test_sqlite_nonexistent_file() {
    aresa()
        .args(["sqlite", "/nonexistent/path/to/db.sqlite", "SELECT 1"])
        .assert()
        .failure();
}

#[test]
fn test_sqlite_invalid_sql() {
    aresa()
        .args(["sqlite", ":memory:", "SELEKT * FORM nothing"])
        .assert()
        .failure();
}

#[test]
fn test_postgres_missing_source() {
    aresa()
        .args(["pg", "nonexistent_source", "SELECT 1"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("not found").or(predicate::str::contains("No URI")));
}

// =============================================================================
// BigQuery Tests (require authentication, marked as ignored)
// =============================================================================

#[test]
#[ignore = "Requires BigQuery authentication"]
fn test_bigquery_datasets() {
    aresa()
        .args(["bq", "--datasets", "--limit", "5"])
        .assert()
        .success()
        .stdout(predicate::str::contains("schema_name"));
}

#[test]
#[ignore = "Requires BigQuery authentication"]
fn test_bigquery_query() {
    aresa()
        .args(["bq", "SELECT 1 as one"])
        .assert()
        .success()
        .stdout(predicate::str::contains("one"))
        .stdout(predicate::str::contains("1"));
}

#[test]
#[ignore = "Requires BigQuery authentication"]
fn test_bigquery_named_source() {
    aresa()
        .args(["bq", "abridge", "--datasets", "--limit", "3"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Using source"));
}

// =============================================================================
// Config Add/Remove Tests (use temp config)
// =============================================================================

#[test]
fn test_config_list() {
    aresa()
        .args(["config", "list"])
        .assert()
        .success();
}
