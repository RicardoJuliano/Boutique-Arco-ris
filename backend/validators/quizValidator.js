const { z } = require('zod');

// Enums estritos impedem que texto livre do usuário chegue ao prompt da IA
exports.quizSchema = z.object({
  occasion: z.enum(
    ['Trabalho', 'Festa', 'Casual', 'Passeio', 'Esporte'],
    { errorMap: () => ({ message: 'Ocasião inválida' }) }
  ),

  style: z.enum(
    ['Clássico', 'Moderno', 'Streetwear', 'Boho', 'Minimalista'],
    { errorMap: () => ({ message: 'Estilo inválido' }) }
  ),

  colors: z
    .array(
      z.enum(
        ['Neutros', 'Tons quentes', 'Tons frios', 'Colorido'],
        { errorMap: () => ({ message: 'Cor inválida' }) }
      )
    )
    .min(1, 'Selecione ao menos uma cor'),

  size: z.enum(
    ['P', 'M', 'G', 'GG'],
    { errorMap: () => ({ message: 'Tamanho inválido' }) }
  ),

  budget: z.enum(
    ['Até R$100', 'R$100–200', 'R$200–400', 'Acima de R$400'],
    { errorMap: () => ({ message: 'Orçamento inválido' }) }
  ),

  category: z.enum(
    ['Camiseta / Blusa', 'Calça', 'Vestido / Saia', 'Jaqueta', 'Conjunto', 'Qualquer coisa'],
    { errorMap: () => ({ message: 'Categoria inválida' }) }
  ),
});
