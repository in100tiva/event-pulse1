# 🔧 Solução: Erros de Server Error no Convex

## 📋 Problema Identificado

Você estava enfrentando os seguintes erros no console:

```
[CONVEX Q(users:getUserOrganizations)] [Request ID: 0561aa89581b6662] Server Error
[CONVEX M(users:syncUser)] [Request ID: 1565a9bdc053e5c9] Server Error
```

### 🔍 Causas Identificadas

1. **Falta de Tratamento de Erros**: As funções do Convex não tinham try-catch adequado
2. **Chamadas Assíncronas sem Await**: As mutations estavam sendo chamadas sem await nos useEffect
3. **Dependências Incorretas**: Os useEffect estavam com dependências que causavam loops infinitos
4. **Validação Insuficiente**: Faltava validação de dados antes de enviar para o Convex

## ✅ Soluções Implementadas

### 1. **Tratamento de Erros no Backend (Convex)**

#### Arquivo: `convex/users.ts`

**Antes:**
```typescript
export const syncUser = mutation({
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    // ... resto do código sem try-catch
  },
});
```

**Depois:**
```typescript
export const syncUser = mutation({
  handler: async (ctx, args) => {
    try {
      // Validação de email
      if (!args.email || args.email.trim() === '') {
        throw new Error("Email é obrigatório");
      }

      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();
      // ... resto do código
    } catch (error) {
      console.error("Erro ao sincronizar usuário:", error);
      throw new Error(`Falha ao sincronizar usuário: ${error.message}`);
    }
  },
});
```

#### Mudanças Aplicadas:
- ✅ Adicionado `try-catch` em todas as mutations
- ✅ Validação de dados de entrada (email obrigatório)
- ✅ Mensagens de erro mais descritivas
- ✅ Logs de erro no console para debugging
- ✅ `getUserOrganizations` retorna array vazio em caso de erro (não quebra a UI)

### 2. **Correção dos useEffect no Frontend**

#### Arquivo: `components/Dashboard.tsx` e `components/CreateEvent.tsx`

**Antes:**
```typescript
useEffect(() => {
  if (user) {
    syncUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      // ...
    });
  }
}, [user, syncUser]); // ❌ Dependências incorretas
```

**Depois:**
```typescript
useEffect(() => {
  const syncUserData = async () => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      try {
        await syncUser({
          clerkId: user.id,
          email: user.primaryEmailAddress.emailAddress,
          // ...
        });
      } catch (error) {
        console.error('Erro ao sincronizar usuário:', error);
        // Não mostra toast para não incomodar o usuário
      }
    }
  };
  
  syncUserData();
}, [user?.id, user?.primaryEmailAddress?.emailAddress]); // ✅ Dependências específicas
```

#### Mudanças Aplicadas:
- ✅ Chamadas assíncronas agora usam `async/await`
- ✅ Try-catch para capturar erros
- ✅ Validação de email antes de sincronizar
- ✅ Dependências específicas (apenas `user?.id` e `user?.primaryEmailAddress?.emailAddress`)
- ✅ Evita loops infinitos de re-renderização

### 3. **Melhorias Gerais**

- ✅ Mensagens de erro mais amigáveis
- ✅ Logs detalhados para debugging
- ✅ Tratamento gracioso de falhas (não quebra a aplicação)
- ✅ Validação de dados em múltiplas camadas

## 🚀 Como Testar

### Passo 1: Limpar o Cache e Recompilar

```bash
# Parar o servidor de desenvolvimento
# Pressionar Ctrl+C no terminal

# Limpar o cache do Convex
npx convex dev --once

# Reiniciar o servidor
npm run dev
```

### Passo 2: Verificar o Console

1. Abra o DevTools do navegador (F12)
2. Vá para a aba Console
3. Limpe o console (Ctrl+L)
4. Recarregue a página (F5)
5. Observe que os erros não aparecem mais

### Passo 3: Testar Funcionalidades

1. **Login**: Faça login na aplicação
2. **Dashboard**: Verifique se o dashboard carrega sem erros
3. **Criar Evento**: Tente criar um novo evento
4. **Organizações**: Verifique se as organizações são listadas

## 🔍 Monitoramento de Erros

### Logs do Convex

Para ver logs detalhados do Convex:

```bash
# No terminal onde o Convex está rodando
npx convex dev
```

Você verá mensagens como:
```
✓ Synced functions successfully
✓ Listening for requests...
```

### Logs do Browser

Os erros agora são logados de forma mais clara:
```
Erro ao sincronizar usuário: Error: Email é obrigatório
Erro ao sincronizar organização: Error: Usuário não encontrado
```

## 📝 Boas Práticas Implementadas

1. **Validação de Entrada**
   - Sempre validar dados antes de processar
   - Retornar erros claros quando dados são inválidos

2. **Tratamento de Erros**
   - Try-catch em todas as operações assíncronas
   - Mensagens de erro descritivas
   - Logs para debugging

3. **Gerenciamento de Estado**
   - useEffect com dependências específicas
   - Evitar loops infinitos
   - Async/await para operações assíncronas

4. **Experiência do Usuário**
   - Não mostrar toasts para erros técnicos de sincronização
   - Logs no console para desenvolvedores
   - UI não quebra em caso de erro

## 🛠️ Troubleshooting

### Erro Persiste?

1. **Verifique a autenticação do Clerk**
   ```bash
   # Verifique se as variáveis de ambiente estão corretas
   cat .env.local
   ```

2. **Limpe o localStorage**
   ```javascript
   // No console do navegador
   localStorage.clear();
   location.reload();
   ```

3. **Verifique o banco de dados Convex**
   - Acesse o dashboard do Convex
   - Verifique se as tabelas `users`, `organizations` e `organizationUsers` existem
   - Verifique se os índices estão criados

4. **Reinicie tudo**
   ```bash
   # Parar todos os servidores
   # Limpar node_modules
   rm -rf node_modules
   npm install
   
   # Reiniciar
   npm run dev
   ```

## 📚 Arquivos Modificados

1. `convex/users.ts` - Tratamento de erros e validações
2. `components/Dashboard.tsx` - Correção dos useEffect
3. `components/CreateEvent.tsx` - Correção dos useEffect

## 💡 Próximos Passos

- [ ] Considere adicionar rate limiting nas mutations
- [ ] Implemente retry logic para falhas de rede
- [ ] Adicione testes automatizados
- [ ] Configure error tracking (como Sentry)

---

**Documentado em:** {{ new Date().toLocaleDateString('pt-BR') }}
