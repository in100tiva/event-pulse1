# ⚡ Execute Estes Comandos AGORA

## 📋 Comandos para Copiar e Colar

Abra um terminal PowerShell no diretório do projeto e execute estes comandos **um por vez**:

### 1️⃣ Navegar para o diretório
```powershell
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
```

### 2️⃣ Remover o commit problemático
```powershell
git reset HEAD~1
```
**O que faz:** Remove o último commit (que tem os tokens), mas mantém as alterações nos arquivos.

### 3️⃣ Ver o status
```powershell
git status
```
**Resultado esperado:** Você verá muitos arquivos "modified" ou "untracked", mas **NÃO** verá os arquivos .bat listados (porque agora estão no .gitignore).

### 4️⃣ Adicionar arquivos
```powershell
git add .
```
**O que faz:** Adiciona todos os arquivos, **EXCETO** os .bat (que estão no .gitignore).

### 5️⃣ Verificar o que será commitado
```powershell
git status
```
**IMPORTANTE:** Confira que os arquivos `.bat` **NÃO** aparecem na lista de "changes to be committed".

### 6️⃣ Criar novo commit
```powershell
git commit -m "feat": implementação completa do EventPulse

Sistema completo de gerenciamento de eventos com Convex e Clerk
Configuração para deploy na Vercel
Documentação completa

Nota: Scripts com credenciais foram removidos do versionamento"
```

### 7️⃣ Fazer push
```powershell
git push -u origin feature/event-pulse-implementation --force
```
**ATENÇÃO:** O `--force` é necessário porque estamos reescrevendo o histórico (removendo o commit com secrets).

---

## ✅ Se Tudo Funcionar

Você verá algo como:
```
Enumerating objects: ...
Counting objects: ...
Writing objects: ...
Total ...
remote: Resolving deltas: ...
To https://github.com/in100tiva/event-pulse1.git
 + 1a5c437...abc1234 feature/event-pulse-implementation -> feature/event-pulse-implementation (forced update)
```

---

## ❌ Se Ainda For Bloqueado

Se o GitHub ainda bloquear, você tem 2 opções:

### Opção A: Permitir o push uma vez (Mais Rápido)
1. Abra o link que o GitHub forneceu:
   ```
   https://github.com/in100tiva/event-pulse1/security/secret-scanning/unblock-secret/36Ug2lubyoax5o7M2RzkveTRI0K
   ```
2. Clique em "Allow secret"
3. Execute o push novamente
4. **DEPOIS REVOGUE O TOKEN IMEDIATAMENTE**

### Opção B: Limpar completamente o histórico
Execute estes comandos:
```powershell
# Instalar git-filter-repo (se necessário)
pip install git-filter-repo

# Remover os arquivos do histórico
git filter-repo --path create-pr.bat --invert-paths --force
git filter-repo --path git-push.bat --invert-paths --force
git filter-repo --path quick-pr.bat --invert-paths --force

# Adicionar remote novamente (filter-repo remove)
git remote add origin https://github.com/in100tiva/event-pulse1.git

# Push
git push -u origin feature/event-pulse-implementation --force
```

---

## 🔐 DEPOIS DO PUSH: Revogar o Token

**MUITO IMPORTANTE:** Depois que o push funcionar, revogue o token:

1. Vá para: https://github.com/settings/tokens
2. Encontre o token `ghp_P57tc...`
3. Clique em "Delete"
4. Crie um novo token se precisar

---

## 📝 Resumo Rápido

```powershell
# Copie tudo e cole de uma vez:
cd "c:\Users\in100\OneDrive\Documentos\projetos\Estudo\projeto-01"
git reset HEAD~1
git add .
git commit -m "feat: implementação completa do EventPulse"
git push -u origin feature/event-pulse-implementation --force
```

---

**Pronto!** Execute os comandos e me avise se funcionar ou se aparecer algum erro.
