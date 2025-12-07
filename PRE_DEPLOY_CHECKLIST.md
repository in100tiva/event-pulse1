# ✅ Checklist Pré-Deploy - EventPulse

Use este checklist para garantir que está tudo pronto antes de fazer o deploy.

## 🔍 Verificação Local

### 1. Dependências
```bash
npm install
```
- [ ] Todas as dependências instaladas sem erros
- [ ] Nenhum warning crítico

### 2. Variáveis de Ambiente Local
```bash
# Verifique se existe .env com:
cat .env
```
- [ ] `VITE_CONVEX_URL` está definido
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` está definido
- [ ] URLs são de desenvolvimento (`pk_test_` para Clerk)

### 3. Convex Local
```bash
npx convex dev
```
- [ ] Convex está rodando sem erros
- [ ] Schema foi aplicado com sucesso
- [ ] Functions foram deployed

### 4. Aplicação Local
```bash
npm run dev
```
- [ ] App abre em `http://localhost:3000`
- [ ] Não há erros no console
- [ ] Login funciona
- [ ] Dashboard carrega

### 5. Teste Completo Local
- [ ] Consigo fazer login
- [ ] Vejo a página do Dashboard
- [ ] Consigo criar uma organização (se necessário)
- [ ] Consigo criar um evento
- [ ] Evento aparece no Dashboard
- [ ] Consigo acessar link público do evento
- [ ] Consigo confirmar presença no evento
- [ ] Consigo criar sugestão

### 6. Build de Produção
```bash
npm run build
npm run preview
```
- [ ] Build completa sem erros
- [ ] Preview abre em `http://localhost:4173`
- [ ] Todas as rotas funcionam no preview
- [ ] Não há erros 404

---

## 🔐 Configuração do Clerk

### 1. Conta e Projeto
- [ ] Conta criada em [clerk.com](https://clerk.com)
- [ ] Projeto criado
- [ ] Modo Production ativo (se for deploy final)

### 2. JWT Template
- [ ] Template "convex" criado
- [ ] applicationID está como "convex"
- [ ] Claims básicas configuradas

### 3. Domínios
- [ ] `http://localhost:3000` adicionado (dev)
- [ ] Domínio Vercel será adicionado após deploy

### 4. Organizations
- [ ] Organizations estão ativadas
- [ ] Usuários podem criar organizations
- [ ] Default role configurado

### 5. Chaves de API
- [ ] Publishable Key de desenvolvimento copiada
- [ ] Publishable Key de produção copiada (para Vercel)
- [ ] Domain/Issuer URL anotado (para Convex)

**Clerk Issuer Domain:** `_____________________________`

---

## 🗄️ Configuração do Convex

### 1. Conta e Projeto
- [ ] Conta criada em [convex.dev](https://convex.dev)
- [ ] Projeto criado
- [ ] Nome do projeto anotado

### 2. Variável de Ambiente
```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://xxx.clerk.accounts.dev
```
- [ ] Variável configurada para desenvolvimento
- [ ] Domínio do Clerk correto

### 3. Development Deploy
```bash
npx convex dev
```
- [ ] Schema deployed
- [ ] Tabelas criadas (users, organizations, events, etc)
- [ ] Functions disponíveis

### 4. Production Deploy
```bash
npx convex deploy --prod
```
- [ ] Deploy de produção executado
- [ ] URL de produção recebida
- [ ] URL anotada

**Convex Production URL:** `_____________________________`

### 5. Variável de Ambiente Produção
```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://xxx.clerk.accounts.dev --prod
```
- [ ] Variável configurada para produção

---

## 📦 Git e Repositório

### 1. Repositório
```bash
git init
git add .
git commit -m "feat: setup para deploy"
```
- [ ] Git inicializado
- [ ] Arquivos commitados
- [ ] `.env` está no `.gitignore` (não deve aparecer no git)

### 2. GitHub/GitLab/Bitbucket
```bash
git remote add origin https://github.com/seu-usuario/eventpulse.git
git push -u origin main
```
- [ ] Repositório remoto criado
- [ ] Código enviado
- [ ] Último commit visível no GitHub

---

## 🚀 Vercel

### 1. Conta
- [ ] Conta criada em [vercel.com](https://vercel.com)
- [ ] Login funcionando

### 2. Preparação
- [ ] Repositório conectado ao GitHub/GitLab
- [ ] `vercel.json` existe na raiz do projeto
- [ ] `package.json` tem script "vercel-build"

### 3. Variáveis de Ambiente Prontas
Anote aqui as variáveis que você vai usar:

```
VITE_CONVEX_URL=_____________________________
VITE_CLERK_PUBLISHABLE_KEY=_____________________________
```

---

## 🎯 Pronto para Deploy?

Se você marcou **TODOS** os itens acima, está pronto! ✅

### Deploy Agora:

**Via Interface:**
1. Vá para [vercel.com/new](https://vercel.com/new)
2. Importe o repositório
3. Configure as variáveis de ambiente
4. Clique em **Deploy**

**Via CLI:**
```bash
npm i -g vercel
vercel login
vercel
```

---

## 📋 Pós-Deploy

Após o deploy na Vercel, você receberá uma URL. Anote aqui:

**URL da Vercel:** `_____________________________`

### Finalize a Configuração:

#### 1. Atualizar Clerk
- [ ] Adicionar URL da Vercel em **Domains**
- [ ] Adicionar redirect URLs com domínio Vercel

#### 2. Atualizar Convex
- [ ] Adicionar URL da Vercel em **Settings > URL Configuration**

#### 3. Testar Produção
- [ ] Acessar URL da Vercel
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Criar evento funciona
- [ ] Link público funciona
- [ ] Nenhum erro no console

---

## 🆘 Problemas Comuns

### ❌ Build falhou na Vercel
- Rode `npm run build` localmente primeiro
- Verifique se `vercel.json` está correto
- Verifique logs no dashboard da Vercel

### ❌ Erro 404 em rotas
- Confirme que `vercel.json` existe
- Verifique se está usando `BrowserRouter` (não `HashRouter`)

### ❌ Erro de autenticação
- Verifique variáveis de ambiente na Vercel
- Confirme JWT Template no Clerk
- Verifique domínio autorizado no Clerk

### ❌ Erro de CORS
- Adicione domínio Vercel no Convex
- Aguarde alguns minutos para propagação

---

## 📞 Recursos de Ajuda

- 📖 **Guia Rápido:** `README_DEPLOY.md`
- 📖 **Guia Completo:** `DEPLOY_VERCEL.md`
- 📖 **Setup Clerk:** `CLERK_SETUP.md`
- 📖 **Setup Convex:** `CONVEX_SETUP.md`
- 📖 **Resumo:** `RESUMO_DEPLOY.md`

---

## ✨ Após Deploy Bem-Sucedido

Parabéns! 🎉 Seu EventPulse está no ar!

Próximos passos:
- [ ] Compartilhe a URL com usuários de teste
- [ ] Configure domínio customizado (opcional)
- [ ] Configure analytics (opcional)
- [ ] Configure monitoring de erros (opcional)

**URL do seu EventPulse:** `_____________________________`

---

**Boa sorte com o deploy! 🚀**
