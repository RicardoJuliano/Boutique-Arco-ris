export const CATEGORIES = [
  { value: 'vestido',   label: 'Vestidos & Saias'  },
  { value: 'camiseta',  label: 'Blusas & Tops'      },
  { value: 'calça',     label: 'Calças'              },
  { value: 'conjunto',  label: 'Conjuntos'           },
  { value: 'jaqueta',   label: 'Jaquetas & Casacos' },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
);
