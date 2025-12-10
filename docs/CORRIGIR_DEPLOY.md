# 🔧 Como Corrigir o Deploy na Vercel

## ✅ Correções Aplicadas

As seguintes correções foram aplicadas no código:

### 1. Tailwind CSS
- ❌ **Antes:** CDN do Tailwind (não funciona em produção)
- ✅ **Depois:** Tailwind instalado como dependência via PostCSS

### 2. Props do Clerk
- ❌ **Antes:** `afterSignInUrl` e `afterSignUpUrl` (depreciadas)
- ✅ **Depois:** `fallbackRedirectUrl` (nova prop recomendada)

### 3. Estrutura de CSS
- ✅ Criado `src/index.css` com as diretivas do Tailwind
- ✅ Criado `tailwind.config.js` com todas as cores customizadas
- ✅ Criado `postcss.config.js` para processar o Tailwind

---

## 🚀 Próximos Passos: Configurar Vercel

### Problema Atual
Seu deploy está usando **chaves de DESENVOLVIMENTO** do Clerk, não de **PRODUÇÃO**.

### 📋 Checklist de Configuração

#### 1️⃣ Configurar Convex para Produção

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
npx convex deploy
```

**Copie a URL de produção** que aparecer (exemplo: `https://xyz-123.convex.cloud`)

---

#### 2️⃣ Obter Chaves de Produção do Clerk

1. Acesse: https://dashboard.clerk.com
2. Selecione seu projeto
3. Vá em **API Keys**
4. Na seção **Production**:
   - Copie a **Publishable key** (começa com `pk_live_...`)
   
⚠️ **IMPORTANTE:** Não use a chave que começa com `pk_test_` - essa é de desenvolvimento!

---

#### 3️⃣ Adicionar Domínio da Vercel no Clerk

Ainda no dashboard do Clerk:

1. Vá em **Domains** no menu lateral
2. Clique em **Add domain**
3. Adicione:
   - `event-pulse1.vercel.app` (ou o domínio do seu projeto)
   - Ou adicione `*.vercel.app` para permitir todos os previews

---

#### 4️⃣ Configurar Variáveis de Ambiente na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto: **event-pulse1**
3. Vá em: **Settings** → **Environment Variables**
4. Adicione estas variáveis:

##### Variável 1: VITE_CONVEX_URL
- **Name:** `VITE_CONVEX_URL`
- **Value:** A URL de **produção** do Convex (passo 1)
- **Environments:** ✅ **Production** (e Preview se quiser)

##### Variável 2: VITE_CLERK_PUBLISHABLE_KEY
- **Name:** `VITE_CLERK_PUBLISHABLE_KEY`
- **Value:** A chave `pk_live_...` do Clerk (passo 2)
- **Environments:** ✅ **Production** (e Preview se quiser)

5. Clique em **Save** para cada variável

---

#### 5️⃣ Fazer Deploy das Correções

Agora vamos fazer o deploy do código corrigido:

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
git add .
git commit -m "fix: corrigir Tailwind CDN e props do Clerk para produção"
git push
```

A Vercel vai detectar o push e fazer o deploy automaticamente.

---

## 🔍 Como Verificar se Funcionou

Após o deploy:

1. Acesse seu site: https://event-pulse1.vercel.app
2. Abra o Console do navegador (F12)
3. Você **NÃO** deve mais ver os avisos:
   - ❌ "cdn.tailwindcss.com should not be used in production"
   - ❌ "Clerk has been loaded with development keys"
   - ❌ "The prop afterSignInUrl is deprecated"

4. Teste o login - deve funcionar corretamente agora!

---

## ❓ Perguntas Frequentes

### Q: Por que o Tailwind via CDN não funciona?
**R:** O CDN do Tailwind:
- Não otimiza o CSS (bundle fica muito grande)
- Não funciona bem com builds de produção
- Pode causar estilos "bugados" ou não aplicados

### Q: Por que preciso de chaves diferentes?
**R:** As chaves de desenvolvimento têm:
- Limites de uso muito baixos
- Não funcionam em domínios de produção
- Não têm as configurações de segurança corretas

### Q: Onde encontro a URL do meu deploy?
**R:** Na Vercel, na página do projeto, você verá:
- **Production:** `https://event-pulse1.vercel.app`
- **Latest Deploy:** Link direto para o último deploy

---

## 📊 Resumo das Variáveis

### 🔵 Desenvolvimento (Local)
Arquivo: `.env.local` na raiz do projeto

```env
VITE_CONVEX_URL=https://seu-dev.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 🟢 Produção (Vercel)
Configurado em: Vercel → Settings → Environment Variables

```env
VITE_CONVEX_URL=https://seu-prod.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## ✅ Checklist Final

- [ ] Executei `npx convex deploy` e copiei a URL de produção
- [ ] Obtive a chave `pk_live_...` do Clerk (não `pk_test_`)
- [ ] Adicionei o domínio da Vercel no Clerk
- [ ] Adicionei `VITE_CONVEX_URL` (produção) na Vercel
- [ ] Adicionei `VITE_CLERK_PUBLISHABLE_KEY` (produção) na Vercel
- [ ] Fiz commit e push das correções do código
- [ ] Verifiquei que o deploy foi concluído na Vercel
- [ ] Testei o site e não vejo mais os avisos no console

---

## 🆘 Ainda com Problemas?

Se após seguir todos os passos o login ainda estiver "bugado":

1. Limpe o cache do navegador
2. Teste em uma aba anônima
3. Verifique o console (F12) para ver se há outros erros
4. Verifique se as variáveis de ambiente na Vercel estão corretas
5. Aguarde 1-2 minutos após salvar as variáveis (pode demorar um pouco)

Se o problema persistir, me envie:
- URL do site
- Print dos erros no console
- Print das variáveis de ambiente na Vercel (sem mostrar os valores completos!)

---

**Boa sorte com o deploy! 🚀**
