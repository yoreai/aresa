import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const ARESADB_PATH = process.env.ARESADB_PATH || '../../../tools/aresadb/target/release/aresadb'
const DB_PATH = process.env.ARESADB_DB_PATH || '/tmp/aresadb-studio-demo'

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      table = 'medical_transcriptions',
      topK = 10,
      metric = 'cosine'
    } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const startTime = performance.now()

    // Execute vector search via AresaDB CLI
    const cmd = `${ARESADB_PATH} --db ${DB_PATH} search "${query.replace(/"/g, '\\"')}" --table ${table} --top-k ${topK} --metric ${metric} --format json`

    try {
      const { stdout, stderr } = await execAsync(cmd, {
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024,
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      let results
      try {
        results = JSON.parse(stdout)
      } catch {
        results = []
      }

      return NextResponse.json({
        success: true,
        results,
        executionTime,
        count: results.length,
        query,
        metric,
      })
    } catch (execError: any) {
      return NextResponse.json({
        success: false,
        error: execError.stderr || execError.message,
        executionTime: performance.now() - startTime,
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Vector search API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

