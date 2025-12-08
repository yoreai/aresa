'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Sparkles,
  Sliders,
  Clock,
  FileText,
  Star,
  ArrowUpRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample medical vector search results
const mockVectorResults = [
  {
    id: 'med_001',
    title: 'Cardiac Rehabilitation Post-MI',
    content: 'Comprehensive cardiac rehabilitation program following acute myocardial infarction. Patient demonstrated significant improvement in exercise tolerance and ejection fraction over 12-week supervised program...',
    similarity: 0.94,
    specialty: 'Cardiology',
    source: 'Medical Transcriptions',
  },
  {
    id: 'med_002',
    title: 'Heart Failure Management Protocol',
    content: 'Evidence-based management of heart failure with reduced ejection fraction (HFrEF). Treatment includes ACE inhibitors, beta-blockers, and aldosterone antagonists with careful fluid management...',
    similarity: 0.91,
    specialty: 'Cardiology',
    source: 'PubMed Abstracts',
  },
  {
    id: 'med_003',
    title: 'Arrhythmia Detection and Treatment',
    content: 'Diagnosis and management of atrial fibrillation in elderly patients. Rhythm control versus rate control strategies, anticoagulation considerations, and catheter ablation outcomes...',
    similarity: 0.88,
    specialty: 'Cardiology',
    source: 'Medical Transcriptions',
  },
  {
    id: 'med_004',
    title: 'Coronary Artery Disease Screening',
    content: 'Non-invasive screening methods for coronary artery disease. Comparison of stress testing, CT angiography, and calcium scoring in asymptomatic high-risk populations...',
    similarity: 0.85,
    specialty: 'Cardiology',
    source: 'PubMed Abstracts',
  },
  {
    id: 'med_005',
    title: 'Hypertension Control Guidelines',
    content: 'Updated guidelines for blood pressure management. Target goals for patients with diabetes, CKD, and cardiovascular disease. First-line medication selection...',
    similarity: 0.82,
    specialty: 'Internal Medicine',
    source: 'Medical Transcriptions',
  },
]

const distanceMetrics = [
  { value: 'cosine', label: 'Cosine Similarity' },
  { value: 'euclidean', label: 'Euclidean Distance' },
  { value: 'dot', label: 'Dot Product' },
]

export default function VectorsPage() {
  const [searchQuery, setSearchQuery] = useState('cardiac treatment outcomes and patient recovery')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<typeof mockVectorResults | null>(null)
  const [searchTime, setSearchTime] = useState<number | null>(null)
  const [topK, setTopK] = useState(10)
  const [metric, setMetric] = useState('cosine')

  const handleSearch = async () => {
    setIsSearching(true)
    setResults(null)

    const startTime = performance.now()
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
    const endTime = performance.now()

    setSearchTime(endTime - startTime)
    setResults(mockVectorResults)
    setIsSearching(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
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
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent" />
              Vector Search
            </h1>
            <p className="text-muted-foreground mt-1">
              Semantic similarity search across medical documents and research papers
            </p>
          </motion.div>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto">
        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you're looking for in natural language..."
              className="w-full pl-12 pr-4 py-4 bg-secondary/50 rounded-xl text-lg outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Search Options */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Results:</label>
                <select
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="bg-secondary px-3 py-1.5 rounded-lg text-sm outline-none"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Metric:</label>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="bg-secondary px-3 py-1.5 rounded-lg text-sm outline-none"
                >
                  {distanceMetrics.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Search Vectors
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold">
                  {results.length} results
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {searchTime?.toFixed(2)}ms
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Sorted by similarity score
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {result.title}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {result.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="px-2.5 py-1 bg-secondary rounded-lg text-xs font-medium">
                          {result.specialty}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="w-3 h-3" />
                          {result.source}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-mono font-bold text-lg">
                          {(result.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        similarity
                      </span>
                    </div>
                  </div>

                  {/* Similarity Bar */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.similarity * 100}%` }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                        className="h-full gradient-primary rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!results && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Semantic Vector Search</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a natural language query to find semantically similar medical documents,
              research papers, and clinical notes across your datasets.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

