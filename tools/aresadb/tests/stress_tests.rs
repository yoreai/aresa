//! Stress and Concurrency Tests
//!
//! Tests that push the database to its limits.

use aresadb::storage::Database;
use aresadb::distributed::{BloomFilter, Compressor};
use std::time::Instant;
use tempfile::TempDir;

mod common;

/// Helper to create a temp database
async fn create_temp_db() -> (Database, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let db = Database::create(temp_dir.path(), "stress_test").await.unwrap();
    (db, temp_dir)
}

/// Test many sequential inserts
#[tokio::test]
async fn test_many_sequential_inserts() {
    let (db, _temp_dir) = create_temp_db().await;

    let start = Instant::now();
    let count = 1000;

    for i in 0..count {
        db.insert_node("item", serde_json::json!({
            "index": i,
            "name": format!("item_{}", i)
        })).await.unwrap();
    }

    let elapsed = start.elapsed();
    println!("Inserted {} nodes in {:?} ({:.2} ops/sec)",
        count, elapsed, count as f64 / elapsed.as_secs_f64());

    // Verify count
    let nodes = db.get_all_by_type("item", Some(count + 100)).await.unwrap();
    assert_eq!(nodes.len(), count);
}

/// Test sequential reads
#[tokio::test]
async fn test_many_sequential_reads() {
    let (db, _temp_dir) = create_temp_db().await;

    // Insert test data
    let count = 100;
    for i in 0..count {
        db.insert_node("read_test", serde_json::json!({
            "value": i
        })).await.unwrap();
    }

    let start = Instant::now();
    let read_count = 500;

    for _ in 0..read_count {
        let _ = db.get_all_by_type("read_test", Some(100)).await.unwrap();
    }

    let elapsed = start.elapsed();
    println!("Performed {} reads in {:?} ({:.2} ops/sec)",
        read_count, elapsed, read_count as f64 / elapsed.as_secs_f64());
}

/// Test edge creation performance
#[tokio::test]
async fn test_edge_creation_performance() {
    let (db, _temp_dir) = create_temp_db().await;

    // Create nodes
    let mut node_ids = Vec::new();
    for i in 0..100 {
        let node = db.insert_node("edge_test", serde_json::json!({
            "index": i
        })).await.unwrap();
        node_ids.push(node.id);
    }

    let start = Instant::now();
    let mut edge_count = 0;

    // Create edges between adjacent nodes
    for i in 0..node_ids.len() - 1 {
        db.create_edge(
            &node_ids[i].to_string(),
            &node_ids[i + 1].to_string(),
            "connects_to",
            Some(serde_json::json!({"order": i}))
        ).await.unwrap();
        edge_count += 1;
    }

    let elapsed = start.elapsed();
    println!("Created {} edges in {:?} ({:.2} ops/sec)",
        edge_count, elapsed, edge_count as f64 / elapsed.as_secs_f64());
}

/// Test bloom filter performance
#[test]
fn test_bloom_filter_bulk_operations() {
    let count = 100_000_usize;
    let mut filter = BloomFilter::new(count, 0.01);

    let start = Instant::now();

    // Insert many items
    for i in 0..count as u64 {
        filter.insert(&i.to_le_bytes());
    }

    let insert_time = start.elapsed();

    let start = Instant::now();

    // Check all items
    for i in 0..count as u64 {
        assert!(filter.may_contain(&i.to_le_bytes()));
    }

    let check_time = start.elapsed();

    println!("Bloom filter: inserted {} items in {:?}, checked in {:?}",
        count, insert_time, check_time);
}

/// Test compression performance
#[test]
fn test_compression_performance() {
    let compressor = Compressor::default();

    // Create sample data
    let data: Vec<u8> = (0..100_000_u32)
        .flat_map(|i| i.to_le_bytes())
        .collect();

    let start = Instant::now();
    let compressed = compressor.compress(&data).unwrap();
    let compress_time = start.elapsed();

    let start = Instant::now();
    let decompressed = compressor.decompress(&compressed).unwrap();
    let decompress_time = start.elapsed();

    println!("Compression: {} bytes -> {} bytes (ratio: {:.2}x)",
        data.len(), compressed.len(), data.len() as f64 / compressed.len() as f64);
    println!("Compress: {:?}, Decompress: {:?}", compress_time, decompress_time);

    assert_eq!(data, decompressed);
}

/// Test database status performance
#[tokio::test]
async fn test_status_performance() {
    let (db, _temp_dir) = create_temp_db().await;

    // Insert some data
    for i in 0..100 {
        db.insert_node("status_test", serde_json::json!({"i": i})).await.unwrap();
    }

    let start = Instant::now();
    let iterations = 100;

    for _ in 0..iterations {
        let _ = db.status().await.unwrap();
    }

    let elapsed = start.elapsed();
    println!("Status called {} times in {:?} ({:.2} ops/sec)",
        iterations, elapsed, iterations as f64 / elapsed.as_secs_f64());
}

/// Test mixed workload
#[tokio::test]
async fn test_mixed_workload() {
    let (db, _temp_dir) = create_temp_db().await;

    let start = Instant::now();
    let iterations = 200;

    for i in 0..iterations {
        match i % 4 {
            0 => {
                // Insert
                let _ = db.insert_node("mixed", serde_json::json!({"i": i})).await;
            }
            1 | 2 => {
                // Read
                let _ = db.get_all_by_type("mixed", Some(10)).await;
            }
            _ => {
                // Status
                let _ = db.status().await;
            }
        }
    }

    let elapsed = start.elapsed();
    println!("Mixed workload: {} operations in {:?} ({:.2} ops/sec)",
        iterations, elapsed, iterations as f64 / elapsed.as_secs_f64());
}

/// Test large property values
#[tokio::test]
async fn test_large_properties() {
    let (db, _temp_dir) = create_temp_db().await;

    // Create large property value
    let large_text: String = (0..10_000).map(|_| 'x').collect();

    let start = Instant::now();

    let node = db.insert_node("large", serde_json::json!({
        "content": large_text,
        "size": 10_000
    })).await.unwrap();

    let elapsed = start.elapsed();
    println!("Inserted node with 10KB text in {:?}", elapsed);

    // Retrieve and verify
    let retrieved = db.get_node(&node.id.to_string()).await.unwrap();
    assert!(retrieved.is_some());
}
