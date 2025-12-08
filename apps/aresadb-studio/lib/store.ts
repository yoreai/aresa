import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface QueryHistoryItem {
  id: string
  query: string
  type: 'sql' | 'vector' | 'graph'
  timestamp: Date
  executionTime: number
  rowCount: number
  status: 'success' | 'error'
  error?: string
}

interface DatabaseConnection {
  name: string
  path: string
  status: 'connected' | 'disconnected' | 'connecting'
  nodeCount: number
  edgeCount: number
}

interface AppState {
  // Query history
  queryHistory: QueryHistoryItem[]
  addQuery: (query: Omit<QueryHistoryItem, 'id' | 'timestamp'>) => void
  clearHistory: () => void

  // Database connection
  connection: DatabaseConnection | null
  setConnection: (connection: DatabaseConnection | null) => void

  // UI preferences
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void

  // Query editor settings
  editorFontSize: number
  setEditorFontSize: (size: number) => void

  // Selected dataset
  selectedDataset: string
  setSelectedDataset: (dataset: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Query history
      queryHistory: [],
      addQuery: (query) =>
        set((state) => ({
          queryHistory: [
            {
              ...query,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
            ...state.queryHistory.slice(0, 99), // Keep last 100 queries
          ],
        })),
      clearHistory: () => set({ queryHistory: [] }),

      // Database connection
      connection: {
        name: 'demo_database',
        path: '/tmp/aresadb-studio-demo',
        status: 'connected',
        nodeCount: 287493,
        edgeCount: 1200000,
      },
      setConnection: (connection) => set({ connection }),

      // UI preferences
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Query editor settings
      editorFontSize: 14,
      setEditorFontSize: (size) => set({ editorFontSize: size }),

      // Selected dataset
      selectedDataset: 'drug_reviews',
      setSelectedDataset: (dataset) => set({ selectedDataset: dataset }),
    }),
    {
      name: 'aresadb-studio-storage',
      partialize: (state) => ({
        theme: state.theme,
        editorFontSize: state.editorFontSize,
        selectedDataset: state.selectedDataset,
      }),
    }
  )
)

