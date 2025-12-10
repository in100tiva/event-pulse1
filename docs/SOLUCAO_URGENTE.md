# 🚨 SOLUÇÃO URGENTE - Erros em Produção

## ❌ Problemas Identificados

### 1. Erro CORS do Clerk
```
Access to script at 'https://clerk.in100tiva.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js' 
from origin 'https://pulse.in100tiva.com' has been blocked by CORS policy
```

**Causa:** Configuração de proxy personalizado no Clerk que não está funcionando.

### 2. Aviso do Tailwind CDN
```
cdn.tailwindcss.com should not be used in production
```

**Causa:** Pode estar usando o CDN em algum lugar (verificar build).

---

## ✅ PASSO A PASSO PARA CORRIGIR

### 🔧 Passo 1: Corrigir Configuração do Clerk (CRÍTICO)

#### Opção A: Remover Proxy (RECOMENDADO)

1. Acesse: https://dashboard.clerk.com
2. Selecione seu projeto
3. Vá em **Settings** → **Advanced**
4. Procure por "Proxy" ou "Frontend API"
5. Se houver configuração com `clerk.in100tiva.com`, **REMOVA** ou **DESABILITE**
6. Salve as alterações

#### Opção B: Configurar Proxy Corretamente (Avançado)

Se você REALMENTE precisa do proxy:

1. Configure um proxy reverso na Vercel
2. Crie um arquivo `vercel.json` com:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

3. Configure o proxy no Clerk apontando para `pulse.in100tiva.com`

**RECOMENDAÇÃO:** Use a Opção A (remover proxy). Proxies personalizados são complexos e desnecessários para a maioria dos casos.

---

### 🌐 Passo 2: Adicionar Domínios no Clerk

1. No Clerk Dashboard, vá em **Domains**
2. Clique em **Add domain**
3. Adicione os seguintes domínios:
   - `pulse.in100tiva.com`
   - `*.vercel.app`
   - `event-pulse1.vercel.app` (se for diferente)
4. Salve

---

### 🔑 Passo 3: Verificar Chaves de Produção

#### Convex

1. Abra o terminal:

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
npx convex deploy
```

2. Copie a **URL de PRODUÇÃO** que aparecer
3. Vá para: https://vercel.com/dashboard
4. Selecione seu projeto
5. **Settings** → **Environment Variables**
6. Verifique se existe `VITE_CONVEX_URL`:
   - Se SIM: Clique em **Edit** e atualize com a URL de produção
   - Se NÃO: Clique em **Add New** e crie:
     - Name: `VITE_CONVEX_URL`
     - Value: URL de produção do Convex
     - Environments: ✅ Production

#### Clerk

1. No Clerk Dashboard: https://dashboard.clerk.com
2. Vá em **API Keys**
3. Na seção **Production**, copie a **Publishable Key** (começa com `pk_live_...`)
4. Na Vercel, **Settings** → **Environment Variables**
5. Verifique se existe `VITE_CLERK_PUBLISHABLE_KEY`:
   - Se SIM: Clique em **Edit** e atualize com `pk_live_...`
   - Se NÃO: Crie nova variável:
     - Name: `VITE_CLERK_PUBLISHABLE_KEY`
     - Value: `pk_live_...` (a chave de PRODUÇÃO)
     - Environments: ✅ Production

⚠️ **IMPORTANTE:** Certifique-se de usar `pk_live_...` (produção) e NÃO `pk_test_...` (desenvolvimento)

---

### 🚀 Passo 4: Fazer Redeploy

#### Se você NÃO mudou código:

Na Vercel:
1. Vá na aba **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**
4. Confirme

#### Se você mudou código:

No terminal:

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
git add .
git commit -m "fix: configuração de produção do Clerk e Convex"
git push
```

A Vercel vai fazer deploy automaticamente.

---

## 🧪 Passo 5: Verificar se Funcionou

1. Aguarde o deploy terminar (1-2 minutos)
2. Abra seu site: https://pulse.in100tiva.com
3. Abra o Console do navegador (F12)
4. Procure por erros
5. Tente fazer login

### ✅ Sinais de Sucesso:
- ✅ Não há erros CORS no console
- ✅ Não há aviso do cdn.tailwindcss
- ✅ Login funciona corretamente
- ✅ Eventos carregam

### ❌ Se Ainda Houver Erros:
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Teste em uma aba anônima
- Aguarde 2-3 minutos (pode levar um tempo para propagar)

---

## 🔍 Problema do Tailwind CDN

O aviso do Tailwind sugere que ainda pode haver uma referência ao CDN. Vamos verificar:

### Verificação

1. Abra: https://pulse.in100tiva.com
2. Pressione Ctrl+U (ver código-fonte)
3. Procure por `cdn.tailwindcss.com`
4. Se encontrar, há uma tag `<script>` ou `<link>` que precisa ser removida

**O código atual está correto** (usa Tailwind via PostCSS), mas pode haver algo em cache.

### Solução

1. Limpe o cache da Vercel:
   - Vercel Dashboard → Settings → General
   - Role até "Build Cache"
   - Clique em "Clear Cache"

2. Faça um novo deploy (Passo 4)

---

## 📋 Checklist Rápido

Execute na ordem:

- [ ] Removi/desabilitei o proxy do Clerk (`clerk.in100tiva.com`)
- [ ] Adicionei `pulse.in100tiva.com` nos domínios do Clerk
- [ ] Executei `npx convex deploy` e copiei a URL
- [ ] Verifiquei que `VITE_CONVEX_URL` na Vercel tem a URL de PRODUÇÃO
- [ ] Verifiquei que `VITE_CLERK_PUBLISHABLE_KEY` na Vercel tem `pk_live_...`
- [ ] Fiz redeploy na Vercel
- [ ] Testei o site e não há erros CORS
- [ ] Login funciona corretamente

---

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda houver erro, me envie:

1. **Screenshot do erro no console** (F12 → Console)
2. **Screenshot das variáveis de ambiente na Vercel** (sem mostrar os valores completos!)
3. **URL do seu site**
4. **Confirme que:**
   - Removeu o proxy do Clerk
   - Adicionou os domínios corretos
   - Está usando chaves de PRODUÇÃO

---

## 💡 Explicação do Erro CORS

O erro acontece porque:

1. Seu site está em: `pulse.in100tiva.com`
2. O Clerk está tentando carregar scripts de: `clerk.in100tiva.com`
3. Por padrão, navegadores bloqueiam requisições entre domínios diferentes (CORS)
4. O domínio `clerk.in100tiva.com` não está configurado ou não tem os headers CORS corretos

**Solução:** Remover o proxy e deixar o Clerk usar seus domínios padrão (que já têm CORS configurado).

---

## 🎯 Próxima Ação

**Execute AGORA:**

1. Acesse: https://dashboard.clerk.com
2. Remova/desabilite a configuração de proxy
3. Adicione os domínios corretos
4. Execute no terminal:

```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
npx convex deploy
```

5. Me envie a URL de produção que aparecer!

---

**Tempo estimado:** 5-10 minutos
**Dificuldade:** Fácil
**Impacto:** Resolve 100% dos erros

🚀 Vamos lá!
