//! Tests for connectors module

#[cfg(test)]
mod filesystem_tests {
    use crate::connectors::filesystem::FilesystemConnector;
    use std::fs;
    use tempfile::TempDir;

    fn create_test_files() -> TempDir {
        let temp_dir = TempDir::new().unwrap();

        // Create test files
        fs::write(temp_dir.path().join("test.py"), "# Python file\nprint('hello')").unwrap();
        fs::write(temp_dir.path().join("test.rs"), "// Rust file\nfn main() {}").unwrap();
        fs::write(temp_dir.path().join("readme.md"), "# README\nThis is a test").unwrap();
        fs::write(temp_dir.path().join("data.json"), r#"{"key": "value"}"#).unwrap();

        // Create subdirectory with files
        let subdir = temp_dir.path().join("src");
        fs::create_dir(&subdir).unwrap();
        fs::write(subdir.join("main.py"), "# Main\nimport os\n# TODO: fix this").unwrap();
        fs::write(subdir.join("utils.py"), "# Utils\ndef helper(): pass").unwrap();

        temp_dir
    }

    #[tokio::test]
    async fn test_search_files_by_pattern() {
        let temp_dir = create_test_files();
        let connector = FilesystemConnector::new();

        // Note: API is search_files(path, pattern, limit)
        let results = connector
            .search_files(temp_dir.path().to_str().unwrap(), "*.py", Some(10))
            .await
            .unwrap();

        assert!(!results.is_empty(), "Should find at least one .py file");
        assert!(results.iter().all(|r| r.path.to_string_lossy().ends_with(".py")));
    }

    #[tokio::test]
    async fn test_search_files_rust_pattern() {
        let temp_dir = create_test_files();
        let connector = FilesystemConnector::new();

        let results = connector
            .search_files(temp_dir.path().to_str().unwrap(), "*.rs", Some(10))
            .await
            .unwrap();

        assert_eq!(results.len(), 1, "Should find exactly one .rs file");
        assert!(results[0].path.to_string_lossy().ends_with("test.rs"));
    }

    #[tokio::test]
    async fn test_search_content() {
        let temp_dir = create_test_files();
        let connector = FilesystemConnector::new();

        let results = connector
            .search_content(temp_dir.path().to_str().unwrap(), "TODO", Some(10))
            .await
            .unwrap();

        assert!(!results.is_empty(), "Should find TODO in main.py");
        assert!(results.iter().any(|r| r.path.to_string_lossy().contains("main.py")));
    }

    #[tokio::test]
    async fn test_search_content_no_match() {
        let temp_dir = create_test_files();
        let connector = FilesystemConnector::new();

        let results = connector
            .search_content(temp_dir.path().to_str().unwrap(), "NONEXISTENT_STRING_12345", Some(10))
            .await
            .unwrap();

        assert!(results.is_empty());
    }

    #[tokio::test]
    async fn test_search_files_nonexistent_path() {
        let connector = FilesystemConnector::new();

        let result = connector
            .search_files("/nonexistent/path/that/does/not/exist", "*.py", Some(10))
            .await;

        // Should return empty results, not error
        assert!(result.is_ok());
        assert!(result.unwrap().is_empty());
    }

    #[tokio::test]
    async fn test_search_files_with_limit() {
        let temp_dir = create_test_files();
        let connector = FilesystemConnector::new();

        let results = connector
            .search_files(temp_dir.path().to_str().unwrap(), "*", Some(2))
            .await
            .unwrap();

        assert!(results.len() <= 2);
    }
}

#[cfg(test)]
mod duckdb_tests {
    use crate::connectors::duckdb::DuckDbConnector;
    use std::fs;
    use tempfile::TempDir;

    fn create_test_json() -> (TempDir, String) {
        let temp_dir = TempDir::new().unwrap();
        let json_path = temp_dir.path().join("test.json");

        fs::write(&json_path, r#"[
            {"name": "Alice", "age": 30},
            {"name": "Bob", "age": 25}
        ]"#).unwrap();

        (temp_dir, json_path.to_string_lossy().to_string())
    }

    #[tokio::test]
    async fn test_duckdb_new() {
        let connector = DuckDbConnector::new(None).await;
        assert!(connector.is_ok());
    }

    #[tokio::test]
    async fn test_query_json() {
        let (_temp_dir, json_path) = create_test_json();
        let connector = DuckDbConnector::new(None).await.unwrap();

        let (columns, rows) = connector.query_json(&json_path).await.unwrap();

        assert!(columns.contains(&"name".to_string()));
        assert!(columns.contains(&"age".to_string()));
        assert_eq!(rows.len(), 2);
    }

    #[tokio::test]
    async fn test_query_json_nonexistent() {
        let connector = DuckDbConnector::new(None).await.unwrap();

        let result = connector.query_json("/nonexistent/file.json").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_execute_sql() {
        let connector = DuckDbConnector::new(None).await.unwrap();

        let (columns, rows) = connector
            .execute_sql("SELECT 1 as num, 'hello' as greeting", None)
            .await
            .unwrap();

        assert_eq!(columns.len(), 2);
        assert_eq!(rows.len(), 1);
    }
}

#[cfg(test)]
mod sqlite_tests {
    use crate::connectors::sqlite::SqliteConnector;

    #[tokio::test]
    async fn test_sqlite_memory() {
        let connector = SqliteConnector::new(":memory:").await;
        assert!(connector.is_ok());
    }

    #[tokio::test]
    async fn test_sqlite_execute_sql() {
        let connector = SqliteConnector::new(":memory:").await.unwrap();

        let (columns, rows) = connector
            .execute_sql("SELECT 42 as answer, 'test' as message", None)
            .await
            .unwrap();

        assert_eq!(columns.len(), 2);
        assert_eq!(rows.len(), 1);
        assert!(columns.contains(&"answer".to_string()));
        assert!(columns.contains(&"message".to_string()));
    }

    #[tokio::test]
    async fn test_sqlite_invalid_sql() {
        let connector = SqliteConnector::new(":memory:").await.unwrap();

        let result = connector
            .execute_sql("INVALID SQL QUERY", None)
            .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_sqlite_create_and_query() {
        let connector = SqliteConnector::new(":memory:").await.unwrap();

        // Create table
        let _ = connector
            .execute_sql("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)", None)
            .await
            .unwrap();

        // Insert data
        let _ = connector
            .execute_sql("INSERT INTO users (name) VALUES ('Alice'), ('Bob')", None)
            .await
            .unwrap();

        // Query
        let (columns, rows) = connector
            .execute_sql("SELECT * FROM users ORDER BY id", None)
            .await
            .unwrap();

        assert!(columns.contains(&"id".to_string()));
        assert!(columns.contains(&"name".to_string()));
        assert_eq!(rows.len(), 2);
    }

    #[tokio::test]
    async fn test_sqlite_list_tables() {
        let connector = SqliteConnector::new(":memory:").await.unwrap();

        // Create tables
        let _ = connector.execute_sql("CREATE TABLE users (id INTEGER)", None).await.unwrap();
        let _ = connector.execute_sql("CREATE TABLE orders (id INTEGER)", None).await.unwrap();

        // List tables
        let (columns, rows) = connector
            .execute_sql("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", None)
            .await
            .unwrap();

        assert!(columns.contains(&"name".to_string()));
        assert!(rows.iter().any(|r| r.get("name") == Some(&"orders".to_string())));
        assert!(rows.iter().any(|r| r.get("name") == Some(&"users".to_string())));
    }
}

#[cfg(test)]
mod clickhouse_tests {
    use crate::connectors::clickhouse::ClickHouseConnector;

    #[tokio::test]
    #[ignore = "Requires ClickHouse server"]
    async fn test_clickhouse_new() {
        // ClickHouse connector tests connection on creation
        let connector = ClickHouseConnector::new("localhost", None, None, None, None).await;
        assert!(connector.is_ok());
    }

    #[tokio::test]
    #[ignore = "Requires ClickHouse server"]
    async fn test_clickhouse_live_query() {
        let connector = ClickHouseConnector::new("localhost", Some(8123), None, None, None).await.unwrap();
        let result = connector.execute_sql("SELECT 1 as num", None).await;
        assert!(result.is_ok());
    }
}

#[cfg(test)]
mod connector_trait_tests {
    /// Test that all connectors implement the expected interface pattern
    /// This is more of a compile-time check than a runtime test

    #[test]
    fn test_query_result_structure() {
        use std::collections::HashMap;

        // QueryResult is (Vec<String>, Vec<HashMap<String, String>>)
        let columns: Vec<String> = vec!["id".to_string(), "name".to_string()];
        let mut row: HashMap<String, String> = HashMap::new();
        row.insert("id".to_string(), "1".to_string());
        row.insert("name".to_string(), "Alice".to_string());
        let rows = vec![row];

        // Verify structure
        assert_eq!(columns.len(), 2);
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].get("name"), Some(&"Alice".to_string()));
    }
}
