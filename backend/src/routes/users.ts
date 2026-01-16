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
  const body = await c.req.json()
  const data = syncUserSchema.parse(body)

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

  return c.json(user)
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
