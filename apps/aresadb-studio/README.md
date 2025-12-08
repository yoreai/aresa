# AresaDB Studio 🏥

A beautiful, modern web UI for **AresaDB** - the high-performance multi-model database built in Rust.

![AresaDB Studio Dashboard](https://via.placeholder.com/800x400?text=AresaDB+Studio+Dashboard)

## Features

- **📊 SQL Query Editor** - Execute SQL queries with syntax highlighting and auto-completion
- **🔮 Vector Search** - Semantic similarity search across medical documents
- **🤖 RAG Pipeline** - AI-powered document retrieval and question answering
- **🧪 Data Playground** - Import, explore, and manage your datasets
- **📈 Benchmarks** - Performance comparisons against SQLite, DuckDB, and Pandas

## Healthcare ML Datasets

Pre-loaded with curated healthcare datasets for demonstration:

| Dataset | Records | Description |
|---------|---------|-------------|
| **Drug Reviews** | 215,063 | Patient medication reviews with ratings |
| **Medical Transcriptions** | 4,999 | Clinical notes across specialties |
| **Heart Disease UCI** | 303 | Classic ML cardiovascular data |
| **PubMed Abstracts** | 67,238 | Research paper abstracts |

## Quick Start

### Prerequisites

- Node.js 18+
- AresaDB CLI (built from `aresa/tools/aresadb`)

### Installation

```bash
# Install dependencies
npm install

# Load demo datasets (optional)
npx tsx scripts/load-demo-data.ts

# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AresaDB Studio (Next.js)                  │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Query Editor  │  Vectors  │  RAG  │  Bench   │
├─────────────────────────────────────────────────────────────┤
│                       API Routes                             │
│   /api/query  │  /api/vector  │  /api/rag  │  /api/status   │
├─────────────────────────────────────────────────────────────┤
│                     AresaDB CLI (Rust)                       │
│   SQL Parser  │  Vector Index  │  Graph Engine  │  Storage  │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom design system
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Database**: AresaDB (Rust)

## Pages

### Dashboard (`/`)
Overview of database stats, query performance, and quick actions.

### Query Editor (`/query`)
Full-featured SQL editor with:
- Syntax highlighting
- Sample queries for each dataset
- Results in table or JSON format
- Query execution timing

### Vector Search (`/vectors`)
Semantic search interface:
- Natural language queries
- Configurable distance metrics (cosine, euclidean, dot product)
- Similarity score visualization

### RAG Pipeline (`/rag`)
AI-powered Q&A:
- Chat interface for medical questions
- Source citations with relevance scores
- Context retrieval visualization

### Benchmarks (`/benchmarks`)
Performance comparisons:
- Query speed vs SQLite, DuckDB, Pandas
- Scale performance (10K to 10M records)
- Feature radar charts

### Playground (`/playground`)
Data management:
- Drag-and-drop file upload
- Schema exploration
- Data export

## Environment Variables

Create a `.env.local` file:

```env
# Path to AresaDB CLI binary
ARESADB_PATH=../../tools/aresadb/target/release/aresadb

# Path to demo database
ARESADB_DB_PATH=/tmp/aresadb-studio-demo

# Optional: OpenAI API key for RAG responses
OPENAI_API_KEY=sk-...
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

Note: For full functionality on Vercel, you'll need to either:
- Use a hosted AresaDB instance
- Deploy AresaDB as a serverless function (experimental)

### Self-Hosted

```bash
npm run build
npm start
```

## Contributing

See [CONTRIBUTING.md](../../tools/aresadb/CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](../../tools/aresadb/LICENSE)

---

Built with ❤️ by [ARESA Lab](https://aresalab.org)

