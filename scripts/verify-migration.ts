/**
 * Script de Verificação da Migração
 * 
 * Verifica a integridade dos dados após a migração.
 * Execute com: npx tsx scripts/verify-migration.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ValidationResult {
  table: string
  count: number
  status: 'ok' | 'warning' | 'error'
  message: string
}

async function verifyMigration() {
  console.log('🔍 Verificando migração de dados...\n')

  const results: ValidationResult[] = []

  try {
    // 1. Verificar contagem de tabelas
    console.log('📊 Contagens:')

    const counts = await Promise.all([
      prisma.user.count().then((c) => ({ table: 'users', count: c })),
      prisma.organization.count().then((c) => ({ table: 'organizations', count: c })),
      prisma.organizationUser.count().then((c) => ({ table: 'organizationUsers', count: c })),
      prisma.event.count().then((c) => ({ table: 'events', count: c })),
      prisma.attendanceConfirmation.count().then((c) => ({ table: 'attendanceConfirmations', count: c })),
      prisma.suggestion.count().then((c) => ({ table: 'suggestions', count: c })),
      prisma.suggestionVote.count().then((c) => ({ table: 'suggestionVotes', count: c })),
      prisma.poll.count().then((c) => ({ table: 'polls', count: c })),
      prisma.pollOption.count().then((c) => ({ table: 'pollOptions', count: c })),
      prisma.pollVote.count().then((c) => ({ table: 'pollVotes', count: c })),
      prisma.waitlist.count().then((c) => ({ table: 'waitlist', count: c })),
    ])

    for (const { table, count } of counts) {
      const status = count > 0 ? 'ok' : 'warning'
      console.log(`   ${status === 'ok' ? '✅' : '⚠️'} ${table}: ${count}`)
      results.push({
        table,
        count,
        status,
        message: count > 0 ? 'OK' : 'Tabela vazia',
      })
    }

    // 2. Verificar integridade referencial
    console.log('\n🔗 Verificando integridade referencial:')

    // Eventos sem organização válida
    const orphanEvents = await prisma.event.count({
      where: {
        organization: null,
      },
    })
    console.log(`   ${orphanEvents === 0 ? '✅' : '❌'} Eventos órfãos: ${orphanEvents}`)

    // Sugestões sem evento válido
    const orphanSuggestions = await prisma.suggestion.count({
      where: {
        event: null,
      },
    })
    console.log(`   ${orphanSuggestions === 0 ? '✅' : '❌'} Sugestões órfãs: ${orphanSuggestions}`)

    // Enquetes sem evento válido
    const orphanPolls = await prisma.poll.count({
      where: {
        event: null,
      },
    })
    console.log(`   ${orphanPolls === 0 ? '✅' : '❌'} Enquetes órfãs: ${orphanPolls}`)

    // 3. Verificar contadores
    console.log('\n📈 Verificando contadores:')

    const eventsWithWrongCount = await prisma.$queryRaw<{ id: string; title: string; stored: number; actual: number }[]>`
      SELECT e.id, e.title, e.participants_count as stored, 
        COALESCE(COUNT(a.id), 0)::int as actual
      FROM events e
      LEFT JOIN attendance_confirmations a ON a.event_id = e.id AND a.status = 'VOU'
      GROUP BY e.id
      HAVING e.participants_count != COALESCE(COUNT(a.id), 0)
    `

    if (eventsWithWrongCount.length > 0) {
      console.log(`   ⚠️ ${eventsWithWrongCount.length} eventos com contagem incorreta:`)
      for (const event of eventsWithWrongCount.slice(0, 5)) {
        console.log(`      - ${event.title}: stored=${event.stored}, actual=${event.actual}`)
      }
    } else {
      console.log('   ✅ Todos os contadores estão corretos')
    }

    // 4. Verificar códigos de compartilhamento únicos
    console.log('\n🔑 Verificando códigos de compartilhamento:')

    const duplicateShareCodes = await prisma.$queryRaw<{ code: string; count: number }[]>`
      SELECT share_link_code as code, COUNT(*) as count
      FROM events
      GROUP BY share_link_code
      HAVING COUNT(*) > 1
    `

    if (duplicateShareCodes.length > 0) {
      console.log(`   ❌ ${duplicateShareCodes.length} códigos duplicados encontrados`)
    } else {
      console.log('   ✅ Todos os códigos são únicos')
    }

    // 5. Verificar emails únicos
    console.log('\n📧 Verificando emails:')

    const duplicateEmails = await prisma.$queryRaw<{ email: string; count: number }[]>`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `

    if (duplicateEmails.length > 0) {
      console.log(`   ❌ ${duplicateEmails.length} emails duplicados`)
    } else {
      console.log('   ✅ Todos os emails são únicos')
    }

    // 6. Resumo final
    console.log('\n' + '='.repeat(50))
    console.log('📋 RESUMO DA VERIFICAÇÃO')
    console.log('='.repeat(50))

    const totalRecords = counts.reduce((sum, c) => sum + c.count, 0)
    const hasErrors = orphanEvents > 0 || orphanSuggestions > 0 || orphanPolls > 0 || duplicateShareCodes.length > 0

    console.log(`\n   Total de registros: ${totalRecords}`)
    console.log(`   Integridade: ${hasErrors ? '❌ Com problemas' : '✅ OK'}`)
    console.log(`   Contadores: ${eventsWithWrongCount.length === 0 ? '✅ OK' : '⚠️ Necessita correção'}`)

    if (hasErrors) {
      console.log('\n⚠️  Foram encontrados problemas na migração.')
      console.log('   Por favor, revise os dados ou execute novamente a migração.')
    } else {
      console.log('\n🎉 Migração verificada com sucesso!')
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyMigration()
