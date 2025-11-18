import { useState } from 'react';
import { formatRut, validateRut } from '../utils/rutValidator';

const RutInput = ({ value, onChange, placeholder = "Ej: 12.345.678-9", required = false, ...props }) => {
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const formatted = formatRut(inputValue);
    const valid = formatted.length < 8 || validateRut(formatted);
    
    setIsValid(valid);
    onChange(formatted);
  };

  const shouldShowError = value.length >= 8 && !isValid;

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        style={{
          borderColor: shouldShowError ? '#dc3545' : (value.length >= 8 && isValid ? '#28a745' : '#e0e0e0'),
          backgroundColor: shouldShowError ? '#fff5f5' : (value.length >= 8 && isValid ? '#f8fff9' : 'white')
        }}
        {...props}
      />
      {shouldShowError && (
        <small style={{ color: '#dc3545', fontSize: '12px' }}>
          ❌ RUT inválido - Verifica el dígito verificador
        </small>
      )}
      {value.length >= 8 && isValid && (
        <small style={{ color: '#28a745', fontSize: '12px' }}>
          ✅ RUT válido
        </small>
      )}
    </div>
  );
};

export default RutInput;