'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  FileText,
  Bot,
  User,
  Sparkles,
  Database,
  ChevronDown,
  Info,
  Copy,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: {
    title: string
    snippet: string
    similarity: number
  }[]
  timestamp: Date
}

const sampleQuestions = [
  "What are the latest treatment guidelines for heart failure with preserved ejection fraction?",
  "Summarize the key side effects of Metformin for Type 2 Diabetes",
  "What diagnostic criteria are used for hypertension in clinical practice?",
  "Explain the mechanism of action of ACE inhibitors in cardiovascular disease",
]

export default function RAGPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate RAG response
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateMockResponse(query),
      sources: [
        {
          title: 'ACC/AHA Heart Failure Guidelines 2022',
          snippet: 'Heart failure with preserved ejection fraction (HFpEF) is characterized by symptoms and signs of heart failure with LVEF ≥50%...',
          similarity: 0.94,
        },
        {
          title: 'Clinical Management of Cardiomyopathy',
          snippet: 'Treatment strategies for diastolic dysfunction include blood pressure control, volume management, and treatment of underlying conditions...',
          similarity: 0.89,
        },
        {
          title: 'Drug Review: Cardiovascular Medications',
          snippet: 'SGLT2 inhibitors have shown promising results in HFpEF patients, reducing hospitalization rates and improving quality of life...',
          similarity: 0.85,
        },
      ],
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const generateMockResponse = (query: string): string => {
    if (query.toLowerCase().includes('heart failure')) {
      return `Based on the medical literature in our database, here's a comprehensive summary of **Heart Failure with Preserved Ejection Fraction (HFpEF)**:

## Definition
HFpEF is diagnosed when patients present with:
- Signs and symptoms of heart failure
- Left ventricular ejection fraction (LVEF) ≥50%
- Evidence of diastolic dysfunction or elevated filling pressures

## Treatment Guidelines (2022 Update)

### First-Line Therapies
1. **Diuretics** - For volume management and symptom relief
2. **SGLT2 Inhibitors** - Empagliflozin and Dapagliflozin have shown mortality benefits
3. **Blood pressure control** - Target <130/80 mmHg

### Additional Considerations
- **MRA (Spironolactone)** - May reduce hospitalizations
- **Exercise training** - Improves functional capacity
- **Treat underlying conditions** - Obesity, AF, diabetes

### Key Statistics from Database
- 287 relevant clinical transcriptions
- Average treatment efficacy: 73% symptom improvement
- 45 clinical trials referenced

*Sources retrieved from medical transcriptions and PubMed abstracts with >85% semantic similarity.*`
    }

    return `Based on the retrieved context from our medical database:

## Summary

Your query has been analyzed against **${Math.floor(Math.random() * 500 + 200)}** relevant documents in our healthcare knowledge base.

### Key Findings
1. Multiple sources confirm the relevance of this topic to clinical practice
2. Evidence-based guidelines support current treatment approaches
3. Recent studies show promising developments in this area

### Retrieved Context Quality
- **High confidence** sources: 3 documents
- **Medium confidence** sources: 7 documents
- Average semantic similarity: **87.3%**

*This response was generated using RAG (Retrieval-Augmented Generation) from AresaDB's medical knowledge base.*`
  }

  return (
    <div className="min-h-screen gradient-mesh noise flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/50 glass sticky top-0 z-10">
        <div className="px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-emerald-500" />
                RAG Pipeline
              </h1>
              <p className="text-muted-foreground mt-1">
                Query medical documents with AI-powered retrieval augmented generation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Dataset:</span>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="bg-secondary px-4 py-2 rounded-xl text-sm outline-none"
              >
                <option value="all">All Datasets</option>
                <option value="medical_transcriptions">Medical Transcriptions</option>
                <option value="pubmed_abstracts">PubMed Abstracts</option>
                <option value="drug_reviews">Drug Reviews</option>
              </select>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 mb-6">
                <Sparkles className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Medical Knowledge Assistant</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Ask questions about medical conditions, treatments, and research.
                Responses are grounded in our curated healthcare knowledge base.
              </p>

              {/* Sample Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(question)}
                    className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-secondary/50 transition-all text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'flex gap-4',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-500" />
                  </div>
                )}

                <div className={cn(
                  'max-w-2xl rounded-2xl p-6',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                )}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/## (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                          .replace(/### (.*)/g, '<h4 class="font-medium mt-3 mb-1">$1</h4>')
                          .replace(/^\d\. /gm, '<span class="text-primary">•</span> ')
                          .replace(/\n/g, '<br/>')
                      }} />
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}

                  {/* Sources */}
                  {message.sources && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        Retrieved from {message.sources.length} sources
                      </p>
                      <div className="space-y-2">
                        {message.sources.map((source, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg bg-secondary/50 text-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs">{source.title}</span>
                              <span className="text-xs text-emerald-500 font-mono">
                                {(source.similarity * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {source.snippet}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Retrieving context and generating response...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/50 glass p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(input)}
                placeholder="Ask a question about medical conditions, treatments, or research..."
                className="w-full px-6 py-4 bg-card border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all pr-12"
                disabled={isLoading}
              />
              <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            <button
              onClick={() => handleSubmit(input)}
              disabled={isLoading || !input.trim()}
              className="px-6 py-4 rounded-2xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Responses are generated using RAG from AresaDB's medical knowledge base.
            Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}

