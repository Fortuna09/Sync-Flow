# 🚀 SyncFlow - SaaS Task Management MVP

## Sobre o Projeto

O **SyncFlow** é uma plataforma de gestão de projetos inspirada em ferramentas como Trello e Jira. 

O objetivo principal foi demonstrar a capacidade de construir uma aplicação **Fullstack Serverless**, focando em:
1.  **Segurança de Dados:** Isolamento total entre usuários (Multi-tenancy).
2.  **Performance:** Uso de estratégias modernas de renderização e estado.
3.  **Engenharia de Software:** Aplicação de princípios SOLID e Clean Code.

## Stack Tecnológica

* **Front-end:** Angular 17+ (Standalone Components, Signals, Control Flow).
* **Estilização:** TailwindCSS (Design System responsivo).
* **Backend as a Service:** Supabase (PostgreSQL, Authentication, Realtime).
* **Infraestrutura:** Vercel (Edge Network).
* **CI/CD:** GitHub Actions (Pipeline automatizada de Build e Deploy).

## Destaques de Arquitetura

O diferencial deste projeto está nas decisões técnicas tomadas para garantir manutenibilidade e escalabilidade:

### 1. Estado Reativo com Signals ⚡
Abandono parcial do `Zone.js` em favor dos **Angular Signals**. Isso garante uma atualização de UI granular e muito mais performática, refletindo o estado da aplicação sem ciclos de detecção de mudança desnecessários.

### 2. Segurança via RLS (Row Level Security) 🛡️
A segurança não é apenas visual. Implementei políticas de acesso diretamente no banco de dados (PostgreSQL).
* Um usuário **jamais** consegue ler ou editar Boards de outro usuário, mesmo que tente manipular as requisições API.
* O banco valida o token JWT do Supabase Auth em cada transação.

### 3. Injeção de Dependência e SOLID
Uso estrito de Injeção de Dependência para desacoplar a camada de visualização (`Components`) da camada de dados (`Services`).
* **Single Responsibility Principle:** Componentes apenas renderizam dados; Services lidam com a lógica de negócios e chamadas HTTP.
* **Guards Funcionais:** Proteção de rotas (`/board`) utilizando a nova sintaxe funcional do Angular Router.

### 4. CI/CD Automatizado
O projeto conta com um pipeline de **Integração Contínua** configurado no GitHub Actions.
* A cada `push` ou `pull_request`, o sistema verifica a integridade do código e roda o build de produção.
* Deploy automático na Vercel apenas se o pipeline for aprovado.

## Funcionalidades

- [x] **Autenticação:** Cadastro e Login (Email/Senha) com gestão de sessão.
- [x] **Gestão de Projetos:** Criação e listagem de Boards.
- [x] **Interface Dinâmica:** Feedback visual de carregamento e estados vazios.
- [x] **Rotas Protegidas:** Redirecionamento automático de usuários não autenticados.

## Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU-USUARIO/sync-flow.git](https://github.com/SEU-USUARIO/sync-flow.git)
   cd sync-flow