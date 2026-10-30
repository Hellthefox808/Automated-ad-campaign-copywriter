import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'node:path'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { getDatabase, closeDatabase } from './data/database.js'
import { seedDatabase } from './data/seedData.js'
import { Repository } from './data/repository.js'
import { createRouter } from './presentation/routes.js'
import { createRateLimiter } from './presentation/rateLimiter.js'
import { globalMetrics } from './service/metricsService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000
const app = express()

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/styles for single-page app
}))

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role', 'x-request-id']
}))

// Request Correlation ID and Metrics Tracing
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID()
  req.id = requestId
  res.setHeader('X-Request-Id', requestId)

  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    globalMetrics.recordRequest(req.method, req.baseUrl + req.path, res.statusCode, duration)
  })

  next()
})

app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

// In-Memory Rate Limiting
app.use('/api', createRateLimiter({ windowMs: 60000, maxRequests: 240 }))

// Database & Repository Initialization
const db = getDatabase()
seedDatabase(db)
const repository = new Repository(db)

// Mount API routes
app.use('/api', createRouter(repository))

// Serve Static Frontend if built
const frontendDist = path.resolve(__dirname, '../../frontend/dist')
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

// 404 Handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` })
})

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Internal Server Error]', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    requestId: req.id
  })
})

let serverInstance = null

export function startServer (port = PORT) {
  return new Promise((resolve) => {
    serverInstance = app.listen(port, () => {
      console.log(`🚀 AdCopyCraft AI Engine listening at http://localhost:${port}`)
      resolve(serverInstance)
    })
  })
}

export function stopServer () {
  return new Promise((resolve) => {
    if (serverInstance) {
      serverInstance.close(() => {
        closeDatabase()
        resolve()
      })
    } else {
      closeDatabase()
      resolve()
    }
  })
}

// Automatically start if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer()
}

export default app

