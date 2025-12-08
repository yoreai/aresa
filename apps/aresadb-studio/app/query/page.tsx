'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  History,
  Save,
  Download,
  Copy,
  Clock,
  Database,
  CheckCircle2,
  XCircle,
  Table,
  Braces,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample data for healthcare demo
const sampleQueries = [
  {
    name: 'Top Rated Drugs for Diabetes',
    query: `SELECT drug_name, condition, AVG(rating) as avg_rating, COUNT(*) as review_count
FROM drug_reviews
WHERE condition LIKE '%Diabetes%'
GROUP BY drug_name, condition
ORDER BY avg_rating DESC, review_count DESC
LIMIT 20`,
  },
  {
    name: 'Heart Disease Risk Factors',
    query: `SELECT age, sex, cp as chest_pain_type, trestbps as resting_bp,
       chol as cholesterol, fbs as fasting_blood_sugar, target as has_disease
FROM heart_disease
WHERE target = 1
ORDER BY age DESC
LIMIT 50`,
  },
  {
    name: 'Medical Transcription Search',
    query: `SELECT transcription_id, medical_specialty, description
FROM medical_transcriptions
WHERE medical_specialty = 'Cardiology'
LIMIT 25`,
  },
  {
    name: 'Drug Side Effects Analysis',
    query: `SELECT drug_name, side_effects, COUNT(*) as mentions
FROM drug_reviews
WHERE side_effects IS NOT NULL
GROUP BY drug_name, side_effects
ORDER BY mentions DESC
LIMIT 15`,
  },
]

// Mock results
const mockResults = [
  { drug_name: 'Metformin', condition: 'Type 2 Diabetes', avg_rating: 4.7, review_count: 12453 },
  { drug_name: 'Lantus', condition: 'Type 1 Diabetes', avg_rating: 4.5, review_count: 8921 },
  { drug_name: 'Januvia', condition: 'Type 2 Diabetes', avg_rating: 4.3, review_count: 6734 },
  { drug_name: 'Trulicity', condition: 'Type 2 Diabetes', avg_rating: 4.2, review_count: 5621 },
  { drug_name: 'Ozempic', condition: 'Type 2 Diabetes', avg_rating: 4.6, review_count: 9823 },
  { drug_name: 'Victoza', condition: 'Type 2 Diabetes', avg_rating: 4.1, review_count: 4532 },
  { drug_name: 'Invokana', condition: 'Type 2 Diabetes', avg_rating: 3.9, review_count: 3241 },
  { drug_name: 'Farxiga', condition: 'Type 2 Diabetes', avg_rating: 4.0, review_count: 2987 },
]

export default function QueryPage() {
  const [query, setQuery] = useState(sampleQueries[0].query)
  const [isExecuting, setIsExecuting] = useState(false)
  const [results, setResults] = useState<typeof mockResults | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const executeQuery = async () => {
    setIsExecuting(true)
    setResults(null)

    // Simulate query execution
    const startTime = performance.now()
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200))
    const endTime = performance.now()

    setExecutionTime(endTime - startTime)
    setResults(mockResults)
    setIsExecuting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      executeQuery()
    }
  }

  return (
    <div className="min-h-screen gradient-mesh noise">
      {/* Header */}
      <header className="border-b border-border bg-background/50 glass sticky top-0 z-10">
        <div className="px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold">SQL Query Editor</h1>
            <p className="text-muted-foreground mt-1">
              Execute SQL queries against healthcare ML datasets
            </p>
          </motion.div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sample Queries Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                Sample Queries
              </h3>
              <div className="space-y-2">
                {sampleQueries.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(sample.query)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl text-sm transition-all',
                      query === sample.query
                        ? 'bg-primary/20 text-primary border border-primary/50'
                        : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Editor */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <select className="bg-transparent text-sm font-medium outline-none cursor-pointer">
                    <option>drug_reviews</option>
                    <option>medical_transcriptions</option>
                    <option>heart_disease</option>
                    <option>pubmed_abstracts</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <Save className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={executeQuery}
                    disabled={isExecuting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {isExecuting ? 'Running...' : 'Run Query'}
                    <span className="text-xs opacity-70">⌘↵</span>
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-64 p-4 bg-transparent font-mono text-sm resize-none outline-none code-editor"
                  placeholder="Enter your SQL query..."
                  spellCheck={false}
                />
                {/* Line numbers overlay */}
                <div className="absolute left-0 top-0 p-4 font-mono text-sm text-muted-foreground/30 pointer-events-none select-none">
                  {query.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            {(results || isExecuting) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                {/* Results Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-4">
                    {results ? (
                      <>
                        <span className="flex items-center gap-2 text-emerald-500 text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          Query successful
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {results.length} rows
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {executionTime?.toFixed(2)}ms
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Executing...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-secondary rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('table')}
                        className={cn(
                          'px-3 py-1 rounded-md text-sm transition-colors',
                          viewMode === 'table' ? 'bg-background text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        <Table className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('json')}
                        className={cn(
                          'px-3 py-1 rounded-md text-sm transition-colors',
                          viewMode === 'json' ? 'bg-background text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        <Braces className="w-4 h-4" />
                      </button>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Results Content */}
                <div className="max-h-96 overflow-auto">
                  {isExecuting ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : viewMode === 'table' ? (
                    <table className="result-table">
                      <thead>
                        <tr>
                          {results && Object.keys(results[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results?.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((value, j) => (
                              <td key={j}>
                                {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <pre className="p-4 font-mono text-sm overflow-auto">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

