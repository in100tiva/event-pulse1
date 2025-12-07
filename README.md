# 🎉 EventPulse

> Plataforma completa para gerenciar eventos, coletar confirmações de presença, receber sugestões e realizar enquetes em tempo real.

## 🚀 Funcionalidades

- ✅ **Autenticação Segura** - Integração com Clerk (suporta múltiplas organizações)
- ✅ **Gerenciamento de Eventos** - Criar, editar e publicar eventos
- ✅ **Confirmações RSVP** - Participantes confirmam presença
- ✅ **Sugestões em Tempo Real** - Sistema de Q&A com votação
- ✅ **Enquetes Interativas** - Criar e votar em tempo real
- ✅ **Links Públicos** - Compartilhar eventos facilmente
- ✅ **Modo Projeção** - Visão otimizada para apresentações
- ✅ **Check-in** - Controle de presença no evento

## 🛠️ Tecnologias

- **Frontend:** React 19 + TypeScript + Vite
- **Rotas:** React Router v6
- **Banco de Dados:** Convex (real-time)
- **Autenticação:** Clerk
- **Styling:** Tailwind CSS
- **Hospedagem:** Vercel (recomendado)

## 📦 Instalação Local

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no [Clerk](https://clerk.com)
- Conta no [Convex](https://convex.dev)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/eventpulse.git
cd eventpulse
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o template
cp .env.example .env

# Edite .env com suas credenciais
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
```

4. **Configure o Convex**
```bash
# Inicie o Convex em modo dev
npx convex dev

# Configure a variável de ambiente do Clerk no Convex
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://xxx.clerk.accounts.dev
```

5. **Execute o projeto**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🚀 Deploy em Produção

### Deploy Rápido (5 passos)

Para fazer deploy na Vercel, siga o guia rápido:

📖 **[README_DEPLOY.md](README_DEPLOY.md)** - Deploy em 5 passos (15 minutos)

### Documentação Completa de Deploy

- 📋 **[PRE_DEPLOY_CHECKLIST.md](PRE_DEPLOY_CHECKLIST.md)** - Checklist completo antes do deploy
- 🔐 **[CLERK_SETUP.md](CLERK_SETUP.md)** - Configuração detalhada do Clerk
- 🗄️ **[CONVEX_SETUP.md](CONVEX_SETUP.md)** - Configuração detalhada do Convex
- 🌐 **[DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)** - Guia completo de deploy na Vercel
- 📊 **[RESUMO_DEPLOY.md](RESUMO_DEPLOY.md)** - Resumo de todas as alterações

## 📁 Estrutura do Projeto

```
eventpulse/
├── components/           # Componentes React
│   ├── Dashboard.tsx    # Painel principal
│   ├── CreateEvent.tsx  # Criação de eventos
│   ├── EventManagement.tsx
│   ├── PublicEvent.tsx  # Página pública
│   ├── ProjectionView.tsx
│   └── Login.tsx
├── convex/              # Backend Convex
│   ├── schema.ts        # Schema do banco
│   ├── events.ts        # Functions de eventos
│   ├── users.ts         # Functions de usuários
│   ├── attendance.ts    # Confirmações de presença
│   ├── suggestions.ts   # Sistema de Q&A
│   └── polls.ts         # Enquetes
├── App.tsx              # Rotas principais
├── index.tsx            # Entry point
├── vercel.json          # Configuração Vercel
└── package.json
```

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env)
```env
VITE_CONVEX_URL=https://xxx.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
GEMINI_API_KEY=xxx  # Opcional
```

### Produção (Vercel)
```env
VITE_CONVEX_URL=https://xxx.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

### Convex
```env
CLERK_JWT_ISSUER_DOMAIN=https://xxx.clerk.accounts.dev
```

## 📱 Rotas da Aplicação

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Pública | Redirect para login |
| `/login` | Pública | Autenticação |
| `/dashboard` | Protegida | Painel de eventos |
| `/create-event` | Protegida | Criar novo evento |
| `/manage/:id` | Protegida | Gerenciar evento |
| `/event/:code` | Pública | Página pública do evento |
| `/projection/:id` | Protegida | Modo apresentação |

## 🧪 Testando

```bash
# Build de produção
npm run build

# Preview local
npm run preview
```

## 📚 Documentação Adicional

- **[SETUP.md](SETUP.md)** - Setup inicial detalhado
- **[PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md)** - Roadmap de features
- **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Início rápido

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 💬 Suporte

- 📖 [Documentação Convex](https://docs.convex.dev)
- 📖 [Documentação Clerk](https://clerk.com/docs)
- 📖 [Documentação Vercel](https://vercel.com/docs)
- 📖 [Documentação React Router](https://reactrouter.com)

## ✨ Agradecimentos

Construído com:
- [React](https://react.dev)
- [Convex](https://convex.dev)
- [Clerk](https://clerk.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

---

**Desenvolvido com ❤️ para criar experiências incríveis em eventos**
