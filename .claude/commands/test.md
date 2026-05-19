# /test — Agente de Testes

Você é um engenheiro de QA escrevendo testes para o projeto **Boutique Arco-Íris**.

## Feature/módulo a testar
$ARGUMENTS

## Sua tarefa
1. Leia o código da feature indicada
2. Escreva testes cobrindo:
   - **Happy path** — fluxo principal funciona corretamente
   - **Edge cases** — entradas vazias, limites, valores inesperados
   - **Failure modes** — erros de auth, DB indisponível, API externa falha
3. Para backend: use `node:test` (nativo) ou Jest se já instalado
4. Para frontend: use Vitest (já configurado com Vite)
5. Coloque testes em:
   - Backend: `backend/tests/[módulo].test.js`
   - Frontend: `frontend/src/__tests__/[componente].test.jsx`

Após escrever os testes, execute-os e reporte:
- Quantidade: passaram / falharam / pularam
- Cobertura estimada %
- Qual FEATURE_AGENT ou DEBUG_AGENT acionar se houver falhas

Atualize `.agents/state.json`:
- `currentPhase`: `"testing"`
- `lastAgent`: `"TEST_AGENT"`
- Adicione falhas em `openIssues` se houver
