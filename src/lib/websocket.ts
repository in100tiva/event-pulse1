import { useEffect, useRef, useCallback, useState } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

type MessageHandler = (data: any) => void

interface WebSocketMessage {
  event: string
  data: any
}

// WebSocket singleton
class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private handlers = new Map<string, Set<MessageHandler>>()
  private isConnecting = false
  private eventRooms = new Set<string>()

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true
    console.log('[WS] Connecting to', WS_URL)

    this.ws = new WebSocket(`${WS_URL}/ws`)

    this.ws.onopen = () => {
      console.log('[WS] Connected')
      this.isConnecting = false
      this.reconnectAttempts = 0
      
      // Rejoin rooms after reconnect
      this.eventRooms.forEach((eventId) => {
        this.joinRoom(eventId)
      })
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (err) {
        console.error('[WS] Error parsing message:', err)
      }
    }

    this.ws.onclose = () => {
      console.log('[WS] Disconnected')
      this.isConnecting = false
      this.attemptReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('[WS] Error:', error)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private handleMessage(message: WebSocketMessage) {
    const { event, data } = message
    const handlers = this.handlers.get(event)
    
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  subscribe(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    
    return () => {
      this.handlers.get(event)?.delete(handler)
    }
  }

  unsubscribe(event: string, handler?: MessageHandler) {
    if (handler) {
      this.handlers.get(event)?.delete(handler)
    } else {
      this.handlers.delete(event)
    }
  }

  send(event: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
    } else {
      console.warn('[WS] Cannot send message, not connected')
    }
  }

  joinRoom(eventId: string) {
    this.eventRooms.add(eventId)
    this.send('join:event', { eventId })
  }

  leaveRoom(eventId: string) {
    this.eventRooms.delete(eventId)
    this.send('leave:event', { eventId })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.handlers.clear()
    this.eventRooms.clear()
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
const wsClient = new WebSocketClient()

// React hook for WebSocket
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    wsClient.connect()

    const unsubConnected = wsClient.subscribe('connected', () => {
      setIsConnected(true)
    })

    return () => {
      unsubConnected()
    }
  }, [])

  const subscribe = useCallback((event: string, handler: MessageHandler) => {
    return wsClient.subscribe(event, handler)
  }, [])

  const unsubscribe = useCallback((event: string, handler?: MessageHandler) => {
    wsClient.unsubscribe(event, handler)
  }, [])

  const send = useCallback((event: string, data: any) => {
    wsClient.send(event, data)
  }, [])

  const joinRoom = useCallback((eventId: string) => {
    wsClient.joinRoom(eventId)
  }, [])

  const leaveRoom = useCallback((eventId: string) => {
    wsClient.leaveRoom(eventId)
  }, [])

  return {
    isConnected,
    subscribe,
    unsubscribe,
    send,
    joinRoom,
    leaveRoom,
  }
}

// Hook for subscribing to event room
export function useEventRoom(eventId: string | undefined) {
  const { joinRoom, leaveRoom, subscribe, isConnected } = useWebSocket()

  useEffect(() => {
    if (!eventId) return

    joinRoom(eventId)

    return () => {
      leaveRoom(eventId)
    }
  }, [eventId, joinRoom, leaveRoom])

  const onSuggestionNew = useCallback((handler: MessageHandler) => {
    return subscribe('suggestion:new', handler)
  }, [subscribe])

  const onSuggestionVote = useCallback((handler: MessageHandler) => {
    return subscribe('suggestion:vote', handler)
  }, [subscribe])

  const onPollActivated = useCallback((handler: MessageHandler) => {
    return subscribe('poll:activated', handler)
  }, [subscribe])

  const onPollDeactivated = useCallback((handler: MessageHandler) => {
    return subscribe('poll:deactivated', handler)
  }, [subscribe])

  const onPollVote = useCallback((handler: MessageHandler) => {
    return subscribe('poll:vote', handler)
  }, [subscribe])

  const onCountsUpdated = useCallback((handler: MessageHandler) => {
    return subscribe('counts:updated', handler)
  }, [subscribe])

  return {
    isConnected,
    onSuggestionNew,
    onSuggestionVote,
    onPollActivated,
    onPollDeactivated,
    onPollVote,
    onCountsUpdated,
  }
}

export default wsClient
