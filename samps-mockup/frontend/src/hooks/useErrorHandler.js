import { useState, useCallback, useRef } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const handleAsync = useCallback(async (asyncFunction, options = {}) => {
    const { 
      successMessage = null, 
      showLoading = true, 
      retryOnError = false,
      onSuccess = null,
      onError = null
    } = options;

    if (showLoading) setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await asyncFunction();
      
      if (successMessage) {
        setSuccess(successMessage);
        setTimeout(() => setSuccess(null), 5000);
      }
      
      if (onSuccess) onSuccess(result);
      retryCountRef.current = 0;
      
      return result;
    } catch (err) {
      let errorMessage = 'Error desconocido';
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else {
        errorMessage = err.message;
      }
      
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retryAfter || 60;
        errorMessage = `Demasiadas solicitudes. Intenta nuevamente en ${retryAfter} segundos.`;
      }
      
      if (retryOnError && retryCountRef.current < maxRetries && err.response?.status >= 500) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        
        setTimeout(() => {
          handleAsync(asyncFunction, options);
        }, delay);
        
        return;
      }
      
      setError(errorMessage);
      if (onError) onError(err);
      
      console.error('Error:', {
        message: errorMessage,
        originalError: err,
        retryCount: retryCountRef.current
      });
      
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);
  const clearAll = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return {
    error,
    loading,
    success,
    handleAsync,
    clearError,
    clearSuccess,
    clearAll,
    retryCount: retryCountRef.current
  };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};