# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o EventPulse! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Mensagens de Commit](#mensagens-de-commit)
- [Pull Requests](#pull-requests)

## 📜 Código de Conduta

Este projeto segue um [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em seguir seus termos.

## 🎯 Como Posso Contribuir?

### 🐛 Reportando Bugs

Antes de criar um bug report, verifique se o problema já não foi reportado. Ao criar um bug report, inclua:

- **Título claro e descritivo**
- **Passos para reproduzir** o problema
- **Comportamento esperado** vs **comportamento atual**
- **Screenshots** (se aplicável)
- **Ambiente** (browser, OS, versão do Node)

### 💡 Sugerindo Melhorias

Para sugerir uma melhoria, abra uma issue incluindo:

- **Título claro** da feature
- **Descrição detalhada** do que você gostaria de ver
- **Casos de uso** - por que isso seria útil?
- **Mockups ou exemplos** (se aplicável)

### 🔨 Contribuindo com Código

1. **Escolha uma issue** ou crie uma nova
2. **Comente na issue** que você vai trabalhar nela
3. **Fork o repositório**
4. **Crie uma branch** a partir da `main`
5. **Faça suas mudanças**
6. **Teste localmente**
7. **Abra um Pull Request**

## 🚀 Processo de Desenvolvimento

### Setup Local

```bash
# 1. Fork e clone o repositório
git clone https://github.com/SEU-USERNAME/event-pulse1.git
cd event-pulse1

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Inicie o Convex
npx convex dev

# 5. Em outro terminal, inicie o app
npm run dev
```

### Estrutura do Projeto

```
event-pulse1/
├── components/          # Componentes React
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── PublicEvent.tsx  # Página pública do evento
│   └── EventManagement.tsx
├── convex/             # Backend Convex
│   ├── events.ts       # Funções de eventos
│   ├── attendance.ts   # Confirmações de presença
│   ├── suggestions.ts  # Sugestões
│   ├── polls.ts        # Enquetes
│   └── waitlist.ts     # Lista de espera
├── docs/               # Documentação
└── src/                # Código fonte adicional
```

### Criando uma Branch

Use nomes descritivos para suas branches:

```bash
# Features
git checkout -b feature/nome-da-feature

# Bugfixes
git checkout -b fix/descricao-do-bug

# Documentação
git checkout -b docs/descricao
```

## 📝 Padrões de Código

### TypeScript

- Use **TypeScript** para todo código novo
- Evite `any` - prefira tipos específicos
- Documente funções complexas com comentários

### React

- Use **componentes funcionais** com hooks
- Mantenha componentes **pequenos e focados**
- Use **nomes descritivos** para componentes e funções

### Estilização

- Use **Tailwind CSS** para estilização
- Siga o **tema escuro** existente
- Mantenha **responsividade** em mente

### Exemplo de Código

```typescript
// ✅ BOM
interface EventProps {
  eventId: Id<"events">;
  onSuccess: () => void;
}

const EventCard: React.FC<EventProps> = ({ eventId, onSuccess }) => {
  const event = useQuery(api.events.getById, { eventId });
  
  if (!event) return <Loading />;
  
  return (
    <div className="rounded-lg bg-surface-dark p-4">
      <h3 className="text-xl font-bold text-white">{event.title}</h3>
    </div>
  );
};

// ❌ EVITE
const Card = (props: any) => {
  return <div style={{backgroundColor: '#1a1a1a'}}>{props.data}</div>;
};
```

## 💬 Mensagens de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>: <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de build, etc

### Exemplos

```bash
# Feature
git commit -m "feat: Adicionar modal de confirmação ao deletar evento"

# Bugfix
git commit -m "fix: Corrigir contagem de participantes no dashboard"

# Documentação
git commit -m "docs: Atualizar README com instruções de instalação"

# Refatoração
git commit -m "refactor: Extrair lógica de validação para função separada"
```

## 🔄 Pull Requests

### Checklist Antes de Abrir PR

- [ ] Código está funcionando localmente
- [ ] Testes passando (se aplicável)
- [ ] Sem erros de linting
- [ ] Documentação atualizada (se necessário)
- [ ] Mensagens de commit seguem o padrão
- [ ] Branch está atualizada com `main`

### Criando um Pull Request

1. **Título claro** e descritivo
2. **Descrição detalhada** do que foi mudado e por quê
3. **Link para a issue** relacionada (se houver)
4. **Screenshots** (se mudanças visuais)
5. **Como testar** as mudanças

### Exemplo de Descrição de PR

```markdown
## 🎯 Descrição

Adiciona funcionalidade de exportação de participantes em formato PDF.

## 🔗 Issue Relacionada

Closes #123

## 🧪 Como Testar

1. Acesse um evento com participantes
2. Clique no botão "Exportar PDF"
3. Verifique se o PDF foi gerado corretamente

## 📸 Screenshots

[Adicione screenshots aqui]

## ✅ Checklist

- [x] Testado localmente
- [x] Documentação atualizada
- [x] Sem erros de linting
```

### Revisão de Código

- Pull requests serão revisados pelo mantenedor
- Pode haver solicitação de mudanças
- Seja receptivo ao feedback
- Discuta mudanças educadamente

## 🎨 Áreas Que Precisam de Ajuda

Procurando por onde começar? Estas áreas sempre precisam de ajuda:

### 🐛 Bugs Conhecidos
- Verifique issues com label `bug`

### ✨ Features Planejadas
- Notificações por email
- Relatórios avançados
- App mobile
- Integração com calendários

### 📚 Documentação
- Tutoriais em vídeo
- Tradução para outros idiomas
- Guias de casos de uso

### 🎨 Design
- Melhorias de UX
- Novos temas
- Ícones personalizados

## 🏆 Reconhecimento

Contribuidores serão:
- ✨ Listados na seção **Equipe & Desenvolvedores** do README
- 🎉 Mencionados nas release notes
- 💖 Eternamente agradecidos!

## ❓ Dúvidas?

- 💬 Abra uma [discussion](https://github.com/in100tiva/event-pulse1/discussions)
- 📧 Entre em contato através do GitHub
- 🐛 Crie uma issue se algo não está claro

---

**Obrigado por contribuir com o EventPulse! Cada contribuição, grande ou pequena, faz a diferença.** 🚀

<p align="center">
  Feito com ❤️ pela comunidade EventPulse
</p>

