# Boutique Arco-Íris — Contexto Completo do Projeto

> Este documento é destinado a modelos de IA (agentes, assistentes, etc.) que precisam entender a fundo o que foi construído, como funciona e como trabalhar neste codebase. Leia-o inteiramente antes de propor qualquer mudança.

---

## 1. Visão Geral

**Boutique Arco-Íris** é uma aplicação web de e-commerce de moda feminina com:
- Catálogo de produtos com filtros e busca
- Consultora de moda via IA (quiz + recomendações personalizadas)
- Carrinho de compras persistente
- Checkout com cálculo de frete real (Correios via ViaCEP)
- Painel admin completo (CRUD de produtos, upload de imagens)
- Autenticação segura com JWT em cookie HttpOnly

O projeto está em **produção local** (`localhost:5173` frontend, `localhost:3001` backend) e ainda não foi implantado em servidor público.

---

## 2. Stack Técnica

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Frontend | React 18.3 + Vite | TypeScript |
| Roteamento | React Router v6 | Data routers não usados; rotas declarativas em `App.tsx` |
| Estilo | Tailwind CSS | **Nunca** estilos inline no JSX — tudo via `@apply` em `index.css` |
| Backend | Node.js + Express | CommonJS (`require`/`module.exports`) |
| Banco | SQLite via `node:sqlite` | Módulo nativo do Node 22+, sem pacote externo (sem `better-sqlite3`) |
| Auth | JWT em cookie HttpOnly | `jsonwebtoken` + `bcryptjs` |
| IA | Anthropic API | Modelo `claude-sonnet-4-6`, max_tokens 1000 |
| Imagens | Cloudinary | Upload via `multer` memory storage, stream para Cloudinary |
| Validação | Zod | Backend e frontend |
| Rate Limit | express-rate-limit | Login, registro, recomendações |

---

## 3. Estrutura de Diretórios

```
Boutique-Arco-ris/
├── CLAUDE.md                          # Instruções para Claude Code
├── CONTEXT.md                         # Este arquivo
├── backend/
│   ├── server.js                      # Ponto de entrada Express
│   ├── package.json
│   ├── .env                           # Secrets (nunca commitar)
│   ├── boutique.db                    # SQLite (gerado automaticamente)
│   ├── config/
│   │   ├── database.js                # Inicialização do SQLite + schema + seed
│   │   └── cloudinary.js              # Configuração do SDK Cloudinary
│   ├── controllers/
│   │   ├── authController.js          # register, login, logout, me
│   │   ├── adminController.js         # CRUD produtos + upload imagens
│   │   ├── orderController.js         # Criação e listagem de pedidos
│   │   └── recommendationController.js # Quiz → IA → resposta
│   ├── middlewares/
│   │   ├── authMiddleware.js          # Verifica JWT, popula req.user
│   │   ├── adminMiddleware.js         # Exige is_admin === 1
│   │   ├── csrfMiddleware.js          # Valida Origin header
│   │   ├── errorMiddleware.js         # Handler centralizado de erros
│   │   └── rateLimiter.js             # Limitadores por rota
│   ├── repositories/
│   │   ├── userRepository.js          # CRUD users no SQLite
│   │   ├── productRepository.js       # CRUD products + product_images
│   │   ├── orderRepository.js         # CRUD orders + order_items
│   │   └── recommendationRepository.js # CRUD recommendations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── freightRoutes.js           # Cálculo de frete
│   ├── services/
│   │   ├── authService.js             # Lógica de auth, hash, token
│   │   ├── recommendationService.js   # Filtro do catálogo + chamada IA
│   │   └── orderService.js            # Processamento com transação
│   ├── validators/
│   │   ├── authValidator.js           # Zod: register/login
│   │   └── quizValidator.js           # Zod: respostas do quiz
│   └── data/
│       └── catalog.js                 # Dados de seed (produtos iniciais)
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js             # Paleta personalizada + fontes
    ├── index.html
    └── src/
        ├── main.tsx                   # ReactDOM.createRoot
        ├── App.tsx                    # BrowserRouter + todas as rotas
        ├── index.css                  # Tailwind + todas as classes @apply
        ├── context/
        │   ├── AuthContext.tsx        # Usuário global (login/logout/loading)
        │   └── CartContext.tsx        # Carrinho (localStorage)
        ├── hooks/
        │   ├── useAuth.ts             # Consume AuthContext
        │   ├── useCart.ts             # Consume CartContext
        │   ├── useRecentlyViewed.ts   # Histórico local de produtos vistos
        │   └── useStagger.ts          # Animação escalonada
        ├── components/
        │   ├── Navbar.tsx             # Busca, carrinho, menu mobile
        │   ├── Footer.tsx
        │   ├── PrivateRoute.tsx       # Guard: redireciona para /login
        │   ├── AdminRoute.tsx         # Guard: redireciona para / se não admin
        │   ├── ProductCard.tsx        # Card de recomendação da IA
        │   ├── ProductImage.tsx       # Imagem com fallback em letra
        │   ├── Spinner.tsx            # Loading state
        │   └── BarcodeScanner.tsx     # Leitor de código de barras (câmera)
        ├── pages/
        │   ├── HomePage.tsx           # Hero + produtos em destaque + depoimentos
        │   ├── CatalogoPage.tsx       # Listagem com filtros e busca
        │   ├── ProdutoPage.tsx        # Detalhe: galeria, tallas, relacionados
        │   ├── CartPage.tsx           # Carrinho + resumo
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── QuizPage.tsx           # 6 perguntas de estilo
        │   ├── ResultsPage.tsx        # 3 recomendações da IA
        │   ├── HistoryPage.tsx        # Histórico de quiz
        │   ├── CheckoutPage.tsx       # 3 steps: endereço → pagamento → revisão
        │   ├── OrderConfirmationPage.tsx
        │   └── admin/
        │       ├── AdminProductsPage.tsx
        │       └── ProductFormPage.tsx
        ├── services/
        │   └── api.ts                 # Todas as chamadas fetch centralizadas
        ├── types/
        │   └── index.ts               # Interfaces TypeScript
        └── utils/
            ├── categories.ts          # Definições de categoria
            ├── format.ts              # Formatadores de preço e erro
            └── complementMap.ts       # Sugestões de produtos relacionados
```

---

## 4. Schema do Banco de Dados

O banco SQLite é criado automaticamente em `backend/boutique.db` na primeira inicialização via `backend/config/database.js`.

```sql
-- Usuários
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Produtos
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,      -- 'vestido' | 'camiseta' | 'calça' | 'conjunto' | 'jaqueta'
  style TEXT NOT NULL,         -- JSON: ["clássico", "moderno", ...]
  colors TEXT NOT NULL,        -- JSON: ["neutros", "tons quentes", ...]
  occasions TEXT NOT NULL,     -- JSON: ["trabalho", "festa", "casual", "passeio", "esporte"]
  sizes TEXT NOT NULL,         -- JSON: ["P", "M", "G", ...]
  description TEXT DEFAULT '',
  tag TEXT,                    -- Badge exibida no card: "NOVO", "DESTAQUE", etc.
  image_url TEXT,
  barcode TEXT,
  stock INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,    -- 0 = inativo (oculto no catálogo público)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Imagens extras por produto (galeria)
CREATE TABLE product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Resultados do quiz (IA)
CREATE TABLE recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  answers TEXT NOT NULL,   -- JSON com as respostas do quiz
  result TEXT NOT NULL,    -- JSON: { message, recommendations: [{id, name, reason, ...}] }
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pedidos
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'processing',
  total REAL NOT NULL,
  shipping_fee REAL DEFAULT 0,
  address TEXT NOT NULL,         -- JSON: { cep, street, number, complement, city, state }
  shipping_method TEXT NOT NULL, -- 'pac' | 'sedex'
  payment_method TEXT NOT NULL,  -- 'pix' | 'card'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Itens de pedido
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
```

**Importante sobre o módulo SQLite:**
- Usa `node:sqlite` (API nativa do Node 22+), **não** `better-sqlite3` nem `sqlite3`.
- API síncrona: `db.prepare(sql).run(params)`, `db.prepare(sql).get(params)`, `db.prepare(sql).all(params)`.
- Transações: `db.transaction(fn)()`.

---

## 5. Rotas da API

Base URL: `http://localhost:3001`

### Autenticação
| Método | Rota | Auth | CSRF | Descrição |
|--------|------|------|------|-----------|
| POST | `/api/auth/register` | — | — | Registro com name, email, password |
| POST | `/api/auth/login` | — | — | Login, retorna JWT em cookie |
| POST | `/api/auth/logout` | — | Sim | Limpa o cookie |
| GET | `/api/auth/me` | JWT | — | Retorna dados do usuário logado |

### Produtos (público)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/products` | Lista produtos ativos |
| GET | `/api/products/:id` | Detalhe de um produto |

### Admin (requer JWT + is_admin)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/products` | Lista todos os produtos (incl. inativos) |
| GET | `/api/admin/products/:id` | Detalhe admin |
| POST | `/api/admin/products` | Criar produto |
| PUT | `/api/admin/products/:id` | Atualizar produto |
| DELETE | `/api/admin/products/:id` | Excluir produto |
| POST | `/api/admin/products/upload` | Upload da imagem principal (multipart) |
| POST | `/api/admin/products/:id/images` | Adicionar imagem extra |
| DELETE | `/api/admin/products/:id/images/:imageId` | Remover imagem extra |

### Recomendações (requer JWT)
| Método | Rota | Rate limit | Descrição |
|--------|------|-----------|-----------|
| POST | `/api/recommendations` | 10/min | Envia respostas do quiz, retorna recomendações da IA |
| GET | `/api/recommendations/history` | — | Histórico do usuário |

### Pedidos (requer JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/orders` | Criar pedido (decrementa estoque) |
| GET | `/api/orders` | Listar pedidos do usuário |
| GET | `/api/orders/:id` | Detalhe do pedido |

### Frete
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/freight?cep=01310100&items=3` | Calcula PAC e SEDEX via ViaCEP |

### Health
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status do servidor |

---

## 6. Fluxo de Autenticação

```
Registro/Login
  → Backend: valida Zod → hash bcrypt (12 rounds) → gera JWT (7d)
  → Cookie: HttpOnly, Secure (prod), SameSite=Strict, Path=/api
  → Frontend: AuthContext chama /api/auth/me no mount para restaurar sessão

Rotas protegidas
  → authMiddleware.js: lê cookie → verifica JWT → popula req.user
  → adminMiddleware.js: verifica req.user.is_admin === 1

CSRF
  → csrfMiddleware.js: valida Origin header em métodos POST/PUT/DELETE
  → Apenas permite origens: FRONTEND_URL (env) ou localhost:5173

Admin
  → O email em ADMIN_EMAIL (env) recebe is_admin=1 automaticamente no registro
  → Só um usuário pode ser admin (via banco, manualmente)
```

---

## 7. Integração com IA (Anthropic)

### Quiz (6 perguntas)
| # | Campo | Opções |
|---|-------|--------|
| 1 | Ocasião | trabalho, festa, casual, passeio, esporte |
| 2 | Estilo | clássico, moderno, streetwear, boho, minimalista |
| 3 | Cores | neutros, tons quentes, tons frios, colorido (até 4) |
| 4 | Tamanho | PP, P, M, G, GG, XG, 34…46 |
| 5 | Orçamento | até R$100, R$100-200, R$200-400, acima de R$400 |
| 6 | Categoria | vestido, camiseta, calça, conjunto, jaqueta |

### Pipeline de recomendação (`recommendationService.js`)
1. Recebe respostas validadas pelo Zod (`quizValidator.js`)
2. Filtra o catálogo ativo por: ocasião, estilo, cores, tamanho, orçamento
3. Se resultado < 3 produtos → usa catálogo completo como fallback
4. Monta prompt com perfil do cliente e catálogo filtrado (JSON)
5. Chama `anthropic.messages.create()` com timeout de 10s
6. Extrai JSON da resposta (regex fallback se vier com markdown)
7. Valida schema: `{ message: string, recommendations: [{id, reason}] }` (exatamente 3)
8. Verifica que os IDs existem no catálogo enviado
9. Enriquece com dados completos do produto
10. Salva no banco (`recommendations` table)
11. Retorna para o frontend

### Prompt Engineering
- **System prompt**: Define papel de consultora de moda, exige JSON puro, previne prompt injection, lista formato esperado
- **User prompt**: Perfil do cliente em texto natural + catálogo como JSON
- **Modelo**: `claude-sonnet-4-6`
- **max_tokens**: 1000

---

## 8. Upload de Imagens

```
Admin seleciona arquivo (JPEG/PNG/WebP, ≤5MB)
  → Multer memory storage (sem arquivo temporário em disco)
  → Validação MIME e tamanho
  → Stream para Cloudinary (pasta: boutique-arco-iris, width: 800px)
  → URL retornada e salva no banco (image_url ou product_images)
```

- Imagem principal: campo `image_url` em `products`
- Imagens extras: tabela `product_images` (até 4, com `position`)
- Frontend exibe galeria com thumbnail clicável em `ProdutoPage`

---

## 9. Páginas do Frontend

| Página | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `HomePage` | `/` | — | Hero com ken-burns, produtos em destaque, depoimentos, como funciona |
| `CatalogoPage` | `/catalogo` | — | Grid de produtos, filtros por categoria, busca por nome |
| `ProdutoPage` | `/produto/:id` | — | Galeria, seleção de tamanho, adicionar ao carrinho, relacionados |
| `CartPage` | `/carrinho` | — | Lista de itens, ajuste de quantidade, subtotal |
| `LoginPage` | `/login` | — | Formulário email + senha |
| `RegisterPage` | `/register` | — | Formulário nome + email + senha |
| `QuizPage` | `/quiz` | JWT | 6 perguntas com animação de step |
| `ResultsPage` | `/results` | JWT | 3 cards de recomendação com justificativa da IA |
| `HistoryPage` | `/history` | JWT | Lista de quizzes anteriores com expansão |
| `CheckoutPage` | `/checkout` | JWT | Step 1: Endereço + CEP (busca ViaCEP) → Step 2: Método pagamento + frete → Step 3: Revisão + confirmar |
| `OrderConfirmationPage` | `/pedido/:id` | JWT | Resumo do pedido confirmado |
| `AdminProductsPage` | `/admin/produtos` | Admin | Tabela de todos os produtos, filtro ativo/inativo |
| `ProductFormPage` | `/admin/produtos/novo` e `/admin/produtos/:id` | Admin | Formulário completo de criação/edição |

---

## 10. Estado Global

### AuthContext (`src/context/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
```
- Inicializa chamando `GET /api/auth/me` no mount
- Enquanto `loading === true`, PrivateRoute e AdminRoute não redirecionam (evita flash)

### CartContext (`src/context/CartContext.tsx`)
```typescript
interface CartItem {
  productId: number;
  name: string;
  price: number;
  size: string;
  image_url?: string;
  quantity: number;
}
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}
```
- Persistido em `localStorage` (chave: `boutique-cart`)
- `count` e `total` são derivados de `items`

---

## 11. TypeScript — Interfaces Principais

Definidas em `frontend/src/types/index.ts`:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  style: string[];      // parsed from JSON string
  colors: string[];
  occasions: string[];
  sizes: string[];
  description: string;
  tag?: string;
  image_url?: string;
  barcode?: string;
  stock: number;
  active: boolean;
  images?: ProductImage[];
}

interface ProductImage {
  id: number;
  url: string;
  position: number;
}

interface Recommendation {
  id: number;
  product: Product;
  reason: string;
}

interface RecommendationResult {
  message: string;
  recommendations: Recommendation[];
}

interface Order {
  id: number;
  status: string;
  total: number;
  shipping_fee: number;
  address: Address;
  shipping_method: 'pac' | 'sedex';
  payment_method: 'pix' | 'card';
  created_at: string;
  items: OrderItem[];
}
```

---

## 12. Design System

### Paleta de Cores (Tailwind custom)
| Token | Hex | Uso |
|-------|-----|-----|
| `brand-bg` | `#faf8f5` | Fundo geral da página |
| `brand-surface` | `#f0ebe3` | Cards, inputs, superfícies |
| `brand-gold` | `#c4789a` | Botão primário, destaques, links |
| `brand-dark` | `#2c2420` | Texto principal |
| `brand-muted` | `#8b7355` | Texto secundário |
| `brand-border` | `#e5ddd5` | Bordas e divisores |

### Tipografia
- **Display**: Pinyon Script — logo "Arco-Íris Boutique"
- **Heading**: Playfair Display — títulos de seções
- **Body**: DM Sans — texto corrido, labels, botões

### Classes CSS Globais (`index.css`)
Todas as classes reutilizáveis usam `@apply`. Nunca adicione estilos inline no JSX.

| Classe | Uso |
|--------|-----|
| `.btn-gold` | Botão primário dourado/rosa |
| `.btn-outline` | Botão secundário com borda |
| `.btn-ghost` | Botão sem fundo |
| `.field-input` | Input de formulário |
| `.field-label` | Label de campo |
| `.card-surface` | Card com fundo surface e borda |
| `.rainbow-bar` | Faixa de degradê arco-íris (topo da navbar) |
| `.ken-burns` | Animação zoom lento para hero images |
| `.stagger-item` | Item com entrada escalonada |

---

## 13. Segurança

| Camada | Mecanismo |
|--------|-----------|
| Senhas | bcryptjs, 12 rounds, constante contra timing attack (dummy hash) |
| Sessão | JWT HttpOnly cookie, SameSite, 7 dias |
| CSRF | Validação de `Origin` header no middleware |
| Rate limit | Login 5/min, Registro 3/min, Recomendações 10/min |
| Validação | Zod em todas as entradas (backend e frontend) |
| Upload | MIME whitelist (JPEG/PNG/WebP), 5MB max, sem disco local |
| Admin | Double check: JWT + is_admin, não apenas role no token |
| IA | System prompt previne prompt injection; IDs validados contra catálogo enviado |

---

## 14. Cálculo de Frete (`freightRoutes.js`)

1. Recebe `cep` e `items` (quantidade) via query string
2. Consulta ViaCEP (`https://viacep.com.br/ws/{cep}/json/`) para obter estado
3. Determina zona de entrega (1–5) pelo estado
4. Calcula peso estimado: `items × 400g`
5. Seleciona faixa de preço em tabela estática (baseada em Correios)
6. Retorna:
```json
{
  "pac": { "price": 18.50, "days": 8 },
  "sedex": { "price": 35.20, "days": 2 }
}
```

---

## 15. Variáveis de Ambiente (`backend/.env`)

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=<string aleatória longa>
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
ADMIN_EMAIL=rjulianojunior@gmail.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

- `ADMIN_EMAIL`: usuário com esse email recebe `is_admin=1` automaticamente no registro
- `NODE_ENV=production`: ativa `secure: true` no cookie, oculta stack traces nos erros

---

## 16. Como Iniciar o Projeto

```bash
# Backend (porta 3001)
cd backend
node server.js
# O banco boutique.db é criado e populado automaticamente

# Frontend (porta 5173)
cd frontend
npm run dev
```

Não há step de build obrigatório para desenvolvimento. O banco SQLite é criado na primeira execução.

---

## 17. Padrões e Decisões de Arquitetura

### Backend

**Repository Pattern**
- Todo acesso ao banco passa por `repositories/`
- Controllers não chamam SQL diretamente — chamam repositories ou services
- Facilita mock em testes e troca de banco no futuro

**Service Layer**
- `authService`: hash, verify, token gerado aqui
- `recommendationService`: filtragem do catálogo + orquestração da chamada IA
- `orderService`: criação do pedido com transação SQLite

**Error Flow**
```
Controller throws Error (com err.status)
  → errorMiddleware.js captura
  → Responde com { error: message } e status correto
  → Em dev: inclui stack trace; em prod: mensagem genérica para 500
```

**Validação Zod**
```javascript
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
const parsed = schema.safeParse(req.body);
if (!parsed.success) {
  // formata erros de campo e retorna 422
}
```

### Frontend

**Chamadas API centralizadas**
- Todo `fetch` está em `frontend/src/services/api.ts`
- Sempre com `credentials: 'include'` (para o cookie)
- Tratamento de erro padronizado: extrai `error` do JSON ou usa `response.statusText`
- Nunca chame `fetch` diretamente nos componentes/páginas

**Contexto vs Props**
- Auth e Cart são globais → Context
- Estado local de página (loading, form data) → useState no próprio componente
- Não existe Redux ou Zustand

**CSS: regra absoluta**
- **Nunca** `style={{ ... }}` em JSX
- **Nunca** classes Tailwind inline que deveriam ser reutilizáveis
- Toda classe nova vai em `index.css` com `@apply`

---

## 18. Módulos e Dependências Notáveis

### Backend (`backend/package.json`)
```
express, cors, cookie-parser, dotenv
jsonwebtoken, bcryptjs
multer (memoryStorage)
cloudinary
@anthropic-ai/sdk
zod
express-rate-limit
node:sqlite (nativo — não instalar nada)
```

### Frontend (`frontend/package.json`)
```
react, react-dom, react-router-dom
typescript, vite
tailwindcss, postcss, autoprefixer
zod
@zxing/browser (leitor de código de barras via câmera)
```

---

## 19. Funcionalidades Pendentes / Não Implementadas

- **Pagamento real**: O checkout coleta método (PIX/cartão) mas não processa — é mock
- **Notificações por email**: Não há envio de email (sem Nodemailer ou similar)
- **Deploy em produção**: Sem configuração de CI/CD ou hosting
- **Testes automatizados**: Sem Jest, Vitest ou qualquer suite de testes
- **Paginação**: O catálogo carrega todos os produtos de uma vez
- **Busca fulltext**: A busca no catálogo é client-side (filter no array)

---

## 20. Pontos de Atenção para Manutenção

1. **`node:sqlite` é síncrono e nativo** — não confunda com `sqlite3` (callbacks) ou `better-sqlite3`. A API usa `db.prepare().run/get/all()`.

2. **JSON em campos do SQLite** — `style`, `colors`, `occasions`, `sizes` são armazenados como string JSON. O `productRepository` faz `JSON.parse` ao ler e `JSON.stringify` ao escrever.

3. **CSRF é por Origin** — O middleware não usa tokens CSRF tradicionais. Valida o header `Origin` da request. Em produção com HTTPS, isso é suficiente combinado com SameSite cookie.

4. **Admin é por email** — A promoção a admin acontece no momento do registro via `ADMIN_EMAIL`. Não há endpoint para promover usuários depois.

5. **Cloudinary folder** — Todas as imagens vão para `boutique-arco-iris/`. Não há limpeza automática de imagens antigas ao trocar a imagem de um produto.

6. **IA sem streaming** — A chamada Anthropic é blocking com timeout de 10s. Sem SSE ou WebSocket.

7. **CSS global** — `index.css` é o único arquivo de estilos além do Tailwind. Não há CSS Modules.
