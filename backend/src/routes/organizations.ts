import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { mapOrganizationRole } from '../lib/utils.js'

const organizations = new Hono()

// Create organization
const createOrgSchema = z.object({
  name: z.string().min(1),
  clerkId: z.string(),
})

organizations.post('/', authMiddleware, async (c) => {
  const authUser = c.get('user')
  const body = await c.req.json()
  const data = createOrgSchema.parse(body)

  // Find user
  const user = await prisma.user.findUnique({
    where: { clerkId: authUser.userId },
  })

  if (!user) {
    return c.json({ error: 'Usuário não encontrado' }, 404)
  }

  // Create org and add user as admin
  const org = await prisma.organization.create({
    data: {
      name: data.name,
      clerkId: data.clerkId,
      organizationUsers: {
        create: {
          userId: user.id,
          role: 'ADMIN',
        },
      },
    },
  })

  return c.json({ ...org, _id: org.id })
})

// Sync organization from Clerk
const syncOrgSchema = z.object({
  clerkId: z.string(),
  name: z.string().min(1),
})

organizations.post('/sync', authMiddleware, async (c) => {
  const authUser = c.get('user')
  const body = await c.req.json()
  const data = syncOrgSchema.parse(body)

  // Find user
  const user = await prisma.user.findUnique({
    where: { clerkId: authUser.userId },
  })

  if (!user) {
    return c.json({ error: 'Usuário não encontrado' }, 404)
  }

  // Upsert organization
  const org = await prisma.organization.upsert({
    where: { clerkId: data.clerkId },
    update: { name: data.name },
    create: {
      name: data.name,
      clerkId: data.clerkId,
    },
  })

  // Check if user is already member
  const existingMembership = await prisma.organizationUser.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
  })

  // Add user as admin if not member
  if (!existingMembership) {
    await prisma.organizationUser.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'ADMIN',
      },
    })
  }

  return c.json({ ...org, _id: org.id })
})

// Get organization by Clerk ID
organizations.get('/clerk/:clerkId', authMiddleware, async (c) => {
  const clerkId = c.req.param('clerkId')

  const org = await prisma.organization.findUnique({
    where: { clerkId },
  })

  if (!org) {
    return c.json(null)
  }

  return c.json({ ...org, _id: org.id })
})

// Add user to organization
const addUserSchema = z.object({
  userEmail: z.string().email(),
  role: z.enum(['admin', 'member']),
})

organizations.post('/:id/users', authMiddleware, async (c) => {
  const orgId = c.req.param('id')
  const body = await c.req.json()
  const data = addUserSchema.parse(body)

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.userEmail },
  })

  if (!user) {
    return c.json({ error: `Usuário com email ${data.userEmail} não encontrado` }, 404)
  }

  // Upsert membership
  const membership = await prisma.organizationUser.upsert({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: user.id,
      },
    },
    update: {
      role: mapOrganizationRole(data.role),
    },
    create: {
      organizationId: orgId,
      userId: user.id,
      role: mapOrganizationRole(data.role),
    },
  })

  return c.json({ success: true, membership })
})

export default organizations
