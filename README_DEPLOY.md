# 🚀 Deploy Rápido - EventPulse na Vercel

## 📋 Checklist Pré-Deploy

- [ ] Convex configurado e funcionando localmente
- [ ] Clerk configurado e funcionando localmente
- [ ] Código testado localmente
- [ ] Conta na Vercel criada
- [ ] Repositório Git criado (GitHub/GitLab/Bitbucket)

## ⚡ Deploy em 5 Passos

### 1️⃣ Deploy do Convex em Produção

```bash
npx convex deploy --prod
```

✅ Copie a URL do deployment (será algo como: `https://xxx.convex.cloud`)

### 2️⃣ Configure o Clerk para Produção

1. Acesse: [dashboard.clerk.com](https://dashboard.clerk.com)
2. Pegue sua **Publishable Key** de produção
3. Em **JWT Templates**, configure o template `convex`

### 3️⃣ Push para o Git (se ainda não fez)

```bash
git init
git add .
git commit -m "feat: setup para deploy na Vercel"
git branch -M main
git remote add origin https://github.com/seu-usuario/eventpulse.git
git push -u origin main
```

### 4️⃣ Deploy na Vercel

**Via Interface Web:**

1. Acesse: [vercel.com/new](https://vercel.com/new)
2. Importe seu repositório
3. Configure as variáveis:
   - `VITE_CONVEX_URL` = (URL do Convex)
   - `VITE_CLERK_PUBLISHABLE_KEY` = (Chave do Clerk)
4. Clique em **Deploy**

**Via CLI:**

```bash
npm i -g vercel
vercel login
vercel
```

### 5️⃣ Configure URLs Autorizadas

**No Clerk:**
- Adicione `https://seu-app.vercel.app` em **Domains**

**No Convex:**
- Adicione `https://seu-app.vercel.app` nas origens permitidas

## 🎉 Pronto!

Seu EventPulse está no ar! Acesse: `https://seu-app.vercel.app`

## 🔧 Variáveis de Ambiente Necessárias

```env
VITE_CONVEX_URL=https://xxx.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

## 📱 Testando o Deploy

1. ✅ Acesse a URL
2. ✅ Faça login
3. ✅ Crie um evento
4. ✅ Teste o link público do evento

## ⚠️ Problemas Comuns

| Problema | Solução |
|----------|---------|
| 404 nas rotas | Verifique se `vercel.json` existe |
| Erro de auth | Confira variáveis de ambiente |
| CORS | Adicione domínio nas origens do Convex |

## 📚 Documentação Completa

Para mais detalhes, veja: `DEPLOY_VERCEL.md`

---

**Dúvidas?** Confira a documentação oficial:
- [Vercel Docs](https://vercel.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Convex Docs](https://docs.convex.dev)
