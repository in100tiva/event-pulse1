# 🆚 Comparação: Neon Serverless vs Convex para EventPulse

## 📊 Tabela Comparativa dos Planos Gratuitos (2026)

| Recurso | Neon Free | Convex Free | Vencedor |
|---------|-----------|-------------|----------|
| **Armazenamento** | 0.5 GB por projeto<br>(até 5 GB total em 10 projetos) | 0.5 GiB | 🟰 Empate |
| **Compute/Execuções** | 100 CU-hours/mês<br>(≈2 vCPU / 8 GB RAM) | 1M chamadas/mês<br>20 GiB-hours actions | 🏆 **Neon** (mais tempo) |
| **Bandwidth** | 5 GB/mês (egress) | 1 GiB/mês | 🏆 **Neon** (5x mais) |
| **Projetos** | Até 20 projetos | Até 5 projetos por time | 🏆 **Neon** |
| **Branches/Ambientes** | 10 branches por projeto | 1 deployment por projeto | 🏆 **Neon** |
| **Scale to Zero** | Sim (após 5 min inatividade) | Não aplicável | 🏆 **Neon** (economiza) |
| **Tempo Real** | Não nativo | Nativo (subscriptions) | 🏆 **Convex** |
| **Facilidade de Setup** | Médio (precisa ORM/Prisma) | Alto (tudo integrado) | 🏆 **Convex** |

---

## 🎯 Análise Específica para EventPulse

### 📋 Características do Seu Projeto

Baseado no código que analisamos:

- ✅ Sistema de autenticação (Clerk)
- ✅ CRUD de eventos
- ✅ Confirmações de presença (RSVP)
- ✅ Sugestões e votações em tempo real
- ✅ Enquetes ao vivo
- ✅ Check-in de participantes
- ✅ Lista de espera
- ✅ Dashboard com estatísticas
- ✅ Múltiplas organizações

### 🔢 Estimativa de Uso (Cenário Médio)

**Assumindo:**
- 5 organizações
- 20 eventos ativos
- 100 usuários total
- 10 eventos simultâneos "ao vivo"
- 50 confirmações de presença/dia
- 30 sugestões/dia
- 20 votos em enquetes/dia

---

## 📊 Projeção de Uso no Convex

### 1️⃣ **Chamadas de Função (Limite: 1M/mês)**

| Operação | Frequência | Chamadas/mês |
|----------|------------|--------------|
| Dashboard load (queries) | 100 users × 10 acessos/dia | 30.000 |
| Sync user/org | 100 users × 2 logins/dia | 6.000 |
| List events | 100 users × 5 vezes/dia | 15.000 |
| RSVP confirmations | 50/dia | 1.500 |
| Sugestões | 30/dia | 900 |
| Votos em enquetes | 20/dia | 600 |
| Polling (subscriptions) | 20 users online × 60/min | **864.000** ⚠️ |
| **TOTAL ESTIMADO** | | **~918.000/mês** |

**Análise:** 
- ✅ Dentro do limite, mas **APERTADO**
- ⚠️ Se tiver mais usuários online simultaneamente, **ESTOURA**
- ⚠️ Subscriptions em tempo real consomem MUITO

### 2️⃣ **Armazenamento (Limite: 0.5 GiB)**

| Tabela | Registros | Tamanho Médio | Total |
|--------|-----------|---------------|-------|
| users | 100 | 1 KB | 100 KB |
| organizations | 5 | 0.5 KB | 2.5 KB |
| events | 20 | 2 KB | 40 KB |
| attendanceConfirmations | 1.000 | 0.5 KB | 500 KB |
| suggestions | 500 | 1 KB | 500 KB |
| polls + options | 100 | 2 KB | 200 KB |
| **TOTAL** | | | **~1.3 MB** ✅ |

**Análise:**
- ✅ **Muito abaixo** do limite
- ✅ Pode crescer 400x antes de problema

### 3️⃣ **Bandwidth (Limite: 1 GiB/mês)**

- Dashboard loads: 30.000 × 50 KB = **1.5 GB** ❌
- Event pages: 15.000 × 30 KB = **450 MB**
- APIs: **~500 MB**
- **TOTAL:** **~2.5 GB/mês** ❌ **ESTOURA!**

---

## 📊 Projeção de Uso no Neon

### 1️⃣ **Compute Hours (Limite: 100 CU-hours/mês)**

| Operação | Tempo Ativo | CU-hours |
|----------|-------------|----------|
| Queries do Dashboard | 2 horas/dia × 0.5 CU | 30 CU-hours |
| CRUD de eventos | 1 hora/dia × 0.5 CU | 15 CU-hours |
| Confirmações RSVP | 30 min/dia × 0.5 CU | 7.5 CU-hours |
| Sugestões/Votos | 30 min/dia × 0.5 CU | 7.5 CU-hours |
| Idle time (scale to zero) | - | 0 |
| **TOTAL** | | **~60 CU-hours/mês** ✅ |

**Análise:**
- ✅ **Bem dentro** do limite
- ✅ Scale to zero ajuda MUITO
- ✅ Margem de 40% para crescimento

### 2️⃣ **Armazenamento (Limite: 0.5 GB)**

Similar ao Convex: **~1.3 MB** ✅

### 3️⃣ **Bandwidth (Limite: 5 GB/mês)**

- Dashboard loads: **1.5 GB**
- Event pages: **450 MB**
- APIs: **500 MB**
- **TOTAL:** **~2.5 GB/mês** ✅ **Dentro do limite!**

---

## 🎯 Veredito para EventPulse

### ❌ **Convex Free: Vai ESTOURAR**

**Problemas identificados:**
1. ⚠️ **Bandwidth:** 2.5 GB vs limite de 1 GB (150% acima)
2. ⚠️ **Chamadas de função:** Muito próximo do limite (92%)
3. ⚠️ **Tempo real:** Subscriptions consomem demais
4. ❌ **Já estourou** no seu caso atual

**Por que estourou:**
- Muitas subscriptions em tempo real
- Polling constante do Dashboard
- useEffect com dependências incorretas (loops)
- Console.logs no servidor contando como execuções

### ✅ **Neon Free: Vai FUNCIONAR**

**Vantagens:**
1. ✅ **Compute:** 60/100 CU-hours (40% de margem)
2. ✅ **Bandwidth:** 2.5/5 GB (50% de margem)
3. ✅ **Scale to zero:** Economiza quando não há uso
4. ✅ **Branches:** Pode ter dev/staging/prod separados

**Desvantagens:**
- ❌ Sem tempo real nativo (precisa implementar polling ou SSE)
- ❌ Mais complexo de configurar (Prisma, migrations, etc.)
- ❌ Precisa servidor próprio (Next.js API routes, tRPC, etc.)

---

## 💡 Recomendação Final

### 🏆 Para EventPulse: **MIGRE PARA NEON**

**Razões:**
1. **Bandwidth:** Neon tem 5x mais (5 GB vs 1 GB)
2. **Compute:** Neon tem margem de sobra
3. **Custo-benefício:** Vai suportar crescimento sem pagar
4. **Já estourou Convex:** Problema atual resolvido

### 📋 Plano de Migração

**Opção 1: Neon + Prisma + Next.js API Routes**
```
Frontend (Vite/React) → Next.js API Routes → Prisma → Neon Postgres
                     ↑
                   Clerk Auth
```

**Opção 2: Neon + tRPC + Next.js**
```
Frontend (Vite/React) → tRPC → Prisma → Neon Postgres
                     ↑
                   Clerk Auth
```

**Opção 3: Neon + Supabase Client** (mais simples)
```
Frontend (Vite/React) → Supabase Client → Neon Postgres
                     ↑
                   Clerk Auth
```

---

## 🚀 Alternativas a Considerar

### Se quiser manter tempo real:

**1. Supabase (PostgreSQL + Tempo Real)**
- ✅ Free tier generoso
- ✅ Tempo real nativo
- ✅ Auth integrada
- ✅ Storage para arquivos
- **Limite:** 500 MB DB, 2 GB bandwidth, 50k usuários ativos/mês

**2. PlanetScale (MySQL Serverless)**
- ✅ 5 GB storage
- ✅ 1 bilhão de row reads/mês
- ✅ 10M row writes/mês
- ❌ Sem tempo real nativo

**3. Firebase/Firestore**
- ✅ Tempo real nativo
- ✅ 1 GB storage
- ✅ 50k reads, 20k writes/dia
- ❌ NoSQL (precisa reestruturar dados)

---

## 📊 Comparação Final de Custos

| Serviço | Free Tier | Pro Tier | Quando pagar? |
|---------|-----------|----------|---------------|
| **Neon** | Até 100 CU-h, 5 GB egress | $19/mês (300 CU-h) | >1000 usuários |
| **Convex** | 1M calls, 1 GB bandwidth | $25/mês (100M calls) | >100 usuários ativos |
| **Supabase** | 500 MB DB, 2 GB bandwidth | $25/mês (8 GB DB) | >500 usuários |
| **PlanetScale** | 5 GB, 1B reads | $39/mês (25 GB) | >5000 usuários |

---

## ✅ Ação Recomendada

**CURTO PRAZO (Hoje):**
1. Criar novo projeto Convex Free (para continuar desenvolvendo)
2. Remover console.logs
3. Otimizar useEffect

**MÉDIO PRAZO (1-2 semanas):**
1. Migrar para Neon + Prisma
2. Implementar API routes no Next.js
3. Manter Clerk para auth

**LONGO PRAZO (Produção):**
1. Neon vai suportar até ~1000 usuários free
2. Quando crescer, upgrade para Pro ($19/mês)

---

## 🆘 Quer Ajuda com a Migração?

Posso ajudar você a:
- [ ] Migrar schema do Convex para Prisma
- [ ] Configurar Neon + Prisma
- [ ] Reescrever queries/mutations como API routes
- [ ] Implementar tempo real alternativo (polling otimizado ou SSE)
- [ ] Deploy na Vercel com Neon

Me avise se quer que eu faça isso! 🚀

---

**Conclusão:** Para EventPulse, **Neon é a melhor escolha gratuita**. Suporta 5x mais bandwidth e tem margem de crescimento sem pagar.
