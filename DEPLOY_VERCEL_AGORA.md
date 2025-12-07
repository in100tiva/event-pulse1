# 🚀 Deploy na Vercel - Passo a Passo

## ✅ Problema Resolvido
Removi a configuração de secrets do `vercel.json`. Agora você precisa adicionar as variáveis de ambiente diretamente no painel da Vercel.

---

## 📋 PASSO 1: Fazer Commit e Push

```powershell
git add vercel.json
git commit -m "fix: remove secrets config do vercel.json"
git push
```

---

## 📋 PASSO 2: Adicionar Variáveis de Ambiente na Vercel

### 1️⃣ Acesse as configurações do projeto
1. Vá para: https://vercel.com/dashboard
2. Clique no seu projeto **event-pulse1**
3. Clique em **Settings** (no menu superior)
4. No menu lateral, clique em **Environment Variables**

### 2️⃣ Adicione VITE_CONVEX_URL

**⚠️ IMPORTANTE:** Você precisa da URL de **PRODUÇÃO** do Convex (não a de desenvolvimento)!

#### Como obter a URL de produção:

Execute no terminal:
```powershell
npx convex deploy
```

Isso criará um deployment de **produção** e mostrará a URL.

**📖 Para mais detalhes, veja:** `CONVEX_PRODUCAO.md`

#### Adicione na Vercel:
- **Nome:** `VITE_CONVEX_URL`
- **Valor:** Cole a URL do Convex (ex: `https://seu-projeto.convex.cloud`)
- **Environments:** Selecione **Production**, **Preview** e **Development** (todos)
- Clique em **Save**

### 3️⃣ Adicione VITE_CLERK_PUBLISHABLE_KEY

**IMPORTANTE:** Você precisa da chave pública do Clerk. Para obter:

1. Vá para: https://dashboard.clerk.com
2. Selecione seu projeto
3. No menu lateral, clique em **API Keys**
4. Copie a **Publishable Key** (começa com `pk_test_...` ou `pk_live_...`)

#### Adicione na Vercel:
- **Nome:** `VITE_CLERK_PUBLISHABLE_KEY`
- **Valor:** Cole a chave pública do Clerk
- **Environments:** Selecione **Production**, **Preview** e **Development** (todos)
- Clique em **Save**

---

## 📋 PASSO 3: Fazer o Deploy

### Opção A: Deploy Automático (Recomendado)
Quando você fizer push para o GitHub, a Vercel fará o deploy automaticamente!

```powershell
# Se ainda não fez:
git add vercel.json
git commit -m "fix: remove secrets config do vercel.json"
git push
```

### Opção B: Deploy Manual
1. No dashboard da Vercel
2. Clique no seu projeto
3. Clique em **Deployments**
4. Clique em **Redeploy** no último deployment

---

## ✅ Verificar se Funcionou

Após o deploy:
1. Acesse a URL do seu projeto (algo como `event-pulse1.vercel.app`)
2. Verifique se a aplicação carrega sem erros
3. Abra o Console do navegador (F12) e verifique se não há erros de autenticação

---

## 🔧 Se Ainda Der Erro

### Erro: "Missing Convex URL"
- Verifique se adicionou a variável `VITE_CONVEX_URL` corretamente
- Certifique-se de que a URL termina com `.convex.cloud`
- Faça um novo deploy

### Erro: "Clerk not initialized"
- Verifique se adicionou a variável `VITE_CLERK_PUBLISHABLE_KEY`
- Certifique-se de que copiou a chave correta (não a Secret Key!)
- Faça um novo deploy

### Erro de Build
Se o build falhar, verifique os logs na Vercel:
1. Clique no deployment que falhou
2. Leia os logs de erro
3. Me envie o erro para eu ajudar

---

## 📝 Resumo Rápido

```powershell
# 1. Commit e push
git add vercel.json
git commit -m "fix: remove secrets config do vercel.json"
git push

# 2. Vá para https://vercel.com/dashboard
#    → Seu projeto → Settings → Environment Variables
#    → Adicione VITE_CONVEX_URL
#    → Adicione VITE_CLERK_PUBLISHABLE_KEY

# 3. A Vercel fará o deploy automaticamente!
```

---

## ❓ Não Tem as URLs/Chaves?

Se você não tem as URLs do Convex ou chaves do Clerk configuradas, avise que eu te ajudo a configurar esses serviços primeiro!
