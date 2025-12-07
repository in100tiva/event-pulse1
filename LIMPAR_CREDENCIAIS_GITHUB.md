# 🔧 Como Limpar e Reconfigurar Credenciais do GitHub

## ⚠️ Problema
Você está recebendo erros ao tentar fazer push para o GitHub, possivelmente devido a credenciais antigas ou configurações incorretas.

## 🎯 Solução: Execute os comandos abaixo no seu terminal

### Passo 1: Abrir o PowerShell ou CMD como Administrador
- Pressione `Win + X` e selecione "Windows PowerShell (Admin)" ou "Prompt de Comando (Admin)"

### Passo 2: Navegar até o diretório do projeto
```cmd
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
```

### Passo 3: Limpar credenciais antigas do GitHub

#### Opção A - No CMD ou PowerShell:
```cmd
cmdkey /delete:git:https://github.com
cmdkey /delete:LegacyGeneric:target=git:https://github.com
```

Se aparecer "ERRO: credencial não encontrada", está tudo bem! Significa que não havia credenciais antigas.

### Passo 4: Limpar configuração do Git Credential Manager
```cmd
git config --global --unset credential.helper
git config --global credential.helper manager-core
```

### Passo 5: Reconfigurar o remote do GitHub
```cmd
git remote remove origin
git remote add origin https://github.com/in100tiva/event-pulse1.git
```

### Passo 6: Verificar se está tudo configurado
```cmd
git remote -v
```

Você deve ver:
```
origin  https://github.com/in100tiva/event-pulse1.git (fetch)
origin  https://github.com/in100tiva/event-pulse1.git (push)
```

### Passo 7: Fazer o primeiro push (que vai solicitar login)
```cmd
git add .
git commit -m "Initial commit"
git push -u origin main
```

## 🔐 Quando o Git solicitar login:

### ⚠️ IMPORTANTE: NÃO use sua senha do GitHub!

O GitHub não aceita mais senhas normais. Você precisa usar um **Personal Access Token (PAT)**.

### Como criar um PAT:

1. **Acesse**: https://github.com/settings/tokens
2. **Clique em**: "Generate new token" > "Generate new token (classic)"
3. **Configure**:
   - **Nome**: "EventPulse Deploy Token"
   - **Expiration**: Escolha um prazo (recomendo 90 dias ou mais)
   - **Scopes**: Marque ✅ `repo` (isso dá acesso completo aos repositórios)
4. **Clique em**: "Generate token"
5. **⚠️ COPIE O TOKEN IMEDIATAMENTE** - você não conseguirá ver ele novamente!

### Ao fazer login:
- **Username**: seu usuário do GitHub (in100tiva)
- **Password**: cole o Personal Access Token (PAT) que você criou

## 🎉 Alternativa Mais Fácil: GitHub CLI

Se você tiver o GitHub CLI instalado, pode usar:

```cmd
gh auth login
```

E seguir as instruções interativas. É muito mais fácil!

### Para instalar o GitHub CLI:
```cmd
winget install --id GitHub.cli
```

## 📋 Verificação Final

Depois de tudo configurado, teste com:
```cmd
git push -u origin main
```

Se funcionar sem pedir credenciais (ou pedir apenas uma vez e salvar), está tudo certo! ✅

## 🆘 Se ainda der erro:

1. **Erro "remote origin already exists"**:
   ```cmd
   git remote remove origin
   git remote add origin https://github.com/in100tiva/event-pulse1.git
   ```

2. **Erro de autenticação**:
   - Verifique se o PAT está correto
   - Verifique se o PAT tem permissão `repo`
   - Crie um novo PAT se necessário

3. **Erro "repository not found"**:
   - Verifique se o repositório existe em: https://github.com/in100tiva/event-pulse1
   - Verifique se você tem acesso ao repositório

## 📝 Notas Adicionais

- As credenciais serão salvas no Windows Credential Manager após o primeiro login bem-sucedido
- Você não precisará fazer login novamente até o token expirar
- Mantenha seu PAT em um local seguro (gerenciador de senhas)

## 🔄 Para limpar credenciais novamente no futuro:

Execute o script que criei:
```cmd
.\reset-github.bat
```

Ou use o comando direto:
```cmd
cmdkey /delete:git:https://github.com
```

---

**Última atualização**: Dezembro 2025
