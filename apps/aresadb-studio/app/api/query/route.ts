import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Path to AresaDB CLI - adjust based on your setup
const ARESADB_PATH = process.env.ARESADB_PATH || '../../../tools/aresadb/target/release/aresadb'
const DB_PATH = process.env.ARESADB_DB_PATH || '/tmp/aresadb-studio-demo'

export async function POST(request: NextRequest) {
  try {
    const { query, format = 'json' } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const startTime = performance.now()

    // Execute query via AresaDB CLI
    const cmd = `${ARESADB_PATH} --db ${DB_PATH} query "${query.replace(/"/g, '\\"')}" --format ${format}`

    try {
      const { stdout, stderr } = await execAsync(cmd, {
        timeout: 30000, // 30 second timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Parse results
      let results
      if (format === 'json') {
        try {
          results = JSON.parse(stdout)
        } catch {
          results = stdout
        }
      } else {
        results = stdout
      }

      return NextResponse.json({
        success: true,
        results,
        executionTime,
        rowCount: Array.isArray(results) ? results.length : 1,
      })
    } catch (execError: any) {
      // AresaDB command failed
      return NextResponse.json({
        success: false,
        error: execError.stderr || execError.message,
        executionTime: performance.now() - startTime,
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Query API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    const cmd = `${ARESADB_PATH} --db ${DB_PATH} status`
    const { stdout } = await execAsync(cmd, { timeout: 5000 })

    return NextResponse.json({
      status: 'connected',
      database: DB_PATH,
      info: stdout.trim(),
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'disconnected',
      error: error.message,
    }, { status: 503 })
  }
}

