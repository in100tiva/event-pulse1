import { Context } from 'hono'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, c: Context) {
  console.error('Error:', err)

  if (err instanceof AppError) {
    return c.json(
      {
        error: err.message,
        code: err.code,
      },
      err.statusCode as 400 | 401 | 403 | 404 | 500
    )
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any
    
    if (prismaError.code === 'P2002') {
      return c.json(
        { error: 'Registro já existe', code: 'DUPLICATE_ENTRY' },
        409
      )
    }
    
    if (prismaError.code === 'P2025') {
      return c.json(
        { error: 'Registro não encontrado', code: 'NOT_FOUND' },
        404
      )
    }
  }

  // Default error
  return c.json(
    {
      error: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
    },
    500
  )
}
