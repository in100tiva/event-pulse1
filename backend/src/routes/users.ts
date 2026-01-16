import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { mapOrganizationRoleToFrontend } from '../lib/utils.js'

const users = new Hono()

// Sync user from Clerk
const syncUserSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().optional(),
})

users.post('/sync', async (c) => {
  console.log('[SYNC] Recebendo requisição de sync')
  
  try {
    const body = await c.req.json()
    console.log('[SYNC] Dados recebidos:', JSON.stringify(body))
    
    const data = syncUserSchema.parse(body)
    console.log('[SYNC] Dados validados para:', data.email)

    const user = await prisma.user.upsert({
    where: { clerkId: data.clerkId },
    update: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
    },
    create: {
      clerkId: data.clerkId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
    },
  })

  console.log('[SYNC] Usuário sincronizado com sucesso:', user.email)
  return c.json(user)
  } catch (error) {
    console.error('[SYNC] Erro ao sincronizar:', error)
    throw error
  }
})

// Get current user
users.get('/me', authMiddleware, async (c) => {
  const authUser = c.get('user')

  const user = await prisma.user.findUnique({
    where: { clerkId: authUser.userId },
  })

  if (!user) {
    return c.json({ error: 'Usuário não encontrado' }, 404)
  }

  return c.json(user)
})

// Get user organizations
users.get('/organizations', authMiddleware, async (c) => {
  const authUser = c.get('user')

  const user = await prisma.user.findUnique({
    where: { clerkId: authUser.userId },
    include: {
      organizationUsers: {
        include: {
          organization: true,
        },
      },
    },
  })

  if (!user) {
    return c.json([])
  }

  const organizations = user.organizationUsers.map((ou) => ({
    ...ou.organization,
    _id: ou.organization.id, // Compatibility with Convex frontend
    role: mapOrganizationRoleToFrontend(ou.role),
  }))

  return c.json(organizations)
})

export default users
