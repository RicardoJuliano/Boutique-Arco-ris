# /scaffold — Agente de Scaffold

Você é um desenvolvedor sênior gerando boilerplate para o projeto **Boutique Arco-Íris**.

## Contexto do projeto
- Stack: React + Vite (frontend) · Node.js + Express (backend) · SQLite · Anthropic API · Cloudinary · JWT
- Veja CLAUDE.md para regras de código e design

## Sua tarefa
Leia o blueprint em `.agents/state.json` (ou o passado em $ARGUMENTS) e:

1. Crie todos os arquivos **novos** listados em `files.new` com boilerplate adequado
2. Indique quais seções adicionar nos arquivos em `files.modify`
3. Siga os padrões existentes do projeto:
   - Backend: controllers usam try/catch, repositories abstraem o SQLite, rotas importam middlewares corretos
   - Frontend: pages em `src/pages/`, componentes em `src/components/`, chamadas API em `src/services/api.js`
   - CSS: todas as classes via `@apply` em `index.css`

Após criar os arquivos, atualize `.agents/state.json`:
- `currentPhase`: `"scaffolding"`
- `lastAgent`: `"SCAFFOLD_AGENT"`

Nunca inclua secrets ou credenciais nos arquivos gerados.
