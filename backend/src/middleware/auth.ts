import { Context, Next } from 'hono'

export interface AuthUser {
  userId: string
  email?: string
  firstName?: string
  lastName?: string
}

// Extend Hono context with user
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}

/**
 * Simple auth middleware that extracts user info from request headers
 * The frontend sends the user info via headers after authenticating with Clerk
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    const userId = c.req.header('X-User-Id')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401)
    }

    if (!userId) {
      return c.json({ error: 'Unauthorized - No user ID provided' }, 401)
    }

    // Get user info from headers (sent by frontend after Clerk auth)
    const email = c.req.header('X-User-Email')
    const firstName = c.req.header('X-User-FirstName')
    const lastName = c.req.header('X-User-LastName')

    // Set user in context
    c.set('user', {
      userId,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    })

    await next()
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Unauthorized - Authentication failed' }, 401)
  }
}

// Optional auth - doesn't fail if no token
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    const userId = c.req.header('X-User-Id')
    
    if (authHeader && authHeader.startsWith('Bearer ') && userId) {
      const email = c.req.header('X-User-Email')
      const firstName = c.req.header('X-User-FirstName')
      const lastName = c.req.header('X-User-LastName')
      
      c.set('user', {
        userId,
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      })
    }

    await next()
  } catch (error) {
    // Continue without user
    await next()
  }
}
