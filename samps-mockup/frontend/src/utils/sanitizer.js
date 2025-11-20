// Utilidades de sanitización y validación
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .substring(0, 1000); // Limitar longitud
};

export const sanitizeRut = (rut) => {
  return rut.replace(/[^0-9kK.-]/g, '').substring(0, 12);
};

export const sanitizeEmail = (email) => {
  return email.toLowerCase().trim().substring(0, 254);
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} es requerido`;
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }
  return null;
};

export const validateLength = (value, min, max, fieldName) => {
  const length = value ? value.toString().length : 0;
  if (length < min) {
    return `${fieldName} debe tener al menos ${min} caracteres`;
  }
  if (length > max) {
    return `${fieldName} no puede exceder ${max} caracteres`;
  }
  return null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    // Sanitizar valor
    if (typeof value === 'string') {
      data[field] = sanitizeInput(value);
    }
    
    // Validar reglas
    fieldRules.forEach(rule => {
      if (errors[field]) return; // Ya hay error en este campo
      
      const error = rule(data[field], field);
      if (error) {
        errors[field] = error;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: data
  };
};