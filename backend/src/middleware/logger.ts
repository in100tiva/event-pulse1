import { Context, Next } from 'hono'

export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path
  
  await next()
  
  const duration = Date.now() - start
  const status = c.res.status
  
  const logLevel = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO'
  
  console.log(
    `[${new Date().toISOString()}] [${logLevel}] ${method} ${path} ${status} ${duration}ms`
  )
}
