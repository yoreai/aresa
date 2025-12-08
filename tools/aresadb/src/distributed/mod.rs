//! Distributed Database Components
//!
//! V2 features for scaling AresaDB across multiple nodes:
//! - Sharding with consistent hashing
//! - Write-ahead logging for durability
//! - Bloom filters for fast negative lookups
//! - LZ4 compression for storage efficiency
//! - Replication for fault tolerance
//! - Streaming for large result sets

mod bloom;
mod compression;
mod shard;
mod wal;
mod replication;
mod streaming;

pub use bloom::{BloomFilter, CountingBloomFilter};
pub use compression::{Compressor, CompressionStats};
pub use shard::{ShardManager, ShardConfig, Shard};
pub use wal::{WriteAheadLog, WalEntry, WalEntryType};
pub use replication::{ReplicaSet, ReplicaConfig, ReplicaState};
pub use streaming::{ResultStream, StreamSender, Cursor};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bloom_filter_basic() {
        let mut bloom = BloomFilter::new(1000, 0.01);
        bloom.insert(b"hello");
        bloom.insert(b"world");

        assert!(bloom.may_contain(b"hello"));
        assert!(bloom.may_contain(b"world"));
        // False positives are possible, but "definitely not in set" is reliable
    }

    #[test]
    fn test_compression_roundtrip() {
        let compressor = Compressor::new();
        let data = b"Hello, AresaDB! This is a test of compression.";

        let compressed = compressor.compress(data).unwrap();
        let decompressed = compressor.decompress(&compressed).unwrap();

        assert_eq!(data.as_slice(), decompressed.as_slice());
    }
}
