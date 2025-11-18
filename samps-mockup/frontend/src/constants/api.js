// Configuración centralizada de API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
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

export const getApiUrl = (endpoint, id = null, query = '') => {
  const baseUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  if (id) return `${baseUrl}/${id}`;
  if (query) return `${baseUrl}?${query}`;
  return baseUrl;
};