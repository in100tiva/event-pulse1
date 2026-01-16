/**
 * Script de Migração de Dados - Convex para Neon/Prisma
 * 
 * Este script exporta dados do Convex e importa para o banco Neon.
 * Execute com: npx tsx scripts/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping de IDs antigos (Convex) para novos (Prisma)
const idMappings = {
  users: new Map<string, string>(),
  organizations: new Map<string, string>(),
  events: new Map<string, string>(),
  suggestions: new Map<string, string>(),
  polls: new Map<string, string>(),
  pollOptions: new Map<string, string>(),
}

// Helper para converter status
function mapEventStatus(status: string): 'RASCUNHO' | 'PUBLICADO' | 'AO_VIVO' | 'ENCERRADO' {
  const map: Record<string, 'RASCUNHO' | 'PUBLICADO' | 'AO_VIVO' | 'ENCERRADO'> = {
    'rascunho': 'RASCUNHO',
    'publicado': 'PUBLICADO',
    'ao_vivo': 'AO_VIVO',
    'encerrado': 'ENCERRADO',
  }
  return map[status] || 'RASCUNHO'
}

function mapAttendanceStatus(status: string): 'VOU' | 'TALVEZ' | 'NAO_VOU' {
  const map: Record<string, 'VOU' | 'TALVEZ' | 'NAO_VOU'> = {
    'vou': 'VOU',
    'talvez': 'TALVEZ',
    'nao_vou': 'NAO_VOU',
  }
  return map[status] || 'VOU'
}

function mapSuggestionStatus(status: string): 'PENDENTE' | 'APROVADA' | 'REJEITADA' {
  const map: Record<string, 'PENDENTE' | 'APROVADA' | 'REJEITADA'> = {
    'pendente': 'PENDENTE',
    'aprovada': 'APROVADA',
    'rejeitada': 'REJEITADA',
  }
  return map[status] || 'PENDENTE'
}

// Interface para dados do Convex
interface ConvexData {
  users: any[]
  organizations: any[]
  organizationUsers: any[]
  events: any[]
  attendanceConfirmations: any[]
  suggestions: any[]
  suggestionVotes: any[]
  polls: any[]
  pollOptions: any[]
  pollVotes: any[]
  waitlist: any[]
}

// Função principal de migração
async function migrateData(convexData: ConvexData) {
  console.log('🚀 Iniciando migração de dados...\n')

  try {
    // 1. Migrar usuários
    console.log('📦 Migrando usuários...')
    for (const user of convexData.users) {
      const created = await prisma.user.create({
        data: {
          clerkId: user.clerkId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
        },
      })
      idMappings.users.set(user._id, created.id)
    }
    console.log(`   ✅ ${convexData.users.length} usuários migrados\n`)

    // 2. Migrar organizações
    console.log('📦 Migrando organizações...')
    for (const org of convexData.organizations) {
      const created = await prisma.organization.create({
        data: {
          name: org.name,
          clerkId: org.clerkId,
        },
      })
      idMappings.organizations.set(org._id, created.id)
    }
    console.log(`   ✅ ${convexData.organizations.length} organizações migradas\n`)

    // 3. Migrar relações usuário-organização
    console.log('📦 Migrando relações usuário-organização...')
    for (const ou of convexData.organizationUsers) {
      const userId = idMappings.users.get(ou.userId)
      const organizationId = idMappings.organizations.get(ou.organizationId)
      
      if (userId && organizationId) {
        await prisma.organizationUser.create({
          data: {
            userId,
            organizationId,
            role: ou.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'MEMBER',
          },
        })
      }
    }
    console.log(`   ✅ ${convexData.organizationUsers.length} relações migradas\n`)

    // 4. Migrar eventos
    console.log('📦 Migrando eventos...')
    for (const event of convexData.events) {
      const organizationId = idMappings.organizations.get(event.organizationId)
      
      if (organizationId) {
        const created = await prisma.event.create({
          data: {
            organizationId,
            title: event.title,
            description: event.description,
            startDateTime: new Date(event.startDateTime),
            isOnline: event.isOnline ?? false,
            location: event.location,
            participantLimit: event.participantLimit,
            confirmationDeadline: event.confirmationDeadline ? new Date(event.confirmationDeadline) : null,
            requireCheckIn: event.requireCheckIn ?? false,
            checkInWindowHours: event.checkInWindowHours,
            checkInDeadlineMinutes: event.checkInDeadlineMinutes,
            allowAnonymousSuggestions: event.allowAnonymousSuggestions ?? true,
            moderateSuggestions: event.moderateSuggestions ?? false,
            status: mapEventStatus(event.status),
            shareLinkCode: event.shareLinkCode,
            imageUrl: event.imageUrl,
            participantsCount: 0, // Will be recalculated
            suggestionsCount: 0, // Will be recalculated
          },
        })
        idMappings.events.set(event._id, created.id)
      }
    }
    console.log(`   ✅ ${convexData.events.length} eventos migrados\n`)

    // 5. Migrar confirmações de presença
    console.log('📦 Migrando confirmações de presença...')
    let attendanceCount = 0
    for (const att of convexData.attendanceConfirmations) {
      const eventId = idMappings.events.get(att.eventId)
      
      if (eventId) {
        await prisma.attendanceConfirmation.create({
          data: {
            eventId,
            name: att.name,
            email: att.email,
            status: mapAttendanceStatus(att.status),
            checkedIn: att.checkedIn ?? false,
            checkInTime: att.checkInTime ? new Date(att.checkInTime) : null,
            noShow: att.noShow,
          },
        })
        attendanceCount++
      }
    }
    console.log(`   ✅ ${attendanceCount} confirmações migradas\n`)

    // 6. Migrar sugestões
    console.log('📦 Migrando sugestões...')
    for (const sugg of convexData.suggestions) {
      const eventId = idMappings.events.get(sugg.eventId)
      
      if (eventId) {
        const created = await prisma.suggestion.create({
          data: {
            eventId,
            content: sugg.content,
            authorName: sugg.authorName,
            isAnonymous: sugg.isAnonymous ?? false,
            status: mapSuggestionStatus(sugg.status),
            isAnswered: sugg.isAnswered ?? false,
            votesCount: sugg.votesCount ?? 0,
          },
        })
        idMappings.suggestions.set(sugg._id, created.id)
      }
    }
    console.log(`   ✅ ${convexData.suggestions.length} sugestões migradas\n`)

    // 7. Migrar votos em sugestões
    console.log('📦 Migrando votos em sugestões...')
    let suggVotesCount = 0
    for (const vote of convexData.suggestionVotes) {
      const suggestionId = idMappings.suggestions.get(vote.suggestionId)
      
      if (suggestionId) {
        try {
          await prisma.suggestionVote.create({
            data: {
              suggestionId,
              participantIdentifier: vote.participantIdentifier,
            },
          })
          suggVotesCount++
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    console.log(`   ✅ ${suggVotesCount} votos em sugestões migrados\n`)

    // 8. Migrar enquetes
    console.log('📦 Migrando enquetes...')
    for (const poll of convexData.polls) {
      const eventId = idMappings.events.get(poll.eventId)
      
      if (eventId) {
        const created = await prisma.poll.create({
          data: {
            eventId,
            question: poll.question,
            allowMultipleChoice: poll.allowMultipleChoice ?? false,
            showResultsAutomatically: poll.showResultsAutomatically ?? true,
            isActive: poll.isActive ?? false,
            totalVotes: poll.totalVotes ?? 0,
            timerDuration: poll.timerDuration,
            activatedAt: poll.activatedAt ? new Date(poll.activatedAt) : null,
            expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
          },
        })
        idMappings.polls.set(poll._id, created.id)
      }
    }
    console.log(`   ✅ ${convexData.polls.length} enquetes migradas\n`)

    // 9. Migrar opções de enquete
    console.log('📦 Migrando opções de enquete...')
    for (const opt of convexData.pollOptions) {
      const pollId = idMappings.polls.get(opt.pollId)
      
      if (pollId) {
        const created = await prisma.pollOption.create({
          data: {
            pollId,
            optionText: opt.optionText,
            votesCount: opt.votesCount ?? 0,
          },
        })
        idMappings.pollOptions.set(opt._id, created.id)
      }
    }
    console.log(`   ✅ ${convexData.pollOptions.length} opções migradas\n`)

    // 10. Migrar votos em enquetes
    console.log('📦 Migrando votos em enquetes...')
    let pollVotesCount = 0
    for (const vote of convexData.pollVotes) {
      const pollId = idMappings.polls.get(vote.pollId)
      const pollOptionId = idMappings.pollOptions.get(vote.pollOptionId)
      
      if (pollId && pollOptionId) {
        try {
          await prisma.pollVote.create({
            data: {
              pollId,
              pollOptionId,
              participantIdentifier: vote.participantIdentifier,
            },
          })
          pollVotesCount++
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    console.log(`   ✅ ${pollVotesCount} votos em enquetes migrados\n`)

    // 11. Migrar lista de espera
    console.log('📦 Migrando lista de espera...')
    let waitlistCount = 0
    for (const entry of convexData.waitlist) {
      const eventId = idMappings.events.get(entry.eventId)
      
      if (eventId) {
        await prisma.waitlist.create({
          data: {
            eventId,
            name: entry.name,
            whatsapp: entry.whatsapp,
          },
        })
        waitlistCount++
      }
    }
    console.log(`   ✅ ${waitlistCount} entradas na lista de espera migradas\n`)

    // 12. Atualizar contadores nos eventos
    console.log('📦 Atualizando contadores...')
    const events = await prisma.event.findMany()
    for (const event of events) {
      const [participantsCount, suggestionsCount] = await Promise.all([
        prisma.attendanceConfirmation.count({
          where: { eventId: event.id, status: 'VOU' },
        }),
        prisma.suggestion.count({
          where: { eventId: event.id, deletedAt: null },
        }),
      ])

      await prisma.event.update({
        where: { id: event.id },
        data: { participantsCount, suggestionsCount },
      })
    }
    console.log('   ✅ Contadores atualizados\n')

    console.log('🎉 Migração concluída com sucesso!')
    console.log('\n📊 Resumo:')
    console.log(`   - Usuários: ${convexData.users.length}`)
    console.log(`   - Organizações: ${convexData.organizations.length}`)
    console.log(`   - Eventos: ${convexData.events.length}`)
    console.log(`   - Confirmações: ${attendanceCount}`)
    console.log(`   - Sugestões: ${convexData.suggestions.length}`)
    console.log(`   - Enquetes: ${convexData.polls.length}`)
    console.log(`   - Waitlist: ${waitlistCount}`)

  } catch (error) {
    console.error('❌ Erro na migração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Se executado diretamente
// Para usar, exporte os dados do Convex e cole aqui
const sampleData: ConvexData = {
  users: [],
  organizations: [],
  organizationUsers: [],
  events: [],
  attendanceConfirmations: [],
  suggestions: [],
  suggestionVotes: [],
  polls: [],
  pollOptions: [],
  pollVotes: [],
  waitlist: [],
}

// Exemplo de como executar:
// 1. Exporte os dados do Convex usando o MCP tool (mcp_convex_data)
// 2. Cole os dados exportados no objeto sampleData acima
// 3. Execute: npx tsx scripts/migrate-data.ts

console.log(`
===========================================
  Script de Migração: Convex → Neon/Prisma
===========================================

Para executar a migração:

1. Use o MCP Convex para exportar dados de cada tabela:
   - users
   - organizations
   - organizationUsers
   - events
   - attendanceConfirmations
   - suggestions
   - suggestionVotes
   - polls
   - pollOptions
   - pollVotes
   - waitlist

2. Cole os dados exportados no arquivo migrate-data.ts

3. Execute: npx tsx scripts/migrate-data.ts

⚠️  ATENÇÃO: Faça backup antes de executar!
`)

// Descomente a linha abaixo quando tiver os dados:
// migrateData(sampleData)
