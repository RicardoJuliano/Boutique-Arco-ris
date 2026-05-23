# 🛍️ Boutique Arco-Íris — E-commerce Fullstack com Consultora de Estilo por IA

Aplicação web fullstack de portfólio que combina um e-commerce de moda completo com uma consultora de estilo alimentada pela API da Anthropic. O usuário navega pelo catálogo, recebe recomendações personalizadas via IA, adiciona produtos ao carrinho e finaliza pedidos com cálculo de frete real — tudo com autenticação segura e painel administrativo para gestão da loja.

---

## ✨ Funcionalidades

### Para o cliente
- **Catálogo de produtos** com filtros por categoria, estilo, ocasião e faixa de preço
- **Página individual de produto** com galeria de imagens, variações de tamanho e histórico de produtos vistos recentemente
- **Consultora de estilo por IA** — quiz de 6 perguntas → análise do perfil → 3 recomendações personalizadas com justificativas
- **Histórico de consultorias** — todas as sessões anteriores com data e produtos recomendados
- **Carrinho de compras** com contexto global — persiste entre páginas sem recarregar
- **Checkout completo** com endereço de entrega, escolha de método de envio (PAC/SEDEX) e forma de pagamento (cartão/PIX)
- **Cálculo de frete em tempo real** via endpoint dedicado
- **Confirmação de pedido** com resumo e número do pedido
- **Autenticação completa** — cadastro, login, logout e sessão persistente via cookie HttpOnly

### Para o administrador
- **Painel admin** protegido por role (`is_admin`) com middleware dedicado
- **CRUD completo de produtos** — criar, editar, ativar/desativar, com upload de imagem via Cloudinary
- **Gestão de estoque** com controle transacional e guard contra race condition

---

## 🚀 Stack Tecnológico

### Frontend
| Tecnologia | Versão | Por quê |
|---|---|---|
| React | 18 | SPA moderna com renderização eficiente via reconciliação |
| Vite | 5 | Build tool com HMR instantâneo — DX superior ao CRA |
| React Router | v6 | Roteamento declarativo com rotas protegidas (`PrivateRoute`, `AdminRoute`) |
| Tailwind CSS | 3 | Utilitário — estilos co-localizados com o componente, sem CSS morto |

### Backend
| Tecnologia | Versão | Por quê |
|---|---|---|
| Node.js | ≥22.5 | Runtime — permite usar `node:sqlite` nativo sem dependências extras |
| Express | 4 | API REST leve, com middleware pipeline bem estabelecido |
| SQLite via `node:sqlite` | embutido | Zero dependências nativas — sem `node-gyp`, sem Python, sem Visual Studio Build Tools |
| Zod | 3 | Schema validation tipada para inputs do usuário **e** outputs da IA |
| JWT + bcryptjs | — | Autenticação stateless com bcrypt saltRounds 12 |
| Helmet.js | 7 | Headers HTTP de segurança automáticos (CSP, HSTS, X-Frame-Options...) |
| express-rate-limit | 7 | Proteção contra brute force no login e abuso da API Anthropic |
| Cloudinary + multer | — | Upload e hospedagem de imagens de produtos no painel admin |
| dotenv | 16 | Separação de secrets do código-fonte |

### IA
| Tecnologia | Por quê |
|---|---|
| Anthropic API (Claude Sonnet) | Análise de perfil de estilo e seleção de produtos com justificativas personalizadas |

---

## 🏗️ Arquitetura

```
boutique-arco-iris/
│
├── backend/
│   ├── server.js                    # Entry point — Express + middlewares na ordem correta
│   ├── config/
│   │   ├── database.js              # SQLite, WAL mode, FK, criação de tabelas, seed
│   │   └── cloudinary.js            # Config Cloudinary para upload de imagens
│   ├── data/
│   │   └── catalog.js               # Seed inicial de produtos
│   ├── validators/
│   │   ├── authValidator.js         # Zod schemas para cadastro e login
│   │   └── quizValidator.js         # Zod schemas para respostas do quiz (enums estritos)
│   ├── repositories/                # Única camada que toca o banco — queries parametrizadas
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   ├── recommendationRepository.js
│   │   └── orderRepository.js
│   ├── services/                    # Regras de negócio puras (sem req/res)
│   │   ├── authService.js
│   │   ├── recommendationService.js # Filtro do catálogo + chamada Anthropic + validação Zod
│   │   └── orderService.js          # Transação SQLite com guard de estoque
│   ├── middlewares/
│   │   ├── authMiddleware.js        # Verifica JWT do cookie
│   │   ├── adminMiddleware.js       # Verifica is_admin no payload do JWT
│   │   ├── csrfMiddleware.js        # Valida header Origin como segunda barreira CSRF
│   │   ├── rateLimiter.js           # Limites por rota (login, register, recomendações)
│   │   └── errorMiddleware.js       # Handler global de erros (4 parâmetros)
│   ├── controllers/                 # Orquestração: valida → chama service → responde
│   │   ├── authController.js
│   │   ├── recommendationController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── productRoutes.js
│       ├── recommendationRoutes.js
│       ├── orderRoutes.js
│       ├── freightRoutes.js         # Cálculo de frete PAC/SEDEX
│       └── adminRoutes.js           # Rotas protegidas por adminMiddleware
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx      # Estado global de autenticação (token no cookie, não no estado)
        │   └── CartContext.jsx      # Carrinho global persistente entre páginas
        ├── hooks/
        │   ├── useAuth.js           # Acesso conveniente ao AuthContext
        │   ├── useRecentlyViewed.js # Produtos visitados recentemente (localStorage)
        │   └── useStagger.js        # Animações de entrada em sequência
        ├── components/
        │   ├── PrivateRoute.jsx     # Redireciona para /login se não autenticado
        │   ├── AdminRoute.jsx       # Redireciona se não for admin
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   └── ProductCard.jsx
        ├── services/
        │   └── api.js               # fetch centralizado com credentials: 'include'
        ├── utils/
        │   └── complementMap.js     # Mapeia categorias a produtos complementares ("Complete o Look")
        └── pages/
            ├── HomePage.jsx
            ├── CatalogoPage.jsx
            ├── ProdutoPage.jsx      # Produto individual + recently viewed
            ├── CartPage.jsx
            ├── CheckoutPage.jsx     # Endereço + frete + pagamento
            ├── OrderConfirmationPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── QuizPage.jsx
            ├── ResultsPage.jsx
            ├── HistoryPage.jsx
            ├── AdminProductsPage.jsx
            └── ProductFormPage.jsx      # Criar/editar produto com upload de imagem
```

**Fluxo de uma requisição:**
```
Request → Middleware(s) → Controller → Service → Repository → Database
                                          ↓
                                    Anthropic API (apenas em /recommendations)
                                          ↓
                                    Cloudinary (apenas em /admin/produtos)
```

---

## 🔒 Segurança

| Medida | Implementação | Por quê |
|---|---|---|
| **JWT em cookie HttpOnly** | `res.cookie('token', jwt, { httpOnly: true })` | JavaScript não acessa o cookie — XSS não consegue roubar o token |
| **SameSite=Strict** | Atributo do cookie | Browser não envia cookie em requisições cross-site — proteção CSRF primária |
| **Validação de Origin** | `csrfMiddleware.js` | Segunda barreira CSRF para browsers antigos |
| **Rate limiting por rota** | `express-rate-limit` | Anti brute-force no login, anti-spam no cadastro, anti-abuso na IA |
| **Helmet.js** | `app.use(helmet())` | CSP, HSTS, X-Frame-Options, X-Content-Type-Options automáticos |
| **CORS restrito** | `origin: process.env.FRONTEND_URL` | Apenas o frontend autorizado pode chamar a API |
| **Zod em inputs** | Enums estritos no quiz | Bloqueia prompt injection — nenhum texto livre do usuário chega à IA |
| **Zod em outputs** | Schema no retorno da IA | Nunca confiar cegamente no output — IDs validados contra o catálogo real |
| **Queries parametrizadas** | `db.prepare('WHERE id = ?').get(id)` | Impede SQL injection |
| **bcrypt saltRounds: 12** | `bcrypt.hash(password, 12)` | Força bruta computacionalmente inviável |
| **Anti timing attack** | `bcrypt.compare()` sempre executa | Impede identificar emails válidos pela diferença de tempo de resposta |
| **Guard de estoque transacional** | `UPDATE ... WHERE stock >= ? + changes === 0` | Impede venda acima do estoque em requisições concorrentes |
| **Validação de env vars na inicialização** | `process.exit(1)` se ausentes | Falha rápida com mensagem clara em vez de erro críptico em runtime |
| **Timeout na Anthropic** | `AbortSignal.timeout(10000)` | Impede requisições travadas bloqueando o event loop |
| **Role-based access** | `adminMiddleware.js` | Rotas de admin inacessíveis para usuários comuns mesmo com JWT válido |
| **Secrets no `.env`** | `.env` no `.gitignore` | Chaves da API nunca no repositório |
| **Payload limit** | `express.json({ limit: '10kb' })` | Reduz superfície de ataque de payloads gigantes |

> **Por que `node:sqlite` em vez de `better-sqlite3`?**
> O `better-sqlite3` requer compilação de binários nativos (`node-gyp`), que depende de Python e Visual Studio Build Tools. O `node:sqlite` é embutido no Node.js 22.5+ e oferece a mesma API síncrona sem dependência alguma.

> **Por que não Axios?** O `fetch` nativo cobre tudo no frontend sem dependência extra.

> **Por que não `csurf`?** Foi deprecado e arquivado em 2023. A proteção CSRF é feita via `SameSite=Strict` no cookie + validação do header `Origin` no middleware.

---

## 🤖 Fluxo da Consultora de Estilo por IA

```
Quiz (6 perguntas com enums estritos)
  ↓
Zod valida inputs — nenhum texto livre chega à IA
  ↓
Filtra catálogo por estilo, ocasião, cores, tamanho, orçamento, categoria
  ↓
Monta prompt estruturado com catálogo filtrado
  ↓
Anthropic API → JSON com 3 IDs + justificativas
  ↓
Zod valida output — formato e IDs verificados contra o catálogo real
  ↓
Enriquece com dados completos dos produtos → salva no banco → retorna ao frontend
```

**Proteção contra prompt injection:** as respostas do quiz são enums estritos validados por Zod antes de chegar ao serviço. Nenhum texto livre do usuário é interpolado no prompt.

---

## 🛒 Fluxo do Pedido

```
Adicionar ao carrinho (CartContext global)
  ↓
Checkout: endereço + método de envio → /api/freight calcula frete real
  ↓
Submissão → /api/orders
  ↓
orderService.createOrder() inicia transação SQLite:
  - Valida estoque de cada item
  - Decrementa com guard de concorrência
  - Cria pedido + itens
  - Faz commit (ou rollback automático em erro)
  ↓
OrderConfirmationPage com resumo e número do pedido
```

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos
- **Node.js 22.5+** (para o módulo `node:sqlite`)
- Chave da API da Anthropic — [console.anthropic.com](https://console.anthropic.com)
- Conta no Cloudinary (para upload de imagens no painel admin) — [cloudinary.com](https://cloudinary.com)

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/boutique-arco-iris.git
cd boutique-arco-iris
```

### 2. Configurar o backend

```bash
cd backend
cp .env.example .env
```

Edite `.env`:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Gere com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=seu_secret_aqui

ANTHROPIC_API_KEY=sua_chave_anthropic

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

```bash
npm install
npm run dev
```

O backend sobe em `http://localhost:3001`.

### 3. Configurar o frontend

```bash
cd ../frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

### 4. Criar conta admin (opcional)

Para acessar o painel admin, promova um usuário diretamente no banco após cadastro:

```bash
cd backend
node -e "
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('database.db');
db.prepare('UPDATE users SET is_admin = 1 WHERE email = ?').run('seu@email.com');
console.log('Usuário promovido a admin.');
"
```

---

## 🌐 Deploy

### Frontend → Vercel

1. Push do código para GitHub
2. Importar repositório no Vercel
3. `Root Directory: frontend`
4. Deploy automático a cada push na branch `main`

### Backend → Railway

1. Criar novo projeto no Railway
2. Conectar ao repositório GitHub, selecionar pasta `backend`
3. Adicionar variáveis de ambiente (JWT_SECRET, ANTHROPIC_API_KEY, CLOUDINARY_*, FRONTEND_URL)
4. Configurar `FRONTEND_URL` com a URL gerada pelo Vercel

> ⚠️ **SQLite em produção:** o `database.db` não persiste entre redeploys no Railway (sistema de arquivos efêmero). Para produção real, migrar para PostgreSQL via [Railway Postgres](https://railway.app) ou usar um volume persistente.

---

## 📚 O que aprendi com esse projeto

- Arquitetura em camadas (routes → controllers → services → repositories) e por que ela facilita manutenção e testes
- Autenticação segura com JWT em cookie HttpOnly — diferença prática para localStorage
- Como implementar proteção CSRF sem depender de pacotes deprecados
- Validação de inputs e outputs com Zod — incluindo saídas de LLMs
- Proteção contra prompt injection em aplicações com IA
- Gestão de estado global com Context API — auth e carrinho sem Redux
- Transações SQLite com guard de concorrência para pedidos
- Upload e hospedagem de imagens via Cloudinary + multer
- Rotas protegidas por autenticação e por role no React Router v6
- Deploy fullstack com Vercel (frontend) + Railway (backend)

---

## 👤 Autor

**Ricardo Juliano Jr**
Desenvolvedor front-end em transição para desenvolvimento fullstack, construindo na prática um projeto de cada vez.

Projeto desenvolvido para a Boutique Arco-Íris, loja multimarcas localizada em Buenópolis/MG. A aplicação está em desenvolvimento ativo e não está em produção.
