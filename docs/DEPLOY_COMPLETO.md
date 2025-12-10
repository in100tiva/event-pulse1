# 🚀 Deploy Completo - Checklist Definitivo

## 📋 O que você vai fazer:

1. ✅ Fazer deploy de **produção** no Convex
2. ✅ Configurar variáveis de ambiente na Vercel
3. ✅ Configurar Clerk para produção
4. ✅ Fazer deploy na Vercel

**Tempo estimado:** 10-15 minutos

---

## PASSO 1: Deploy do Convex (Produção)

### Execute no PowerShell:

```powershell
# Navegue para o projeto
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"

# Faça deploy de produção
npx convex deploy
```

### ✅ O que você verá:

```
✔ Deployed!
  
Production deployment URL:
https://super-cat-456.convex.cloud
```

### 📝 ANOTE ESSA URL!
Copie a URL que apareceu (você vai precisar dela no próximo passo).

---

## PASSO 2: Configurar Clerk para Produção

### 2.1 Adicionar domínio da Vercel

1. Vá para: https://dashboard.clerk.com
2. Clique no seu projeto
3. Menu lateral → **Domains**
4. Clique em **Add domain**
5. Adicione: `event-pulse1.vercel.app`
6. Se quiser permitir deploys de preview também, adicione: `*.vercel.app`

### 2.2 Obter chave de produção

1. No Clerk, vá em **API Keys**
2. Na seção **Production**, copie a **Publishable Key**
3. Deve começar com `pk_live_...`

### 📝 ANOTE ESSA CHAVE!

---

## PASSO 3: Adicionar Variáveis na Vercel

### 3.1 Acessar configurações

1. Vá para: https://vercel.com/dashboard
2. Clique no projeto **event-pulse1**
3. Clique em **Settings** (menu superior)
4. Menu lateral → **Environment Variables**

### 3.2 Adicionar VITE_CONVEX_URL

Clique em **Add Another**:
- **Name:** `VITE_CONVEX_URL`
- **Value:** Cole a URL de produção do Convex (do Passo 1)
- **Environments:** Selecione **Production** e **Preview**
- Clique em **Save**

### 3.3 Adicionar VITE_CLERK_PUBLISHABLE_KEY

Clique em **Add Another** novamente:
- **Name:** `VITE_CLERK_PUBLISHABLE_KEY`
- **Value:** Cole a chave `pk_live_...` do Clerk (do Passo 2)
- **Environments:** Selecione **Production** e **Preview**
- Clique em **Save**

---

## PASSO 4: Fazer Deploy na Vercel

### Opção A: Deploy Automático (Recomendado)

Se você já fez push para o GitHub, a Vercel vai fazer deploy automaticamente!

1. Vá para: https://vercel.com/dashboard
2. Clique no projeto
3. Vá em **Deployments**
4. Aguarde o deploy terminar (leva 1-3 minutos)

### Opção B: Forçar Novo Deploy

Se o deploy não iniciou automaticamente:

1. Vá para **Deployments**
2. Clique nos 3 pontinhos do último deployment
3. Clique em **Redeploy**
4. Confirme

---

## PASSO 5: Testar o Site

### 5.1 Acessar o site

Após o deploy terminar:
1. Clique no botão **Visit** no deployment
2. Ou acesse: `https://event-pulse1.vercel.app`

### 5.2 Verificar funcionamento

✅ **Checklist de testes:**
- [ ] O site carrega sem erros
- [ ] Botão de login aparece
- [ ] Consigo fazer login com Clerk
- [ ] Console do navegador (F12) não mostra erros de Convex
- [ ] Consigo criar um evento de teste

---

## 🎉 PRONTO!

Se tudo funcionou, seu site está no ar! 🚀

### URLs importantes:
- **Site:** https://event-pulse1.vercel.app
- **Dashboard Vercel:** https://vercel.com/dashboard
- **Dashboard Convex:** https://dashboard.convex.dev
- **Dashboard Clerk:** https://dashboard.clerk.com

---

## ❌ Se algo der errado

### Erro: "Failed to fetch"
**Solução:** Verifique se a URL do Convex está correta na Vercel.

### Erro: "Clerk is not loaded"
**Solução:** 
1. Verifique se adicionou o domínio da Vercel no Clerk
2. Verifique se a chave `pk_live_...` está correta

### Build falhou na Vercel
**Solução:** 
1. Vá em Deployments → clique no deployment que falhou
2. Clique em **View Build Logs**
3. Copie o erro e me envie

### Outros erros
Abra o Console do navegador (F12) e me envie os erros que aparecem!

---

## 📚 Guias Detalhados

Se precisar de mais informações:
- **Convex Produção:** Leia `CONVEX_PRODUCAO.md`
- **Deploy Vercel:** Leia `DEPLOY_VERCEL_AGORA.md`

---

## 🚀 Começar Agora

Copie e cole este comando:

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01" && npx convex deploy
```

Depois me envie a URL que aparecer! 🎯
