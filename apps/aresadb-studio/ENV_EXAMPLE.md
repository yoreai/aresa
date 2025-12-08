# Environment Configuration

Copy these values to `.env.local`:

```env
# AresaDB Configuration
ARESADB_BINARY=aresadb
ARESADB_DEFAULT_DB=/path/to/your/database

# OpenAI (Required for RAG)
OPENAI_API_KEY=sk-your-api-key-here

# Vercel Blob (Optional, for production)
# BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

## Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `ARESADB_BINARY` | Yes | Path to AresaDB CLI binary or `aresadb` if in PATH |
| `ARESADB_DEFAULT_DB` | Yes | Path to database directory |
| `OPENAI_API_KEY` | For RAG | Your OpenAI API key from platform.openai.com |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob token for KB storage |
