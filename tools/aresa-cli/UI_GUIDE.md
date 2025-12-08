# ARESA Studio - Web UI Guide

## 🎨 What is ARESA Studio?

A **beautiful web interface** embedded in the ARESA CLI that gives you visual database management without leaving the terminal ecosystem.

```
┌─────────────────────────────────────────────────┐
│  Terminal                                       │
│  $ aresa serve                                  │
│  🌐 ARESA Studio running at http://localhost:3001│
│  ✓ Opened browser                               │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  Browser Window                          │   │
│  │  ╔═══════════════════════════════════╗  │   │
│  │  ║  ARESA Studio                     ║  │   │
│  │  ║  📊 Dashboard | 🎯 Query | 📜 ...  ║  │   │
│  │  ╚═══════════════════════════════════╝  │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Build with UI Support

```bash
cd aresa/tools/aresa-cli
cargo build --release --features ui
```

### Start the UI

```bash
./target/release/aresa serve

# With custom port
./target/release/aresa serve --port 8080

# Don't auto-open browser
./target/release/aresa serve --no-open
```

## 📱 Features

### 1. Dashboard
- View all configured connections at a glance
- Quick stats (queries today, success rate, avg response time)
- Recent query history
- Quick actions to all features

### 2. SQL Editor
- Monaco editor (same as VS Code!)
- Syntax highlighting for SQL
- Auto-completion (coming soon)
- Multi-database support via dropdown
- Execute queries with ▶️ button
- Beautiful table results
- Export to CSV/JSON

### 3. Schema Explorer
- Browse all tables in selected database
- View column details (name, type, nullable, keys)
- Visual indicators for views vs tables
- Row counts (where available)
- Copy table/column names

### 4. Query History
- Automatic tracking of all queries
- Search full-text
- Filter by source
- Statistics dashboard
- Re-run any query with one click
- View execution time and row counts

### 5. Connection Manager
- Add new connections via form
- Test connections
- View connection status
- Delete unused connections
- Supports all ARESA database types

### 6. Terminal (Planned)
- Embedded terminal emulator
- Direct CLI access
- Command history
- Persistent sessions

## 🎨 Screenshots

### Dashboard
```
┌──────────────────────────────────────────────────┐
│  ARESA Studio                [Connections ▼]     │
├──────────────────────────────────────────────────┤
│                                                   │
│  📊 9 Connections    📈 42 Queries    ✓ 97% OK   │
│                                                   │
│  Recent Queries              Connected DBs        │
│  • SELECT * FROM users       ✅ prod (postgres)  │
│  • COUNT(*) FROM events      ✅ analytics (bq)   │
│  • SELECT MAX(created...)    ✅ warehouse (rs)   │
│                                                   │
│  [New Query] [Schema] [History] [Terminal]       │
└──────────────────────────────────────────────────┘
```

### SQL Editor
```
┌──────────────────────────────────────────────────┐
│  SQL Editor              [prod ▼]      [Run ▶]   │
├──────────────────────────────────────────────────┤
│  SELECT * FROM users                              │
│  WHERE created_at > NOW() - INTERVAL '7 days';   │
│                                                   │
├──────────────────────────────────────────────────┤
│  Results (1,234 rows in 0.45s)   [CSV] [JSON]   │
├──────────────────────────────────────────────────┤
│  id │ name   │ email            │ created_at    │
│  1  │ Alice  │ alice@ex.com    │ 2024-12-01   │
│  2  │ Bob    │ bob@ex.com      │ 2024-11-30   │
└──────────────────────────────────────────────────┘
```

## 🔌 API Integration

The UI communicates with the Rust backend via REST API:

### Endpoints

```typescript
// List connections
GET /api/connections
→ [{ name: "prod", type: "postgres", status: "connected" }]

// Execute query
POST /api/query
{ source: "prod", query: "SELECT * FROM users", limit: 100 }
→ { columns: [...], rows: [...], executionTimeMs: 234 }

// Ping connection
GET /api/connections/:name/ping
→ { success: true, latencyMs: 45 }

// Get history
GET /api/history?limit=50
→ [{ id: 1, query: "...", timestamp: "...", ... }]

// List tables
GET /api/schema/:source/tables
→ [{ name: "users", type: "table", rowCount: 1234 }]
```

## 🎯 Use Cases

### Data Exploration
```
1. Open ARESA Studio (aresa serve)
2. Select database from dropdown
3. Navigate to Schema tab
4. Click on a table
5. See all columns with types
6. Click "Query" to generate SELECT
7. Execute and view results
```

### Query Development
```
1. Open SQL Editor
2. Write complex query with auto-completion
3. Execute to see results
4. Save successful query
5. View in History for future reference
```

### Connection Management
```
1. Open Connections tab
2. Click "Add Connection"
3. Fill in form (Postgres, MySQL, BigQuery, etc.)
4. Test connection
5. Save and use immediately
```

### Monitoring
```
1. Save monitoring queries
2. Pin to dashboard
3. Auto-refresh every 30s
4. Visual alerts for errors
```

## 🔧 Configuration

ARESA Studio uses the same configuration as the CLI:
- Config file: `~/.config/aresa/config.toml`
- Credentials: OS keychain
- History: `~/.config/aresa/history.db` (when implemented)

Changes in the UI are immediately reflected in the CLI and vice versa!

## 🚀 Deployment

### As Part of ARESA CLI

```bash
# Build with UI
cargo build --release --features ui

# Users can run
aresa serve

# Or without UI feature (smaller binary)
cargo build --release
aresa serve
# → Error: UI feature not enabled
```

### Standalone (Development)

```bash
cd aresa-studio
npm run dev
# Runs on http://localhost:3000
# Connects to aresa serve on http://localhost:3001
```

## 📊 Performance

- **Build size:** ~2MB static files
- **Binary impact:** +5MB when embedded
- **Load time:** < 1s
- **Query execution:** Same as CLI (minimal overhead)

## 🎓 Technical Details

### Static Export

Next.js is built as static HTML/JS/CSS (no server-side rendering needed):

```bash
npm run build
# → out/ directory with:
#    - HTML files for each route
#    - JavaScript bundles
#    - CSS stylesheets
#    - Assets
```

### Embedding in Rust

```rust
// Using include_dir! macro
const STATIC_FILES: Dir = include_dir!("../aresa-studio/out");

// Serve with Axum
.nest_service("/", ServeDir::new("../aresa-studio/out"))
```

### API Communication

```typescript
// lib/api.ts
const API_BASE = 'http://localhost:3001';

export const api = {
  async executeQuery(source, query) {
    const res = await fetch(`${API_BASE}/api/query`, {
      method: 'POST',
      body: JSON.stringify({ source, query }),
    });
    return res.json();
  }
};
```

## 🔮 Future Enhancements

- **WebSocket** for live query execution progress
- **Terminal emulator** using xterm.js
- **Visual query builder** drag-and-drop
- **ER diagrams** auto-generated from schema
- **Data charts** built-in visualization
- **Collaboration** share queries with team
- **Themes** light/dark/custom
- **Keyboard shortcuts** power user mode

## 🐛 Troubleshooting

### UI Won't Start

```bash
# Check if built with UI feature
cargo build --features ui

# Check if Next.js is built
cd aresa-studio && npm run build

# Check if port is available
lsof -ti:3001 | xargs kill
```

### Connection to Backend Fails

```bash
# Ensure CORS is enabled (it is by default)
# Check console for API errors
# Verify Rust server is running
```

### Slow Performance

```bash
# Use --limit for large result sets
# Check network tab for API response times
# Same performance as CLI queries
```

## 📄 License

MIT - Part of the ARESA project by Aresa Lab

