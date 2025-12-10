# 🔐 Como Resolver: Push Bloqueado por Secret

## ❌ O Problema

O GitHub bloqueou seu push porque detectou um **Personal Access Token (PAT)** em alguns arquivos `.bat`:

```
- create-pr.bat
- git-push.bat  
- quick-pr.bat
```

**Por que isso é um problema?**
- Tokens são credenciais sensíveis que dão acesso à sua conta
- Se commitados, ficam no histórico público do Git
- Qualquer pessoa pode ver e usar seu token

## ✅ A Solução

### Opção 1: Script Automatizado (RECOMENDADO)

Execute o script PowerShell que criei:

```powershell
.\fix-secret-push.ps1
```

**O que o script faz:**
1. Remove o último commit (que contém os secrets)
2. Adiciona os arquivos novamente (agora os .bat estão no .gitignore)
3. Cria um novo commit sem os secrets
4. Faz push novamente

### Opção 2: Comandos Manuais

Se preferir executar manualmente:

```powershell
# 1. Remover o commit com secrets
git reset HEAD~1

# 2. Adicionar arquivos (agora .bat está no .gitignore)
git add .

# 3. Ver o que será commitado
git status

# 4. Criar novo commit
git commit -m "feat: implementação completa do EventPulse"

# 5. Push com force
git push -u origin feature/event-pulse-implementation --force
```

## 📋 O Que Foi Alterado

### `.gitignore` Atualizado

Adicionei estas linhas ao `.gitignore`:

```gitignore
# Scripts com credenciais (não commitar)
*.bat
!exemplo-*.bat
pr-execution-log.txt
```

**Isso significa:**
- ✅ Todos os arquivos `.bat` serão ignorados
- ✅ Exceto aqueles que começam com `exemplo-`
- ✅ Logs de execução também serão ignorados

### Arquivos que Permanecerão Localmente

Os scripts `.bat` ainda existem no seu computador:
- `create-pr.bat`
- `git-push.bat`
- `quick-pr.bat`

**Mas agora:**
- ❌ Não serão mais versionados no Git
- ❌ Não aparecerão em commits futuros
- ✅ Você pode continuar usando-os localmente

## 🔒 Boas Práticas

### Para Scripts com Credenciais

**❌ NUNCA faça:**
```bat
git remote add origin https://ghp_SEU_TOKEN_AQUI@github.com/...
```

**✅ SEMPRE faça:**

1. **Opção 1: Git Credential Manager (Recomendado)**
   ```bat
   git remote add origin https://github.com/in100tiva/event-pulse1.git
   ```
   O Git pedirá suas credenciais na primeira vez e as salvará com segurança.

2. **Opção 2: Variáveis de Ambiente**
   ```bat
   git remote add origin https://%GITHUB_TOKEN%@github.com/...
   ```
   E defina a variável de ambiente separadamente.

3. **Opção 3: GitHub CLI**
   ```bat
   gh auth login
   ```
   Mais seguro e moderno.

## ⚠️ IMPORTANTE: Revogar o Token

Como o token foi exposto, você **DEVE** revogá-lo:

1. Vá para: https://github.com/settings/tokens
2. Encontre o token que começa com `ghp_P57tc...`
3. Clique em **Delete** ou **Revoke**
4. Crie um novo token se necessário

**Ou clique no link que o GitHub forneceu:**
```
https://github.com/in100tiva/event-pulse1/security/secret-scanning/unblock-secret/36Ug2lubyoax5o7M2RzkveTRI0K
```

## 📝 Próximos Passos

Após resolver o problema do push:

1. ✅ Execute `.\fix-secret-push.ps1`
2. ✅ Revogue o token antigo no GitHub
3. ✅ Configure o Git Credential Manager:
   ```powershell
   git config --global credential.helper manager-core
   ```
4. ✅ Remova os tokens dos scripts `.bat` locais
5. ✅ Use `gh auth login` para autenticação futura

## 🆘 Se Ainda Tiver Problemas

Se o push ainda for bloqueado:

1. **Verifique o histórico:**
   ```bash
   git log --all -- create-pr.bat git-push.bat quick-pr.bat
   ```

2. **Se o token ainda estiver no histórico:**
   ```bash
   # Use BFG Repo-Cleaner ou git filter-repo
   git filter-repo --path create-pr.bat --invert-paths
   git filter-repo --path git-push.bat --invert-paths
   git filter-repo --path quick-pr.bat --invert-paths
   ```

3. **Ou simplesmente ignore o aviso do GitHub:**
   - Clique no link fornecido pelo GitHub para permitir o push
   - Depois revogue o token imediatamente

## 📚 Links Úteis

- [GitHub: Working with Push Protection](https://docs.github.com/code-security/secret-scanning/working-with-secret-scanning-and-push-protection/working-with-push-protection-from-the-command-line)
- [GitHub: Personal Access Tokens](https://github.com/settings/tokens)
- [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager)

---

**Dúvidas?** Revise este documento ou consulte a documentação do GitHub.

