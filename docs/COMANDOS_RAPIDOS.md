# ⚡ Comandos Rápidos para Deploy

## ✅ Correções Aplicadas

Todas as correções técnicas já foram aplicadas! Agora você só precisa:
1. Configurar variáveis de ambiente na Vercel
2. Fazer commit e push

---

## 📋 Passo 1: Deploy de Produção no Convex

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
npx convex deploy
```

**📝 Copie a URL que aparecer!** Exemplo: `https://xyz-123.convex.cloud`

---

## 🔐 Passo 2: Obter Chave de Produção do Clerk

1. Acesse: https://dashboard.clerk.com
2. Selecione seu projeto
3. **API Keys** → Seção **Production**
4. Copie a chave que começa com `pk_live_...`

⚠️ **NÃO use** a chave `pk_test_` - essa é de desenvolvimento!

---

## 🌐 Passo 3: Adicionar Domínio no Clerk

No dashboard do Clerk:
1. **Domains** → **Add domain**
2. Adicione: `event-pulse1.vercel.app` (ou seu domínio)

---

## 🔧 Passo 4: Configurar Vercel

1. Acesse: https://vercel.com/dashboard
2. Seu projeto → **Settings** → **Environment Variables**
3. Adicione estas 2 variáveis:

### Variável 1: VITE_CONVEX_URL
- **Name:** `VITE_CONVEX_URL`
- **Value:** (Cole a URL do Passo 1)
- **Environments:** ✅ Production

### Variável 2: VITE_CLERK_PUBLISHABLE_KEY
- **Name:** `VITE_CLERK_PUBLISHABLE_KEY`
- **Value:** (Cole a chave `pk_live_...` do Passo 2)
- **Environments:** ✅ Production

---

## 🚀 Passo 5: Deploy!

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
git add .
git commit -m "fix: corrigir Tailwind CDN e Clerk para produção"
git push
```

A Vercel vai detectar o push e fazer o deploy automaticamente! 🎉

---

## ✅ Verificar se Funcionou

1. Acesse: https://event-pulse1.vercel.app
2. Abra o Console (F12)
3. Você **NÃO** deve mais ver:
   - ❌ "cdn.tailwindcss.com should not be used in production"
   - ❌ "Clerk has been loaded with development keys"
   - ❌ "The prop afterSignInUrl is deprecated"

---

## 📚 Mais Detalhes

Para instruções mais detalhadas, veja: `CORRIGIR_DEPLOY.md`
