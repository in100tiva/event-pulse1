import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createServer } from 'http'

// Import middleware
import { loggerMiddleware } from './middleware/logger.js'
import { errorHandler } from './middleware/error.js'

// Import routes
import users from './routes/users.js'
import organizations from './routes/organizations.js'
import events from './routes/events.js'
import attendance from './routes/attendance.js'
import suggestions from './routes/suggestions.js'
import polls from './routes/polls.js'
import waitlist from './routes/waitlist.js'

// Import WebSocket
import { initWebSocket, getTotalClients, getRoomStats } from './websocket/server.js'

// Load environment variables
import 'dotenv/config'

const app = new Hono()

// CORS configuration - multiple origins support
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://pulse.in100tiva.com',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use('/*', cors({
  origin: (origin) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return '*'
    // Check if origin matches allowed list
    if (allowedOrigins.includes(origin)) return origin
    // Allow Vercel preview URLs
    if (origin.endsWith('.vercel.app')) return origin
    // Reject unknown origins
    return null
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Clerk-User-Id', 'X-User-Id', 'X-User-Email', 'X-User-FirstName', 'X-User-LastName'],
  exposeHeaders: ['Content-Length'],
  credentials: true,
  maxAge: 86400,
}))

// Logger middleware
app.use('/*', loggerMiddleware)

// Error handler
app.onError(errorHandler)

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    websocket: {
      clients: getTotalClients(),
      rooms: getRoomStats(),
    },
  })
})

// API routes
app.route('/api/users', users)
app.route('/api/organizations', organizations)
app.route('/api/events', events)
app.route('/api', attendance)
app.route('/api', suggestions)
app.route('/api', polls)
app.route('/api', waitlist)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Rota não encontrada' }, 404)
})

// Start server
const port = parseInt(process.env.PORT || '3001')

// Create HTTP server for WebSocket support
const server = createServer(async (req, res) => {
  // Handle Hono requests
  const response = await app.fetch(
    new Request(`http://localhost:${port}${req.url}`, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = []
            req.on('data', (chunk) => chunks.push(chunk))
            req.on('end', () => resolve(Buffer.concat(chunks)))
          })
        : undefined,
    })
  )

  // Write response
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  
  const body = await response.arrayBuffer()
  res.end(Buffer.from(body))
})

// Initialize WebSocket
initWebSocket(server)

// Start listening
server.listen(port, () => {
  console.log(`
🚀 EventPulse API Server
========================
HTTP:      http://localhost:${port}
WebSocket: ws://localhost:${port}/ws
Health:    http://localhost:${port}/health

Environment: ${process.env.NODE_ENV || 'development'}
`)
})

export default app
