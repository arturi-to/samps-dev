import { validateEnvironment } from '../constants/api';

export const initializeApp = () => {
  // Validar variables de entorno
  const isValidEnv = validateEnvironment();
  
  if (!isValidEnv) {
    console.error('❌ Configuración de entorno incompleta');
    return false;
  }

  // Verificar conectividad con API
  return checkApiConnectivity();
};

const checkApiConnectivity = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios_mock?_limit=1`);
    if (response.ok) {
      console.log('✅ Conexión con API establecida');
      return true;
    } else {
      console.error('❌ API no responde correctamente');
      return false;
    }
  } catch (error) {
    console.error('❌ Error de conectividad con API:', error.message);
    return false;
  }
};

export const getEnvironmentInfo = () => {
  return {
    apiUrl: import.meta.env.VITE_API_BASE_URL,
    environment: import.meta.env.VITE_ENVIRONMENT,
    version: import.meta.env.VITE_APP_VERSION,
    isDevelopment: import.meta.env.VITE_ENVIRONMENT === 'development',
    isProduction: import.meta.env.VITE_ENVIRONMENT === 'production'
  };
};