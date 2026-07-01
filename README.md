# Boutique Arco-Íris

E-commerce de moda com consultora de estilo por IA. Comecei esse projeto para ter uma loja real para a Boutique Arco-Íris, uma loja física de roupas, e acabou virando meu projeto de portfólio principal.

A parte mais interessante é a consultora de estilo: o usuário responde um quiz de 6 perguntas sobre seu estilo e a API da Anthropic devolve 3 recomendações personalizadas com justificativa para cada uma.

## Stack

**Frontend:** React 18, TypeScript (strict mode), Tailwind CSS, Vite

**Backend:** Node.js, Express, SQLite, Knex, JWT via cookie HttpOnly, Zod, Cloudinary, Anthropic API, ZXing

## O que tem no projeto

- Catálogo com busca por nome/descrição e filtros por categoria
- Consultora de estilo com IA e histórico de consultorias anteriores
- Carrinho persistente entre páginas
- Checkout com cálculo de frete PAC/SEDEX e pagamento por cartão ou PIX
- Login com CPF validado e sessão segura
- Painel admin com leitor de código de barras via câmera, upload de imagens no Cloudinary e controle de estoque

O backend segue arquitetura Controller/Service/Repository. Passei por uma sessão grande de refatoração (48 arquivos) depois que o projeto cresceu demais sem estrutura, e também corrigi 8 bugs de produção com diagnóstico de causa raiz — a maioria vinha de inconsistência de nomenclatura entre frontend e backend.

## Como rodar

```bash
git clone https://github.com/RicardoJuliano/Boutique-Arco-ris.git

# backend
cd server && npm install
cp .env.example .env
npm run dev

# frontend
cd client && npm install
npm run dev
```

Variáveis necessárias no `.env`:
```
ANTHROPIC_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=
ADMIN_EMAIL=
```

---

Ricardo Juliano — [LinkedIn](https://linkedin.com/in/ricardo-juliano)
