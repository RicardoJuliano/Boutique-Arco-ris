# Correções de Segurança Aplicadas — Boutique Arco-Íris
**Data:** 2026-05-20  
**Baseado em:** `security_report.md`  
**Agente:** Fixer Agent (Engenheiro de Segurança Sênior)

---

## Sumário

| ID | Severidade | Status |
|----|-----------|--------|
| CRIT-01 | Crítica | ✅ Verificado — .env já ignorado pelo git |
| CRIT-02 | Crítica | ✅ Corrigido |
| ALTA-01 | Alta | ✅ Corrigido |
| ALTA-02 | Alta | ✅ Corrigido |
| ALTA-03 | Alta | ⚠️ Documentado — requer decisão arquitetural |
| ALTA-04 | Alta | ✅ Corrigido |
| ALTA-05 | Alta | ✅ Corrigido |
| BAIXA-01 | Baixa | ✅ Corrigido |
| BAIXA-03 | Baixa | ✅ Corrigido |
| MEDIA-01/02 | Média | ✅ Mitigado (React escapa por padrão + validação admin) |
| MEDIA-03 | Média | ⚠️ Pendente manual — refatoração de localStorage |
| MEDIA-04 | Média | ✅ Corrigido (junto com ALTA-01) |
| MEDIA-05 | Média | ℹ️ Aceito — single instance em Render |
| MEDIA-06/07 | Média | ℹ️ Aceito — risco baixo / design intencional |
| BAIXA-02/04/05 | Baixa | ℹ️ Aceito ou documentado |

---

## Correções Detalhadas

---

### ✅ CRIT-01 — Secrets no .env
**Arquivo:** `backend/.gitignore`, `.gitignore`  
**Status:** Verificado — o arquivo `.env` JÁ estava listado em ambos os `.gitignore` e NÃO estava rastreado pelo git (`git ls-files backend/.env` retornou vazio).

**Ação necessária do desenvolvedor:**
> As credenciais foram expostas no relatório do agente atacante. Por precaução, **revogue e gere novas credenciais** em:
> - [Anthropic Console](https://console.anthropic.com) — revogar `ANTHROPIC_API_KEY`
> - [Cloudinary Dashboard](https://cloudinary.com/console) — rotacionar `API_KEY` e `API_SECRET`
> - Gerar novo `JWT_SECRET` (64+ bytes aleatórios): `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

### ✅ CRIT-02 — Escalada de Privilégio no Registro
**Arquivo:** `backend/services/authService.js`, linha 17  
**Antes:**
```js
const isAdmin = process.env.ADMIN_EMAIL === email ? 1 : 0;
```
**Depois:**
```js
// Novos usuários SEMPRE começam sem privilégios admin (isAdmin = 0).
const user = userRepository.create({ name, email, passwordHash, isAdmin: 0 });
```
**Justificativa:** Promoção a admin nunca deve depender de um campo fornecido externamente pelo usuário, mesmo que seja o email. Promoção deve ser feita diretamente no banco por um admin existente.

**Ação necessária:** Para promover o primeiro admin, execute diretamente no banco:
```sql
UPDATE users SET is_admin = 1 WHERE email = 'rjulianojunior@gmail.com';
```

---

### ✅ ALTA-01 + MEDIA-04 — CSRF em Rotas Críticas
**Arquivos modificados:**
- `backend/routes/orderRoutes.js` — `csrfMiddleware` adicionado em `POST /`
- `backend/routes/adminRoutes.js` — `router.use(csrfMiddleware)` após authMiddleware e adminMiddleware (cobre todos os endpoints admin)
- `backend/routes/authRoutes.js` — `csrfMiddleware` adicionado em `POST /logout`

**Justificativa:** O `csrfMiddleware` existente valida o header `Origin`/`Referer` contra `FRONTEND_URL`. O browser envia `Origin` automaticamente em requisições `fetch` com `credentials: 'include'`, portanto nenhuma mudança no frontend foi necessária.

---

### ✅ ALTA-02 — Race Condition + Estoque Nunca Decrementado
**Arquivo:** `backend/services/orderService.js`  
**Mudanças:**
1. Toda a lógica de criação de pedido movida para `db.transaction(...)()` — transação atômica SQLite
2. Verificação de estoque e decremento agora ocorrem dentro da mesma transação:
```js
db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, product.id);
```
3. Removida a tabela hardcoded `SHIPPING = { pac: 12.90, sedex: 25.90 }` — frete agora vem do frontend após cálculo real pelo `/api/freight`

**Justificativa:** SQLite com `db.transaction()` garante serialização das operações — múltiplas requisições simultâneas aguardam o lock, eliminando o TOCTOU.

---

### ✅ ALTA-03 — Campos de Cartão sem Gateway PCI-DSS
**Arquivo:** `frontend/src/pages/CheckoutPage.jsx`  
**Status:** Documentado com comentário obrigatório no código:
```jsx
{/* TODO(PCI-DSS): substituir estes campos por iframe tokenizado de gateway
    certificado (Stripe Elements / Mercado Pago) antes do deploy em produção.
    Os dados abaixo NÃO são enviados ao backend — são apenas UI de protótipo. */}
```

**Ação necessária do desenvolvedor:**
> Antes de aceitar pagamentos reais, integrar um dos seguintes:
> - **Stripe** (`@stripe/stripe-js` + Elements) — recomendado para internacionalização
> - **Mercado Pago** (Checkout Bricks) — recomendado para mercado brasileiro
> - **Pagar.me** — alternativa nacional
> 
> Os campos de cartão do protótipo devem ser removidos e substituídos pelo iframe do gateway.

---

### ✅ ALTA-04 — Validação Zod no adminController
**Arquivo:** `backend/controllers/adminController.js`  
**Adicionado:** Schema Zod completo para validação de criação e atualização de produtos:
```js
const productSchema = z.object({
  name:        z.string().min(1).max(200),
  price:       z.number().positive().max(50000),
  category:    z.enum(['vestido', 'camiseta', 'calça', 'conjunto', 'jaqueta']),
  stock:       z.number().int().min(0).max(9999),
  image_url:   z.string().url().startsWith('https://').max(500).optional().or(z.literal('')),
  sizes:       z.array(z.enum([...VALID_SIZES])).min(1).max(14),
  // ...
});
```
- Bloqueia preços negativos, estoque negativo, categorias inválidas
- `image_url` deve ser HTTPS — bloqueia `javascript:` URLs
- Update usa `productSchema.partial()` — valida apenas campos enviados

---

### ✅ ALTA-05 — Open Redirect no Login
**Arquivo:** `frontend/src/pages/LoginPage.jsx`, linha 17  
**Antes:**
```js
const from = location.state?.from?.pathname || '/quiz';
```
**Depois:**
```js
const ALLOWED_PREFIXES = ['/', '/quiz', '/catalogo', '/produto', '/carrinho', '/checkout', '/history'];
const from = rawFrom && ALLOWED_PREFIXES.some(p => rawFrom.startsWith(p)) ? rawFrom : '/quiz';
```

---

### ✅ BAIXA-01 — Frete Inconsistente (servidor vs. exibido)
**Arquivo:** `backend/services/orderService.js` + `frontend/src/pages/CheckoutPage.jsx`  
**Fix:** O frontend agora envia `shippingFee` no payload do pedido (valor real calculado pelo `/api/freight`). O backend valida via Zod (`z.number().positive().max(500)`). A tabela hardcoded `SHIPPING` foi removida.

---

### ✅ BAIXA-03 — Upload sem fileFilter
**Arquivo:** `backend/routes/adminRoutes.js`  
**Adicionado:**
```js
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype)),
});
```
Bloqueia SVGs e outros tipos não-imagem na camada do multer antes de chegar ao Cloudinary.

---

## Itens que Requerem Ação Manual

| Item | Prioridade | Ação |
|------|-----------|------|
| Rotacionar credenciais (Anthropic, Cloudinary, JWT_SECRET) | 🔴 Imediato | Fazer em cada plataforma |
| Promover admin no banco após CRIT-02 | 🔴 Imediato | `UPDATE users SET is_admin=1 WHERE email='...'` |
| Integrar gateway de pagamento PCI-DSS | 🟡 Antes do go-live | Stripe ou Mercado Pago |
| Rate limiting distribuído (Redis) | 🟢 Futuro | Necessário apenas com múltiplas instâncias |
| localStorage: armazenar apenas IDs | 🟢 Futuro | Refatoração de CartContext e useRecentlyViewed |

---

*Relatório gerado em 2026-05-20*
