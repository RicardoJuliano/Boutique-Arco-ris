/** @type {import('tailwindcss').Config} */
export default {
  // Informar ao Tailwind quais arquivos escanear para gerar apenas as classes utilizadas
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta de cores da identidade visual Élite Moda
      colors: {
        bg: '#faf8f5',
        surface: '#f0ebe3',
        surface2: '#e8e0d6',
        gold: '#c4789a',
        'gold-hover': '#b5688a',
        cream: '#2c2420',
        muted: '#9a8c82',
        border: '#e0d8ce',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['Jost', 'sans-serif'],
        script: ['"Pinyon Script"', 'cursive'],
      },
    },
  },
  plugins: [],
};
