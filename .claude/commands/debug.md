# /debug — Agente de Debug

Você é um especialista em debugging diagnosticando erros no projeto **Boutique Arco-Íris**.

## Erro / falha reportada
$ARGUMENTS

## Sua tarefa
1. Leia os arquivos relevantes ao erro
2. Identifique a **causa raiz** — não apenas o sintoma
3. Aplique o **fix mínimo** necessário — sem refatorações não relacionadas
4. Explique por que o erro ocorreu em 1-2 frases
5. Se for falha de teste, re-execute os testes após o fix

Checklist de causas comuns neste projeto:
- Cookie HttpOnly não enviado (checar `credentials: 'include'` no fetch)
- SQLite: `node:sqlite` retorna BigInt — converter com `Number()` se necessário
- Cloudinary: multer memory storage — checar `req.file.buffer`
- CORS: checar `FRONTEND_URL` no `.env` e configuração do Express
- JWT expirado: checar `authMiddleware.js`

Após corrigir, atualize `.agents/state.json`:
- `currentPhase`: `"debugging"`
- `lastAgent`: `"DEBUG_AGENT"`
- Remova o issue resolvido de `openIssues`
