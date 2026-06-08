# Changelog — Boutique Arco-Íris

Histórico de alterações commitadas no repositório GitHub.

---

## [2026-06-08] `8af5ac9` — feat: busca, hero image, leitor de barras, clean code

### Navbar
- Substituída exibição de texto "Carrinho" por ícone SVG de sacola com badge numérico
- Adicionado botão de busca (ícone lupa) que expande uma barra de busca inline ao clicar
- Busca navega para `/catalogo?q=termo` e fecha automaticamente ao confirmar
- Funciona em mobile (ícone de lupa ao lado do hambúrguer) e desktop
- Extraído componente local `CartBadge` eliminando duplicação entre versão desktop e mobile

### Catálogo
- Filtro de busca por nome e descrição via query string `?q=`
- Header contextual "Resultados para '...'" com botão "Limpar busca ✕"
- Ao clicar em uma categoria enquanto há busca ativa, a busca é limpa automaticamente
- Empty state adaptado: mensagem diferente para busca vazia vs. categoria vazia

### Hero (HomePage)
- Imagem de background substituída por foto local `public/hero.jpg` (arara de roupas)
- Zoom e posicionamento configuráveis via `backgroundSize` e `backgroundPosition`
- Overlays (preto e gradiente lateral) com opacidade reduzida para maior nitidez
- Filtro CSS de contraste/saturação aplicado para compensar compressão da imagem
- Altura mínima definida com `min-h` para garantir enquadramento correto

### Painel Admin — Produtos
- Adicionado campo **Código de barras / SKU** no formulário de produto
- Botão 📷 abre modal com leitor de código de barras via câmera (auto-preenche o campo)
- Toggle **Upload / URL** para a foto do produto (Cloudinary ou link externo)
- Campo `active` (ativo/inativo) incluído no schema Zod e persistido corretamente
- `imageUrl` corrigido no schema (era `image_url` em snake_case — Zod descartava o campo silenciosamente)

### Logo
- Logo processada com `sharp`: fundo removido por threshold de brilho + canvas recortado
- Resultado: imagem PNG transparente 1106×341px com apenas as letras "Arco-Íris BOUTIQUE"
- Aplicada em Navbar e Footer substituindo o texto/gradiente anterior

### Clean Code — Redundâncias Removidas
| Arquivo | Problema | Solução |
|---------|----------|---------|
| `CheckoutPage.tsx` | 6× `.toFixed(2).replace('.', ',')` inline | `formatPrice()` |
| `AdminProductsPage.tsx` | `toLocaleString('pt-BR', { currency: 'BRL' })` | `formatPrice()` |
| `AdminRoute.tsx` | Spinner inline duplicado | `<Spinner />` |
| `Navbar.tsx` | Badge do carrinho repetido (desktop + mobile) | `<CartBadge />` local |

### Novos Arquivos Compartilhados
| Arquivo | Exporta |
|---------|---------|
| `src/components/ProductImage.tsx` | Imagem com skeleton de carregamento e fallback de letra inicial |
| `src/components/Spinner.tsx` | Spinner animado reutilizável |
| `src/components/BarcodeScanner.tsx` | Modal com câmera para leitura de código de barras (`@zxing/browser`) |
| `src/utils/format.ts` | `formatPrice()`, `toErrorMessage()` |
| `src/utils/categories.ts` | `CATEGORIES[]`, `CATEGORY_LABEL` — fonte única de verdade |

---

## [2026-06-07] `5156445` — fix: corrigir 8 bugs e aplicar clean code em todo o projeto

### Bugs Corrigidos

| # | Arquivo | Bug | Causa | Correção |
|---|---------|-----|-------|----------|
| 1 | `database.js` | Imagens não apareciam no catálogo | `image_url` ausente no seed INSERT | Coluna adicionada + UPDATE para registros existentes com NULL |
| 2 | `database.js` | Email admin não reconhecido | `is_admin=0` no banco; variável `ADMIN_EMAIL` ignorada | Bloco de promoção automática na inicialização via `ADMIN_EMAIL` |
| 3 | `adminController.js` | Foto nunca salva ao criar/editar produto | Schema Zod usava `image_url` (snake_case) mas frontend enviava `imageUrl` (camelCase) — campo descartado silenciosamente | Renomeado para `imageUrl` no schema |
| 4 | `adminController.js` | Campo `active` nunca persistido | Ausente do schema Zod | Adicionado `active: z.boolean().optional()` |
| 5 | `productRepository.js` | Coluna `barcode` não existia | Migration não executada | `ALTER TABLE` + update/insert incluindo `barcode` |
| 6 | `recommendationService.js` | Produto novo não aparecia no catálogo após criação | Categoria do produto de teste era `vestido`, filtro estava em `calça` | Produto excluído; raiz do problema era dado, não código |
| 7 | `cloudinary.js` | `Invalid cloud_name Root` no upload | `CLOUDINARY_CLOUD_NAME=Root` inválido no `.env` | Atualizado pelo usuário para o valor correto |
| 8 | `useAuth.ts` | Referência stale a `.js` em comentário de cabeçalho | Comentário desatualizado | Removido |

### Clean Code — Backend
- **Controllers:** orquestração pura (valida → service → responde), sem lógica de negócio inline
- **Services:** regras de negócio isoladas de `req`/`res`
- **Repositories:** única camada com acesso ao banco; queries parametrizadas
- **Middlewares:** `csrfMiddleware`, `errorMiddleware`, `rateLimiter` simplificados e sem comentários redundantes
- **Routes:** extração de handlers anônimos para funções nomeadas
- **Validators:** schemas Zod centralizados em `validators/`
- **`server.js`:** middleware pipeline com comentários removidos; apenas o necessário
- **`catalog.js`:** bloco de comentários desnecessário removido

### Clean Code — Frontend
- **`ProductImage`:** skeleton + fallback extraídos para componente compartilhado (era duplicado em 4 arquivos)
- **`formatPrice`:** função centralizada em `utils/format.ts` (era duplicada em 4 arquivos)
- **`toErrorMessage`:** centralizado em `utils/format.ts` (era duplicado em 6 arquivos)
- **`CATEGORIES` / `CATEGORY_LABEL`:** centralizados em `utils/categories.ts` (eram duplicados em 3 arquivos)
- **`Spinner`:** extraído para componente compartilhado (era duplicado em 2 arquivos)
- **Pages:** `CatalogoPage`, `HomePage`, `ProdutoPage`, `CartPage`, `ProductFormPage` — todos usando utilitários centralizados

### Novos Pacotes
| Pacote | Uso |
|--------|-----|
| `@zxing/browser` | Leitura de código de barras via câmera |
| `@zxing/library` | Peer dependency do anterior |
| `cloudinary` | Upload de imagens de produtos |
| `sharp` | Processamento da logo (remoção de fundo + trim) |

---

## Arquivos por Commit

### Commit `8af5ac9`
```
frontend/public/hero.jpg              (novo — foto hero local)
frontend/public/logo.png              (novo — logo processada com sharp)
frontend/src/components/BarcodeScanner.tsx  (novo)
frontend/src/components/ProductImage.tsx    (novo)
frontend/src/components/Spinner.tsx         (novo)
frontend/src/utils/categories.ts            (novo)
frontend/src/utils/format.ts               (novo)
frontend/src/components/AdminRoute.tsx     (modificado)
frontend/src/components/Footer.tsx         (modificado)
frontend/src/components/Navbar.tsx         (modificado)
frontend/src/components/ProductCard.tsx    (modificado)
frontend/src/pages/CartPage.tsx            (modificado)
frontend/src/pages/CatalogoPage.tsx        (modificado)
frontend/src/pages/CheckoutPage.tsx        (modificado)
frontend/src/pages/HomePage.tsx            (modificado)
frontend/src/pages/ProdutoPage.tsx         (modificado)
frontend/src/pages/admin/AdminProductsPage.tsx  (modificado)
frontend/src/pages/admin/ProductFormPage.tsx    (modificado)
frontend/src/types/index.ts                (modificado)
backend/config/database.js                 (modificado)
backend/controllers/adminController.js     (modificado)
backend/data/catalog.js                    (modificado)
backend/repositories/productRepository.js  (modificado)
README.md                                  (atualizado)
```

### Commit `5156445`
```
backend/controllers/authController.js          (modificado)
backend/controllers/recommendationController.js (modificado)
backend/middlewares/csrfMiddleware.js           (modificado)
backend/middlewares/errorMiddleware.js          (modificado)
backend/middlewares/rateLimiter.js              (modificado)
backend/repositories/orderRepository.js        (modificado)
backend/repositories/recommendationRepository.js (modificado)
backend/routes/authRoutes.js                   (modificado)
backend/routes/freightRoutes.js                (modificado)
backend/routes/productRoutes.js                (modificado)
backend/routes/recommendationRoutes.js         (modificado)
backend/server.js                              (modificado)
backend/services/authService.js               (modificado)
backend/services/orderService.js              (modificado)
backend/services/recommendationService.js     (modificado)
backend/validators/authValidator.js           (modificado)
backend/validators/quizValidator.js           (modificado)
frontend/src/hooks/useAuth.ts                 (modificado)
frontend/src/services/api.ts                  (modificado)
frontend/src/types/index.ts                   (modificado)
```
