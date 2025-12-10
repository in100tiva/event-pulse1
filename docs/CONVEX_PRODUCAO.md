# 🔄 Convex: Desenvolvimento vs Produção

## 📌 Como Funciona

O Convex tem **2 ambientes separados**:

### 🔵 **Desenvolvimento** (Dev)
- Para testar localmente no seu computador
- URL termina com: `.convex.cloud`
- Exemplo: `https://happy-animal-123.convex.cloud`

### 🟢 **Produção** (Prod)
- Para o site público na Vercel
- URL **diferente** do desenvolvimento
- Exemplo: `https://super-cat-456.convex.cloud`

---

## ✅ PASSO A PASSO: Configurar Produção

### 1️⃣ Criar Deployment de Produção no Convex

Abra o terminal no diretório do projeto:

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
```

#### Opção A: Criar deployment de produção (Recomendado)

```powershell
npx convex deploy --prod
```

Ou simplesmente:

```powershell
npx convex deploy
```

**O que acontece:**
- Cria um novo deployment de **produção**
- Mostra a URL de produção no terminal
- Faz upload de todas as suas funções Convex

**Você verá algo assim:**
```
✔ Deployed!
  
Production deployment URL:
https://super-cat-456.convex.cloud

Add this to your .env.production or Vercel environment variables:
VITE_CONVEX_URL=https://super-cat-456.convex.cloud
```

**IMPORTANTE:** Copie essa URL! Você vai precisar dela na Vercel.

---

### 2️⃣ Obter URL de Produção no Dashboard (Alternativa)

Se preferir usar o dashboard:

1. Vá para: https://dashboard.convex.dev
2. Clique no seu projeto
3. No topo, você verá **2 abas**:
   - **Dev** (desenvolvimento)
   - **Prod** (produção)
4. Clique em **Prod**
5. Copie a **Deployment URL** que aparece

---

### 3️⃣ Adicionar URL de Produção na Vercel

Agora que você tem a URL de produção:

1. Vá para: https://vercel.com/dashboard
2. Clique no projeto **event-pulse1**
3. **Settings** → **Environment Variables**
4. Adicione:
   - **Nome:** `VITE_CONVEX_URL`
   - **Valor:** Cole a URL de **PRODUÇÃO** do Convex
   - **Environments:** Selecione **APENAS Production** (ou Production + Preview)
   - ⚠️ **NÃO** selecione Development
5. Clique em **Save**

---

## 🔐 PASSO 4: Configurar Clerk para Produção

### 1️⃣ Adicionar domínio da Vercel no Clerk

1. Vá para: https://dashboard.clerk.com
2. Selecione seu projeto
3. No menu lateral: **Domains**
4. Clique em **Add domain**
5. Adicione o domínio da Vercel:
   - Para produção: `event-pulse1.vercel.app` (ou seu domínio customizado)
   - Para preview: `*.vercel.app` (permite todos os previews)

### 2️⃣ Obter chave de produção do Clerk

1. No Clerk, vá em **API Keys**
2. Você verá:
   - **Development** (para local)
   - **Production** (para Vercel)
3. Copie a **Publishable Key** de **Production** (começa com `pk_live_...`)

### 3️⃣ Adicionar no Vercel

1. Vercel → Seu projeto → Settings → Environment Variables
2. Adicione:
   - **Nome:** `VITE_CLERK_PUBLISHABLE_KEY`
   - **Valor:** A chave `pk_live_...` do Clerk
   - **Environments:** Selecione **Production** (e Preview se quiser)

---

## 📊 Resumo: Variáveis para cada Ambiente

### 🔵 Para Desenvolvimento Local (.env.local)
```env
VITE_CONVEX_URL=https://seu-dev.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 🟢 Para Produção (Vercel Environment Variables)
```env
VITE_CONVEX_URL=https://seu-prod.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## 🚀 COMANDOS RÁPIDOS

### Copie e cole no PowerShell:

```powershell
# 1. Navegar para o projeto
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"

# 2. Fazer deploy de produção no Convex
npx convex deploy

# 3. Copie a URL que aparecer!
```

---

## ✅ Checklist Final

- [ ] Executei `npx convex deploy` e copiei a URL de produção
- [ ] Adicionei `VITE_CONVEX_URL` (produção) na Vercel
- [ ] Adicionei o domínio da Vercel no Clerk
- [ ] Copiei a chave `pk_live_...` do Clerk
- [ ] Adicionei `VITE_CLERK_PUBLISHABLE_KEY` na Vercel
- [ ] Fiz um novo deploy na Vercel

---

## 🔍 Como Verificar se Está Funcionando

Após configurar tudo:

1. Acesse seu site na Vercel: `https://event-pulse1.vercel.app`
2. Abra o Console do navegador (F12)
3. Procure por erros
4. Tente fazer login
5. Tente criar um evento

Se aparecer erro, me envie a mensagem de erro!

---

## ❓ Perguntas Frequentes

### Q: Preciso ter 2 projetos separados no Convex?
**R:** Não! É o mesmo projeto, mas com 2 deployments (dev e prod).

### Q: Os dados de dev e prod são compartilhados?
**R:** Não! Cada ambiente tem seu próprio banco de dados. Isso é bom para testar sem afetar produção.

### Q: Posso usar a mesma URL de dev na produção?
**R:** Tecnicamente sim, mas **NÃO recomendado**! Seus testes locais vão afetar o site público.

### Q: E se eu mudar o código Convex?
**R:** 
- Para dev: Execute `npx convex dev` (atualiza automaticamente)
- Para prod: Execute `npx convex deploy` (atualiza produção)

---

## 🎯 Próximo Passo

Execute este comando agora:

```powershell
npx convex deploy
```

E me envie a URL que aparecer para eu te ajudar a configurar na Vercel! 🚀
