# ⚡ Comandos Rápidos para Deploy

## 🎯 Deploy Completo em Sequência

Execute estes comandos na ordem para fazer deploy completo:

### 1️⃣ Configurar Convex Produção
```bash
# Configure o domínio do Clerk no Convex
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://seu-dominio.clerk.accounts.dev --prod

# Faça deploy do backend
npx convex deploy --prod
```

**Copie a URL retornada!** Exemplo: `https://xxx.convex.cloud`

---

### 2️⃣ Preparar Git (se ainda não fez)
```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "feat: configuração para deploy na Vercel"

# Criar branch main
git branch -M main

# Adicionar repositório remoto (GitHub/GitLab)
git remote add origin https://github.com/seu-usuario/eventpulse.git

# Enviar para o repositório
git push -u origin main
```

---

### 3️⃣ Deploy na Vercel (via CLI)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

**Durante o processo, configure:**
- Projeto: `eventpulse` (ou seu nome)
- Framework: `vite`
- Build Command: `npm run build`
- Output Directory: `dist`

**Adicione as variáveis de ambiente quando solicitado:**
```bash
vercel env add VITE_CONVEX_URL production
# Cole: https://xxx.convex.cloud

vercel env add VITE_CLERK_PUBLISHABLE_KEY production
# Cole: pk_live_xxx (sua chave de produção do Clerk)
```

---

### 4️⃣ Deploy Final
```bash
# Deploy para produção
vercel --prod
```

**Copie a URL retornada!** Exemplo: `https://eventpulse.vercel.app`

---

## 🔧 Comandos de Manutenção

### Atualizar Deployment

```bash
# 1. Atualizar código
git add .
git commit -m "feat: nova funcionalidade"
git push

# 2. A Vercel fará deploy automático!
# Ou force um redeploy:
vercel --prod
```

### Ver Logs

```bash
# Logs da Vercel
vercel logs

# Logs do Convex
npx convex logs --prod

# Logs em tempo real
npx convex logs --prod --follow
```

### Gerenciar Variáveis de Ambiente

```bash
# Listar variáveis (Vercel)
vercel env ls

# Adicionar variável (Vercel)
vercel env add NOME_VARIAVEL production

# Remover variável (Vercel)
vercel env rm NOME_VARIAVEL production

# Listar variáveis (Convex)
npx convex env list --prod

# Adicionar variável (Convex)
npx convex env set NOME_VARIAVEL valor --prod
```

### Rollback

```bash
# Ver deployments anteriores
vercel ls

# Fazer rollback para um deployment específico
vercel rollback [deployment-url]
```

---

## 🧪 Comandos de Teste

### Teste Local Antes do Deploy

```bash
# 1. Build de produção
npm run build

# 2. Preview local
npm run preview

# 3. Abrir no navegador
# http://localhost:4173
```

### Teste de Funções Convex

```bash
# Executar uma função específica
npx convex run events:getByOrganization '{"organizationId":"xxx"}' --prod

# Ver schema atual
npx convex dashboard --prod
```

---

## 📊 Comandos de Monitoramento

```bash
# Status do projeto Vercel
vercel inspect

# Analytics da Vercel
vercel logs --follow

# Dashboard Convex
npx convex dashboard --prod

# Verificar domínios configurados
vercel domains ls
```

---

## 🔄 Comandos de Desenvolvimento

```bash
# Modo desenvolvimento local
npm run dev

# Convex em modo dev
npx convex dev

# Rodar ambos simultaneamente (em terminais separados)
# Terminal 1:
npx convex dev

# Terminal 2:
npm run dev
```

---

## 🆘 Comandos de Troubleshooting

### Limpar Cache

```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Limpar build
rm -rf dist
npm run build
```

### Reset Convex

```bash
# Limpar dados do Convex (CUIDADO!)
npx convex data clear --prod

# Redeployar schema
npx convex deploy --prod --yes
```

### Reset Vercel

```bash
# Remover projeto da Vercel
vercel rm eventpulse

# Criar novo deployment
vercel
```

---

## 📝 Template de Comandos para Copy/Paste

### Deploy Inicial Completo

```bash
# 1. Convex
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://seu-dominio.clerk.accounts.dev --prod
npx convex deploy --prod

# 2. Git
git add .
git commit -m "feat: setup para deploy"
git push

# 3. Vercel
npm i -g vercel
vercel login
vercel
vercel env add VITE_CONVEX_URL production
vercel env add VITE_CLERK_PUBLISHABLE_KEY production
vercel --prod
```

### Atualização de Código

```bash
# Simples - push automático
git add .
git commit -m "feat: sua mensagem"
git push

# Manual - com rebuild
git add .
git commit -m "feat: sua mensagem"
git push
vercel --prod
```

---

## 🎯 Comandos por Situação

### "Preciso fazer deploy pela primeira vez"
```bash
npx convex deploy --prod
vercel
vercel --prod
```

### "Mudei o código e quero atualizar"
```bash
git add .
git commit -m "feat: mudança"
git push
# Deploy automático na Vercel!
```

### "Mudei functions do Convex"
```bash
npx convex deploy --prod
```

### "Preciso adicionar variável de ambiente"
```bash
vercel env add NOME_VAR production
# Cole o valor quando solicitado
```

### "Quero ver logs de erros"
```bash
vercel logs
npx convex logs --prod
```

### "Quero voltar para versão anterior"
```bash
vercel ls
vercel rollback [url-do-deployment-anterior]
```

---

## 🔗 Links Úteis

- [Dashboard Vercel](https://vercel.com/dashboard)
- [Dashboard Convex](https://dashboard.convex.dev)
- [Dashboard Clerk](https://dashboard.clerk.com)

---

## 💡 Dicas Pro

### Alias para comandos frequentes

Adicione ao seu `.bashrc` ou `.zshrc`:

```bash
# Aliases EventPulse
alias ep-dev='npx convex dev & npm run dev'
alias ep-build='npm run build && npm run preview'
alias ep-deploy='git add . && git commit -m "deploy" && git push && vercel --prod'
alias ep-logs='vercel logs --follow'
alias ep-convex='npx convex dashboard --prod'
```

Depois use:
```bash
ep-deploy  # Deploy tudo de uma vez!
ep-logs    # Ver logs em tempo real
```

---

**Salve este arquivo para referência rápida! 📌**
