# Boutique Arco-Íris — E-commerce Fullstack com IA

Aplicação web fullstack de portfólio que combina um e-commerce de moda completo com uma consultora de estilo alimentada pela API da Anthropic. O usuário navega pelo catálogo, recebe recomendações personalizadas via IA, adiciona produtos ao carrinho e finaliza pedidos — tudo com autenticação segura e painel administrativo completo.

## Tecnologias

**Frontend**
- React 18 + TypeScript (strict mode)
- Tailwind CSS
- Vite

**Backend**
- Node.js + Express.js
- SQLite + Knex.js
- JWT (HttpOnly cookie)
- Zod (validação)
- Cloudinary (upload de imagens)
- Anthropic API (IA)
- ZXing (leitor de código de barras via câmera)

## Funcionalidades

**Para o cliente**
- Catálogo com filtros por categoria e busca por nome/descrição
- Consultora de estilo por IA com quiz de 6 perguntas e recomendações personalizadas
- Histórico de consultorias anteriores
- Carrinho de compras persistente entre páginas
- Checkout completo com cálculo de frete (PAC/SEDEX) e múltiplas formas de pagamento
- Autenticação com CPF validado e sessão segura via cookie HttpOnly

**Para o administrador**
- Painel admin com gestão de produtos, pedidos e estoque
- Leitor de código de barras via câmera para cadastro rápido
- Upload de imagens via Cloudinary
- Controle de produtos ativos/inativos

## Arquitetura

O backend segue arquitetura em camadas (Controller / Service / Repository), com validação centralizada via Zod e separação clara de responsabilidades.

## Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/RicardoJuliano/Boutique-Arco-ris.git

# Backend
cd server
npm install
cp .env.example .env  # configure as variáveis de ambiente
npm run dev

# Frontend
cd client
npm install
npm run dev
```

**Variáveis de ambiente necessárias:**
```
ANTHROPIC_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=
ADMIN_EMAIL=
```

## Autor

Ricardo Juliano — [LinkedIn](https://linkedin.com/in/ricardo-juliano) • [GitHub](https://github.com/RicardoJuliano)
