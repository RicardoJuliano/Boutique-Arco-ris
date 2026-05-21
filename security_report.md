# Relatório de Segurança — Boutique Arco-Íris
**Data:** 2026-05-19  
**Escopo:** Varredura completa (backend + frontend)  
**Metodologia:** Revisão estática de código (SAST manual)

---

## Sumário Executivo

| Severidade | Quantidade |
|------------|-----------|
| Crítica    | 2         |
| Alta       | 5         |
| Média      | 7         |
| Baixa      | 5         |
| **Total**  | **19**    |

---

## CRÍTICA

---

### [CRIT-01] Secrets reais expostos no repositório Git
**Arquivo:** `backend/.env`  
**Linhas:** 7–17  
**Tipo:** Hardcoded Secrets — CWE-798  

**Descrição:**  
O arquivo `.env` contém credenciais reais de produção commitadas no repositório Git. O histórico Git preserva versões anteriores mesmo se o arquivo for removido posteriormente.

**Credenciais expostas:**
- `JWT_SECRET` — chave de assinatura de todos os tokens JWT da aplicação
- `ANTHROPIC_API_KEY` — `sk-ant-api03-QvXc8kpV_5rq...` (chave real da API Anthropic)
- `CLOUDINARY_API_KEY` — `946996796638678`
- `CLOUDINARY_API_SECRET` — `ecpVj6dCDphfTCSy6g0bHn4SrA8`
- `CLOUDINARY_CLOUD_NAME` — `Root`

**Prova de conceito:**
```bash
# Qualquer pessoa com acesso ao repositório (público ou privado comprometido) pode:
# 1. Forjar tokens JWT para qualquer usuário, incluindo admin
JWT_SECRET="47429d81b3c60e5d7beb7f90f1ddaf975af0fab3161eb62490709fb3df662466b679bb24ae0e065f06a2d0b44b8d5624bfa891e508e6d83d8faf9df3b5f39c42"
# node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({id:1,name:'hacker',email:'admin@x.com',isAdmin:true}, process.env.JWT_SECRET, {expiresIn:'7d'}))"

# 2. Gastar créditos Anthropic sem limite
# 3. Apagar/substituir todas as imagens da loja no Cloudinary
```

**Impacto:**  
- Comprometimento total da autenticação (forjar tokens de admin)
- Uso não autorizado e custos financeiros na API Anthropic
- Manipulação ou deleção de todo o catálogo de imagens no Cloudinary
- GDPR/LGPD: acesso não autorizado a dados de usuários

**Remediação:**
1. Revogar IMEDIATAMENTE todas as credenciais expostas
2. Adicionar `.env` ao `.gitignore` e remover do histórico Git com `git filter-repo` ou BFG
3. Gerar novas credenciais em todas as plataformas

---

### [CRIT-02] Escalada de Privilégio via Registro — Promoção a Admin por Email
**Arquivo:** `backend/services/authService.js`  
**Linha:** 17  
**Tipo:** Broken Access Control / Privilege Escalation — CWE-269  

**Descrição:**  
A lógica de promoção a administrador é baseada exclusivamente no endereço de email fornecido durante o registro. O email `ADMIN_EMAIL` não é validado como proprietário real — qualquer pessoa que registrar uma conta com `rjulianojunior@gmail.com` (ou o valor configurado em `ADMIN_EMAIL`) obtém acesso admin completo.

**Código vulnerável:**
```javascript
// backend/services/authService.js, linha 17
const isAdmin = process.env.ADMIN_EMAIL === email ? 1 : 0;
```

**Prova de conceito:**
```bash
# O atacante registra uma conta com o email do administrador
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacker","email":"rjulianojunior@gmail.com","password":"Senha1234"}'
# Resposta: token JWT com isAdmin=true
# Acesso total ao painel admin: criar/editar/deletar produtos
```

**Impacto:**  
- Acesso administrativo completo à aplicação
- Criação, edição e exclusão de produtos
- Upload de imagens arbitrárias para o Cloudinary da conta da loja
- O email admin está exposto no próprio `.env` commitado (CRIT-01), tornando o ataque trivial

**Remediação:**
- Remover a promoção automática por email do fluxo de registro
- Criar um comando CLI ou migration dedicada para promover admins diretamente no banco
- Alternativamente, exigir um `ADMIN_INVITE_TOKEN` secreto para o primeiro admin

---

## ALTA

---

### [ALTA-01] CSRF sem proteção em rotas críticas de mutação
**Arquivo:** `backend/routes/orderRoutes.js`, `backend/routes/adminRoutes.js`, `backend/routes/authRoutes.js`  
**Tipo:** Cross-Site Request Forgery — CWE-352  

**Descrição:**  
O `csrfMiddleware` existe no projeto mas **não está aplicado** nas rotas de pedidos (`POST /api/orders`), nas rotas admin (`POST/PUT/DELETE /api/admin/products`) nem no logout (`POST /api/auth/logout`). Apenas `recommendationRoutes.js` aplica o middleware CSRF.

**Rotas vulneráveis:**
- `POST /api/orders` — criar pedido em nome da vítima
- `POST /api/admin/products` — criar produto
- `PUT /api/admin/products/:id` — modificar produto
- `DELETE /api/admin/products/:id` — deletar produto
- `POST /api/auth/logout` — forçar logout da vítima

**Cookie SameSite em desenvolvimento:**  
O cookie JWT usa `sameSite: 'strict'` apenas em produção. Em desenvolvimento (`NODE_ENV=development`) usa `sameSite: 'strict'` — o que mitiga parcialmente, mas o CSRF middleware deveria estar aplicado de qualquer forma para garantir a defesa em produção cross-origin (onde `sameSite: 'none'` é usado).

**Prova de conceito — CSRF em pedidos (produção com sameSite=none):**
```html
<!-- Página maliciosa hospedada em evil.com -->
<script>
fetch('https://boutique.com/api/orders', {
  method: 'POST',
  credentials: 'include',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    items: [{productId: 1, size: 'M', quantity: 10}],
    address: {name:'Hacker',street:'Rua Fake 1',city:'SP',state:'SP',zip:'01310100',phone:'11999999999'},
    shippingMethod: 'sedex',
    paymentMethod: 'pix'
  })
});
</script>
```

**Impacto:**  
- Em produção (onde `sameSite=none`): pedidos fraudulentos criados em nome de qualquer usuário autenticado
- Deleção/modificação de produtos por admin autenticado visitando página maliciosa

**Remediação:**
```javascript
// backend/routes/orderRoutes.js
const csrfMiddleware = require('../middlewares/csrfMiddleware');
router.post('/', csrfMiddleware, orderController.create);

// backend/routes/adminRoutes.js
router.use(csrfMiddleware); // após authMiddleware e adminMiddleware
```

---

### [ALTA-02] Race Condition no Estoque — Ausência de Transação Atômica
**Arquivo:** `backend/services/orderService.js`, linhas 31–53  
**Tipo:** TOCTOU Race Condition — CWE-362  

**Descrição:**  
O processo de criação de pedido verifica o estoque disponível em um momento (`findById`) e cria o pedido em outro (`create` + `addItem`), sem nenhuma transação SQLite ou lock. Múltiplas requisições simultâneas podem passar pela verificação de estoque e todas criarem pedidos, resultando em estoque negativo.

**Código vulnerável:**
```javascript
// Linha 35: verifica estoque
if (product.stock < item.quantity) throw ...

// Linha 41: cria pedido — sem transação, sem decremento de estoque
const orderId = orderRepository.create({...});

// Linha 50-54: adiciona items — mas estoque nunca é decrementado!
for (const item of enriched) {
  orderRepository.addItem({...});
}
// NOTA: o estoque em `products.stock` NUNCA É DECREMENTADO após a compra
```

**Dupla vulnerabilidade:**
1. **Race condition:** dois clientes comprando simultaneamente passam na verificação e ambos criam pedido
2. **Estoque nunca decrementado:** a coluna `stock` em `products` nunca é atualizada após uma compra, tornando a verificação completamente ineficaz mesmo sem race condition

**Prova de conceito:**
```bash
# 50 requisições simultâneas para o último item em estoque (stock=1)
for i in $(seq 1 50); do
  curl -s -X POST .../api/orders -H "Cookie: token=..." -d '{"items":[{"productId":1,"size":"M","quantity":1}],...}' &
done
wait
```

**Impacto:**
- Venda de itens fora de estoque (overselling)
- Prejuízo financeiro e insatisfação de clientes

**Remediação:**
```javascript
// Usar transação SQLite + decremento atômico
db.transaction(() => {
  const product = db.prepare('SELECT * FROM products WHERE id=? AND stock >= ?').get(id, qty);
  if (!product) throw new Error('Estoque insuficiente');
  db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(qty, id);
  // criar pedido e items...
})();
```

---

### [ALTA-03] Dados de Cartão de Crédito Coletados no Frontend Sem Processador de Pagamento
**Arquivo:** `frontend/src/pages/CheckoutPage.jsx`, linhas 29, 293–312  
**Tipo:** Sensitive Data Exposure — CWE-312  

**Descrição:**  
O frontend coleta número do cartão, nome, validade e CVV em campos de input, mas esses dados são **completamente descartados** antes de enviar o pedido para a API (o payload em `handleSubmit` na linha 92 não inclui os campos do cartão). Isso cria uma falsa sensação de segurança, mas representa um risco real:

1. Os dados do cartão ficam no estado React em memória
2. Não há integração com Stripe, PagSeguro, Mercado Pago ou qualquer gateway PCI-DSS
3. Qualquer XSS na página (atual ou futuro) pode capturar esses campos

**Código que coleta sem processar:**
```jsx
// Dados coletados
const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

// Dados enviados ao backend (cartão ausente)
const payload = {
  items: ...,
  address: ...,
  shippingMethod,
  paymentMethod,  // apenas a string 'card', sem os dados
};
```

**Impacto:**
- Usuários inserem dados reais de cartão achando que estão pagando
- Dados sensíveis em memória/DOM sem propósito funcional real
- Violação do PCI-DSS: nunca coletar dados de cartão fora de um iframe tokenizado de gateway certificado

**Remediação:**
- Remover completamente os campos de cartão
- Integrar um gateway PCI-DSS (Stripe Elements, Mercado Pago Checkout) que processa os dados em iframe isolado

---

### [ALTA-04] Ausência de Validação no Backend do adminController — Inputs sem Sanitização
**Arquivo:** `backend/controllers/adminController.js`, linhas 23–41, 44–61  
**Tipo:** Improper Input Validation — CWE-20  

**Descrição:**  
As funções `createProduct` e `updateProduct` não aplicam nenhum schema de validação Zod (ao contrário das rotas de auth e orders que usam Zod). Campos como `name`, `description`, `tag`, `category`, `price`, `stock`, `imageUrl` são passados diretamente do `req.body` para o repositório sem validação de tipo, tamanho ou conteúdo.

**Exemplos de payloads maliciosos aceitos:**
```json
// name com 100.000 caracteres (contorna o limit: '10kb' global, mas campos individuais são ilimitados)
{"name": "A".repeat(100000), "price": -999999, "stock": -1, "category": "../../etc/passwd", "tag": "<script>alert(1)</script>"}

// price negativo — cria produto com preço negativo no banco
{"name": "Malicioso", "price": -999}

// imageUrl como URL arbitrária (inclui URLs javascript:)
{"imageUrl": "javascript:alert(document.cookie)"}
```

**Impacto:**
- Dados corrompidos no banco de dados (preços negativos, estoque negativo)
- Possível XSS stored via campos `name`, `description`, `tag` se renderizados sem escape (ver MEDIA-01)
- A `imageUrl` pode ser definida como URL arbitrária sem validação de domínio

**Remediação:**
```javascript
// Criar um productSchema Zod em validators/productValidator.js
const productSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  // ...
});
```

---

### [ALTA-05] Open Redirect via `location.state.from` no Login
**Arquivo:** `frontend/src/pages/LoginPage.jsx`, linha 17  
**Tipo:** Open Redirect — CWE-601  

**Descrição:**  
Após o login, o usuário é redirecionado para a URL armazenada em `location.state?.from?.pathname`. Esse valor é controlado pelo React Router e pode ser manipulado por um link externo que redireciona para `/login` com state específico.

**Código vulnerável:**
```javascript
const from = location.state?.from?.pathname || '/quiz';
// ...
navigate(from, { replace: true });
```

**Prova de conceito:**
```javascript
// Um atacante pode criar um link que, após login, redireciona para uma rota arbitrária
// Como `pathname` é limitado ao path local pelo React Router, o risco é principalmente
// de redirecionamento para rotas internas indesejadas (ex: /admin) se combinado com
// manipulação de estado. No entanto, se VITE_API_URL for externo, pode haver risco maior.
```

**Nota:** O risco é mitigado pois `pathname` é apenas o caminho relativo (React Router não aceita URLs absolutas em `navigate`). Contudo, se a URL base da aplicação mudasse ou se houvesse manipulação de `state` via link, o risco aumenta.

**Impacto:** Baixo a médio — redirecionamento para rotas internas indesejadas após login.

**Remediação:**
```javascript
const from = location.state?.from?.pathname;
const safePaths = ['/quiz', '/history', '/catalogo', '/carrinho', '/checkout'];
const redirectTo = from && safePaths.some(p => from.startsWith(p)) ? from : '/quiz';
navigate(redirectTo, { replace: true });
```

---

## MÉDIA

---

### [MEDIA-01] XSS Stored Potencial — Dados da IA renderizados sem sanitização
**Arquivo:** `frontend/src/pages/ResultsPage.jsx` (linha 39), `frontend/src/pages/HistoryPage.jsx` (linha 83), `frontend/src/components/ProductCard.jsx` (linha 79)  
**Tipo:** Stored XSS (Indireto via IA) — CWE-79  

**Descrição:**  
As mensagens geradas pela API Anthropic (`result.message` e `rec.reason`) são renderizadas diretamente como conteúdo React sem qualquer sanitização. React escapa HTML por padrão no JSX, o que previne XSS básico. Porém, se a IA retornar conteúdo com markdown ou caracteres especiais, e no futuro for usado `dangerouslySetInnerHTML` para renderização de rich text, há risco real.

O risco atual é baixo porque React escapa por padrão, mas o schema Zod que valida a resposta da IA (`aiResponseSchema`) aceita qualquer string — um atacante que comprometesse o modelo ou fizesse prompt injection poderia injetar payloads que seriam sanitizados mas ainda causariam confusão visual (UI Redressing).

**Arquivo:** `frontend/src/pages/ResultsPage.jsx`, linha 39:
```jsx
<p className="...">{result.message}</p>  // React escapa, OK atualmente
```

**Risco real:** O campo `reason` da IA (max 300 chars) não é validado por tipo de conteúdo, apenas por tamanho. Uma IA comprometida poderia injetar payloads de phishing em texto puro.

---

### [MEDIA-02] XSS via Dados do Produto — Campos sem validação de conteúdo
**Arquivo:** `frontend/src/components/ProductCard.jsx` (linha 70), `frontend/src/pages/ProdutoPage.jsx` (linha 221)  
**Tipo:** Stored XSS — CWE-79  

**Descrição:**  
Os campos `product.desc`, `product.name`, `product.tag` vindos da API são renderizados diretamente no JSX. React escapa automaticamente, prevenindo XSS na maioria dos casos. Porém:

1. O backend não sanitiza esses campos no `adminController` (ver ALTA-04)
2. Se no futuro qualquer campo for renderizado com `dangerouslySetInnerHTML` (para suporte a markdown, por exemplo), qualquer dado malicioso já armazenado no banco será executado
3. O campo `imageUrl` sem validação de domínio pode apontar para tracking pixels externos

**Impacto atual:** Baixo (React escapa). **Risco futuro:** Alto se `dangerouslySetInnerHTML` for adicionado.

---

### [MEDIA-03] Exposição de Dados Sensíveis do Usuário no localStorage
**Arquivo:** `frontend/src/hooks/useRecentlyViewed.js`, linhas 9–13; `frontend/src/context/CartContext.jsx`, linhas 9–10  
**Tipo:** Sensitive Data Exposure in Storage — CWE-922  

**Descrição:**  
O hook `useRecentlyViewed` armazena objetos completos de produto no `localStorage`, incluindo todos os campos retornados pela API. O `CartContext` serializa todos os itens do carrinho (incluindo dados completos do produto) em `localStorage`.

Dados de produto incluem: `id`, `name`, `price`, `stock`, `image_url`, `active`, `style`, `colors`, `occasions`, `sizes`, `desc`, `tag`.

**Impacto:**
- Qualquer script malicioso (extensão de browser, XSS) pode ler o histórico completo de navegação e carrinho
- O histórico de visualizações persiste indefinidamente sem TTL ou expiração

**Remediação:**
- Armazenar apenas IDs no localStorage, buscando detalhes via API quando necessário
- Definir TTL para os dados armazenados

---

### [MEDIA-04] Ausência de CSRF no Logout
**Arquivo:** `backend/routes/authRoutes.js`, linha 21; `backend/controllers/authController.js`, linha 49  
**Tipo:** CSRF — CWE-352  

**Descrição:**  
O endpoint `POST /api/auth/logout` não tem proteção CSRF. Um atacante pode forçar o logout de qualquer usuário autenticado através de uma requisição cross-origin.

**Prova de conceito:**
```html
<img src="javascript:void(fetch('http://boutique.com/api/auth/logout',{method:'POST',credentials:'include'}))" />
```

**Impacto:** DoS de sessão — forçar logout de usuários autenticados.

---

### [MEDIA-05] Rate Limiting Apenas em Memória — Bypassável em Multi-Instância
**Arquivo:** `backend/middlewares/rateLimiter.js`  
**Tipo:** Insufficient Rate Limiting — CWE-770  

**Descrição:**  
O `express-rate-limit` usa store em memória. Em deploys com múltiplas instâncias (horizontal scaling), load balancers, ou após restart do servidor, os contadores são zerados. Um atacante pode:

1. Fazer 5 tentativas de login por instância (se houver N instâncias, 5×N tentativas)
2. Reiniciar sua conexão ao servidor para obter novo contador
3. Usar o endpoint de recomendações (que chama a API Anthropic) indefinidamente em multi-instância

**Impacto:** Brute force parcialmente eficaz; custos excessivos na API Anthropic.

---

### [MEDIA-06] Informações de Sistema Expostas no Health Check
**Arquivo:** `backend/server.js`, linhas 71–73  
**Tipo:** Information Disclosure — CWE-200  

**Descrição:**  
O endpoint `GET /api/health` não requer autenticação e retorna timestamp do servidor:
```json
{"status":"ok","timestamp":"2026-05-19T12:00:00.000Z"}
```

Embora aparentemente inofensivo, o health check expõe:
- Confirmação de que o servidor está ativo (facilita scanning)
- Timezone do servidor via formato ISO (informação de infraestrutura)
- Pode ser usado para sincronizar ataques de replay com o relógio do servidor

---

### [MEDIA-07] JWT sem Claim `isAdmin` — Revalidação em Cada Request
**Arquivo:** `backend/services/authService.js`, linhas 48–54; `backend/middlewares/authMiddleware.js`  
**Tipo:** Insecure Design — CWE-284  

**Descrição:**  
O token JWT não inclui o claim `isAdmin`. O `authMiddleware` busca o usuário no banco a cada requisição para obter `is_admin`. Isso é correto do ponto de vista de segurança (revogação imediata), mas cria uma inconsistência: se um usuário for promovido a admin, o token existente não precisa ser renovado (o banco é a fonte de verdade). Porém, se `is_admin` fosse incluído no token e um admin fosse removido, ele continuaria com acesso por até 7 dias.

**Risco atual:** O design atual é seguro porque valida no banco. O risco seria se alguém alterasse o código para confiar apenas no token sem verificar o banco.

---

## BAIXA

---

### [BAIXA-01] Frete Calculado pelo Frontend — Manipulação do Valor de Frete
**Arquivo:** `backend/services/orderService.js`, linha 5  
**Tipo:** Business Logic Flaw — CWE-840  

**Descrição:**  
O `orderService` usa uma tabela de frete hardcoded simplificada (`SHIPPING = { pac: 12.90, sedex: 25.90 }`) que não corresponde ao cálculo real mostrado ao usuário pelo endpoint `/api/freight`. O usuário vê um preço de frete calculado pelo endpoint de frete (que usa tabela real dos Correios por zona), mas o pedido é criado com valores fixos.

**Impacto:** Discrepância entre o frete exibido e o frete cobrado no pedido. Usuários em regiões distantes podem ser cobrados valores menores (prejuízo) ou maiores (fraude ao consumidor) que o exibido.

---

### [BAIXA-02] Ausência de Política de Expiração de Senha / Rotação de JWT
**Arquivo:** `backend/services/authService.js`, linha 4; `backend/controllers/authController.js`, linha 22  
**Tipo:** Weak Session Management — CWE-613  

**Descrição:**  
- O JWT tem expiração de 7 dias sem mecanismo de revogação (logout não invalida o token no servidor, apenas limpa o cookie)
- Não há refresh token — tokens roubados (ex: via XSS em cookie não-HttpOnly, ou MITM) são válidos por 7 dias inteiros
- O cookie usa `secure: false` em desenvolvimento — aceita transmissão via HTTP

**Impacto:** Token roubado permanece válido por até 7 dias após logout.

---

### [BAIXA-03] Validação de Tipo de Arquivo de Upload Apenas por MIME Declarado
**Arquivo:** `backend/routes/adminRoutes.js`, linha 9; `backend/controllers/adminController.js`, linha 72  
**Tipo:** Unrestricted File Upload — CWE-434  

**Descrição:**  
O upload de imagem usa `multer` com `memoryStorage` e limite de 5MB, mas não valida o tipo MIME real do arquivo (magic bytes). O campo `accept="image/*"` no frontend é facilmente contornável.

```javascript
// adminRoutes.js linha 9 — sem restrição de fileFilter
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
```

**Impacto:** Um admin malicioso (ou conta admin comprometida) pode fazer upload de arquivos não-imagem para o Cloudinary. O Cloudinary processa o arquivo e pode rejeitar, mas SVGs maliciosos com scripts podem ser aceitos.

**Remediação:**
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

---

### [BAIXA-04] Ausência de Headers de Segurança Específicos
**Arquivo:** `backend/server.js`, linha 45  
**Tipo:** Security Misconfiguration — CWE-16  

**Descrição:**  
O Helmet está configurado com `contentSecurityPolicy: true`, mas usa a CSP padrão do Helmet, que pode ser muito permissiva para o contexto específico da aplicação. Não há configuração explícita de:
- `Permissions-Policy` (desabilitar câmera, microfone, geolocalização)
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

**Impacto:** Baixo — Helmet padrão já cobre os principais casos.

---

### [BAIXA-05] Nome do Projeto Vaza Informação no package.json do Frontend
**Arquivo:** `frontend/package.json`, linha 2  
**Tipo:** Information Disclosure — CWE-200  

**Descrição:**  
O `package.json` do frontend contém `"name": "elite-moda-frontend"`, expondo o nome interno original do projeto (diferente do nome público "Boutique Arco-Íris"). Em builds de produção o `package.json` não é servido publicamente, mas pode estar em repositórios.

**Impacto:** Mínimo — apenas information leakage de nome interno.

---

## Análise de Dependências

### Backend (`backend/package.json`)

| Pacote | Versão | Status |
|--------|--------|--------|
| `bcryptjs` | ^2.4.3 | Sem CVEs críticos conhecidos em 2026 |
| `jsonwebtoken` | ^9.0.2 | Sem CVEs críticos |
| `express` | ^4.18.3 | Sem CVEs críticos |
| `multer` | ^2.1.1 | Versão 2.x — sem CVEs críticos conhecidos |
| `helmet` | ^7.1.0 | Atualizado |
| `express-rate-limit` | ^7.2.0 | Atualizado |
| `cloudinary` | ^2.10.0 | Atualizado |
| `zod` | ^3.22.4 | Sem CVEs conhecidos |

**Observação:** Nenhuma dependência com CVE crítico confirmado nas versões utilizadas. Recomenda-se executar `npm audit` regularmente.

### Frontend (`frontend/package.json`)

| Pacote | Versão | Status |
|--------|--------|--------|
| `react` | ^18.3.1 | Atualizado |
| `react-router-dom` | ^6.23.1 | Atualizado |
| `vite` | ^5.2.11 | Verificar atualizações (^5.x) |

---

## Mapa de Ameaças — Prioridade de Remediação

```
IMEDIATO (< 24h):
  1. [CRIT-01] Revogar todas as credenciais expostas no .env
  2. [CRIT-02] Remover lógica de isAdmin por email do registro

CURTO PRAZO (< 1 semana):
  3. [ALTA-02] Corrigir race condition e decremento de estoque
  4. [ALTA-01] Aplicar csrfMiddleware em orderRoutes e adminRoutes
  5. [ALTA-03] Remover campos de cartão do frontend e integrar gateway real

MÉDIO PRAZO (< 1 mês):
  6. [ALTA-04] Adicionar validação Zod no adminController
  7. [MEDIA-03] Refatorar localStorage para armazenar apenas IDs
  8. [BAIXA-01] Corrigir cálculo de frete no orderService
  9. [BAIXA-03] Adicionar fileFilter no multer
```

---

## Pontos Positivos (Defesas Identificadas)

- Uso de prepared statements em todas as queries SQL (sem SQL Injection)
- Cookie JWT com `httpOnly: true` (inacessível via JavaScript)
- Rate limiting aplicado em login e registro
- Validação Zod em auth, quiz e orders
- Hash de senha com bcrypt (12 rounds)
- Proteção anti-timing-attack no login (bcrypt dummy hash)
- CORS restrito ao `FRONTEND_URL`
- Helmet com CSP ativo
- Limite de 10kb no body parser
- Validação de enum no quiz (anti prompt injection)
- Validação do output da IA com Zod + verificação de IDs existentes
- Ownership check em pedidos (`WHERE o.id = ? AND o.user_id = ?`)
- AbortSignal.timeout nas chamadas externas (Anthropic, ViaCEP)

---

*Relatório gerado por análise estática manual em 2026-05-19*
