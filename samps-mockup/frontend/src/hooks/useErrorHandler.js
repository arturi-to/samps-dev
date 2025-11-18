import { useState } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsync = async (asyncFunction, successMessage = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      if (successMessage) {
        // En una implementación real, aquí se mostraría un toast
        console.log(successMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      setError(errorMessage);
      console.error('Error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    error,
    loading,
    handleAsync,
    clearError
  };
};