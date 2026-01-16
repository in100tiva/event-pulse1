import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'

// Room management - Map of eventId to Set of WebSockets
const rooms = new Map<string, Set<WebSocket>>()

// WebSocket server instance
let wss: WebSocketServer | null = null

// Initialize WebSocket server
export function initWebSocket(server: any) {
  wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('[WS] New connection')

    // Heartbeat
    let isAlive = true
    ws.on('pong', () => {
      isAlive = true
    })

    const heartbeat = setInterval(() => {
      if (!isAlive) {
        console.log('[WS] Connection dead, terminating')
        return ws.terminate()
      }
      isAlive = false
      ws.ping()
    }, 30000)

    // Handle messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())
        handleMessage(ws, message)
      } catch (err) {
        console.error('[WS] Error parsing message:', err)
      }
    })

    // Handle close
    ws.on('close', () => {
      clearInterval(heartbeat)
      // Remove from all rooms
      for (const [eventId, clients] of rooms.entries()) {
        if (clients.has(ws)) {
          clients.delete(ws)
          console.log(`[WS] Client left room: ${eventId}`)
          if (clients.size === 0) {
            rooms.delete(eventId)
          }
        }
      }
    })

    // Handle errors
    ws.on('error', (err) => {
      console.error('[WS] Error:', err)
    })

    // Send welcome message
    ws.send(JSON.stringify({ event: 'connected', data: { message: 'Connected to EventPulse' } }))
  })

  console.log('[WS] WebSocket server initialized')
}

// Handle incoming messages
function handleMessage(ws: WebSocket, message: { event: string; data: any }) {
  const { event, data } = message

  switch (event) {
    case 'join:event':
      joinRoom(ws, data.eventId)
      break
    case 'leave:event':
      leaveRoom(ws, data.eventId)
      break
    default:
      console.log('[WS] Unknown event:', event)
  }
}

// Join a room
function joinRoom(ws: WebSocket, eventId: string) {
  if (!rooms.has(eventId)) {
    rooms.set(eventId, new Set())
  }
  rooms.get(eventId)!.add(ws)
  console.log(`[WS] Client joined room: ${eventId} (${rooms.get(eventId)!.size} clients)`)
  
  ws.send(JSON.stringify({ 
    event: 'room:joined', 
    data: { eventId, clients: rooms.get(eventId)!.size } 
  }))
}

// Leave a room
function leaveRoom(ws: WebSocket, eventId: string) {
  const room = rooms.get(eventId)
  if (room) {
    room.delete(ws)
    console.log(`[WS] Client left room: ${eventId} (${room.size} clients)`)
    if (room.size === 0) {
      rooms.delete(eventId)
    }
  }
}

// Broadcast to a room
export function broadcast(eventId: string, event: string, data: any) {
  const room = rooms.get(eventId)
  if (!room) {
    return
  }

  const message = JSON.stringify({ event, data })
  let sent = 0

  room.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message)
      sent++
    }
  })

  console.log(`[WS] Broadcast ${event} to room ${eventId}: ${sent}/${room.size} clients`)
}

// Broadcast to all connected clients
export function broadcastAll(event: string, data: any) {
  if (!wss) return

  const message = JSON.stringify({ event, data })
  let sent = 0

  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message)
      sent++
    }
  })

  console.log(`[WS] Broadcast ${event} to all: ${sent} clients`)
}

// Get room stats
export function getRoomStats() {
  const stats: Record<string, number> = {}
  for (const [eventId, clients] of rooms.entries()) {
    stats[eventId] = clients.size
  }
  return stats
}

// Get total connected clients
export function getTotalClients(): number {
  return wss ? wss.clients.size : 0
}
