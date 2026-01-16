import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'
import { broadcast } from '../websocket/server.js'

const polls = new Hono()

// Helper to format poll for frontend
function formatPoll(poll: any, options?: any[]) {
  return {
    ...poll,
    _id: poll.id,
    _creationTime: poll.createdAt.getTime(),
    activatedAt: poll.activatedAt?.getTime(),
    expiresAt: poll.expiresAt?.getTime(),
    options: options?.map((opt) => ({
      ...opt,
      _id: opt.id,
    })),
  }
}

// Get polls by event
polls.get('/events/:eventId/polls', authMiddleware, async (c) => {
  const eventId = c.req.param('eventId')

  const pollsList = await prisma.poll.findMany({
    where: { eventId, deletedAt: null },
    include: { options: true },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(pollsList.map((p) => formatPoll(p, p.options)))
})

// Get active poll for event
polls.get('/events/:eventId/polls/active', async (c) => {
  const eventId = c.req.param('eventId')

  const poll = await prisma.poll.findFirst({
    where: { eventId, isActive: true, deletedAt: null },
    include: { options: true },
  })

  if (!poll) {
    return c.json(null)
  }

  return c.json(formatPoll(poll, poll.options))
})

// Create poll
const createPollSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  allowMultipleChoice: z.boolean(),
  showResultsAutomatically: z.boolean(),
  timerDuration: z.number().optional(),
})

polls.post('/events/:eventId/polls', authMiddleware, async (c) => {
  const eventId = c.req.param('eventId')
  const body = await c.req.json()
  const data = createPollSchema.parse(body)

  const poll = await prisma.poll.create({
    data: {
      eventId,
      question: data.question,
      allowMultipleChoice: data.allowMultipleChoice,
      showResultsAutomatically: data.showResultsAutomatically,
      timerDuration: data.timerDuration,
      options: {
        create: data.options.map((text) => ({ optionText: text })),
      },
    },
    include: { options: true },
  })

  return c.json(formatPoll(poll, poll.options))
})

// Toggle poll active status
const toggleActiveSchema = z.object({
  isActive: z.boolean(),
})

polls.patch('/polls/:id/activate', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = toggleActiveSchema.parse(body)

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { options: true },
  })

  if (!poll) {
    return c.json({ error: 'Enquete não encontrada' }, 404)
  }

  // If activating, deactivate other polls
  if (data.isActive) {
    await prisma.poll.updateMany({
      where: { eventId: poll.eventId, id: { not: id } },
      data: { isActive: false },
    })
  }

  const activatedAt = data.isActive ? new Date() : null
  let expiresAt = null

  if (data.isActive && poll.timerDuration) {
    expiresAt = new Date(Date.now() + poll.timerDuration * 1000)
  }

  const updated = await prisma.poll.update({
    where: { id },
    data: { 
      isActive: data.isActive,
      activatedAt,
      expiresAt,
    },
    include: { options: true },
  })

  const formatted = formatPoll(updated, updated.options)

  // Broadcast poll status change
  broadcast(poll.eventId, data.isActive ? 'poll:activated' : 'poll:deactivated', formatted)

  return c.json(formatted)
})

// Vote on poll
const voteSchema = z.object({
  pollOptionId: z.string(),
  participantIdentifier: z.string().min(1),
})

polls.post('/polls/:id/vote', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = voteSchema.parse(body)

  // Check if poll exists and is active
  const poll = await prisma.poll.findUnique({
    where: { id },
  })

  if (!poll || poll.deletedAt) {
    return c.json({ error: 'Enquete não encontrada' }, 404)
  }

  if (!poll.isActive) {
    return c.json({ error: 'Enquete não está ativa' }, 400)
  }

  // Check if already voted
  const existingVote = await prisma.pollVote.findUnique({
    where: {
      pollId_participantIdentifier: {
        pollId: id,
        participantIdentifier: data.participantIdentifier,
      },
    },
  })

  if (existingVote && !poll.allowMultipleChoice) {
    return c.json({ error: 'Você já votou nesta enquete' }, 400)
  }

  // Create vote and update counts
  await prisma.$transaction([
    prisma.pollVote.create({
      data: {
        pollId: id,
        pollOptionId: data.pollOptionId,
        participantIdentifier: data.participantIdentifier,
      },
    }),
    prisma.pollOption.update({
      where: { id: data.pollOptionId },
      data: { votesCount: { increment: 1 } },
    }),
    prisma.poll.update({
      where: { id },
      data: { totalVotes: { increment: 1 } },
    }),
  ])

  // Get updated poll
  const updated = await prisma.poll.findUnique({
    where: { id },
    include: { options: true },
  })

  if (updated) {
    broadcast(poll.eventId, 'poll:vote', formatPoll(updated, updated.options))
  }

  return c.json({ success: true })
})

// Get poll results
polls.get('/polls/:id/results', async (c) => {
  const id = c.req.param('id')

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { options: true },
  })

  if (!poll || poll.deletedAt) {
    return c.json({ error: 'Enquete não encontrada' }, 404)
  }

  return c.json({
    poll: formatPoll(poll, poll.options),
    results: poll.options.map((opt) => ({
      optionId: opt.id,
      optionText: opt.optionText,
      votes: opt.votesCount,
      percentage: poll.totalVotes > 0 ? (opt.votesCount / poll.totalVotes) * 100 : 0,
    })),
    totalVotes: poll.totalVotes,
  })
})

// Get participant votes
polls.get('/polls/:id/participantVotes', async (c) => {
  const id = c.req.param('id')
  const participantIdentifier = c.req.query('participantIdentifier')

  if (!participantIdentifier) {
    return c.json({ error: 'participantIdentifier é obrigatório' }, 400)
  }

  const votes = await prisma.pollVote.findMany({
    where: {
      pollId: id,
      participantIdentifier,
    },
  })

  return c.json(votes.map((v) => v.pollOptionId))
})

// Delete poll
polls.delete('/polls/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  await prisma.poll.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return c.json({ success: true })
})

export default polls
