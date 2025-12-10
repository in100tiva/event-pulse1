# 🎉 EventPulse

> Plataforma completa de gerenciamento de eventos com engajamento em tempo real

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Convex](https://img.shields.io/badge/Convex-FF6B6B?logo=convex&logoColor=white)](https://www.convex.dev/)

## 📋 Sobre o Projeto

EventPulse é uma plataforma moderna e completa para criação e gerenciamento de eventos, permitindo interação em tempo real com participantes através de confirmações de presença, sugestões, enquetes e muito mais.

### ✨ Funcionalidades Principais

#### 🎯 Gerenciamento de Eventos
- ✅ **Criação de Eventos** - Interface intuitiva para criar eventos online ou presenciais
- 📊 **Dashboard com Abas** - Organize eventos por status (Publicados, Ao Vivo, Encerrados)
- 🔄 **Status Dinâmicos** - Rascunho → Publicado → Ao Vivo → Encerrado
- 📱 **Links Compartilháveis** - Gere links únicos para cada evento
- 🎨 **Páginas Públicas** - Página dedicada para cada evento

#### 👥 Gestão de Participantes
- ✅ **Confirmações de Presença** - Sistema "Vou", "Talvez", "Não vou"
- 🚫 **Limite de Participantes** - Controle de vagas com bloqueio automático
- 📋 **Lista de Espera Inteligente** - Captura de leads quando evento lota
- 📞 **Integração WhatsApp** - Botões diretos para contato
- ✓ **Check-in Digital** - Marque presença dos participantes
- 📥 **Exportação CSV** - Exporte lista de participantes

#### 💡 Engajamento em Tempo Real
- 💭 **Mural de Sugestões** - Participantes enviam perguntas/sugestões
- 👍 **Sistema de Votação** - Vote em sugestões (um voto por pessoa)
- 📊 **Enquetes Ao Vivo** - Crie enquetes com resultados em tempo real
- ✅ **Moderação de Conteúdo** - Aprove/rejeite sugestões antes de publicar
- 🎭 **Sugestões Anônimas** - Opção para participantes serem anônimos

#### 🔐 Controles de Acesso
- 🔒 **Restrição de Interação** - Apenas confirmados podem interagir
- 🗳️ **Voto Único em Enquetes** - Enquete some após votar
- 👤 **Autenticação com Clerk** - Login seguro com múltiplos provedores
- 🏢 **Sistema de Organizações** - Gerencie eventos por organização

#### 📈 Lista de Espera & Leads
- 📋 **Captura Automática** - Modal de waitlist quando evento lota
- 📞 **Dados de Contato** - Nome completo + WhatsApp
- 💼 **Dashboard de Leads** - Visualize todos os leads por organização
- 📊 **Aba Dedicada** - Seção exclusiva para leads no dashboard

#### 🎨 Interface & UX
- 🌙 **Modo Escuro** - Design moderno e elegante
- 📱 **Responsivo** - Funciona perfeitamente em mobile
- ⚡ **Tempo Real** - Atualizações instantâneas com Convex
- 🔔 **Feedback Visual** - Mensagens claras para cada ação
- ⬅️ **Navegação Intuitiva** - Botão voltar e navegação fluida

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool ultra-rápido
- **React Router** - Navegação SPA
- **Tailwind CSS** - Estilização utility-first

### Backend & Database
- **Convex** - Backend-as-a-Service com tempo real
- **Clerk** - Autenticação e gerenciamento de usuários

### Deploy
- **Vercel** - Deploy do frontend
- **Convex Cloud** - Backend e database

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Convex
- Conta no Clerk

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/in100tiva/event-pulse1.git
cd event-pulse1
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie o arquivo .env.local na raiz do projeto
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://...convex.cloud
```

4. **Configure o Convex**
```bash
npx convex dev
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📚 Documentação Adicional

- [📖 Início Rápido](docs/INICIO_RAPIDO.md)
- [🔐 Configuração Clerk](docs/CLERK_SETUP.md)
- [🚀 Deploy na Vercel](docs/RESUMO_DEPLOY.md)
- [✅ Checklist Pré-Deploy](docs/PRE_DEPLOY_CHECKLIST.md)
- [🧪 Testes de Organização](docs/TESTE_ORGANIZACOES.md)

## 🤝 Como Contribuir

EventPulse é um projeto open-source e **adoramos contribuições**! 

### 💎 Benefícios para Contribuidores
- 🌟 Seu nome na seção **Equipe & Desenvolvedores**
- 📈 Portfólio com projeto real em produção
- 🎓 Aprendizado com código TypeScript + React moderno
- 🤝 Networking com outros desenvolvedores

### Primeiros Passos
1. Leia o [Guia de Contribuição](CONTRIBUTING.md)
2. Veja as [Issues abertas](https://github.com/in100tiva/event-pulse1/issues)
3. Leia o [Código de Conduta](CODE_OF_CONDUCT.md)
4. Faça um fork e comece a contribuir!

## 👥 Equipe & Desenvolvedores

### 👨‍💻 Criador Principal
**Luan Oliveira dos Santos** - Idealizador e desenvolvedor principal
- GitHub: [@in100tiva](https://github.com/in100tiva)

### 🌟 Contribuidores

Seja o primeiro a contribuir e ter seu nome aqui! 🎉

<!--
Adicione seu nome após sua primeira contribuição ser aceita:
- **[Seu Nome](seu-github)** - Descrição da contribuição
-->

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 Luan Oliveira dos Santos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Agradecimentos

- [Convex](https://www.convex.dev/) - Backend poderoso e em tempo real
- [Clerk](https://clerk.com/) - Autenticação sem complicação
- [Vercel](https://vercel.com/) - Deploy simplificado
- Todos os contribuidores que fazem este projeto melhor! ❤️

## 📞 Contato & Suporte

- 🐛 **Bugs**: Abra uma [issue](https://github.com/in100tiva/event-pulse1/issues)
- 💡 **Ideias**: Compartilhe nas [discussions](https://github.com/in100tiva/event-pulse1/discussions)
- 📧 **Email**: Contate através do GitHub

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/in100tiva">Luan Oliveira dos Santos</a>
</p>

<p align="center">
  ⭐ Se este projeto te ajudou, considere dar uma estrela!
</p>
