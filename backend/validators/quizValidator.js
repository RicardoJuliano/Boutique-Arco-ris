/**
 * validators/quizValidator.js
 * Schema Zod para as respostas do questionário de estilo.
 *
 * Por que enums estritos?
 *   - Bloqueia prompt injection por campo: o usuário não pode inserir texto livre
 *     que seria repassado diretamente à IA como instrução
 *   - Se um valor não pertencer ao enum, Zod rejeita antes de qualquer
 *     processamento, impedindo que dados maliciosos cheguem ao service layer
 *   - Os valores aqui DEVEM ser idênticos às opções exibidas no QuizPage.jsx
 *     e compatíveis com os campos do catálogo (catalog.js)
 */

const { z } = require('zod');

exports.quizSchema = z.object({
  // Para qual ocasião a peça será usada
  occasion: z.enum(
    ['Trabalho', 'Festa', 'Casual', 'Passeio', 'Esporte'],
    { errorMap: () => ({ message: 'Ocasião inválida' }) }
  ),

  // Estilo pessoal do cliente
  style: z.enum(
    ['Clássico', 'Moderno', 'Streetwear', 'Boho', 'Minimalista'],
    { errorMap: () => ({ message: 'Estilo inválido' }) }
  ),

  // Preferência de cores — campo multi-select, mín. 1 cor obrigatória
  colors: z
    .array(
      z.enum(
        ['Neutros', 'Tons quentes', 'Tons frios', 'Colorido'],
        { errorMap: () => ({ message: 'Cor inválida' }) }
      )
    )
    .min(1, 'Selecione ao menos uma cor'),

  // Tamanho de roupa do cliente
  size: z.enum(
    ['P', 'M', 'G', 'GG'],
    { errorMap: () => ({ message: 'Tamanho inválido' }) }
  ),

  // Faixa de orçamento para a peça
  budget: z.enum(
    ['Até R$100', 'R$100–200', 'R$200–400', 'Acima de R$400'],
    { errorMap: () => ({ message: 'Orçamento inválido' }) }
  ),

  // Tipo de peça desejada (ou "qualquer coisa" para deixar a IA surpreender)
  category: z.enum(
    ['Camiseta / Blusa', 'Calça', 'Vestido / Saia', 'Jaqueta', 'Conjunto', 'Qualquer coisa'],
    { errorMap: () => ({ message: 'Categoria inválida' }) }
  ),
});
