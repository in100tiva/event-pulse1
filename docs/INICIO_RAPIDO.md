# 🚀 Início Rápido - EventPulse

## ✅ Status Atual

- ✅ Dependências instaladas
- ✅ Código atualizado com Clerk e Convex
- ✅ Arquivo `convex.json` criado
- ⚠️ **Falta**: Configuração inicial do Convex e Clerk

---

## 📋 Execute estes comandos (PASSO A PASSO)

### 1️⃣ Inicializar Convex (FAÇA ISSO PRIMEIRO)

Abra um terminal e execute:

```bash
npx convex dev
```

**O que vai acontecer:**
1. Você será perguntado se quer fazer login ou criar conta
2. Escolha uma opção e siga as instruções no terminal
3. Você será perguntado se quer criar um novo projeto → **Responda SIM**
4. O Convex vai gerar uma URL tipo: `https://xxxxxx.convex.cloud`
5. **COPIE esta URL** - você vai precisar dela!

**IMPORTANTE**: 
- Mantenha este terminal aberto e rodando!
- Quando você ver "Watching for file changes..." significa que funcionou! ✅

---

### 2️⃣ Configurar Clerk

1. Acesse: https://clerk.com
2. Crie uma conta (ou faça login)
3. Clique em **"Create application"**
4. Escolha um nome (ex: EventPulse)
5. Selecione os métodos de login: **Google**, **GitHub**, **Email**
6. Clique em **Create application**

**Configurar JWT:**
1. No menu lateral, vá em: **JWT Templates**
2. Clique em **New template**
3. Selecione: **Convex**
4. ⚠️ **NÃO MUDE O NOME!** Deixe como "Convex"
5. Copie o **Issuer** (algo como: `https://xxxxx.clerk.accounts.dev`)

**Pegar as chaves:**
1. No menu lateral, vá em: **API Keys**
2. Copie a **Publishable Key** (começa com `pk_test_...`)

---

### 3️⃣ Configurar Variáveis de Ambiente

#### A) No Convex Dashboard:
1. Abra: https://dashboard.convex.dev
2. Selecione seu projeto
3. Vá em: **Settings** → **Environment Variables**
4. Clique em **Add**:
   - **Name**: `CLERK_JWT_ISSUER_DOMAIN`
   - **Value**: [Cole o Issuer do Clerk que você copiou]
5. Salve

#### B) No arquivo `.env` (raiz do projeto):

Edite o arquivo `.env` e adicione:

```env
# Cole a URL do Convex que foi gerada no Passo 1
VITE_CONVEX_URL=https://xxxxx.convex.cloud

# Cole a Publishable Key do Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Exemplo:**
```env
VITE_CONVEX_URL=https://merry-jaguar-123.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k
```

---

### 4️⃣ Iniciar o Frontend

Abra um **SEGUNDO terminal** (o primeiro ainda está rodando o Convex) e execute:

```bash
npm run dev
```

---

## 🎉 Pronto!

Se tudo estiver correto:

1. **Terminal 1** mostra: "Watching for file changes..." ✅
2. **Terminal 2** mostra: "Local: http://localhost:3000/" ✅
3. **Navegador** (http://localhost:3000): Tela de login do Clerk ✅

---

## ❌ Problemas Comuns

### "convex/server not found"
**Causa**: convex.json estava faltando
**Solução**: ✅ Já foi recriado!

### "Failed to resolve @clerk/clerk-react"
**Causa**: Versão incorreta no package.json
**Solução**: ✅ Já foi corrigida!

### "Invalid JWT" após login
**Causa**: Configuração incorreta no Convex ou Clerk
**Solução**: Verifique se:
1. O JWT Template no Clerk se chama exatamente **"Convex"**
2. O `CLERK_JWT_ISSUER_DOMAIN` está correto no Convex Dashboard
3. Você copiou o Issuer **completo** (incluindo https://)

### "Cannot find module '../convex/_generated/api'"
**Causa**: Convex não gerou os arquivos ainda
**Solução**: 
1. Certifique-se que `npx convex dev` está rodando
2. Aguarde alguns segundos para ele gerar os arquivos
3. Se não funcionar, pare (Ctrl+C) e rode novamente

---

## 🔍 Verificação Final

Execute este checklist:

- [ ] Terminal 1 rodando `npx convex dev` (sem erros)
- [ ] Pasta `convex/_generated` foi criada
- [ ] Arquivo `.env` tem `VITE_CONVEX_URL` e `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_JWT_ISSUER_DOMAIN` configurado no Convex Dashboard
- [ ] JWT Template "Convex" criado no Clerk
- [ ] Terminal 2 rodando `npm run dev` (sem erros)
- [ ] http://localhost:3000 abre a tela de login

---

## 📞 Ainda com Problemas?

Se após seguir todos os passos ainda houver erros:

1. **Pare ambos os terminais** (Ctrl+C em cada um)
2. **Limpe o cache**:
   ```bash
   npx convex dev --clear-cache
   ```
3. **Reinicie tudo**:
   - Terminal 1: `npx convex dev`
   - Terminal 2: `npm run dev`

---

**💡 Dica**: Mantenha os dois terminais visíveis para ver os logs em tempo real!
