# Élite Moda — Consultora de Estilo com IA

## Sobre o Projeto

Élite Moda é uma aplicação web fullstack de portfólio que combina um e-commerce de moda com uma consultora de estilo alimentada pela API da Anthropic. O usuário cria uma conta, responde um questionário de seis perguntas sobre seu estilo pessoal e a IA analisa as respostas para recomendar as três peças do catálogo que melhor combinam com seu perfil — com justificativas personalizadas para cada escolha.

---

## Funcionalidades Implementadas

- **Autenticação completa**: cadastro, login, logout e sessão persistente via cookie HttpOnly
- **Questionário de estilo**: 6 perguntas com navegação passo a passo (ocasião, estilo, cores, tamanho, orçamento, categoria)
- **Recomendações por IA**: integração com `claude-haiku-4-5-20251001` para análise de perfil e seleção de produtos
- **Histórico de consultorias**: registro de todas as recomendações anteriores com data e respostas do quiz
- **Proteção contra prompt injection**: inputs validados como enums estritos (Zod) antes de chegar à IA
- **Validação de output da IA**: schema Zod verifica o JSON retornado antes de salvar no banco

---

## Tecnologias e Justificativas

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend | React 18 + Vite | SPA moderna com HMR rápido para desenvolvimento |
| Roteamento | React Router v6 | Padrão atual para SPAs React, com rotas protegidas |
| Estilização | Tailwind CSS | Utilitário — mantém estilos co-localizados com o componente |
| Backend | Node.js + Express | API REST leve, amplamente conhecida |
| Banco de dados | SQLite via `node:sqlite` | Zero configuração, sem dependências nativas, embutido no Node.js 22+ |
| Validação | Zod | Schema validation tipada para inputs E outputs da IA |
| Autenticação | JWT + bcryptjs | Stateless e seguro, padrão de mercado |
| Segurança HTTP | Helmet.js | Headers de segurança automáticos (CSP, HSTS, X-Frame-Options...) |
| Rate limiting | express-rate-limit | Proteção contra brute force e abuso da API Anthropic |
| IA | Anthropic API (Haiku) | Rápido e econômico para recomendações em tempo real |
| Env vars | dotenv | Separação de segredos do código-fonte |

> **Por que `node:sqlite` em vez de `better-sqlite3`?**
> O `better-sqlite3` requer compilação de binários nativos (node-gyp), que depende de Python e Visual Studio Build Tools — não disponíveis em todos os ambientes. O módulo `node:sqlite` é embutido no Node.js 22.5+ e oferece a mesma API síncrona sem nenhuma dependência externa.

> **Por que não Axios?** O `fetch` nativo resolve tudo no frontend sem dependência extra.

> **Por que não `csurf`?** O pacote foi deprecado e arquivado em 2023. A proteção CSRF é feita via `SameSite=Strict` no cookie + validação do header `Origin` no middleware.

---

## Como Rodar Localmente

### Pré-requisitos

- Node.js **22.5+** (para o módulo `node:sqlite`)
- Uma chave da API da Anthropic ([console.anthropic.com](https://console.anthropic.com))

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd elite-moda
```

### 2. Configurar o backend

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` e preencha:
- `JWT_SECRET`: gere com `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `ANTHROPIC_API_KEY`: sua chave da Anthropic

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

### 4. Acessar a aplicação

Abra `http://localhost:5173` no browser, crie uma conta e teste a consultoria.

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor Express (padrão: 3001) |
| `FRONTEND_URL` | URL do frontend — usada no CORS e validação de Origin (CSRF) |
| `JWT_SECRET` | Segredo para assinar tokens JWT — deve ser longo e aleatório |
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic — **nunca expor ao frontend** |
| `NODE_ENV` | `development` ou `production` — controla logs e `secure` nos cookies |

---

## Arquitetura

```
elite-moda/
│
├── backend/
│   ├── server.js              # Entry point — monta Express e registra middlewares
│   ├── config/
│   │   └── database.js        # Conexão SQLite, WAL mode, criação de tabelas
│   ├── data/
│   │   └── catalog.js         # Array de produtos (substituir por BD em produção)
│   ├── validators/            # Schemas Zod — validam inputs E outputs
│   ├── repositories/          # Queries SQL parametrizadas (única camada que toca o BD)
│   ├── services/              # Regras de negócio puras (sem req/res)
│   ├── middlewares/           # auth, csrf, rateLimiter, errorHandler
│   ├── controllers/           # Orquestração: valida → chama service → responde
│   └── routes/                # Define rotas com middlewares aplicados
│
└── frontend/
    └── src/
        ├── context/           # Estado global de auth (sem token no estado — fica no cookie)
        ├── hooks/             # useAuth() — acesso conveniente ao contexto
        ├── services/          # api.js — fetch centralizado com credentials: 'include'
        ├── components/        # Navbar, ProductCard, PrivateRoute
        └── pages/             # Home, Login, Register, Quiz, Results, History
```

**Fluxo de uma requisição:**
```
Request → Middleware(s) → Controller → Service → Repository → Database
                                         ↓
                                    Anthropic API (apenas em /recommendations)
```

---

## Fluxo da Aplicação

1. **Usuário acessa `/`** → vê a landing page com CTA para criar conta
2. **Cadastro em `/register`** → dados validados por Zod → senha hasheada com bcrypt → JWT gerado e salvo em cookie HttpOnly
3. **Login em `/login`** → mesma lógica → cookie renovado
4. **Quiz em `/quiz`** → 6 perguntas → ao submeter, respostas enviadas ao backend
5. **Backend recebe respostas** → valida com Zod (enums estritos) → filtra catálogo → monta prompt estruturado → chama Anthropic API → valida output com Zod → salva no banco
6. **Resultado em `/results`** → 3 cards de produtos com justificativas da IA
7. **Histórico em `/history`** → todas as consultas anteriores com data e produtos

---

## Segurança

| Medida | Implementação | Por quê |
|---|---|---|
| **JWT em cookie HttpOnly** | `res.cookie('token', jwt, { httpOnly: true })` | JavaScript não acessa o cookie — elimina XSS como vetor de roubo de token |
| **SameSite=Strict** | Atributo do cookie | Browser não envia cookie em requisições cross-site — proteção CSRF primária |
| **Validação de Origin** | `csrfMiddleware.js` | Segunda barreira CSRF para browsers antigos |
| **Rate limiting** | `express-rate-limit` | Anti brute-force no login, anti-spam no cadastro, anti-abuso na IA |
| **Helmet.js** | `app.use(helmet())` | Headers HTTP de segurança (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS restrito** | `origin: process.env.FRONTEND_URL` | Apenas o frontend autorizado pode chamar a API |
| **Zod em inputs** | Enums estritos no quiz | Bloqueia prompt injection — nenhum texto livre do usuário chega à IA |
| **Zod em outputs** | Schema no output da IA | Nunca confiar cegamente no retorno da IA |
| **Queries parametrizadas** | `db.prepare('... WHERE id = ?').get(id)` | Impede SQL injection |
| **bcrypt saltRounds: 12** | `bcrypt.hash(password, 12)` | Força bruta computacionalmente inviável |
| **Anti timing attack** | `bcrypt.compare()` sempre executa | Impede identificar emails válidos pela velocidade de resposta |
| **Zero `dangerouslySetInnerHTML`** | Política do frontend | React escapa HTML por padrão — não contornar |
| **Sem upload de arquivos** | Não implementado | Upload é superfície de ataque desnecessária para este projeto |
| **Secrets no `.env`** | `dotenv` + `.env` no `.gitignore` | Chaves nunca no repositório |
| **Timeout na Anthropic** | `AbortSignal.timeout(10000)` | Impede requisições travadas bloqueando o event loop |

---

## Como Adicionar Produtos ao Catálogo

Edite o arquivo `backend/data/catalog.js`:

1. Copie um produto existente
2. Atribua um `id` único (sequencial)
3. Preencha todos os campos obrigatórios
4. Use **exatamente** os valores de `style`, `colors` e `occasions` listados abaixo (em minúsculas):

```javascript
// Valores válidos:
style:     ['clássico', 'moderno', 'streetwear', 'boho', 'minimalista']
colors:    ['neutros', 'tons quentes', 'tons frios', 'colorido']
occasions: ['trabalho', 'festa', 'casual', 'passeio', 'esporte']
category:  ['camiseta', 'calça', 'vestido', 'jaqueta', 'conjunto']
sizes:     ['P', 'M', 'G', 'GG']
```

> Em produção, substituir o array estático por queries ao banco com paginação e busca.

---

## Sugestões de Deploy

### Frontend → Vercel

1. Push do código para GitHub
2. Importar repositório no Vercel
3. Configurar `Root Directory: frontend`
4. Deploy automático a cada push

### Backend → Railway

1. Criar novo projeto no Railway
2. Conectar ao repositório GitHub, selecionar pasta `backend`
3. Adicionar as variáveis de ambiente (JWT_SECRET, ANTHROPIC_API_KEY, etc.)
4. Configurar `FRONTEND_URL` com a URL do Vercel

> **Atenção com o SQLite em produção**: o arquivo `database.db` não persiste entre redeploys no Railway (sistema de arquivos efêmero). Para produção real, migrar para PostgreSQL com [Railway Postgres](https://railway.app) ou usar um volume persistente.
