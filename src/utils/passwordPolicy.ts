export interface PasswordValidationRule {
  id: string;
  label: string;
  isMet: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  rules: PasswordValidationRule[];
}

/**
 * Valida se uma senha atende aos requisitos de segurança do sistema Vértice:
 * - Mínimo de 8 caracteres
 * - Pelo menos 1 letra maiúscula (A-Z)
 * - Pelo menos 1 letra minúscula (a-z)
 * - Pelo menos 1 número (0-9)
 * - Pelo menos 1 caractere especial (!@#$%^&*...)
 * - Sem sequências numéricas (ex: 123, 234, 321, 789)
 */
export function validatePasswordPolicy(password: string): PasswordValidationResult {
  const pwd = password || '';

  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);

  // Verificar sequências numéricas (crescente ou decrescente de 3 dígitos)
  let hasNoSequentialNumber = true;
  const digitsOnly = pwd.replace(/\D/g, '');
  if (digitsOnly.length >= 3) {
    for (let i = 0; i <= digitsOnly.length - 3; i++) {
      const d1 = parseInt(digitsOnly[i], 10);
      const d2 = parseInt(digitsOnly[i + 1], 10);
      const d3 = parseInt(digitsOnly[i + 2], 10);
      if ((d2 === d1 + 1 && d3 === d2 + 1) || (d2 === d1 - 1 && d3 === d2 - 1)) {
        hasNoSequentialNumber = false;
        break;
      }
    }
  }

  const rules: PasswordValidationRule[] = [
    { id: 'min_length', label: 'Mínimo de 8 caracteres', isMet: hasMinLength },
    { id: 'uppercase', label: 'Pelo menos 1 letra maiúscula (A-Z)', isMet: hasUppercase },
    { id: 'lowercase', label: 'Pelo menos 1 letra minúscula (a-z)', isMet: hasLowercase },
    { id: 'number', label: 'Pelo menos 1 número (0-9)', isMet: hasNumber },
    { id: 'special', label: 'Pelo menos 1 caractere especial (!@#$%&...)', isMet: hasSpecial },
    { id: 'no_sequence', label: 'Sem sequência numérica (ex: 123, 321, 789)', isMet: hasNoSequentialNumber }
  ];

  const errors: string[] = [];
  rules.forEach(rule => {
    if (!rule.isMet) {
      errors.push(rule.label);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    rules
  };
}

/**
 * Gera uma senha provisória aleatória e forte que atenda a todas as regras
 */
export function generateTemporaryPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const special = '!@#$%&*';
  
  // Garantir que não haja sequências de números
  const randomNonSeqDigits = '2749385';
  
  const pick = (str: string) => str[Math.floor(Math.random() * str.length)];

  const p1 = pick(upper);
  const p2 = pick(lower);
  const p3 = pick(lower);
  const p4 = pick(special);
  const p5 = pick(randomNonSeqDigits);
  const p6 = pick(upper);
  const p7 = pick(lower);
  const p8 = pick(randomNonSeqDigits);

  return `${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}`;
}
