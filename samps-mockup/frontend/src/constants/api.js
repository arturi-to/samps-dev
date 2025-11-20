// Configuración centralizada de API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: {
    USUARIOS: '/usuarios_mock',
    ENTIDADES: '/entidades',
    MONITORES: '/monitores',
    CURSOS: '/cursos_mock_sige',
    ALUMNOS: '/alumnos_mock_sige',
    TALLERES: '/talleres',
    SESIONES: '/sesiones_checkin',
    ASISTENCIAS: '/asistencias',
    VISITAS: '/visitas_gestor'
  }
};

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'SAMPS',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  OTP_TIMEOUT: parseInt(import.meta.env.VITE_OTP_TIMEOUT) || 600000,
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 600
};

export const getApiUrl = (endpoint, id = null, query = '') => {
  const baseUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  if (id) return `${baseUrl}/${id}`;
  if (query) return `${baseUrl}?${query}`;
  return baseUrl;
};

export const validateEnvironment = () => {
  const required = ['VITE_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  return missing.length === 0;
};