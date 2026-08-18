# Boutique Arco-Iris

E-commerce full stack para uma boutique de moda, com vitrine para o cliente e uma area administrativa para gerenciar catalogo, produtos e pedidos.

Este projeto foi construido como uma loja realista, nao apenas como uma landing page. A aplicacao junta frontend, API, autenticacao, checkout, upload de imagens, painel admin e persistencia em banco, deixando o fluxo mais proximo do que uma loja precisaria para sair do prototipo.

## O que a aplicacao faz

- Vitrine com pagina inicial, catalogo, detalhe de produto e navegacao por categorias.
- Carrinho, checkout, confirmacao de pedido e historico para usuario logado.
- Cadastro, login e rotas protegidas no frontend.
- Painel administrativo para criar, editar e remover produtos.
- Upload de imagens com Cloudinary.
- Scanner de codigo de barras no fluxo de produto.
- API REST separada em rotas, controllers, services e repositories.
- Autenticacao com JWT, senhas com hash e middleware para perfil admin.
- Validacao de dados com Zod.
- Middlewares para CORS, rate limit, CSRF, erros e seguranca HTTP.
- Recomendacao/consultora de moda por IA.
- Calculo de frete e envio de e-mails pelo backend.

## Stack

Frontend:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- ZXing para leitura de codigo de barras

Backend:

- Node.js
- Express
- PostgreSQL
- JWT
- bcryptjs
- Cloudinary
- Multer
- Nodemailer
- Helmet, CORS e express-rate-limit
- Zod

## Estrutura do projeto

```txt
.
├── frontend/        # SPA em React + TypeScript
├── backend/         # API REST em Node.js + Express
├── api/             # entrada para deploy/serverless
├── vercel.json      # configuracao de deploy
└── package.json     # script de build do frontend
```

## Rodando localmente

Clone o repositorio e instale as dependencias de cada parte:

```bash
git clone https://github.com/RicardoJuliano/Boutique-Arco-ris.git
cd Boutique-Arco-ris

cd backend
npm install
npm run dev
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Antes de subir o backend, crie o `.env` com as credenciais usadas pela API: banco PostgreSQL, segredo JWT, Cloudinary, configuracao de e-mail e servico de IA.

## Banco de dados

O backend usa PostgreSQL. O script inicial fica em:

```txt
backend/scripts/setup-db.sql
```

## Observacoes

O foco do projeto e mostrar uma aplicacao completa de loja: interface de compra, area logada, administracao e backend organizado. Algumas integracoes dependem de variaveis de ambiente externas, entao o projeto precisa dessas credenciais para funcionar 100% fora do ambiente original.
