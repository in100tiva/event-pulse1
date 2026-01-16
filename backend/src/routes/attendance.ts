import { Hono } from 'hono'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'
import { mapAttendanceStatus, mapAttendanceStatusToFrontend } from '../lib/utils.js'

const attendance = new Hono()

// Helper to format attendance for frontend
function formatAttendance(att: any) {
  return {
    ...att,
    _id: att.id,
    _creationTime: att.createdAt.getTime(),
    status: mapAttendanceStatusToFrontend(att.status),
    checkInTime: att.checkInTime?.getTime(),
  }
}

// Get attendance by event
attendance.get('/events/:eventId/attendance', optionalAuthMiddleware, async (c) => {
  const eventId = c.req.param('eventId')

  const attendanceList = await prisma.attendanceConfirmation.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(attendanceList.map(formatAttendance))
})

// Confirm attendance
const confirmSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  status: z.enum(['vou', 'talvez', 'nao_vou']),
})

attendance.post('/events/:eventId/attendance', optionalAuthMiddleware, async (c) => {
  const eventId = c.req.param('eventId')
  const body = await c.req.json()
  const data = confirmSchema.parse(body)

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!event || event.deletedAt) {
    return c.json({ error: 'Evento não encontrado' }, 404)
  }

  // Check participant limit
  if (event.participantLimit && data.status === 'vou') {
    const currentCount = await prisma.attendanceConfirmation.count({
      where: { eventId, status: 'VOU' },
    })

    if (currentCount >= event.participantLimit) {
      return c.json({ error: 'Limite de participantes atingido' }, 400)
    }
  }

  // Upsert attendance
  const att = await prisma.attendanceConfirmation.upsert({
    where: {
      eventId_email: {
        eventId,
        email: data.email,
      },
    },
    update: {
      name: data.name,
      status: mapAttendanceStatus(data.status),
    },
    create: {
      eventId,
      name: data.name,
      email: data.email,
      status: mapAttendanceStatus(data.status),
    },
  })

  // Update event count
  const count = await prisma.attendanceConfirmation.count({
    where: { eventId, status: 'VOU' },
  })
  await prisma.event.update({
    where: { id: eventId },
    data: { participantsCount: count },
  })

  return c.json(formatAttendance(att))
})

// Check if user has confirmed
attendance.get('/events/:eventId/attendance/check', async (c) => {
  const eventId = c.req.param('eventId')
  const email = c.req.query('email')

  if (!email) {
    return c.json({ error: 'Email é obrigatório' }, 400)
  }

  const att = await prisma.attendanceConfirmation.findUnique({
    where: {
      eventId_email: {
        eventId,
        email,
      },
    },
  })

  return c.json({ hasConfirmed: !!att, attendance: att ? formatAttendance(att) : null })
})

// Check-in
attendance.patch('/attendance/:id/checkin', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const checkedIn = body.checkedIn ?? true

  const att = await prisma.attendanceConfirmation.update({
    where: { id },
    data: {
      checkedIn,
      checkInTime: checkedIn ? new Date() : null,
    },
  })

  return c.json(formatAttendance(att))
})

// Public check-in
const publicCheckInSchema = z.object({
  email: z.string().email(),
})

attendance.post('/events/:eventId/checkin-public', async (c) => {
  const eventId = c.req.param('eventId')
  const body = await c.req.json()
  const data = publicCheckInSchema.parse(body)

  const att = await prisma.attendanceConfirmation.findUnique({
    where: {
      eventId_email: {
        eventId,
        email: data.email,
      },
    },
  })

  if (!att) {
    return c.json({ error: 'Confirmação não encontrada' }, 404)
  }

  const updated = await prisma.attendanceConfirmation.update({
    where: { id: att.id },
    data: {
      checkedIn: true,
      checkInTime: new Date(),
    },
  })

  return c.json(formatAttendance(updated))
})

// Get attendance stats
attendance.get('/events/:eventId/attendance/stats', async (c) => {
  const eventId = c.req.param('eventId')

  const [stats, checkInStats] = await Promise.all([
    prisma.attendanceConfirmation.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
    }),
    prisma.attendanceConfirmation.count({
      where: { eventId, checkedIn: true },
    }),
  ])

  return c.json({
    total: stats.reduce((sum, s) => sum + s._count, 0),
    vou: stats.find((s) => s.status === 'VOU')?._count || 0,
    talvez: stats.find((s) => s.status === 'TALVEZ')?._count || 0,
    nao_vou: stats.find((s) => s.status === 'NAO_VOU')?._count || 0,
    checkedIn: checkInStats,
  })
})

// Get effective attendance (considering check-in status)
attendance.get('/events/:eventId/attendance/effective', async (c) => {
  const eventId = c.req.param('eventId')

  const attendanceList = await prisma.attendanceConfirmation.findMany({
    where: { 
      eventId,
      status: 'VOU',
    },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(attendanceList.map(formatAttendance))
})

// Export attendance list
attendance.get('/events/:eventId/attendance/export', authMiddleware, async (c) => {
  const eventId = c.req.param('eventId')

  const attendanceList = await prisma.attendanceConfirmation.findMany({
    where: { eventId },
    orderBy: { createdAt: 'asc' },
  })

  return c.json(attendanceList.map((att) => ({
    nome: att.name,
    email: att.email,
    status: mapAttendanceStatusToFrontend(att.status),
    checkedIn: att.checkedIn,
    checkInTime: att.checkInTime?.toISOString(),
  })))
})

export default attendance
