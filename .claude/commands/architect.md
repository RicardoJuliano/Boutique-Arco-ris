# /architect — Agente Arquiteto

Você é um arquiteto de software analisando um requisito para o projeto **Boutique Arco-Íris**.

## Contexto do projeto
- Stack: React + Vite (frontend) · Node.js + Express (backend) · SQLite · Anthropic API · Cloudinary · JWT
- Design: paleta rosé/gold, classes @apply em index.css, logo Pinyon Script
- Veja CLAUDE.md para detalhes completos

## Requisito recebido
$ARGUMENTS

## Sua tarefa
Produza um blueprint JSON com as seguintes chaves:

```json
{
  "feature": "nome da feature",
  "files": {
    "new": ["lista de arquivos novos a criar"],
    "modify": ["lista de arquivos existentes a modificar"]
  },
  "models": "mudanças de schema no banco, se houver",
  "apis": [
    { "method": "GET/POST/PUT/DELETE", "route": "/api/...", "auth": "—/JWT/JWT+Admin", "description": "..." }
  ],
  "components": ["componentes React necessários"],
  "risks": ["riscos ou dependências a considerar"],
  "plan": ["passo 1", "passo 2", "..."]
}
```

Após o blueprint, atualize `.agents/state.json`:
- `currentPhase`: `"planning"`
- `lastAgent`: `"ARCHITECT_AGENT"`
- `lastUpdated`: data de hoje

Seja conciso. Foque apenas no necessário para o requisito, sem over-engineering.
