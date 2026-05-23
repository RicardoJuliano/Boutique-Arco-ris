/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
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
        display:   ['"Playfair Display"', 'Georgia', 'serif'],
        body:      ['"DM Sans"', 'system-ui', 'sans-serif'],
        script:    ['"Moontime"', 'cursive'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
