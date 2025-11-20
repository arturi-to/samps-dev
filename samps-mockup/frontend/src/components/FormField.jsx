import { forwardRef } from 'react';

const FormField = forwardRef(({ 
  label, 
  error, 
  required = false, 
  type = 'text',
  children,
  ...props 
}, ref) => {
  const fieldId = props.id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className="form-group">
      <label htmlFor={fieldId}>
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
      </label>
      
      {children ? (
        children
      ) : (
        <input
          ref={ref}
          id={fieldId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
      )}
      
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;