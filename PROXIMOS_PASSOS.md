# 🎯 Próximos Passos - EventPulse

## ✅ O que já foi feito

1. ✅ Dependências instaladas (`@clerk/clerk-react`, `convex`, etc.)
2. ✅ Arquivos do Convex criados (schema, auth, functions)
3. ✅ Componentes React atualizados com integração
4. ✅ Arquivo `convex.json` criado

## 🚀 O que você precisa fazer agora

### Passo 1: Configurar Convex

Execute no terminal:

```bash
npx convex dev
```

Este comando irá:
- Pedir para você fazer login no Convex (criar conta se necessário)
- Criar um novo projeto
- Gerar o arquivo `convex/_generated/` com os tipos TypeScript
- Gerar a URL do seu deployment (`VITE_CONVEX_URL`)

**IMPORTANTE**: Mantenha este comando rodando em um terminal separado!

### Passo 2: Configurar Clerk

1. Acesse [clerk.com](https://clerk.com) e crie uma conta
2. Crie uma nova aplicação
3. Ative os providers de autenticação (Google, GitHub, Email)
4. Vá em **JWT Templates** → **New template** → Selecione **Convex**
   - ⚠️ **NÃO renomeie!** Mantenha o nome "Convex"
5. Copie o **Issuer URL** (algo como `https://....clerk.accounts.dev`)

### Passo 3: Configurar Variáveis de Ambiente

1. No **Convex Dashboard**:
   - Vá em Settings → Environment Variables
   - Adicione: `CLERK_JWT_ISSUER_DOMAIN` = [Cole o Issuer URL do Clerk]

2. No arquivo **`.env`** (raiz do projeto):
   ```env
   # Copie a URL gerada pelo npx convex dev
   VITE_CONVEX_URL=https://seu-projeto.convex.cloud
   
   # Copie do dashboard do Clerk em API Keys
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

### Passo 4: Executar o Projeto

Em **dois terminais separados**:

**Terminal 1 - Convex (Backend):**
```bash
npx convex dev
```

**Terminal 2 - Vite (Frontend):**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔍 Verificação

Se tudo estiver correto, você verá:
- ✅ Terminal 1: Convex sincronizando em tempo real
- ✅ Terminal 2: Vite rodando sem erros
- ✅ Navegador: Tela de login do Clerk

## ❌ Erros Comuns

### "Failed to resolve import @clerk/clerk-react"
**Solução**: ✅ Já resolvido! As dependências foram instaladas corretamente.

### "Failed to resolve convex/_generated/api"
**Solução**: Execute `npx convex dev` - ele gera automaticamente estes arquivos.

### "Invalid JWT" ou "Authentication failed"
**Solução**: Verifique se:
1. O JWT Template no Clerk se chama exatamente "Convex"
2. O `CLERK_JWT_ISSUER_DOMAIN` está correto no Convex Dashboard
3. Você copiou o Issuer URL completo (incluindo https://)

## 📚 Documentação Completa

Para mais detalhes, consulte o arquivo `SETUP.md`

## 🆘 Precisa de Ajuda?

1. Verifique se todos os arquivos foram criados corretamente
2. Confirme se as variáveis de ambiente estão corretas
3. Reinicie ambos os servidores (Convex e Vite)
4. Limpe o cache: `npm run dev -- --force`

---

**🎉 Sucesso!** Após seguir estes passos, seu EventPulse estará funcionando com autenticação Clerk e backend Convex em tempo real!
