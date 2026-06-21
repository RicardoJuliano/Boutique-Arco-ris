function isValidCPF(cpf) {
  const digits = String(cpf).replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (limit) => {
    let sum = 0;
    for (let i = 0; i < limit; i++) {
      sum += parseInt(digits[i]) * (limit + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calcDigit(9) === parseInt(digits[9]) && calcDigit(10) === parseInt(digits[10]);
}

module.exports = { isValidCPF };
