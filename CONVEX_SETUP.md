# 🗄️ Configuração do Convex para Produção

## Passo a Passo Completo

### 1. Criar Conta e Projeto no Convex

1. Acesse [dashboard.convex.dev](https://dashboard.convex.dev)
2. Faça login (pode usar GitHub)
3. Clique em **Create a project**
4. Nome do projeto: `eventpulse` (ou o nome que preferir)

### 2. Configurar Variáveis de Ambiente no Convex

O Convex precisa conhecer o domínio do Clerk:

```bash
# Configurar localmente (desenvolvimento)
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://seu-dominio.clerk.accounts.dev

# Configurar em produção
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://seu-dominio.clerk.accounts.dev --prod
```

**Como encontrar seu CLERK_JWT_ISSUER_DOMAIN:**
1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Vá em **API Keys**
3. Procure por "Issuer" ou copie de "Frontend API"
4. Será algo como: `https://xxx-yyy.clerk.accounts.dev`

### 3. Deploy do Schema e Functions

#### Desenvolvimento:
```bash
npx convex dev
```

Isso vai:
- ✅ Criar as tabelas definidas em `schema.ts`
- ✅ Fazer deploy das functions
- ✅ Sincronizar em tempo real

#### Produção:
```bash
npx convex deploy --prod
```

Isso vai:
- ✅ Criar deployment de produção
- ✅ Gerar URL de produção
- ✅ Fazer deploy de todas as functions

### 4. Configurar Domínios Permitidos (CORS)

**Importante:** Para que o frontend acesse o backend:

1. No [Dashboard do Convex](https://dashboard.convex.dev)
2. Selecione seu projeto
3. Vá em **Settings** > **URL Configuration**
4. Adicione os domínios:
   - Desenvolvimento: `http://localhost:3000`
   - Produção: `https://seu-app.vercel.app`

### 5. Obter URL do Deployment

Após `npx convex deploy --prod`, você receberá:

```
✔ Deployment complete!
  URL: https://xxx.convex.cloud
```

**Copie essa URL!** Você vai usá-la em:
- `.env` local: `VITE_CONVEX_URL=https://xxx.convex.cloud`
- Vercel: variável de ambiente `VITE_CONVEX_URL`

### 6. Verificar Functions Deployed

No Dashboard do Convex:

1. Vá em **Functions**
2. Confirme que todas estão listadas:
   - ✅ `events:create`
   - ✅ `events:getByOrganization`
   - ✅ `events:getByShareCode`
   - ✅ `users:syncUser`
   - ✅ `users:syncOrganization`
   - ✅ `attendance:confirm`
   - ✅ `suggestions:create`
   - ✅ `polls:create`

### 7. Verificar Schema

No Dashboard do Convex:

1. Vá em **Data**
2. Confirme que as tabelas existem:
   - ✅ `users`
   - ✅ `organizations`
   - ✅ `organizationUsers`
   - ✅ `events`
   - ✅ `attendanceConfirmations`
   - ✅ `suggestions`
   - ✅ `polls`
   - ✅ `pollOptions`

### 8. Testar Functions Localmente

Você pode testar functions direto no dashboard:

1. Vá em **Functions**
2. Selecione uma function (ex: `events:getByOrganization`)
3. Clique em **Run**
4. Insira argumentos de teste
5. Veja o resultado

### 9. Monitoramento e Logs

#### Ver Logs em Tempo Real:
```bash
npx convex logs --prod
```

#### No Dashboard:
1. Vá em **Logs**
2. Filtre por:
   - Function name
   - Status (success/error)
   - Time range

### 10. Backups (Recomendado)

1. Vá em **Data**
2. Clique em **Export**
3. Salve um backup inicial

## 🔧 Comandos Úteis

```bash
# Ver status do deployment
npx convex deploy --dry-run --prod

# Ver environment variables
npx convex env list
npx convex env list --prod

# Limpar e redeployar
npx convex deploy --prod --yes

# Ver logs
npx convex logs
npx convex logs --prod

# Executar uma function
npx convex run events:getByOrganization '{"organizationId":"xxx"}'
```

## 📊 Estrutura de Dados

### Tabelas Principais:

```
users
├── clerkId (string)
├── email (string)
├── firstName (string, optional)
├── lastName (string, optional)
└── avatarUrl (string, optional)

organizations
├── name (string)
└── clerkId (string)

events
├── organizationId (Id<"organizations">)
├── title (string)
├── description (string, optional)
├── startDateTime (number)
├── status (string: rascunho|publicado|ao_vivo|encerrado)
├── shareLinkCode (string)
└── ... (outros campos)
```

## ⚙️ Configuração de Autenticação

O arquivo `convex/auth.config.ts` já está configurado:

```typescript
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

**Certifique-se de configurar `CLERK_JWT_ISSUER_DOMAIN` antes do deploy!**

## ✅ Checklist de Deploy

- [ ] Conta Convex criada
- [ ] Projeto criado
- [ ] `CLERK_JWT_ISSUER_DOMAIN` configurado
- [ ] Schema deployed (`npx convex dev`)
- [ ] Deploy de produção feito (`npx convex deploy --prod`)
- [ ] URL de produção copiada
- [ ] Domínios CORS configurados
- [ ] Functions verificadas
- [ ] Backup inicial criado
- [ ] Testado com dados reais

## 🆘 Troubleshooting

### Erro: "Authentication failed"
```bash
# Verifique a variável de ambiente
npx convex env list --prod

# Se não existir, configure:
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://xxx.clerk.accounts.dev --prod
```

### Erro: "Function not found"
```bash
# Faça deploy novamente
npx convex deploy --prod --yes
```

### Erro: "CORS policy"
- Adicione o domínio em Settings > URL Configuration
- Aguarde alguns minutos para propagação

### Erro: "Invalid organizationId"
- Verifique se a organização foi sincronizada
- Confirme que o usuário está vinculado à organização

## 📈 Limites e Performance

### Plano Free (Hobby):
- ✅ 10,000 leituras/dia
- ✅ 10,000 escritas/dia
- ✅ 1GB storage
- ✅ Perfeito para começar!

### Upgrade quando necessário:
- Plano Pro: $25/mês
- Mais requests, storage e features

## 📚 Documentação Oficial

- [Convex Docs](https://docs.convex.dev)
- [Convex + Clerk](https://docs.convex.dev/auth/clerk)
- [Convex CLI](https://docs.convex.dev/cli)
- [Convex React](https://docs.convex.dev/client/react)

---

**Convex configurado?** Próximo passo: Deploy na Vercel! 🚀
