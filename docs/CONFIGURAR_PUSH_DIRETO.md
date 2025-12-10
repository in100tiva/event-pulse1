# 🔓 Como Configurar Push Direto nas Branches (Remover Proteção)

## 📋 Índice
1. [Opção 1: Remover Completamente a Proteção](#opção-1-remover-completamente-a-proteção)
2. [Opção 2: Permitir Push Direto para Administradores](#opção-2-permitir-push-direto-para-administradores)
3. [Opção 3: Adicionar Exceções Específicas](#opção-3-adicionar-exceções-específicas)
4. [Verificação Final](#verificação-final)

---

## ⚠️ Aviso Importante

**Remover a proteção de branches é arriscado!** 
- ❌ Você pode sobrescrever código acidentalmente
- ❌ Não haverá revisão de código automática
- ❌ Perde as vantagens de CI/CD

**Recomendação**: Use Pull Requests (veja `SOLUCAO_BRANCH_PROTEGIDA.md`)

---

## 🎯 Opção 1: Remover Completamente a Proteção

### Passo 1: Acesse as Configurações do Repositório

1. Abra seu navegador
2. Vá para: **https://github.com/in100tiva/event-pulse1**
3. Clique na aba **"Settings"** (Configurações) no topo
   - 📍 Fica ao lado de "Insights"
   - ⚠️ Se não vê essa aba, você não tem permissões de administrador

### Passo 2: Navegue até Branch Protection Rules

1. No menu lateral esquerdo, procure por **"Branches"**
   - Fica na seção "Code and automation"
2. Clique em **"Branches"**
3. Você verá a seção **"Branch protection rules"**

### Passo 3: Identifique as Regras de Proteção

Você verá uma lista de regras. Procure por:
- **main** (branch principal)
- Outras branches que estão protegidas

### Passo 4: Deletar a Regra de Proteção

Para cada branch que você quer desproteger:

1. Localize a regra (ex: **main**)
2. Do lado direito, clique no botão **"Delete"** (ícone de lixeira 🗑️)
3. Confirme clicando em **"Delete"** novamente no popup

✅ **Pronto!** A branch agora aceita pushes diretos.

---

## 🎯 Opção 2: Permitir Push Direto para Administradores

**Esta opção mantém a proteção, mas permite que administradores façam push direto**

### Passo 1-2: Igual à Opção 1
Siga os passos 1 e 2 da Opção 1 acima.

### Passo 3: Editar a Regra Existente

1. Ao invés de deletar, clique em **"Edit"** (ícone de lápis ✏️) ao lado da regra
2. Role a página até encontrar a seção:
   - **"Do not allow bypassing the above settings"**
   - **"Não permitir ignorar as configurações acima"**

### Passo 4: Desmarcar a Opção de Restrição

1. **DESMARQUE** o checkbox:
   - ☐ **"Do not allow bypassing the above settings"**
   
2. Ou marque:
   - ☑ **"Allow specified actors to bypass required pull requests"**
   - Adicione seu usuário na lista de exceções

### Passo 5: Salvar as Alterações

1. Role até o final da página
2. Clique no botão verde **"Save changes"**

✅ **Pronto!** Agora você pode fazer push direto sendo administrador.

---

## 🎯 Opção 3: Adicionar Exceções Específicas

**Mantém a proteção, mas permite push direto em situações específicas**

### Configuração Recomendada:

1. Acesse as configurações (passos 1-2 da Opção 1)
2. Clique em **"Edit"** na regra da branch main
3. Configure as seguintes opções:

#### ☐ Require a pull request before merging
**DESMARQUE** esta opção se quiser permitir pushes diretos

OU mantenha marcada e configure:

#### ☑ Allow specified actors to bypass
Adicione usuários/times que podem fazer bypass:
- Clique em **"Add"**
- Digite seu username: **in100tiva**
- Selecione seu usuário
- Clique em **"Add"**

#### Outras Configurações Úteis:

- ☐ **Require status checks to pass** - Desmarque se não usa CI/CD
- ☐ **Require branches to be up to date** - Desmarque para facilitar
- ☐ **Require conversation resolution** - Desmarque
- ☐ **Require signed commits** - Desmarque se não usa GPG

4. Clique em **"Save changes"**

---

## 🔍 Verificação Final

### Teste se funcionou:

```powershell
# Navegue até o projeto
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"

# Verifique a branch atual
git branch

# Se não estiver na main, mude para ela
git checkout main

# Faça um push de teste (crie um arquivo temporário)
echo "# Test" > test.txt
git add test.txt
git commit -m "test: verificando push direto"
git push origin main
```

### ✅ Se funcionou:
Você verá:
```
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Writing objects: 100% (3/3), 280 bytes | 280.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To https://github.com/in100tiva/event-pulse1.git
   abc1234..def5678  main -> main
```

### ❌ Se NÃO funcionou:
Você verá:
```
! [remote rejected] main -> main (push declined due to repository rule violations)
```

**Possíveis causas:**
1. A regra ainda está ativa - volte e delete completamente
2. Há outra regra (rulesets) ativa - veja a próxima seção
3. Você não é administrador do repositório

---

## 🔧 Rulesets (Novo Sistema de Proteção do GitHub)

O GitHub agora tem dois sistemas de proteção:
1. **Branch Protection Rules** (antigo)
2. **Rulesets** (novo)

Se você removeu a proteção mas ainda não funciona, verifique os Rulesets:

### Como verificar:

1. Vá em: **Settings** → **Rules** → **Rulesets**
   - URL direta: https://github.com/in100tiva/event-pulse1/settings/rules
2. Se houver rulesets ativos, você verá uma lista
3. Clique em cada ruleset e:
   - Clique em **"Edit"**
   - Mude o **Status** para **"Disabled"**
   - Ou clique em **"Delete ruleset"**
4. Clique em **"Save changes"**

---

## 📊 Comparação das Opções

| Opção | Segurança | Facilidade | Recomendado para |
|-------|-----------|------------|------------------|
| **Opção 1: Remover Proteção** | ⚠️ Baixa | ⭐⭐⭐ Fácil | Projetos pessoais/testes |
| **Opção 2: Bypass Admin** | ✅ Média | ⭐⭐ Média | Pequenas equipes |
| **Opção 3: Exceções** | ✅ Alta | ⭐ Complexa | Times grandes |
| **Pull Requests** | 🏆 Muito Alta | ⭐⭐ Média | Produção |

---

## 🚀 Depois de Configurar

Agora você pode fazer push direto:

```powershell
# Método simples
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
git add .
git commit -m "feat: suas alterações"
git push origin main
```

Ou use o script rápido:
```powershell
.\push-rapido.bat
```

---

## 🆘 Problemas Comuns

### 1. "You don't have permission to access Settings"
**Solução**: Você não é o dono do repositório
- Peça ao dono para adicionar você como colaborador com permissão de admin
- Ou peça ao dono para remover a proteção

### 2. Ainda recebe erro após remover proteção
**Solução**: Verifique os Rulesets (seção acima)

### 3. "Authentication failed"
**Solução**: Execute:
```powershell
.\reset-github.bat
```

### 4. "Branch is behind remote"
**Solução**: Atualize antes de fazer push:
```powershell
git pull origin main --rebase
git push origin main
```

---

## 📚 Recursos Adicionais

- **Documentação oficial**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- **Sobre Rulesets**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets

---

## ✨ Dica Final

Se você é o único desenvolvedor do projeto e está em fase de desenvolvimento:
- ✅ **Remova a proteção** (Opção 1) para facilitar
- 🎯 Quando for para produção, **reative a proteção**
- 🏆 Use Pull Requests para mudanças importantes

Se está trabalhando em equipe:
- 🛡️ **Mantenha a proteção**
- 🔄 Use o fluxo de Pull Requests
- 📋 Veja o arquivo `SOLUCAO_BRANCH_PROTEGIDA.md`

---

**💡 Precisa de ajuda?** Abra uma issue no repositório ou consulte os outros arquivos de documentação do projeto.

---

*Última atualização: {{ date }}*
*Repositório: https://github.com/in100tiva/event-pulse1*
