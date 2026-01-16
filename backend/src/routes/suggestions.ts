import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'
import { mapSuggestionStatus, mapSuggestionStatusToFrontend } from '../lib/utils.js'
import { broadcast } from '../websocket/server.js'

const suggestions = new Hono()

// Helper to format suggestion for frontend
function formatSuggestion(sugg: any) {
  return {
    ...sugg,
    _id: sugg.id,
    _creationTime: sugg.createdAt.getTime(),
    status: mapSuggestionStatusToFrontend(sugg.status),
  }
}

// Get all suggestions by event
suggestions.get('/events/:eventId/suggestions', optionalAuthMiddleware, async (c) => {
  const eventId = c.req.param('eventId')

  const suggestionsList = await prisma.suggestion.findMany({
    where: { eventId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(suggestionsList.map(formatSuggestion))
})

// Get approved suggestions by event
suggestions.get('/events/:eventId/suggestions/approved', async (c) => {
  const eventId = c.req.param('eventId')

  const suggestionsList = await prisma.suggestion.findMany({
    where: { 
      eventId, 
      deletedAt: null,
      status: 'APROVADA',
    },
    orderBy: [
      { votesCount: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return c.json(suggestionsList.map(formatSuggestion))
})

// Create suggestion
const createSuggestionSchema = z.object({
  content: z.string().min(1),
  authorName: z.string().optional(),
  isAnonymous: z.boolean(),
})

suggestions.post('/events/:eventId/suggestions', optionalAuthMiddleware, async (c) => {
  const eventId = c.req.param('eventId')
  const body = await c.req.json()
  const data = createSuggestionSchema.parse(body)

  // Check if event exists and get moderation setting
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!event || event.deletedAt) {
    return c.json({ error: 'Evento não encontrado' }, 404)
  }

  // If moderation is off, auto-approve
  const status = event.moderateSuggestions ? 'PENDENTE' : 'APROVADA'

  const sugg = await prisma.suggestion.create({
    data: {
      eventId,
      content: data.content,
      authorName: data.isAnonymous ? null : data.authorName,
      isAnonymous: data.isAnonymous,
      status,
    },
  })

  // Update event count
  await prisma.event.update({
    where: { id: eventId },
    data: { suggestionsCount: { increment: 1 } },
  })

  const formatted = formatSuggestion(sugg)

  // Broadcast if auto-approved
  if (status === 'APROVADA') {
    broadcast(eventId, 'suggestion:new', formatted)
  }

  return c.json(formatted)
})

// Update suggestion status
const updateStatusSchema = z.object({
  status: z.enum(['pendente', 'aprovada', 'rejeitada']),
})

suggestions.patch('/suggestions/:id/status', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = updateStatusSchema.parse(body)

  const sugg = await prisma.suggestion.update({
    where: { id },
    data: { status: mapSuggestionStatus(data.status) },
  })

  const formatted = formatSuggestion(sugg)

  // Broadcast if approved
  if (data.status === 'aprovada') {
    broadcast(sugg.eventId, 'suggestion:new', formatted)
  }

  return c.json(formatted)
})

// Mark as answered
suggestions.patch('/suggestions/:id/answered', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const isAnswered = body.isAnswered ?? true

  const sugg = await prisma.suggestion.update({
    where: { id },
    data: { isAnswered },
  })

  return c.json(formatSuggestion(sugg))
})

// Vote on suggestion
const voteSchema = z.object({
  participantIdentifier: z.string().min(1),
})

suggestions.post('/suggestions/:id/vote', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = voteSchema.parse(body)

  // Check if already voted
  const existingVote = await prisma.suggestionVote.findUnique({
    where: {
      suggestionId_participantIdentifier: {
        suggestionId: id,
        participantIdentifier: data.participantIdentifier,
      },
    },
  })

  if (existingVote) {
    return c.json({ error: 'Você já votou nesta sugestão' }, 400)
  }

  // Create vote and update count
  await prisma.$transaction([
    prisma.suggestionVote.create({
      data: {
        suggestionId: id,
        participantIdentifier: data.participantIdentifier,
      },
    }),
    prisma.suggestion.update({
      where: { id },
      data: { votesCount: { increment: 1 } },
    }),
  ])

  const sugg = await prisma.suggestion.findUnique({
    where: { id },
  })

  if (sugg) {
    broadcast(sugg.eventId, 'suggestion:vote', { suggestionId: id, votesCount: sugg.votesCount })
  }

  return c.json({ success: true, votesCount: sugg?.votesCount })
})

// Check if user has voted
suggestions.get('/suggestions/:id/hasVoted', async (c) => {
  const id = c.req.param('id')
  const participantIdentifier = c.req.query('participantIdentifier')

  if (!participantIdentifier) {
    return c.json({ error: 'participantIdentifier é obrigatório' }, 400)
  }

  const vote = await prisma.suggestionVote.findUnique({
    where: {
      suggestionId_participantIdentifier: {
        suggestionId: id,
        participantIdentifier,
      },
    },
  })

  return c.json({ hasVoted: !!vote })
})

// Delete suggestion
suggestions.delete('/suggestions/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  const sugg = await prisma.suggestion.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  // Update event count
  await prisma.event.update({
    where: { id: sugg.eventId },
    data: { suggestionsCount: { decrement: 1 } },
  })

  return c.json({ success: true })
})

export default suggestions
