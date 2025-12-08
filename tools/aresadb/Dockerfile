# AresaDB Dockerfile
# Multi-stage build for optimal image size

# =============================================================================
# Stage 1: Build
# =============================================================================
FROM rust:1.75-slim-bookworm AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first for layer caching
COPY Cargo.toml Cargo.lock ./

# Create dummy src to build dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    echo "pub fn lib() {}" > src/lib.rs

# Build dependencies (this layer is cached)
RUN cargo build --release && rm -rf src target/release/deps/aresadb*

# Copy actual source code
COPY src ./src
COPY tests ./tests
COPY benches ./benches
COPY examples ./examples

# Build the actual application
RUN cargo build --release --bin aresadb

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM debian:bookworm-slim AS runtime

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1000 -s /bin/bash aresadb

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/aresadb /usr/local/bin/aresadb

# Create data directory
RUN mkdir -p /data && chown aresadb:aresadb /data

# Switch to non-root user
USER aresadb

# Set default data directory
ENV ARESADB_DATA_DIR=/data

# Default command
CMD ["aresadb", "repl"]

# Expose default port for server mode
EXPOSE 6379

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD aresadb --version || exit 1

# Labels
LABEL org.opencontainers.image.title="AresaDB" \
      org.opencontainers.image.description="High-performance multi-model database in Rust" \
      org.opencontainers.image.version="0.1.0" \
      org.opencontainers.image.vendor="ARESA Lab" \
      org.opencontainers.image.source="https://github.com/aresa-lab/aresadb"

