# 🎉 EventPulse v2.0

> Plataforma completa de gerenciamento de eventos com engajamento em tempo real

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Neon](https://img.shields.io/badge/Neon-00E5CC?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

## 📋 Sobre o Projeto

EventPulse é uma plataforma moderna e completa para criação e gerenciamento de eventos, permitindo interação em tempo real com participantes através de confirmações de presença, sugestões, enquetes e muito mais.

### 🆕 Novidades da v2.0
- **Migração para Neon + Prisma** - Banco de dados PostgreSQL serverless
- **API REST com Hono** - Backend leve e performático
- **WebSocket nativo** - Atualizações em tempo real
- **React Query** - Cache inteligente e estado do servidor

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vite + React)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ React Query │  │  WebSocket  │  │    Clerk Auth       │  │
│  │   (Cache)   │  │   Client    │  │    (Tokens)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │                 │
                         ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Hono API)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  REST API   │  │  WebSocket  │  │   JWT Validation    │  │
│  │   Routes    │  │   Server    │  │     (Clerk)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                         │                                    │
│                    ┌────┴────┐                              │
│                    │ Prisma  │                              │
│                    │   ORM   │                              │
│                    └────┬────┘                              │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    Neon PostgreSQL    │
              │   (Serverless DB)     │
              └───────────────────────┘
```

### ✨ Funcionalidades

#### 🎯 Gerenciamento de Eventos
- ✅ Criação de eventos online ou presenciais
- 📊 Dashboard com abas (Publicados, Ao Vivo, Encerrados)
- 🔄 Status dinâmicos com workflow completo
- 📱 Links compartilháveis únicos

#### 👥 Gestão de Participantes
- ✅ Confirmações de presença (Vou, Talvez, Não vou)
- 🚫 Limite de participantes com bloqueio automático
- 📋 Lista de espera inteligente
- ✓ Check-in digital com QR code

#### 💡 Engajamento em Tempo Real
- 💭 Mural de sugestões com votação
- 📊 Enquetes ao vivo com resultados instantâneos
- ✅ Moderação de conteúdo
- 🎭 Opção de anonimato

## 🚀 Tecnologias

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Query** - Estado do servidor
- **Tailwind CSS** - Estilização

### Backend
- **Hono** - Framework web ultrarrápido
- **Prisma** - ORM type-safe
- **WebSocket (ws)** - Tempo real
- **Clerk** - Autenticação JWT

### Database
- **Neon PostgreSQL** - Serverless com scale-to-zero

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no [Neon](https://neon.tech)
- Conta no [Clerk](https://clerk.com)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/in100tiva/event-pulse1.git
cd event-pulse1
```

2. **Configure as variáveis de ambiente**

Crie o arquivo `.env` na raiz:
```env
# Neon Database
DATABASE_URL="postgresql://user:pass@host.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@host.neon.tech/neondb?sslmode=require"

# API
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

3. **Instale as dependências e configure o banco**
```bash
# Instala todas as dependências
npm run setup

# Ou manualmente:
npm install
cd backend && npm install && cd ..
npx prisma db push
```

4. **Inicie o desenvolvimento**
```bash
# Inicia frontend + backend simultaneamente
npm run dev:all

# Ou separadamente:
npm run dev          # Frontend (porta 3000)
npm run dev:api      # Backend (porta 3001)
```

5. **Acesse o projeto**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- WebSocket: ws://localhost:3001/ws
- Health check: http://localhost:3001/health

## 📁 Estrutura do Projeto

```
projeto-01/
├── backend/               # API Hono + Prisma
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── routes/        # Rotas da API
│   │   ├── middleware/    # Auth, Error, Logger
│   │   ├── websocket/     # WebSocket server
│   │   └── lib/           # Prisma client, utils
│   └── package.json
│
├── prisma/
│   └── schema.prisma      # Schema do banco
│
├── components/            # Componentes React
├── src/
│   ├── lib/
│   │   ├── api.ts         # Cliente API (axios)
│   │   ├── hooks.ts       # React Query hooks
│   │   ├── websocket.ts   # Cliente WebSocket
│   │   └── types.ts       # TypeScript types
│   └── utils/
│
├── scripts/
│   ├── migrate-data.ts    # Migração do Convex
│   └── verify-migration.ts
│
└── docs/                  # Documentação
```

## 🔧 Scripts Disponíveis

```bash
# Frontend
npm run dev              # Inicia o Vite
npm run build            # Build de produção
npm run preview          # Preview do build

# Backend
npm run dev:api          # Inicia API com hot reload
npm run dev:all          # Frontend + Backend juntos

# Database
npm run db:generate      # Gera Prisma Client
npm run db:push          # Sync schema → database
npm run db:migrate       # Cria migration
npm run db:studio        # Abre Prisma Studio

# Setup
npm run setup            # Instala tudo e gera Prisma
```

## 📚 API Endpoints

### Autenticação
Todas as rotas `/api/*` requerem Bearer token do Clerk.

### Users
- `POST /api/users/sync` - Sincronizar usuário
- `GET /api/users/me` - Usuário atual
- `GET /api/users/organizations` - Organizações do usuário

### Events
- `GET /api/events?organizationId=X` - Listar eventos
- `GET /api/events/:id` - Detalhes do evento
- `GET /api/events/public/:shareCode` - Evento público
- `POST /api/events` - Criar evento
- `PATCH /api/events/:id` - Atualizar
- `DELETE /api/events/:id` - Soft delete

### Attendance
- `GET /api/events/:id/attendance` - Lista de confirmações
- `POST /api/events/:id/attendance` - Confirmar presença
- `PATCH /api/attendance/:id/checkin` - Fazer check-in

### Suggestions
- `GET /api/events/:id/suggestions` - Listar sugestões
- `POST /api/events/:id/suggestions` - Criar sugestão
- `POST /api/suggestions/:id/vote` - Votar

### Polls
- `GET /api/events/:id/polls` - Listar enquetes
- `GET /api/events/:id/polls/active` - Enquete ativa
- `POST /api/events/:id/polls` - Criar enquete
- `POST /api/polls/:id/vote` - Votar

### WebSocket Events
```typescript
// Cliente → Servidor
{ event: 'join:event', data: { eventId } }
{ event: 'leave:event', data: { eventId } }

// Servidor → Cliente
{ event: 'suggestion:new', data: { ... } }
{ event: 'suggestion:vote', data: { suggestionId, votesCount } }
{ event: 'poll:activated', data: { ... } }
{ event: 'poll:vote', data: { ... } }
```

## 🔒 Segurança

- JWT validation via Clerk
- CORS configurado por ambiente
- Soft deletes para auditoria
- Rate limiting (configurável)
- Validação Zod em todas as rotas

## 📊 Limites do Plano Free (Neon)

| Recurso | Limite |
|---------|--------|
| CU-hours | 100/mês |
| Storage | 0.5 GB |
| Bandwidth | 5 GB/mês |
| Branches | 10 |

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 👥 Equipe

**Luan Oliveira dos Santos** - Criador e desenvolvedor principal
- GitHub: [@in100tiva](https://github.com/in100tiva)

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/in100tiva">Luan Oliveira dos Santos</a>
</p>

<p align="center">
  ⭐ Se este projeto te ajudou, considere dar uma estrela!
</p>
