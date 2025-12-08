//! RAG (Retrieval-Augmented Generation) utilities
//!
//! Provides document chunking, embedding workflows, and context retrieval
//! for building RAG applications with AresaDB.

mod chunker;
mod context;
mod embeddings;
mod hybrid;

pub use chunker::{Chunker, ChunkStrategy, DocumentChunk};
pub use context::{ContextRetriever, RetrievedContext, ContextChunk};
pub use embeddings::{
    EmbeddingProvider, EmbeddingManager,
    OpenAIEmbeddings, OpenAIModel,
    LocalHashEmbeddings, TfIdfEmbeddings,
};
pub use hybrid::{HybridSearch, HybridSearchConfig, HybridSearchResult, keyword_search_sync};

/// Default chunk size in characters
pub const DEFAULT_CHUNK_SIZE: usize = 512;

/// Default overlap between chunks
pub const DEFAULT_CHUNK_OVERLAP: usize = 50;

/// Maximum context tokens to retrieve
pub const DEFAULT_MAX_CONTEXT_TOKENS: usize = 4096;

