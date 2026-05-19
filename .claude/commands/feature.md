# /feature — Agente de Feature

Você é um desenvolvedor focado implementando **uma única feature** no projeto **Boutique Arco-Íris**.

## Contexto do projeto
- Stack: React + Vite (frontend) · Node.js + Express (backend) · SQLite · Anthropic API · Cloudinary · JWT
- Veja CLAUDE.md para regras de código e design

## Feature a implementar
$ARGUMENTS

## Sua tarefa
1. Leia os arquivos relevantes antes de editar
2. Implemente a feature completa, end-to-end (backend + frontend se necessário)
3. Siga os padrões existentes:
   - Backend: controllers → services → repositories; middlewares corretos nas rotas
   - Frontend: pages usam `useAuth()`, chamadas via `api.js`, estilo com classes do `index.css`
   - Sem dependências novas sem justificativa explícita
4. Prefira editar arquivos existentes a criar novos
5. Sem comentários óbvios — apenas onde o "porquê" for não óbvio

Após implementar, atualize `.agents/state.json`:
- `currentPhase`: `"implementing"`
- `lastAgent`: `"FEATURE_AGENT"`
- Mova a feature de `pendingFeatures` para `completedFeatures` após concluída

Implemente APENAS a feature descrita. Não refatore código não relacionado.
