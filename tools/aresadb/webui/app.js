/**
 * AresaDB Dashboard Application
 *
 * A beautiful, modern dashboard for interacting with AresaDB.
 * This is a standalone frontend - in production, it would connect
 * to an AresaDB HTTP server.
 */

// State management
const state = {
    connected: true,
    database: {
        name: 'demo',
        nodeCount: 0,
        edgeCount: 0,
        schemaCount: 0,
        vectorCount: 0
    },
    queryHistory: [],
    activity: []
};

// Demo data for visualization
const demoData = {
    nodes: [
        { id: 'user-1', type: 'user', name: 'Alice', email: 'alice@example.com' },
        { id: 'user-2', type: 'user', name: 'Bob', email: 'bob@example.com' },
        { id: 'doc-1', type: 'document', title: 'Machine Learning Intro', chunks: 5 },
        { id: 'chunk-1', type: 'chunk', content: 'Machine learning is a subset...', embedding: true },
        { id: 'chunk-2', type: 'chunk', content: 'Deep learning uses neural...', embedding: true },
    ],
    edges: [
        { from: 'user-1', to: 'doc-1', type: 'authored' },
        { from: 'doc-1', to: 'chunk-1', type: 'contains' },
        { from: 'doc-1', to: 'chunk-2', type: 'contains' },
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initQueryEditor();
    refreshStatus();
    addActivity('Dashboard initialized');
});

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.dataset.view;

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding view
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById(viewId).classList.add('active');

            addActivity(`Navigated to ${viewId}`);
        });
    });
}

// Query Editor
function initQueryEditor() {
    const sqlInput = document.getElementById('sql-input');

    // Keyboard shortcuts
    sqlInput.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            executeQuery();
        }
    });
}

function setQuery(template) {
    const sqlInput = document.getElementById('sql-input');
    sqlInput.value = template;
    sqlInput.focus();
}

function clearQuery() {
    document.getElementById('sql-input').value = '';
}

async function executeQuery() {
    const sql = document.getElementById('sql-input').value.trim();
    if (!sql) return;

    addActivity(`Executed query: ${sql.substring(0, 50)}...`);

    // Simulate query execution
    const startTime = performance.now();

    // Demo results based on query
    let results = [];
    let columns = [];

    if (sql.toLowerCase().includes('select')) {
        if (sql.toLowerCase().includes('user')) {
            columns = ['id', 'type', 'name', 'email'];
            results = demoData.nodes
                .filter(n => n.type === 'user')
                .map(n => [n.id, n.type, n.name, n.email]);
        } else if (sql.toLowerCase().includes('chunk')) {
            columns = ['id', 'type', 'content', 'embedding'];
            results = demoData.nodes
                .filter(n => n.type === 'chunk')
                .map(n => [n.id, n.type, n.content, n.embedding ? '✓' : '']);
        } else {
            columns = ['id', 'type', 'data'];
            results = demoData.nodes.map(n => [n.id, n.type, JSON.stringify(n).substring(0, 50) + '...']);
        }
    } else if (sql.toLowerCase().includes('vector search')) {
        columns = ['id', 'score', 'content'];
        results = [
            ['chunk-1', '0.95', 'Machine learning is a subset...'],
            ['chunk-2', '0.87', 'Deep learning uses neural...'],
        ];
    }

    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    renderResults(columns, results, duration);

    state.queryHistory.push({ sql, timestamp: new Date() });
}

function renderResults(columns, rows, duration) {
    const container = document.getElementById('results-container');
    const meta = document.getElementById('results-meta');

    if (rows.length === 0) {
        container.innerHTML = `
            <div class="results-placeholder">
                <p>No results found</p>
            </div>
        `;
        meta.textContent = `0 rows (${duration}ms)`;
        return;
    }

    let html = '<table><thead><tr>';
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${escapeHtml(String(cell))}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';

    container.innerHTML = html;
    meta.textContent = `${rows.length} rows (${duration}ms)`;
}

// Status
function refreshStatus() {
    // Simulate fetching status
    state.database.nodeCount = demoData.nodes.length;
    state.database.edgeCount = demoData.edges.length;
    state.database.schemaCount = 3;
    state.database.vectorCount = demoData.nodes.filter(n => n.embedding).length;

    document.getElementById('node-count').textContent = state.database.nodeCount.toLocaleString();
    document.getElementById('edge-count').textContent = state.database.edgeCount.toLocaleString();
    document.getElementById('schema-count').textContent = state.database.schemaCount.toLocaleString();
    document.getElementById('vector-count').textContent = state.database.vectorCount.toLocaleString();

    addActivity('Refreshed database status');

    // Animate the numbers
    animateValue('node-count', 0, state.database.nodeCount);
    animateValue('edge-count', 0, state.database.edgeCount);
    animateValue('schema-count', 0, state.database.schemaCount);
    animateValue('vector-count', 0, state.database.vectorCount);
}

function animateValue(elementId, start, end, duration = 500) {
    const element = document.getElementById(elementId);
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = Math.floor(start + (end - start) * easeOutQuart(progress));
        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

// Vector Search
async function searchVectors() {
    const searchText = document.getElementById('vector-search-text').value;
    const nodeType = document.getElementById('vector-node-type').value;
    const metric = document.getElementById('vector-metric').value;
    const k = parseInt(document.getElementById('vector-k').value);

    if (!searchText) {
        alert('Please enter search text');
        return;
    }

    addActivity(`Vector search: "${searchText.substring(0, 30)}..."`);

    // Simulate vector search results
    const results = [
        { id: 'chunk-1', score: 0.95, content: 'Machine learning is a subset of artificial intelligence that enables computers to learn from data.' },
        { id: 'chunk-2', score: 0.87, content: 'Deep learning uses neural networks with multiple layers to process complex patterns.' },
        { id: 'chunk-3', score: 0.72, content: 'Natural language processing allows machines to understand human language.' },
    ].slice(0, k);

    const container = document.getElementById('vector-results');

    if (results.length === 0) {
        container.innerHTML = `
            <div class="results-placeholder">
                <p>No similar vectors found</p>
            </div>
        `;
        return;
    }

    let html = '';
    results.forEach((r, i) => {
        html += `
            <div class="vector-result-item" style="animation-delay: ${i * 0.1}s">
                <div class="vector-result-header">
                    <span class="vector-result-score">Score: ${r.score.toFixed(3)}</span>
                    <span class="vector-result-id">${r.id}</span>
                </div>
                <div class="vector-result-content">${escapeHtml(r.content)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// RAG
async function ingestDocument() {
    const content = document.getElementById('rag-document').value;
    const docId = document.getElementById('rag-doc-id').value;
    const chunkSize = parseInt(document.getElementById('rag-chunk-size').value);
    const overlap = parseInt(document.getElementById('rag-overlap').value);

    if (!content) {
        alert('Please enter document content');
        return;
    }

    addActivity(`Ingested document: ${docId}`);

    // Simulate chunking
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize - overlap) {
        chunks.push(content.substring(i, i + chunkSize));
    }

    // Update stats
    state.database.nodeCount += chunks.length;
    state.database.vectorCount += chunks.length;
    document.getElementById('node-count').textContent = state.database.nodeCount;
    document.getElementById('vector-count').textContent = state.database.vectorCount;

    // Show feedback
    const contextDiv = document.getElementById('rag-context');
    contextDiv.innerHTML = `
        <div class="context-chunk">
            <div class="context-chunk-header">
                ✓ Document ingested successfully
            </div>
            <div>Document ID: ${docId}</div>
            <div>Chunks created: ${chunks.length}</div>
            <div>Chunk size: ${chunkSize} chars</div>
            <div>Overlap: ${overlap} chars</div>
        </div>
    `;
}

async function retrieveContext() {
    const query = document.getElementById('rag-query').value;
    const maxTokens = parseInt(document.getElementById('rag-max-tokens').value);
    const minScore = parseFloat(document.getElementById('rag-min-score').value);

    if (!query) {
        alert('Please enter a query');
        return;
    }

    addActivity(`Context retrieval: "${query.substring(0, 30)}..."`);

    // Simulate context retrieval
    const chunks = [
        { score: 0.92, content: 'Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed. This technology has revolutionized many industries.' },
        { score: 0.85, content: 'Deep learning is a further subset of machine learning that uses neural networks with multiple layers. These networks can automatically discover representations from raw data.' },
        { score: 0.78, content: 'Applications of machine learning include image recognition, natural language processing, and autonomous vehicles. These technologies continue to advance rapidly.' },
    ].filter(c => c.score >= minScore);

    const contextDiv = document.getElementById('rag-context');

    if (chunks.length === 0) {
        contextDiv.innerHTML = `
            <div class="results-placeholder">
                <p>No relevant context found (min score: ${minScore})</p>
            </div>
        `;
        return;
    }

    let html = '';
    chunks.forEach((chunk, i) => {
        html += `
            <div class="context-chunk">
                <div class="context-chunk-header">
                    [Source ${i + 1}] <span class="context-chunk-score">Relevance: ${(chunk.score * 100).toFixed(0)}%</span>
                </div>
                ${escapeHtml(chunk.content)}
            </div>
        `;
    });

    // Add LLM prompt suggestion
    html += `
        <div style="margin-top: 20px; padding: 16px; background: var(--bg-tertiary); border-radius: 10px; border: 1px dashed var(--border-color);">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">💡 SUGGESTED LLM PROMPT</div>
            <div style="font-family: var(--font-mono); font-size: 12px;">
                Based on the following context, answer the question: "${escapeHtml(query)}"
                <br><br>
                Context: [${chunks.length} relevant chunks retrieved]
            </div>
        </div>
    `;

    contextDiv.innerHTML = html;
}

function copyContext() {
    const contextDiv = document.getElementById('rag-context');
    navigator.clipboard.writeText(contextDiv.innerText);
    addActivity('Copied context to clipboard');
}

// Graph Visualization
function visualizeGraph() {
    const startNode = document.getElementById('graph-start-node').value;
    const depth = parseInt(document.getElementById('graph-depth').value);

    if (!startNode) {
        alert('Please enter a starting node ID');
        return;
    }

    addActivity(`Graph visualization from: ${startNode}`);

    const canvas = document.getElementById('graph-canvas');

    // Simple SVG visualization
    const nodes = [
        { id: startNode, x: 300, y: 200, label: startNode },
        { id: 'connected-1', x: 150, y: 100, label: 'Node A' },
        { id: 'connected-2', x: 450, y: 100, label: 'Node B' },
        { id: 'connected-3', x: 150, y: 300, label: 'Node C' },
        { id: 'connected-4', x: 450, y: 300, label: 'Node D' },
    ];

    const edges = [
        { from: startNode, to: 'connected-1' },
        { from: startNode, to: 'connected-2' },
        { from: startNode, to: 'connected-3' },
        { from: startNode, to: 'connected-4' },
        { from: 'connected-1', to: 'connected-2' },
    ];

    let svg = `
        <svg width="100%" height="100%" viewBox="0 0 600 400" style="max-height: 500px;">
            <defs>
                <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#6366f1"/>
                    <stop offset="100%" style="stop-color:#8b5cf6"/>
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
    `;

    // Draw edges
    edges.forEach(edge => {
        const from = nodes.find(n => n.id === edge.from);
        const to = nodes.find(n => n.id === edge.to);
        if (from && to) {
            svg += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                    stroke="#3a3a4a" stroke-width="2" opacity="0.6"/>`;
        }
    });

    // Draw nodes
    nodes.forEach((node, i) => {
        const isCenter = node.id === startNode;
        const r = isCenter ? 35 : 25;
        const fill = isCenter ? 'url(#nodeGradient)' : '#2a2a3a';
        const filter = isCenter ? 'filter="url(#glow)"' : '';

        svg += `
            <g transform="translate(${node.x}, ${node.y})" style="animation: nodeIn 0.5s ease ${i * 0.1}s both;">
                <circle r="${r}" fill="${fill}" ${filter} stroke="#4a4a5a" stroke-width="2"/>
                <text y="5" text-anchor="middle" fill="#f0f0f5" font-size="11" font-family="var(--font-mono)">
                    ${node.label.substring(0, 8)}
                </text>
            </g>
        `;
    });

    svg += `
        <style>
            @keyframes nodeIn {
                from { opacity: 0; transform: scale(0); }
                to { opacity: 1; transform: scale(1); }
            }
        </style>
    </svg>`;

    canvas.innerHTML = svg;
}

// Benchmarks
async function runBenchmarks() {
    addActivity('Running benchmarks...');

    const benchmarks = {
        insert: { value: 0, target: 312 },
        query: { value: 0, target: 0.05 },
        vector: { value: 0, target: 2.3 },
        traverse: { value: 0, target: 0.8 }
    };

    // Animate benchmark results
    for (const [key, bench] of Object.entries(benchmarks)) {
        await animateBenchmark(`bench-${key}`, bench.target);
    }

    // Animate comparison bar
    document.getElementById('bar-insert-aresadb').style.width = '75%';

    addActivity('Benchmarks completed');
}

function animateBenchmark(elementId, target) {
    return new Promise(resolve => {
        const element = document.getElementById(elementId);
        const duration = 1000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = target * easeOutQuart(progress);
            element.textContent = current < 1 ? current.toFixed(2) : Math.floor(current).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(update);
    });
}

// Activity Log
function addActivity(text) {
    const list = document.getElementById('activity-list');
    const time = new Date().toLocaleTimeString();

    state.activity.unshift({ time, text });
    if (state.activity.length > 10) state.activity.pop();

    list.innerHTML = state.activity.map(a => `
        <div class="activity-item">
            <span class="activity-time">${a.time}</span>
            <span class="activity-text">${a.text}</span>
        </div>
    `).join('');
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Type Distribution Chart (simplified)
function drawTypeChart() {
    const canvas = document.getElementById('typeDistributionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = [
        { label: 'Users', value: 2, color: '#6366f1' },
        { label: 'Documents', value: 1, color: '#8b5cf6' },
        { label: 'Chunks', value: 2, color: '#10b981' },
    ];

    // Simple bar chart
    const width = canvas.width = 300;
    const height = canvas.height = 150;
    const barWidth = 60;
    const gap = 30;
    const maxValue = Math.max(...data.map(d => d.value));

    ctx.clearRect(0, 0, width, height);

    data.forEach((d, i) => {
        const x = 30 + i * (barWidth + gap);
        const barHeight = (d.value / maxValue) * 100;
        const y = height - 30 - barHeight;

        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#9090a0';
        ctx.font = '11px Plus Jakarta Sans';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barWidth / 2, height - 10);
        ctx.fillText(d.value, x + barWidth / 2, y - 5);
    });
}

// Initialize chart on load
setTimeout(drawTypeChart, 100);

