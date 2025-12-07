# Guia de Configuração - EventPulse

## 🚀 Passos para Configurar o Projeto

### 1. Instalar Dependências

✅ **Já instalado!** As dependências foram instaladas com sucesso.

```bash
npm install  # Já executado
```

### 2. Configurar Clerk (Autenticação)

1. Acesse [clerk.com](https://clerk.com) e crie uma conta
2. Crie uma nova aplicação
3. Ative os providers de autenticação desejados (Google, GitHub, Email, etc.)
4. Vá em **JWT Templates** → **New template** → Selecione **Convex**
   - ⚠️ **IMPORTANTE**: Não renomeie o template! Mantenha o nome "Convex"
5. Copie o **Issuer URL** do template JWT

### 3. Configurar Convex (Backend)

1. Execute o comando para inicializar o Convex:

```bash
npx convex dev
```

2. Siga as instruções no terminal para:
   - Criar uma conta no Convex (se ainda não tiver)
   - Criar ou vincular um projeto

3. No dashboard do Convex:
   - Vá em **Settings** → **Environment Variables**
   - Adicione a variável:
     - `CLERK_JWT_ISSUER_DOMAIN` = [Cole o Issuer URL do Clerk]

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `.env` existente na raiz do projeto e adicione:

```env
# Convex URL (será gerado ao rodar npx convex dev)
VITE_CONVEX_URL=https://seu-projeto.convex.cloud

# Clerk Publishable Key (do dashboard do Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**IMPORTANTE**: O `VITE_CONVEX_URL` será gerado automaticamente quando você executar `npx convex dev` pela primeira vez.

### 5. Executar o Projeto

Execute em terminais separados:

**Terminal 1 - Convex (Backend):**
```bash
npx convex dev
```

**Terminal 2 - Vite (Frontend):**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📋 Checklist de Configuração

- [ ] Dependências instaladas (`npm install`)
- [ ] Conta criada no Clerk
- [ ] Aplicação criada no Clerk com providers configurados
- [ ] JWT Template "Convex" criado no Clerk
- [ ] Convex inicializado (`npx convex dev`)
- [ ] `CLERK_JWT_ISSUER_DOMAIN` configurado no Convex Dashboard
- [ ] Arquivo `.env` criado com as variáveis necessárias
- [ ] Projeto rodando (`npx convex dev` + `npm run dev`)

## 🔑 Onde Encontrar as Chaves

### Clerk Publishable Key
1. Acesse o dashboard do Clerk
2. Vá em **API Keys**
3. Copie a **Publishable Key**

### Clerk JWT Issuer Domain
1. No dashboard do Clerk, vá em **JWT Templates**
2. Clique no template "Convex"
3. Copie a URL completa do **Issuer**

### Convex URL
- Gerada automaticamente ao executar `npx convex dev`
- Também pode ser encontrada no dashboard do Convex

## 🎯 Funcionalidades Implementadas

✅ Autenticação com Clerk (Google, GitHub, Email)
✅ Gestão de organizações e usuários
✅ CRUD completo de eventos
✅ Confirmações de presença (RSVP)
✅ Sistema de sugestões com votação
✅ Enquetes em tempo real
✅ Atualizações em tempo real com Convex
✅ Eventos públicos acessíveis via link
✅ Moderação de sugestões (opcional)
✅ Sugestões anônimas (opcional)

## 🆘 Solução de Problemas

### Erro: "No CONVEX_DEPLOYMENT set"
- Execute `npx convex dev` em um terminal separado

### Erro: "Invalid JWT"
- Verifique se o `CLERK_JWT_ISSUER_DOMAIN` está correto no Convex Dashboard
- Certifique-se de que o JWT Template no Clerk se chama exatamente "Convex"

### Erro: "Organization not found"
- Certifique-se de ter criado pelo menos uma organização no Clerk
- Ou o código sincronizará automaticamente ao fazer login

## 📚 Próximos Passos

Após a configuração, você pode:

1. Fazer login no sistema
2. Criar seu primeiro evento
3. Compartilhar o link do evento com participantes
4. Gerenciar RSVPs, sugestões e enquetes em tempo real

## 🔗 Links Úteis

- [Documentação Clerk](https://clerk.com/docs)
- [Documentação Convex](https://docs.convex.dev)
- [Documentação React](https://react.dev)
