# Briefing — Boutique Arco-Íris

Aplicação web de moda com consultora de IA e painel admin. Desenvolvida para a loja **Boutique Arco-Íris**.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite + React Router v6 |
| Estilo | Tailwind CSS com @apply em `index.css` |
| Backend | Node.js + Express |
| Banco | SQLite via `node:sqlite` nativo (sem pacote externo) |
| Auth | JWT em cookie HttpOnly |
| IA | Anthropic API (`claude-sonnet-4-6`) |
| Imagens | Cloudinary (upload via multer memory storage) |
| Fontes | Cormorant Garamond (display), Jost (body), Pinyon Script (logo script) |

---

## Como rodar

```bash
# Terminal 1 — backend
cd backend
node server.js        # ou: node --watch server.js (auto-reload)

# Terminal 2 — frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

---

## Variáveis de ambiente — `backend/.env`

```
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
ADMIN_EMAIL=rjulianojunior@gmail.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

O usuário que registrar com `ADMIN_EMAIL` vira admin automaticamente.  
Se o usuário já existia antes de definir `ADMIN_EMAIL`, rodar no banco:
```bash
node -e "const db = require('./config/database'); db.prepare('UPDATE users SET is_admin = 1 WHERE email = ?').run('rjulianojunior@gmail.com');"
```

---

## Estrutura do projeto

```
elite-moda/
├── backend/
│   ├── config/
│   │   ├── database.js          # SQLite — cria tabelas, seeds catálogo
│   │   └── cloudinary.js        # Config Cloudinary
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js   # CRUD produtos + upload imagem
│   │   └── recommendationController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verifica JWT, popula req.user
│   │   ├── adminMiddleware.js   # Bloqueia se !req.user.isAdmin
│   │   ├── errorMiddleware.js
│   │   └── rateLimiter.js
│   ├── repositories/
│   │   ├── productRepository.js # findAll, findActive, findById, create, update, remove
│   │   ├── userRepository.js
│   │   └── recommendationRepository.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js       # /api/admin/products (protegido por auth+admin)
│   │   └── recommendationRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   └── recommendationService.js  # Chama Anthropic, usa productRepository
│   ├── data/
│   │   └── catalog.js           # Catálogo estático (legado — DB é a fonte principal agora)
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx        # Logo script, hamburger mobile, link Admin para admins
        │   ├── PrivateRoute.jsx
        │   └── AdminRoute.jsx    # Redireciona se não for admin
        ├── context/
        │   └── AuthContext.jsx   # Expõe: user, isAuthenticated, isAdmin, login, logout
        ├── hooks/
        │   └── useAuth.js
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── QuizPage.jsx
        │   ├── ResultsPage.jsx
        │   ├── HistoryPage.jsx
        │   └── admin/
        │       ├── AdminProductsPage.jsx  # Tabela de produtos com editar/remover
        │       └── ProductFormPage.jsx    # Formulário criar/editar + upload foto
        ├── services/
        │   └── api.js            # Todas as chamadas fetch (auth + recomendações + admin)
        ├── App.jsx               # Rotas: público / PrivateRoute / AdminRoute
        └── index.css             # Classes @apply (btn-gold, field-input, page-title, etc.)
```

---

## Rotas da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/register | — | Criar conta |
| POST | /api/auth/login | — | Login |
| POST | /api/auth/logout | — | Logout |
| GET | /api/auth/me | JWT | Dados do usuário logado |
| POST | /api/recommendations | JWT | Gerar recomendações IA |
| GET | /api/recommendations/history | JWT | Histórico |
| GET | /api/admin/products | JWT + Admin | Listar todos os produtos |
| GET | /api/admin/products/:id | JWT + Admin | Produto por ID |
| POST | /api/admin/products | JWT + Admin | Criar produto |
| PUT | /api/admin/products/:id | JWT + Admin | Editar produto |
| DELETE | /api/admin/products/:id | JWT + Admin | Remover produto |
| POST | /api/admin/products/upload | JWT + Admin | Upload imagem → Cloudinary |

---

## Banco de dados — tabelas

**users**: id, name, email, password_hash, is_admin, created_at  
**products**: id, name, price, category, style (JSON), colors (JSON), occasions (JSON), sizes (JSON), description, tag, image_url, stock, active, created_at, updated_at  
**recommendations**: id, user_id, answers (JSON), result (JSON), created_at

O banco é inicializado automaticamente em `config/database.js`. Se a tabela `products` estiver vazia, faz seed com o catálogo de `data/catalog.js`.

---

## Design

- Paleta clara/rosé: bg `#faf8f5`, surface `#f0ebe3`, gold/rosa `#c4789a`, texto `#2c2420`
- Faixa arco-íris em degradê no topo da navbar (CSS `rainbow-bar`)
- Logo em fonte script Pinyon Script: "Arco-Íris" + "Boutique" abaixo
- Todas as classes de estilo ficam em `index.css` com `@apply` — o JSX usa só um nome de classe (ex: `btn-gold`, `field-input`)

---

## Estado atual

- [x] Auth completo (register, login, logout, sessão persistente)
- [x] Quiz de moda com 6 perguntas
- [x] Consultora IA (Anthropic) — modelo `claude-sonnet-4-6`
- [x] Histórico de recomendações
- [x] Painel admin — listagem e formulário de produtos
- [x] Upload de imagem para Cloudinary
- [x] Responsivo com menu hamburger

## Possíveis próximos passos

- Página pública de catálogo (vitrine de produtos ativos para clientes)
- Exibir foto dos produtos nas recomendações da IA
- Paginação na listagem admin
- Deploy (Render/Railway para o backend, Vercel/Netlify para o frontend)
