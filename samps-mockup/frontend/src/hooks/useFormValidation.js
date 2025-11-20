import { useState, useCallback } from 'react';
import { validateForm, sanitizeInput, sanitizeRut, sanitizeEmail } from '../utils/sanitizer';
import { validateRut } from '../utils/rutValidator';

export const useFormValidation = (initialData = {}, validationRules = {}) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((field, value) => {
    // Sanitizar según el tipo de campo
    let sanitizedValue = value;
    if (typeof value === 'string') {
      if (field.toLowerCase().includes('rut')) {
        sanitizedValue = sanitizeRut(value);
      } else if (field.toLowerCase().includes('email')) {
        sanitizedValue = sanitizeEmail(value);
      } else {
        sanitizedValue = sanitizeInput(value);
      }
    }

    setData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Validar campo individual si ya fue tocado
    if (touched[field] && validationRules[field]) {
      const fieldErrors = {};
      validationRules[field].forEach(rule => {
        const error = rule(sanitizedValue, field);
        if (error) fieldErrors[field] = error;
      });
      
      setErrors(prev => ({ ...prev, ...fieldErrors }));
      if (!fieldErrors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  }, [touched, validationRules]);

  const setTouched = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback(() => {
    const validation = validateForm(data, validationRules);
    setErrors(validation.errors);
    return validation;
  }, [data, validationRules]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  const getFieldProps = useCallback((field) => ({
    value: data[field] || '',
    onChange: (e) => setValue(field, e.target.value),
    onBlur: () => setTouched(field),
    error: errors[field],
    'aria-invalid': !!errors[field],
    'aria-describedby': errors[field] ? `${field}-error` : undefined
  }), [data, errors, setValue, setTouched]);

  return {
    data,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0
  };
};

// Reglas de validación comunes
export const commonValidationRules = {
  required: (value, fieldName) => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} es requerido`;
    }
    return null;
  },
  
  rut: (value) => {
    if (value && !validateRut(value)) {
      return 'RUT inválido';
    }
    return null;
  },
  
  email: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email inválido';
    }
    return null;
  },
  
  minLength: (min) => (value, fieldName) => {
    if (value && value.length < min) {
      return `${fieldName} debe tener al menos ${min} caracteres`;
    }
    return null;
  },
  
  maxLength: (max) => (value, fieldName) => {
    if (value && value.length > max) {
      return `${fieldName} no puede exceder ${max} caracteres`;
    }
    return null;
  }
};