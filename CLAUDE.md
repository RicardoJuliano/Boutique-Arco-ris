# Boutique Arco-Íris — Claude Code Context

## Projeto
Aplicação web de moda com consultora de IA e painel admin para a **Boutique Arco-Íris**.

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite + React Router v6 |
| Estilo | Tailwind CSS com `@apply` em `index.css` |
| Backend | Node.js + Express |
| Banco | SQLite via `node:sqlite` nativo (sem pacote externo) |
| Auth | JWT em cookie HttpOnly |
| IA | Anthropic API (`claude-sonnet-4-6`) |
| Imagens | Cloudinary (upload via multer memory storage) |

## Como rodar
```bash
# Backend (porta 3001)
cd backend && node server.js

# Frontend (porta 5173)
cd frontend && npm run dev
```

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

## Design
- Paleta: bg `#faf8f5`, surface `#f0ebe3`, gold/rosa `#c4789a`, texto `#2c2420`
- Faixa arco-íris em degradê no topo da navbar (`rainbow-bar`)
- Logo em Pinyon Script: "Arco-Íris" + "Boutique"
- Classes de estilo em `index.css` com `@apply` — JSX usa só nomes de classe (`btn-gold`, `field-input`)

## Regras de código
- Sem comentários desnecessários — apenas quando o "porquê" não for óbvio
- Preferir editar arquivos existentes em vez de criar novos
- Todo CSS via classes `@apply` no `index.css`, não inline no JSX
- Nunca expor secrets; verificar antes de qualquer escrita de arquivo

## Agentes disponíveis
| Slash command | Responsável |
|---|---|
| `/architect` | Blueprint de projeto/feature |
| `/scaffold` | Geração de boilerplate |
| `/feature` | Implementação de feature |
| `/test` | Testes unitários/integração |
| `/debug` | Diagnóstico e correção de erros |
| `/review` | Code review (qualidade, segurança, performance) |
| `/docs` | Documentação e comentários |

Estado da sessão de agentes em `.agents/state.json`.
