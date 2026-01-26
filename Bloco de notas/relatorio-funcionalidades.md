# RELATÓRIO COMPLETO DE FUNCIONALIDADES

## **SYNC-FLOW** - Sistema de Gestão de Projetos Kanban
### Stack: Angular 17 (Standalone) + Supabase (PostgreSQL) + TailwindCSS

---

## ARQUITETURA GERAL

```
src/app/
├── core/                    # Módulo central (auth, interfaces, tokens)
│   ├── auth/                # Serviços de autenticação
│   ├── interfaces/          # Tipagens TypeScript
│   └── tokens/              # Injection Tokens
├── features/                # Módulos por domínio (feature-based)
│   ├── auth/                # Login e Registro
│   ├── board/               # Quadros Kanban
│   ├── landing/             # Página inicial
│   └── organization/        # Organizações/Workspaces
└── shared/                  # Componentes reutilizáveis
    └── ui/                  # Topbar, Modais, etc.
```

**Decisão Arquitetural:** Estrutura **feature-based** ao invés de **type-based** (services, components, etc.). Isso facilita escalabilidade - cada feature é autocontida e pode ser lazy-loaded independentemente.

---

## MÓDULO: AUTENTICAÇÃO (`core/auth/`)

### **AuthService** - `auth.service.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `initAuthListener()` | Escuta mudanças de estado de autenticação do Supabase | Usa `onAuthStateChange` para manter signals sincronizados com o estado real do usuário |
| `signIn(email, pass)` | Autentica usuário existente | Após sucesso, redireciona para `/organizations` |
| `signUp(email, pass, metadata?)` | Cria nova conta | Aceita metadados opcionais (nome, sobrenome) para o perfil |
| `signOut()` | Encerra sessão | Limpa estado e redireciona para `/login` |
| `ngOnDestroy()` | Cleanup do listener | Evita memory leak removendo subscription do Supabase |

**Decisões:**
- **Signals vs BehaviorSubject:** Optou-se por Signals (Angular 16+) por serem mais performáticos e com sintaxe mais limpa
- **`toObservable()`:** Converte Signal para Observable apenas quando necessário (guards RxJS)
- **Estado read-only:** `currentUser`, `session`, `isAuthLoaded` são expostos como readonly para encapsulamento

---

### **ProfileService** - `profile.service.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `getMyProfile()` | Busca perfil do usuário logado | Retorna dados da tabela `profiles` |
| `getProfileById(userId)` | Busca perfil por ID | Usado para exibir nome do criador de cards/comentários |
| `hasCreatedOrg()` | Verifica se usuário já criou organização | Controla fluxo de onboarding |
| `markOrgCreated()` | Marca flag `has_created_org = true` | Executado após criar primeira organização |
| `updateProfile(data)` | Atualiza dados do perfil | Atualiza também o `updated_at` |

**Lógica de Negócio:** O campo `has_created_org` controla o fluxo de primeiro acesso. Usuários novos são forçados a criar uma organização antes de usar o sistema.

---

### **AuthGuard** - `auth.guard.ts`

```typescript
export const authGuard: CanActivateFn = () => {
  return authService.authLoaded$.pipe(
    filter(loaded => loaded),  // Aguarda Supabase responder
    take(1),                   // Completa após primeiro valor
    map(() => {
      const isLogged = !!authService.session();
      return isLogged ? true : router.createUrlTree(['/login']);
    })
  );
};
```

**Decisão:** Guard funcional (não classe) - padrão moderno do Angular 15+. O `filter(loaded => loaded)` evita decisões prematuras antes do Supabase inicializar.

---

## MÓDULO: ORGANIZAÇÕES (`features/organization/`)

### **OrganizationService** - `organization.service.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `getMyOrganizations()` | Lista organizações do usuário | Faz JOIN entre `organization_members` e `organizations` |
| `createOrganization(name, isPersonal)` | Cria nova organização | Cria org + adiciona usuário como `owner` automaticamente |
| `getOrganizationBySlug(slug)` | Busca por slug | Usado na URL para identificar organização |
| `getOrganizationById(id)` | Busca por ID | Usado internamente |
| `hasOrganization()` | Verifica se tem pelo menos uma | Controle de fluxo de onboarding |
| `generateSlug(name)` | Gera slug a partir do nome | Remove acentos, espaços → traços, lowercase |

**Lógica de Negócio:**
- **Modelo multi-tenant:** Usuários podem pertencer a múltiplas organizações
- **RBAC básico:** Roles `owner`, `admin`, `member`, `viewer` (apenas owner implementado)
- **Slug único:** URLs amigáveis como `/org/minha-empresa/boards`

---

### **OrganizationListComponent** - `organization-list.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `ngOnInit()` | Inicialização | Verifica onboarding e carrega lista |
| `loadOrganizations()` | Carrega organizações do usuário | Se vazio, redireciona para criar |
| `openNewOrgModal()` | Abre modal de criação | Estado local `isModalOpen` |
| `createOrganization(name)` | Cria nova organização | Chama service e recarrega lista |
| `enterOrganization(org)` | Seleciona organização | Salva no localStorage e navega para boards |

**Decisão:** LocalStorage para persistir organização selecionada entre sessões. Alternativa seria usar um service com estado global.

---

### **CreateOrganizationComponent** - `create-organization.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `onSubmit()` | Submete formulário | Cria organização pessoal + marca flag no perfil |

**Lógica de Negócio:** Primeira organização é sempre `is_personal = true`. Isso diferencia workspace pessoal de times/empresas.

---

## MÓDULO: BOARDS (`features/board/`)

### **BoardService** - `board.service.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `getBoardsByOrganization(orgId)` | Lista boards de uma organização | Ordenado por `created_at DESC` |
| `getBoards()` | Lista todos os boards (legacy) | Mantido para compatibilidade |
| `createBoard(title, color, orgId?)` | Cria novo board | Associa ao `user_id` e opcionalmente à organização |

**Decisão:** Cores são salvas como classes Tailwind (`bg-blue-600`) ao invés de hex. Facilita consistência visual.

---

### **ListService** - `list.service.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `getListsByBoardId(boardId)` | Busca listas com cards | JOIN + ordenação de cards por `position` |
| `createList(dto)` | Cria nova lista | Calcula `position` automaticamente (última + 1) |
| `updateList(id, dto)` | Atualiza título/posição | Usado no inline edit |
| `deleteList(id)` | Exclui lista | Cards são excluídos em cascata (FK no banco) |
| `reorderLists(lists)` | Reordena em batch | `Promise.all()` para múltiplos updates |

**Lógica de Negócio:** Campo `position` (integer) controla a ordem. Ao criar, busca a maior posição existente e soma 1.

---

### **CardService** - `card.service.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `getCardsByListId(listId)` | Lista cards de uma lista | Ordenado por `position ASC` |
| `createCard(dto)` | Cria novo card | Auto-posiciona no final da lista |
| `updateCard(id, dto)` | Atualiza conteúdo/descrição | Aceita partial updates |
| `deleteCard(id)` | Exclui card | Comentários excluídos em cascata |
| `moveCard(cardId, newListId, newPosition)` | Move entre listas | Atualiza `list_id` e `position` |
| `reorderCards(cards)` | Reordena em batch | Usado após drag & drop |
| `getComments(cardId)` | Lista comentários | JOIN com `profiles` para nome do autor |
| `addComment(cardId, content)` | Adiciona comentário | Associa ao `user_id` logado |
| `deleteComment(commentId)` | Exclui comentário | Sem soft delete |

**Lógica de Negócio:** 
- Cards usam `content` para título (campo obrigatório) e `description` para detalhes (opcional)
- Comentários fazem JOIN com `profiles` para exibir nome do autor

---

### **BoardComponent** - `board.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `ngOnInit()` | Inicialização | Extrai slug da URL e carrega organização |
| `loadOrganization(slug)` | Carrega org pelo slug | Atualiza nome na UI e carrega boards |
| `loadBoards()` | Lista boards da organização | Filtra por `organization_id` |
| `setActiveTab(tab)` | Alterna entre abas | Tabs: `boards` e `members` (members não implementado) |
| `getBoardGradient(bgColor)` | Converte classe Tailwind para CSS | Mapeia `bg-blue-600` → `linear-gradient(...)` |
| `createTestBoard()` | Cria board de teste | Cor aleatória entre 5 opções |

**Decisão:** Gradientes são gerados via mapeamento para evitar usar classes dinâmicas (purge do Tailwind não funciona com classes dinâmicas).

---

### **BoardDetailComponent** - `board-detail.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `ngOnInit()` | Inicialização | Extrai `boardId` e `orgSlug` da URL |
| `loadBoard(id)` | Carrega board + listas | `Promise.all()` para paralelizar |
| **CRUD Listas** | | |
| `startAddList()` | Inicia modo de adição | Foca input automaticamente |
| `addList()` | Cria nova lista | Adiciona ao estado local imediatamente |
| `onUpdateList(event)` | Atualiza título | Inline edit |
| `onDeleteList(list)` | Exclui lista | Confirma antes de excluir |
| **CRUD Cards** | | |
| `onAddCard(event)` | Cria novo card | Adiciona ao array de cards da lista |
| `onEditCard(card)` | Abre modal de edição | Define `selectedCard` signal |
| `onDeleteCard(card)` | Exclui card | Remove do estado local |
| **Modal** | | |
| `closeCardModal()` | Fecha modal | Limpa `selectedCard` |
| `onModalUpdateCard(updates)` | Atualiza via modal | Propaga para estado e backend |
| `onModalDeleteCard()` | Exclui via modal | Fecha modal após excluir |
| **Drag & Drop** | | |
| `onCardDropped(event)` | Handler do CDK D&D | Diferencia mesma lista vs entre listas |
| `persistCardPositions(cards, listId)` | Persiste posições | Batch update via `reorderCards()` |

**Decisões Críticas:**

1. **Optimistic Update:** UI atualiza imediatamente, persistência é async
   ```typescript
   this.lists.update(current => ...); // UI instantânea
   await this.persistCardPositions(...); // Backend depois
   ```

2. **Computed Signals:** `connectedListIds` e `selectedCardListName` são derivados automaticamente
   ```typescript
   connectedListIds = computed(() => this.lists().map(list => 'list-' + list.id));
   ```

3. **DestroyRef:** Preparado para subscriptions futuras (realtime)
   ```typescript
   private destroyRef = inject(DestroyRef);
   ```

---

### **KanbanListComponent** - `kanban-list.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `onCardDropped(event)` | Propaga evento D&D | Emite para o pai processar |
| `startEditTitle()` | Inicia edição inline | Foca e seleciona texto |
| `saveTitle()` | Salva título | Emite apenas se mudou |
| `onDeleteList()` | Confirma e exclui | Confirmação obrigatória |
| `startAddCard()` | Inicia adição de card | Foca textarea |
| `addCard()` | Cria card | Emite evento para o pai |
| `onFormFocusOut(event)` | Detecta clique fora | Fecha formulário se clicou fora |

**Padrão de Comunicação:** Componente "burro" (presentational) - apenas emite eventos, não faz chamadas HTTP. O pai (`BoardDetailComponent`) gerencia o estado.

---

### **KanbanCardComponent** - `kanban-card.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `onCardClick()` | Abre modal de edição | Emite evento `edit` |
| `onDelete(event)` | Exclui card | `stopPropagation()` evita abrir modal |

**Decisão:** `stopPropagation()` no botão de excluir evita que o clique propague para o card e abra o modal indesejavelmente.

---

### **CardModalComponent** - `card-modal.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `ngOnInit()` | Inicialização | Carrega comentários e dados do criador |
| `loadCreator()` | Busca nome do criador | Usa `ProfileService` |
| `loadComments()` | Carrega comentários | JOIN com perfil do autor |
| `addComment()` | Adiciona comentário | Atualiza estado local após sucesso |
| `deleteComment(id)` | Exclui comentário | Confirmação obrigatória |
| `adjustTextareaHeight(event)` | Auto-resize textarea | UX para descrições longas |
| **Edição de Título** | | |
| `startEditTitle()` | Inicia modo edição | Foca e seleciona |
| `saveTitle()` | Salva se mudou | Emite evento |
| **Edição de Descrição** | | |
| `startEditDescription()` | Inicia modo edição | Foca textarea |
| `saveDescription()` | Salva se mudou | Emite evento |
| `deleteCard()` | Exclui card | Confirmação obrigatória |

**UX Decisions:**
- Edição inline (clique para editar, blur para salvar)
- Auto-resize de textarea para descrições longas
- Confirmação antes de excluir

---

## MÓDULO: SHARED (`shared/ui/`)

### **TopbarComponent** - `topbar.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `ngOnInit()` | Carrega perfil | Busca dados do usuário logado |
| `loadProfile()` | Extrai iniciais e nome | Gera avatar com iniciais |
| `toggleMenu()` | Abre/fecha dropdown | Estado local `isMenuOpen` |
| `logout()` | Encerra sessão | Chama `authService.signOut()` |

**Decisão:** Iniciais do avatar são geradas no frontend a partir do nome (primeira letra de cada palavra).

---

### **NewOrgModalComponent** - `new-org-modal.component.ts`

| Função | Descrição | Lógica de Negócio |
|--------|-----------|-------------------|
| `close()` | Fecha modal | Emite `onClose` |
| `submit()` | Submete formulário | Valida e emite `onCreate` |
| `joinOrganization()` | Placeholder | Funcionalidade futura |

**API Moderna:** Usa `input()` e `output()` (signal-based) ao invés de `@Input/@Output` decorators.

---

## MODELO DE DADOS (Interfaces)

### **Board** - `board.interface.ts`

```typescript
interface Board {
  id: number;
  title: string;
  bg_color: string;           // Classe Tailwind (ex: 'bg-blue-600')
  created_at?: string;
  user_id?: string;           // Criador
  organization_id: string;    // Organização dona
}
```

### **List**
```typescript
interface List {
  id: number;
  title: string;
  position: number;           // Ordem na UI
  board_id: number;
  cards?: Card[];             // Populado via JOIN
}
```

### **Card**
```typescript
interface Card {
  id: number;
  content: string;            // Título do card
  description?: string;       // Descrição detalhada
  position: number;           // Ordem na lista
  list_id: number;
  created_by?: string;        // ID do criador
  comments?: Comment[];       // Populado via JOIN
}
```

### **Comment**
```typescript
interface Comment {
  id: number;
  card_id: number;
  content: string;
  created_at: string;
  user_id: string;
  user?: {                    // JOIN com profiles
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}
```

### **Organization**
```typescript
interface Organization {
  id: string;                 // UUID
  name: string;
  slug: string;               // URL-friendly
  is_personal: boolean;       // Workspace pessoal vs time
  created_at: string;
}
```

### **Profile**
```typescript
interface Profile {
  id: string;                 // Mesmo ID do auth.users
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  has_created_org: boolean;   // Flag de onboarding
  created_at: string;
  updated_at: string;
}
```

---

## ROTAS

| Rota | Componente | Guard | Descrição |
|------|------------|-------|-----------|
| `/` | `LandingComponent` | ❌ | Página inicial pública |
| `/login` | `LoginComponent` | ❌ | Tela de login |
| `/register` | `RegisterComponent` | ❌ | Tela de cadastro |
| `/organizations` | `OrganizationListComponent` | ✅ | Lista de organizações |
| `/organizations/new` | `CreateOrganizationComponent` | ✅ | Criar primeira organização |
| `/org/:orgSlug/boards` | `BoardComponent` | ✅ | Lista de boards da org |
| `/org/:orgSlug/board/:id` | `BoardDetailComponent` | ✅ | Visualização do Kanban |

**Decisão:** Rotas protegidas usam lazy loading (`loadComponent`) para otimizar bundle inicial.

---

## FLUXO DE ONBOARDING

```
1. Usuário acessa /register
   ↓
2. Cria conta (AuthService.signUp)
   ↓
3. Redirecionado para /organizations/new
   ↓
4. Cria primeira organização (CreateOrganizationComponent)
   - OrganizationService.createOrganization(name, isPersonal=true)
   - ProfileService.markOrgCreated()
   ↓
5. Redirecionado para /organizations
   ↓
6. Seleciona organização → /org/slug/boards
```

---

## RESUMO DE FUNCIONALIDADES

| Módulo | Funcionalidades Implementadas |
|--------|------------------------------|
| **Auth** | Login, Registro, Logout, Proteção de rotas, Gerenciamento de sessão |
| **Perfil** | Exibição de nome/iniciais, Flag de onboarding |
| **Organizações** | CRUD, Multi-tenant, Slug único, Roles (owner) |
| **Boards** | CRUD, Cores customizadas, Associação a organizações |
| **Listas** | CRUD, Ordenação por posição, Inline edit |
| **Cards** | CRUD, Descrição, Posição, Drag & Drop entre listas |
| **Comentários** | CRUD, Autor com JOIN de perfil |
| **UX** | Optimistic updates, Inline editing, Modais, Confirmações |

---

## DECISÕES TÉCNICAS IMPORTANTES

### 1. **Standalone Components**
Todos os componentes são standalone (Angular 17+). Elimina necessidade de NgModules.

### 2. **Signals vs RxJS**
- **Signals:** Estado local de componentes e services
- **RxJS:** Apenas onde necessário (guards, operadores complexos)

### 3. **InjectionToken para Supabase**
Desacopla cliente do código, facilita testes e mocking.

### 4. **Optimistic Updates**
UI atualiza antes da confirmação do backend para UX fluida.

### 5. **Feature-based Architecture**
Código organizado por domínio, não por tipo de arquivo.

### 6. **Tipagem Forte**
Interfaces para todas as entidades, eliminação de `any`.

### 7. **Lifecycle Management**
`OnDestroy` implementado para evitar memory leaks.

---

###### ... Desenvolvimentos futuros

