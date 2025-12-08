//! Tests for configuration module

#[cfg(test)]
mod tests {
    use crate::config::sources::{SourceType, DataSource};

    #[test]
    fn test_source_type_description() {
        assert_eq!(SourceType::Postgres.description(), "PostgreSQL database");
        assert_eq!(SourceType::MySQL.description(), "MySQL database");
        assert_eq!(SourceType::SQLite.description(), "SQLite database");
        assert_eq!(SourceType::DuckDB.description(), "DuckDB database");
        assert_eq!(SourceType::ClickHouse.description(), "ClickHouse OLAP database");
        assert_eq!(SourceType::BigQuery.description(), "Google BigQuery");
        assert_eq!(SourceType::Snowflake.description(), "Snowflake Data Warehouse");
        assert_eq!(SourceType::Databricks.description(), "Databricks SQL Warehouse");
        assert_eq!(SourceType::S3.description(), "AWS S3 bucket");
        assert_eq!(SourceType::GCS.description(), "Google Cloud Storage bucket");
    }

    #[test]
    fn test_source_type_supports_sql() {
        assert!(SourceType::Postgres.supports_sql());
        assert!(SourceType::MySQL.supports_sql());
        assert!(SourceType::SQLite.supports_sql());
        assert!(SourceType::DuckDB.supports_sql());
        assert!(SourceType::ClickHouse.supports_sql());
        assert!(SourceType::BigQuery.supports_sql());
        assert!(SourceType::Snowflake.supports_sql());
        assert!(SourceType::Databricks.supports_sql());
        assert!(!SourceType::S3.supports_sql());
        assert!(!SourceType::GCS.supports_sql());
    }

    #[test]
    fn test_data_source_serialization() {
        let source = DataSource {
            source_type: SourceType::Postgres,
            uri: Some("postgresql://localhost/test".to_string()),
            host: None,
            port: None,
            database: Some("test".to_string()),
            schema: None,
            username: None,
            password: None,
            project: None,
            bucket: None,
            region: None,
            credentials_path: None,
            account: None,
            warehouse: None,
            catalog: None,
            token: None,
        };

        let serialized = toml::to_string(&source).unwrap();
        assert!(serialized.contains("source_type = \"postgres\""));
        assert!(serialized.contains("database = \"test\""));

        // Ensure None fields are not serialized
        assert!(!serialized.contains("host ="));
        assert!(!serialized.contains("port ="));
    }

    #[test]
    fn test_data_source_deserialization() {
        let toml_str = r#"
            source_type = "mysql"
            uri = "mysql://localhost/db"
            database = "mydb"
        "#;

        let source: DataSource = toml::from_str(toml_str).unwrap();
        assert_eq!(source.source_type, SourceType::MySQL);
        assert_eq!(source.uri, Some("mysql://localhost/db".to_string()));
        assert_eq!(source.database, Some("mydb".to_string()));
        assert!(source.host.is_none());
    }

    #[test]
    fn test_snowflake_source_serialization() {
        let source = DataSource {
            source_type: SourceType::Snowflake,
            uri: None,
            host: None,
            port: None,
            database: Some("MY_DATABASE".to_string()),
            schema: Some("PUBLIC".to_string()),
            username: Some("user".to_string()),
            password: None,
            project: None,
            bucket: None,
            region: None,
            credentials_path: None,
            account: Some("xy12345.us-east-1".to_string()),
            warehouse: Some("COMPUTE_WH".to_string()),
            catalog: None,
            token: None,
        };

        let serialized = toml::to_string(&source).unwrap();
        assert!(serialized.contains("source_type = \"snowflake\""));
        assert!(serialized.contains("account = \"xy12345.us-east-1\""));
        assert!(serialized.contains("warehouse = \"COMPUTE_WH\""));
    }

    #[test]
    fn test_databricks_source_serialization() {
        let source = DataSource {
            source_type: SourceType::Databricks,
            uri: None,
            host: Some("adb-1234567890.1.azuredatabricks.net".to_string()),
            port: None,
            database: None,
            schema: Some("default".to_string()),
            username: None,
            password: None,
            project: None,
            bucket: None,
            region: None,
            credentials_path: None,
            account: None,
            warehouse: Some("abc123def456".to_string()),
            catalog: Some("main".to_string()),
            token: None,
        };

        let serialized = toml::to_string(&source).unwrap();
        assert!(serialized.contains("source_type = \"databricks\""));
        assert!(serialized.contains("host = \"adb-1234567890.1.azuredatabricks.net\""));
        assert!(serialized.contains("catalog = \"main\""));
    }

    #[test]
    fn test_all_source_types_serializable() {
        let types = vec![
            SourceType::Postgres,
            SourceType::MySQL,
            SourceType::SQLite,
            SourceType::DuckDB,
            SourceType::ClickHouse,
            SourceType::BigQuery,
            SourceType::Snowflake,
            SourceType::Databricks,
            SourceType::S3,
            SourceType::GCS,
        ];

        for source_type in types {
            let source = DataSource {
                source_type,
                uri: None,
                host: None,
                port: None,
                database: None,
                schema: None,
                username: None,
                password: None,
                project: None,
                bucket: None,
                region: None,
                credentials_path: None,
                account: None,
                warehouse: None,
                catalog: None,
                token: None,
            };

            let serialized = toml::to_string(&source).unwrap();
            let deserialized: DataSource = toml::from_str(&serialized).unwrap();
            assert_eq!(deserialized.source_type, source_type);
        }
    }
}
