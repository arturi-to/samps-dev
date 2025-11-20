import axios from 'axios';
import { API_CONFIG, getApiUrl } from '../constants/api';

// Cache simple para datos estáticos
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Configurar axios con interceptors
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor para rate limiting del cliente
let requestCount = 0;
let windowStart = Date.now();
const WINDOW_SIZE = 60000; // 1 minuto
const MAX_REQUESTS = 50;

apiClient.interceptors.request.use((config) => {
  const now = Date.now();
  
  if (now - windowStart > WINDOW_SIZE) {
    requestCount = 0;
    windowStart = now;
  }
  
  if (requestCount >= MAX_REQUESTS) {
    return Promise.reject(new Error('Rate limit exceeded'));
  }
  
  requestCount++;
  return config;
});

// Response interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    if (!config.retryCount) {
      config.retryCount = 0;
    }
    
    if (config.retryCount < API_CONFIG.RETRY_ATTEMPTS && error.response?.status >= 500) {
      config.retryCount++;
      const delay = Math.pow(2, config.retryCount) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

// Utilidad para cache
const getCacheKey = (url, params) => {
  return `${url}${params ? JSON.stringify(params) : ''}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Wrapper para requests con cache
const cachedRequest = async (url, params = {}, useCache = true) => {
  const cacheKey = getCacheKey(url, params);
  
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) return { data: cached };
  }
  
  const response = await apiClient.get(url, { params });
  
  if (useCache) {
    setCache(cacheKey, response.data);
  }
  
  return response;
};

// Usuarios
export const getUsuarios = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.USUARIOS);
  return cachedRequest(url, params, true);
};
export const getUsuario = (id) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.USUARIOS, id);
  return cachedRequest(url, {}, true);
};

// Entidades
export const getEntidades = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES);
  return cachedRequest(url, params, true);
};
export const getEntidad = (id) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES, id);
  return cachedRequest(url, {}, true);
};
export const createEntidad = (data) => {
  cache.clear(); // Invalidar cache
  return apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES), data);
};
export const updateEntidad = (id, data) => {
  cache.clear();
  return apiClient.patch(getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES, id), data);
};
export const deleteEntidad = (id) => {
  cache.clear();
  return apiClient.delete(getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES, id));
};

// Monitores
export const getMonitores = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.MONITORES);
  return cachedRequest(url, params, true);
};
export const getMonitor = (id) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.MONITORES, id);
  return cachedRequest(url, {}, true);
};
export const createMonitor = (data) => {
  cache.clear();
  return apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.MONITORES), data);
};
export const updateMonitor = (id, data) => {
  cache.clear();
  return apiClient.patch(getApiUrl(API_CONFIG.ENDPOINTS.MONITORES, id), data);
};
export const deleteMonitor = (id) => {
  cache.clear();
  return apiClient.delete(getApiUrl(API_CONFIG.ENDPOINTS.MONITORES, id));
};

// Cursos
export const getCursos = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.CURSOS);
  return cachedRequest(url, params, true);
};
export const getCurso = (id) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.CURSOS, id);
  return cachedRequest(url, {}, true);
};

// Alumnos
export const getAlumnos = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS);
  return cachedRequest(url, params, false); // No cache para datos dinámicos
};
export const getAlumno = (id) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS, id);
  return cachedRequest(url, {}, false);
};
export const createAlumno = (data) => {
  return apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS), data);
};
export const updateAlumno = (id, data) => {
  return apiClient.patch(getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS, id), data);
};
export const deleteAlumno = (id) => {
  return apiClient.delete(getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS, id));
};

// Talleres
export const getTalleres = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.TALLERES);
  return cachedRequest(url, params, true);
};
export const getTaller = (id) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.TALLERES, id);
  return cachedRequest(url, {}, true);
};
export const createTaller = (data) => {
  cache.clear();
  return apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.TALLERES), data);
};
export const updateTaller = (id, data) => {
  cache.clear();
  return apiClient.patch(getApiUrl(API_CONFIG.ENDPOINTS.TALLERES, id), data);
};
export const deleteTaller = (id) => {
  cache.clear();
  return apiClient.delete(getApiUrl(API_CONFIG.ENDPOINTS.TALLERES, id));
};

// Sesiones Check-in
export const getSesionesCheckin = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.SESIONES);
  return apiClient.get(url, { params }); // Sin cache para datos en tiempo real
};
export const createSesionCheckin = (data) => {
  return apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.SESIONES), data);
};
export const getSesionCheckin = (id) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.SESIONES, id);
  return apiClient.get(url);
};
export const deleteSesionCheckin = (id) => {
  return apiClient.delete(getApiUrl(API_CONFIG.ENDPOINTS.SESIONES, id));
};

// Asistencias
export const getAsistencias = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.ASISTENCIAS);
  return apiClient.get(url, { params }); // Sin cache para datos en tiempo real
};
export const createAsistencia = (data) => {
  return apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.ASISTENCIAS), data);
};
export const updateAsistencia = (id, data) => {
  return apiClient.patch(getApiUrl(API_CONFIG.ENDPOINTS.ASISTENCIAS, id), data);
};

// Visitas Gestor
export const getVisitasGestor = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.VISITAS);
  return cachedRequest(url, params, true);
};
export const createVisitaGestor = (data) => {
  cache.clear();
  return apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.VISITAS), data);
};

// Utilidad para limpiar cache manualmente
export const clearCache = () => {
  cache.clear();
};

// Utilidad para obtener estadísticas de cache
export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};