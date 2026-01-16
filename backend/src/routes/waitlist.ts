import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const waitlist = new Hono()

// Helper to format waitlist entry for frontend
function formatWaitlistEntry(entry: any) {
  return {
    ...entry,
    _id: entry.id,
    _creationTime: entry.createdAt.getTime(),
  }
}

// Get waitlist by event
waitlist.get('/events/:eventId/waitlist', async (c) => {
  const eventId = c.req.param('eventId')

  const entries = await prisma.waitlist.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(entries.map(formatWaitlistEntry))
})

// Add to waitlist
const addToWaitlistSchema = z.object({
  name: z.string().min(1),
  whatsapp: z.string().min(1),
})

waitlist.post('/events/:eventId/waitlist', async (c) => {
  const eventId = c.req.param('eventId')
  const body = await c.req.json()
  const data = addToWaitlistSchema.parse(body)

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!event || event.deletedAt) {
    return c.json({ error: 'Evento não encontrado' }, 404)
  }

  const entry = await prisma.waitlist.create({
    data: {
      eventId,
      name: data.name,
      whatsapp: data.whatsapp,
    },
  })

  return c.json(formatWaitlistEntry(entry))
})

// Get waitlist by organization (all leads)
waitlist.get('/organizations/:orgId/waitlist', authMiddleware, async (c) => {
  const orgId = c.req.param('orgId')

  const entries = await prisma.waitlist.findMany({
    where: {
      event: {
        organizationId: orgId,
        deletedAt: null,
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(entries.map((entry) => ({
    ...formatWaitlistEntry(entry),
    eventTitle: entry.event.title,
  })))
})

// Remove from waitlist
waitlist.delete('/waitlist/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  await prisma.waitlist.delete({
    where: { id },
  })

  return c.json({ success: true })
})

// Count waitlist by event
waitlist.get('/events/:eventId/waitlist/count', async (c) => {
  const eventId = c.req.param('eventId')

  const count = await prisma.waitlist.count({
    where: { eventId },
  })

  return c.json({ count })
})

export default waitlist
