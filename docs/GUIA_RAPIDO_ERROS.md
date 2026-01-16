# 🚨 Guia Rápido: Como Resolver os Erros do Convex

## ⚡ Solução Rápida (Execute Estes Comandos)

### Passo 1: Parar Todos os Servidores

Se você tem o Vite ou Convex rodando, pare todos (Ctrl+C em cada terminal).

### Passo 2: Executar Comandos de Correção

Abra dois terminais separados:

**Terminal 1 - Convex:**
```bash
npm run convex:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Passo 3: Limpar o Cache do Navegador

1. Abra o DevTools (F12)
2. Vá em Application > Storage
3. Clique em "Clear site data"
4. Recarregue a página (F5)

---

## 🔍 O Que Foi Corrigido?

### 1. Backend (Convex)

✅ **Adicionado tratamento de erros robusto**
- Try-catch em todas as mutations
- Validação de dados de entrada
- Mensagens de erro claras

✅ **Validação de email obrigatória**
- Agora verifica se o email existe antes de salvar

✅ **Query getUserOrganizations mais segura**
- Retorna array vazio em caso de erro
- Não quebra a UI

### 2. Frontend (React)

✅ **Correção dos useEffect**
- Agora usa async/await corretamente
- Try-catch para capturar erros
- Dependências específicas (evita loops)

✅ **Validação antes de sincronizar**
- Verifica se o email existe antes de chamar syncUser
- Evita chamadas desnecessárias

---

## 📋 Checklist de Verificação

Execute este checklist para garantir que tudo está funcionando:

- [ ] **Convex está rodando?**
  ```bash
  npm run convex:dev
  ```
  Deve mostrar: `✓ Synced functions successfully`

- [ ] **Frontend está rodando?**
  ```bash
  npm run dev
  ```
  Deve mostrar: `VITE ... ready in ... ms`

- [ ] **Console do navegador está limpo?**
  - Abra DevTools (F12)
  - Vá na aba Console
  - Limpe (Ctrl+L)
  - Recarregue (F5)
  - Não deve mostrar erros vermelhos do Convex

- [ ] **Consegue fazer login?**
  - Acesse http://localhost:5173 (ou porta do Vite)
  - Faça login com Clerk
  - Deve redirecionar para o Dashboard

- [ ] **Dashboard carrega sem erros?**
  - Deve mostrar a lista de eventos ou mensagem de "Nenhum evento"
  - Não deve mostrar erros no console

---

## 🛠️ Troubleshooting

### Erro: "Email é obrigatório"

**Causa:** O Clerk não está retornando o email do usuário.

**Solução:**
1. Verifique se você está logado
2. Deslogue e logue novamente
3. Verifique as configurações do Clerk

```javascript
// No console do navegador:
console.log(user?.primaryEmailAddress?.emailAddress);
// Deve mostrar seu email
```

### Erro: "Usuário não encontrado"

**Causa:** O usuário ainda não foi sincronizado no Convex.

**Solução:**
1. Aguarde alguns segundos após o login
2. Recarregue a página
3. Se persistir, limpe o localStorage:

```javascript
// No console do navegador:
localStorage.clear();
location.reload();
```

### Erro: "Server Error" ainda aparece

**Solução Completa:**

```bash
# 1. Parar todos os servidores (Ctrl+C)

# 2. Limpar cache do Convex
npx convex dev --once

# 3. Reiniciar Convex
npm run convex:dev
```

Em outro terminal:
```bash
# 4. Reiniciar frontend
npm run dev
```

No navegador:
```javascript
// 5. Limpar dados do site
// DevTools > Application > Storage > Clear site data
// Depois recarregar (F5)
```

### Erro: "CLERK_JWT_ISSUER_DOMAIN not found"

**Causa:** Variáveis de ambiente não configuradas.

**Solução:**

1. Crie o arquivo `.env.local` na raiz do projeto:

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_seu_key_aqui

# Convex
VITE_CONVEX_URL=https://seu_projeto.convex.cloud
CONVEX_DEPLOY_KEY=seu_deploy_key_aqui
```

2. Configure no dashboard do Convex:
   - Acesse https://dashboard.convex.dev
   - Vá em Settings > Environment Variables
   - Adicione: `CLERK_JWT_ISSUER_DOMAIN=your-clerk-domain.clerk.accounts.dev`

3. Reinicie tudo

---

## 🎯 Validação Final

Execute este teste para confirmar que está tudo OK:

### Teste 1: Login e Sincronização

```javascript
// 1. Abra o console do navegador (F12)

// 2. Após fazer login, execute:
console.log('User ID:', user?.id);
console.log('Email:', user?.primaryEmailAddress?.emailAddress);
console.log('Organizations:', userOrganizations);

// Deve mostrar:
// User ID: user_xxx
// Email: seu@email.com
// Organizations: [...]
```

### Teste 2: Criar Evento

1. Vá em "Criar Evento"
2. Preencha os dados mínimos
3. Clique em "Salvar como Rascunho"
4. Deve salvar sem erros

### Teste 3: Dashboard

1. Vá para o Dashboard
2. Deve listar os eventos
3. Console deve estar limpo (sem erros vermelhos)

---

## 📞 Ainda com Problemas?

Se após seguir todos os passos acima você ainda tiver erros:

### 1. Capture os Logs

**Console do Navegador:**
- Abra DevTools (F12)
- Vá em Console
- Copie todos os erros vermelhos

**Terminal do Convex:**
- Copie a saída completa do terminal onde `npm run convex:dev` está rodando

**Terminal do Frontend:**
- Copie a saída do terminal onde `npm run dev` está rodando

### 2. Informações do Sistema

Execute no terminal:
```bash
node --version
npm --version
```

### 3. Verifique o Schema

Execute:
```bash
npx convex dev --once
```

Procure por mensagens de erro relacionadas ao schema.

---

## ✅ Resumo dos Arquivos Modificados

Se você quiser revisar as mudanças:

1. **`convex/users.ts`**
   - Adicionado try-catch em todas as functions
   - Validação de email
   - Mensagens de erro mais claras

2. **`components/Dashboard.tsx`**
   - useEffect corrigido com async/await
   - Validação antes de sincronizar
   - Dependências específicas

3. **`components/CreateEvent.tsx`**
   - useEffect corrigido com async/await
   - Validação antes de sincronizar
   - Dependências específicas

4. **`package.json`**
   - Adicionado scripts `convex:dev` e `convex:deploy`

---

## 📚 Documentação Adicional

- [Documentação Completa da Solução](./SOLUCAO_ERROS_CONVEX.md)
- [Configuração do Clerk](./CLERK_SETUP.md)
- [Teste de Organizações](./TESTE_ORGANIZACOES.md)

---

**Última atualização:** 16 de janeiro de 2026
