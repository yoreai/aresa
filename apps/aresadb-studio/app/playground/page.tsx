'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Beaker,
  Upload,
  FileJson,
  FileSpreadsheet,
  Database,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trash2,
  RefreshCw,
  Download,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const supportedFormats = [
  { ext: 'CSV', icon: FileSpreadsheet, color: 'text-emerald-500', desc: 'Comma-separated values' },
  { ext: 'JSON', icon: FileJson, color: 'text-amber-500', desc: 'JavaScript Object Notation' },
  { ext: 'JSONL', icon: FileJson, color: 'text-orange-500', desc: 'JSON Lines format' },
  { ext: 'Parquet', icon: Database, color: 'text-purple-500', desc: 'Columnar storage format' },
]

const recentImports = [
  { name: 'drug_reviews.csv', rows: 215063, columns: 7, time: '2.3s', status: 'success' as const },
  { name: 'medical_transcriptions.json', rows: 4999, columns: 5, time: '0.8s', status: 'success' as const },
  { name: 'heart_disease.csv', rows: 303, columns: 14, time: '0.1s', status: 'success' as const },
  { name: 'pubmed_abstracts.jsonl', rows: 67238, columns: 6, time: '4.1s', status: 'success' as const },
]

const experimentOptions = [
  {
    title: 'Schema Explorer',
    description: 'Visualize and explore your database schema',
    icon: Eye,
    href: '#schema',
  },
  {
    title: 'Data Migration',
    description: 'Migrate data between tables or databases',
    icon: ArrowRight,
    href: '#migrate',
  },
  {
    title: 'Backup & Export',
    description: 'Export your data to various formats',
    icon: Download,
    href: '#export',
  },
  {
    title: 'Clear Database',
    description: 'Remove all data (use with caution)',
    icon: Trash2,
    href: '#clear',
  },
]

export default function PlaygroundPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await simulateUpload()
    }
  }

  const simulateUpload = async () => {
    setUploadStatus('uploading')
    setUploadProgress(0)

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(i)
    }

    setUploadStatus('processing')
    await new Promise(resolve => setTimeout(resolve, 1500))

    setUploadStatus('success')
    setUploadProgress(null)

    // Reset after 3 seconds
    setTimeout(() => {
      setUploadStatus('idle')
    }, 3000)
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
              <Beaker className="w-8 h-8 text-purple-500" />
              Data Playground
            </h1>
            <p className="text-muted-foreground mt-1">
              Import data, experiment with queries, and explore your datasets
            </p>
          </motion.div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 bg-card',
              uploadStatus === 'success' && 'border-emerald-500 bg-emerald-500/5'
            )}
          >
            {uploadStatus === 'idle' && (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop files to import</h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse your files
                </p>
                <div className="flex items-center justify-center gap-4">
                  {supportedFormats.map((format) => (
                    <div
                      key={format.ext}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50"
                    >
                      <format.icon className={cn('w-4 h-4', format.color)} />
                      <span className="text-sm font-medium">{format.ext}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {uploadStatus === 'uploading' && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                <h3 className="text-xl font-semibold">Uploading...</h3>
                <div className="max-w-xs mx-auto">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
                </div>
              </div>
            )}

            {uploadStatus === 'processing' && (
              <div className="space-y-4">
                <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
                <h3 className="text-xl font-semibold">Processing data...</h3>
                <p className="text-muted-foreground">
                  Creating nodes, edges, and indexes
                </p>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-semibold text-emerald-500">Import successful!</h3>
                <p className="text-muted-foreground">
                  Your data is now ready to query
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Imports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Recent Imports</h3>
          <div className="space-y-3">
            {recentImports.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.rows.toLocaleString()} rows • {item.columns} columns
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{item.time}</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" />
                    Imported
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Experiment Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">Data Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {experimentOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <button
                  className={cn(
                    'w-full text-left p-6 rounded-2xl border transition-all',
                    option.title === 'Clear Database'
                      ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                >
                  <option.icon className={cn(
                    'w-8 h-8 mb-3',
                    option.title === 'Clear Database' ? 'text-red-500' : 'text-muted-foreground'
                  )} />
                  <h4 className="font-semibold mb-1">{option.title}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Schema Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Database Schema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { table: 'drug_reviews', nodes: 215063, fields: ['drug_name', 'condition', 'review', 'rating', 'date', 'useful_count', 'side_effects'] },
              { table: 'medical_transcriptions', nodes: 4999, fields: ['transcription_id', 'medical_specialty', 'description', 'transcription', 'keywords'] },
              { table: 'heart_disease', nodes: 303, fields: ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'target'] },
              { table: 'pubmed_abstracts', nodes: 67238, fields: ['pmid', 'title', 'abstract', 'authors', 'journal', 'pub_date'] },
            ].map((schema) => (
              <div
                key={schema.table}
                className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{schema.table}</h4>
                  <span className="text-xs text-muted-foreground">
                    {schema.nodes.toLocaleString()} nodes
                  </span>
                </div>
                <div className="space-y-1">
                  {schema.fields.slice(0, 4).map((field) => (
                    <div key={field} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                      <span className="text-xs font-mono text-muted-foreground">{field}</span>
                    </div>
                  ))}
                  {schema.fields.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{schema.fields.length - 4} more fields
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

