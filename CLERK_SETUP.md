# 🔐 Configuração do Clerk para Produção

## Passo a Passo Completo

### 1. Criar/Acessar Aplicação no Clerk

1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Selecione sua aplicação ou crie uma nova
3. Escolha "Production" mode

### 2. Configurar JWT Template para Convex

**Importante:** Isso é essencial para a integração Clerk + Convex funcionar!

1. No dashboard do Clerk, vá em: **JWT Templates** (menu lateral)
2. Clique em **New template**
3. Selecione **Convex** na lista de templates
4. Ou crie manualmente:
   - **Name:** `convex`
   - **Token lifetime:** 3600 segundos (1 hora)
   - **Claims:**
     ```json
     {
       "aud": "convex",
       "iss": "https://{{clerk_domain}}",
       "sub": "{{user.id}}"
     }
     ```
5. Clique em **Save**

### 3. Configurar Domínios Autorizados

#### No Clerk Dashboard:

1. Vá em **Domains** (menu lateral)
2. Clique em **Add domain**
3. Adicione seus domínios:
   - Desenvolvimento: `http://localhost:3000`
   - Produção: `https://seu-app.vercel.app`

#### Configurar Redirect URLs:

1. Vá em **Paths** (menu lateral)
2. Configure as URLs de redirecionamento:
   - **Sign-in URL:** `/login`
   - **Sign-up URL:** `/login`
   - **After sign-in:** `/dashboard`
   - **After sign-up:** `/dashboard`
   - **Home URL:** `/`

### 4. Obter Chaves de API

#### Para Desenvolvimento:
```bash
# Essas já devem estar no seu .env local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

#### Para Produção:
```bash
# Use estas na Vercel
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

**Como encontrar:**
1. No dashboard do Clerk
2. Vá em **API Keys** (menu lateral)
3. Copie a **Publishable key** apropriada

### 5. Configurar Organizações (Importante!)

O EventPulse usa organizações do Clerk:

1. Vá em **Organizations** (menu lateral)
2. Ative **Enable Organizations**
3. Configure:
   - ✅ Allow users to create organizations
   - ✅ Allow users to delete organizations
   - ✅ Default role: Admin

### 6. Personalizar (Opcional)

#### Customizar UI:
1. Vá em **Customization** > **Theme**
2. Ajuste cores para combinar com o EventPulse:
   - **Primary color:** `#13ec5b`
   - **Background:** `#102216`

#### Configurar Métodos de Login:
1. Vá em **User & Authentication** > **Email, Phone, Username**
2. Configure os métodos desejados:
   - ✅ Email address
   - ✅ Google OAuth (recomendado)
   - ✅ GitHub OAuth (recomendado)

### 7. Configurar Webhooks (Opcional, mas recomendado)

Para sincronizar dados automaticamente:

1. Vá em **Webhooks**
2. Clique em **Add Endpoint**
3. URL: `https://seu-app.vercel.app/api/webhooks/clerk`
4. Eventos a escutar:
   - `user.created`
   - `user.updated`
   - `organization.created`
   - `organization.updated`
   - `organizationMembership.created`

### 8. Testar Configuração

Antes de fazer deploy:

```bash
# Teste localmente com as chaves de desenvolvimento
npm run dev
```

Verifique:
- ✅ Login funciona
- ✅ Seleção de organização funciona
- ✅ Dashboard carrega corretamente
- ✅ Criação de eventos funciona

### 9. Configurar no Convex

No arquivo `convex/auth.config.ts`, certifique-se que está assim:

```typescript
export default {
  providers: [
    {
      domain: "https://seu-dominio.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

**Como encontrar seu domínio Clerk:**
1. No dashboard do Clerk
2. Vá em **API Keys**
3. Procure por "Issuer URL" ou "Domain"
4. Será algo como: `https://xxx.clerk.accounts.dev`

### 10. Deploy Final

Após configurar tudo:

```bash
# 1. Deploy do Convex
npx convex deploy --prod

# 2. Deploy na Vercel
vercel --prod
```

## ✅ Checklist Final

- [ ] JWT Template "convex" criado
- [ ] Domínios autorizados configurados
- [ ] Redirect URLs configurados
- [ ] Organizações ativadas
- [ ] Chaves de API copiadas
- [ ] Variáveis de ambiente na Vercel configuradas
- [ ] Testado localmente
- [ ] Deploy realizado
- [ ] Testado em produção

## 🆘 Troubleshooting

### Erro: "Invalid token"
- Verifique se o JWT Template "convex" está criado
- Confirme que o domínio no auth.config.ts está correto

### Erro: "Organization not found"
- Ative Organizations no Clerk
- Aguarde alguns minutos para sincronização

### Erro: "Redirect URI mismatch"
- Adicione todos os domínios em Domains
- Configure as Redirect URLs corretamente

## 📚 Documentação Oficial

- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [Clerk Organizations](https://clerk.com/docs/organizations/overview)
- [Clerk JWT Templates](https://clerk.com/docs/backend-requests/making/jwt-templates)

---

**Tudo configurado?** Agora é só fazer o deploy! 🚀
