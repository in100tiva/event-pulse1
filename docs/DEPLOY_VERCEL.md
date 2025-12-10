# 🚀 Deploy na Vercel - EventPulse

## Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

1. **Conta na Vercel** - [vercel.com](https://vercel.com)
2. **Conta no Clerk** - [clerk.com](https://clerk.com)
3. **Deployment no Convex** - [convex.dev](https://convex.dev)

## Passo a Passo

### 1. Preparar o Convex

```bash
# Fazer deploy do Convex para produção
npx convex deploy --prod
```

Após o deploy, você receberá uma URL de deployment. Copie-a, pois será usada nas variáveis de ambiente.

### 2. Configurar o Clerk

1. Acesse o [Dashboard do Clerk](https://dashboard.clerk.com)
2. Selecione seu projeto ou crie um novo
3. Vá em **API Keys**
4. Copie a **Publishable Key** (começa com `pk_live_` para produção)
5. Em **JWT Templates**, crie um template para Convex:
   - Nome: `convex`
   - Claims: adicione os claims necessários para autenticação

### 3. Deploy na Vercel

#### Opção A: Via Interface Web (Recomendado)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe seu repositório do GitHub/GitLab/Bitbucket
3. Configure as variáveis de ambiente:
   - `VITE_CONVEX_URL`: URL do seu deployment Convex
   - `VITE_CLERK_PUBLISHABLE_KEY`: Chave pública do Clerk
   - `GEMINI_API_KEY`: (Opcional) Sua chave da API Gemini
4. Clique em **Deploy**

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add VITE_CONVEX_URL production
vercel env add VITE_CLERK_PUBLISHABLE_KEY production
vercel env add GEMINI_API_KEY production
```

### 4. Configurar URLs Autorizadas

#### No Clerk:

1. Vá em **Domains**
2. Adicione seu domínio Vercel: `https://seu-projeto.vercel.app`
3. Em **Redirect URLs**, adicione:
   - `https://seu-projeto.vercel.app/dashboard`
   - `https://seu-projeto.vercel.app/login`

#### No Convex:

1. Acesse o [Dashboard do Convex](https://dashboard.convex.dev)
2. Vá em **Settings** > **URL Configuration**
3. Adicione seu domínio Vercel à lista de origens permitidas

### 5. Testar o Deploy

Após o deploy:

1. Acesse sua URL da Vercel
2. Teste o fluxo de login
3. Crie um evento de teste
4. Verifique as funcionalidades principais

## Estrutura de Rotas

O projeto usa `BrowserRouter` com as seguintes rotas:

- `/` - Redireciona para `/login`
- `/login` - Página de autenticação
- `/dashboard` - Painel principal (protegido)
- `/create-event` - Criar novo evento (protegido)
- `/manage/:id` - Gerenciar evento (protegido)
- `/event/:code` - Página pública do evento
- `/projection/:id` - Visão de projeção (protegido)

## Configuração do vercel.json

O arquivo `vercel.json` está configurado para:

- ✅ Redirecionar todas as rotas para `index.html` (SPA)
- ✅ Cache otimizado para assets estáticos
- ✅ Configuração de variáveis de ambiente

## Troubleshooting

### Erro de Rotas (404)

Se você receber erros 404 ao navegar:
- Verifique se o `vercel.json` está na raiz do projeto
- Confirme que está usando `BrowserRouter` no `App.tsx`

### Erro de Autenticação

Se o login não funcionar:
- Verifique as variáveis de ambiente na Vercel
- Confirme que o domínio está autorizado no Clerk
- Verifique os logs do Convex

### Erro de CORS

Se houver erros de CORS:
- Adicione o domínio Vercel nas origens permitidas do Convex
- Verifique as configurações de domínio no Clerk

## Comandos Úteis

```bash
# Ver logs do deploy
vercel logs

# Ver status do projeto
vercel inspect

# Redeploy
vercel --prod

# Remover projeto
vercel rm nome-do-projeto
```

## Domínio Customizado (Opcional)

Para usar seu próprio domínio:

1. Na Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio customizado
3. Configure os registros DNS conforme indicado
4. Atualize as URLs autorizadas no Clerk e Convex

## Monitoramento

A Vercel oferece:
- 📊 Analytics integrado
- 🔍 Logs em tempo real
- ⚡ Métricas de performance
- 🔔 Notificações de deploy

Acesse em: [vercel.com/dashboard/analytics](https://vercel.com/dashboard/analytics)

## Suporte

- 📖 [Documentação Vercel](https://vercel.com/docs)
- 🔑 [Documentação Clerk](https://clerk.com/docs)
- 🗄️ [Documentação Convex](https://docs.convex.dev)

---

✅ **Seu EventPulse está pronto para produção!**
