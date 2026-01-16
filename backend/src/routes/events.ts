import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'
import { generateShareCode, mapEventStatus, mapEventStatusToFrontend } from '../lib/utils.js'

const events = new Hono()

// Helper to format event for frontend (Convex compatibility)
function formatEvent(event: any) {
  return {
    ...event,
    _id: event.id,
    _creationTime: event.createdAt.getTime(),
    organizationId: event.organizationId,
    startDateTime: event.startDateTime.getTime(),
    confirmationDeadline: event.confirmationDeadline?.getTime(),
    status: mapEventStatusToFrontend(event.status),
  }
}

// Get events by organization
events.get('/', authMiddleware, async (c) => {
  const organizationId = c.req.query('organizationId')

  if (!organizationId) {
    return c.json({ error: 'organizationId é obrigatório' }, 400)
  }

  const eventsList = await prisma.event.findMany({
    where: {
      organizationId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(eventsList.map(formatEvent))
})

// Get event by ID
events.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  const event = await prisma.event.findUnique({
    where: { id },
  })

  if (!event || event.deletedAt) {
    return c.json({ error: 'Evento não encontrado' }, 404)
  }

  return c.json(formatEvent(event))
})

// Get event by share code (public)
events.get('/public/:shareCode', optionalAuthMiddleware, async (c) => {
  const shareCode = c.req.param('shareCode')

  const event = await prisma.event.findUnique({
    where: { shareLinkCode: shareCode },
  })

  if (!event || event.deletedAt) {
    return c.json({ error: 'Evento não encontrado' }, 404)
  }

  return c.json(formatEvent(event))
})

// Create event
const createEventSchema = z.object({
  organizationId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  startDateTime: z.number(),
  isOnline: z.boolean(),
  location: z.string().optional(),
  participantLimit: z.number().optional(),
  confirmationDeadline: z.number().optional(),
  requireCheckIn: z.boolean().optional(),
  checkInWindowHours: z.number().optional(),
  checkInDeadlineMinutes: z.number().optional(),
  allowAnonymousSuggestions: z.boolean(),
  moderateSuggestions: z.boolean(),
  status: z.enum(['rascunho', 'publicado', 'ao_vivo', 'encerrado']),
  imageUrl: z.string().optional(),
})

events.post('/', authMiddleware, async (c) => {
  const body = await c.req.json()
  const data = createEventSchema.parse(body)

  const shareLinkCode = generateShareCode()

  const event = await prisma.event.create({
    data: {
      organizationId: data.organizationId,
      title: data.title,
      description: data.description,
      startDateTime: new Date(data.startDateTime),
      isOnline: data.isOnline,
      location: data.location,
      participantLimit: data.participantLimit,
      confirmationDeadline: data.confirmationDeadline ? new Date(data.confirmationDeadline) : null,
      requireCheckIn: data.requireCheckIn ?? false,
      checkInWindowHours: data.checkInWindowHours,
      checkInDeadlineMinutes: data.checkInDeadlineMinutes,
      allowAnonymousSuggestions: data.allowAnonymousSuggestions,
      moderateSuggestions: data.moderateSuggestions,
      status: mapEventStatus(data.status),
      imageUrl: data.imageUrl,
      shareLinkCode,
    },
  })

  return c.json(formatEvent(event))
})

// Update event
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDateTime: z.number().optional(),
  isOnline: z.boolean().optional(),
  location: z.string().optional(),
  participantLimit: z.number().optional(),
  confirmationDeadline: z.number().optional(),
  requireCheckIn: z.boolean().optional(),
  checkInWindowHours: z.number().optional(),
  checkInDeadlineMinutes: z.number().optional(),
  allowAnonymousSuggestions: z.boolean().optional(),
  moderateSuggestions: z.boolean().optional(),
  status: z.enum(['rascunho', 'publicado', 'ao_vivo', 'encerrado']).optional(),
  imageUrl: z.string().optional(),
})

events.patch('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = updateEventSchema.parse(body)

  const updateData: any = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.startDateTime !== undefined) updateData.startDateTime = new Date(data.startDateTime)
  if (data.isOnline !== undefined) updateData.isOnline = data.isOnline
  if (data.location !== undefined) updateData.location = data.location
  if (data.participantLimit !== undefined) updateData.participantLimit = data.participantLimit
  if (data.confirmationDeadline !== undefined) {
    updateData.confirmationDeadline = data.confirmationDeadline ? new Date(data.confirmationDeadline) : null
  }
  if (data.requireCheckIn !== undefined) updateData.requireCheckIn = data.requireCheckIn
  if (data.checkInWindowHours !== undefined) updateData.checkInWindowHours = data.checkInWindowHours
  if (data.checkInDeadlineMinutes !== undefined) updateData.checkInDeadlineMinutes = data.checkInDeadlineMinutes
  if (data.allowAnonymousSuggestions !== undefined) updateData.allowAnonymousSuggestions = data.allowAnonymousSuggestions
  if (data.moderateSuggestions !== undefined) updateData.moderateSuggestions = data.moderateSuggestions
  if (data.status !== undefined) updateData.status = mapEventStatus(data.status)
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl

  const event = await prisma.event.update({
    where: { id },
    data: updateData,
  })

  return c.json(formatEvent(event))
})

// Update event status
const updateStatusSchema = z.object({
  status: z.enum(['rascunho', 'publicado', 'ao_vivo', 'encerrado']),
})

events.patch('/:id/status', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = updateStatusSchema.parse(body)

  const event = await prisma.event.update({
    where: { id },
    data: { status: mapEventStatus(data.status) },
  })

  return c.json(formatEvent(event))
})

// Delete event (soft delete)
events.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  await prisma.event.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return c.json({ success: true })
})

// Get event stats
events.get('/:id/stats', authMiddleware, async (c) => {
  const id = c.req.param('id')

  const [event, attendanceStats, suggestionsCount, pollsCount] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    prisma.attendanceConfirmation.groupBy({
      by: ['status'],
      where: { eventId: id },
      _count: true,
    }),
    prisma.suggestion.count({ where: { eventId: id, deletedAt: null } }),
    prisma.poll.count({ where: { eventId: id, deletedAt: null } }),
  ])

  if (!event) {
    return c.json({ error: 'Evento não encontrado' }, 404)
  }

  const stats = {
    total: attendanceStats.reduce((sum, s) => sum + s._count, 0),
    vou: attendanceStats.find((s) => s.status === 'VOU')?._count || 0,
    talvez: attendanceStats.find((s) => s.status === 'TALVEZ')?._count || 0,
    nao_vou: attendanceStats.find((s) => s.status === 'NAO_VOU')?._count || 0,
    suggestions: suggestionsCount,
    polls: pollsCount,
  }

  return c.json(stats)
})

export default events
