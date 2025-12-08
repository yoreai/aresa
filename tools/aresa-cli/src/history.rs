//! Query history tracking
//!
//! Stores query execution history for the web UI.

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: u64,
    pub timestamp: String,
    pub source: String,
    pub query: String,
    pub success: bool,
    #[serde(rename = "durationMs")]
    pub duration_ms: Option<u64>,
    #[serde(rename = "rowsReturned")]
    pub rows_returned: Option<usize>,
    pub error: Option<String>,
}

#[derive(Debug, Clone)]
pub struct HistoryTracker {
    entries: Arc<RwLock<Vec<HistoryEntry>>>,
    next_id: Arc<RwLock<u64>>,
}

impl HistoryTracker {
    pub fn new() -> Self {
        Self {
            entries: Arc::new(RwLock::new(Vec::new())),
            next_id: Arc::new(RwLock::new(1)),
        }
    }

    pub async fn add_entry(
        &self,
        source: String,
        query: String,
        success: bool,
        duration_ms: Option<u64>,
        rows_returned: Option<usize>,
        error: Option<String>,
    ) -> u64 {
        let mut id = self.next_id.write().await;
        let entry_id = *id;
        *id += 1;
        drop(id);

        let entry = HistoryEntry {
            id: entry_id,
            timestamp: chrono::Utc::now().to_rfc3339(),
            source,
            query,
            success,
            duration_ms,
            rows_returned,
            error,
        };

        let mut entries = self.entries.write().await;
        entries.push(entry);

        // Keep only last 1000 entries
        if entries.len() > 1000 {
            entries.remove(0);
        }

        entry_id
    }

    pub async fn get_history(&self, limit: usize) -> Vec<HistoryEntry> {
        let entries = self.entries.read().await;
        entries
            .iter()
            .rev()
            .take(limit)
            .cloned()
            .collect()
    }

    pub async fn search_history(&self, pattern: &str) -> Vec<HistoryEntry> {
        let entries = self.entries.read().await;
        let pattern_lower = pattern.to_lowercase();

        entries
            .iter()
            .filter(|e| {
                e.query.to_lowercase().contains(&pattern_lower)
                    || e.source.to_lowercase().contains(&pattern_lower)
            })
            .rev()
            .take(100)
            .cloned()
            .collect()
    }

    pub async fn clear_history(&self) {
        let mut entries = self.entries.write().await;
        entries.clear();
    }
}

impl Default for HistoryTracker {
    fn default() -> Self {
        Self::new()
    }
}

