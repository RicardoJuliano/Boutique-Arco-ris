/** @type {import('tailwindcss').Config} */
export default {
  // Informar ao Tailwind quais arquivos escanear para gerar apenas as classes utilizadas
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta de cores da identidade visual Élite Moda
      colors: {
        bg:          '#E8DDD4',
        surface:     '#FAF7F2',
        surface2:    '#F5EDE3',
        gold:        '#C5A882',
        'gold-hover':'#8A5C3A',
        cream:       '#2E1A0E',
        muted:       '#A07858',
        border:      '#D9C9B8',
        dark:        '#1A1A1A',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        script:  ['"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
};
