import axios from 'axios';
import { API_CONFIG, getApiUrl } from '../constants/api';

// Usuarios
export const getUsuarios = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.USUARIOS);
  return axios.get(url, { params }).then(res => res.data);
};
export const getUsuario = (id) => axios.get(getApiUrl(API_CONFIG.ENDPOINTS.USUARIOS, id)).then(res => res.data);

// Entidades
export const getEntidades = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES);
  return axios.get(url, { params }).then(res => res.data);
};
export const getEntidad = (id) => axios.get(getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES, id)).then(res => res.data);
export const createEntidad = (data) => axios.post(getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES), data).then(res => res.data);
export const updateEntidad = (id, data) => axios.patch(getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES, id), data).then(res => res.data);
export const deleteEntidad = (id) => axios.delete(getApiUrl(API_CONFIG.ENDPOINTS.ENTIDADES, id)).then(res => res.data);

// Monitores
export const getMonitores = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.MONITORES);
  return axios.get(url, { params }).then(res => res.data);
};
export const getMonitor = (id) => axios.get(getApiUrl(API_CONFIG.ENDPOINTS.MONITORES, id)).then(res => res.data);
export const createMonitor = (data) => axios.post(getApiUrl(API_CONFIG.ENDPOINTS.MONITORES), data).then(res => res.data);
export const updateMonitor = (id, data) => axios.patch(getApiUrl(API_CONFIG.ENDPOINTS.MONITORES, id), data).then(res => res.data);
export const deleteMonitor = (id) => axios.delete(getApiUrl(API_CONFIG.ENDPOINTS.MONITORES, id)).then(res => res.data);

// Cursos
export const getCursos = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.CURSOS);
  return axios.get(url, { params }).then(res => res.data);
};
export const getCurso = (id) => axios.get(getApiUrl(API_CONFIG.ENDPOINTS.CURSOS, id)).then(res => res.data);

// Alumnos
export const getAlumnos = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS);
  return axios.get(url, { params }).then(res => res.data);
};
export const getAlumno = (id) => axios.get(getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS, id)).then(res => res.data);
export const createAlumno = (data) => axios.post(getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS), data).then(res => res.data);
export const updateAlumno = (id, data) => axios.patch(getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS, id), data).then(res => res.data);
export const deleteAlumno = (id) => axios.delete(getApiUrl(API_CONFIG.ENDPOINTS.ALUMNOS, id)).then(res => res.data);

// Talleres
export const getTalleres = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.TALLERES);
  return axios.get(url, { params }).then(res => res.data);
};
export const getTaller = (id) => axios.get(getApiUrl(API_CONFIG.ENDPOINTS.TALLERES, id)).then(res => res.data);
export const createTaller = (data) => axios.post(getApiUrl(API_CONFIG.ENDPOINTS.TALLERES), data).then(res => res.data);
export const updateTaller = (id, data) => axios.patch(getApiUrl(API_CONFIG.ENDPOINTS.TALLERES, id), data).then(res => res.data);
export const deleteTaller = (id) => axios.delete(getApiUrl(API_CONFIG.ENDPOINTS.TALLERES, id)).then(res => res.data);

// Sesiones Check-in
export const getSesionesCheckin = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.SESIONES);
  return axios.get(url, { params }).then(res => res.data);
};
export const createSesionCheckin = (data) => axios.post(getApiUrl(API_CONFIG.ENDPOINTS.SESIONES), data).then(res => res.data);
export const getSesionCheckin = (id) => axios.get(getApiUrl(API_CONFIG.ENDPOINTS.SESIONES, id)).then(res => res.data);
export const deleteSesionCheckin = (id) => axios.delete(getApiUrl(API_CONFIG.ENDPOINTS.SESIONES, id)).then(res => res.data);

// Asistencias
export const getAsistencias = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.ASISTENCIAS);
  return axios.get(url, { params }).then(res => res.data);
};
export const createAsistencia = (data) => axios.post(getApiUrl(API_CONFIG.ENDPOINTS.ASISTENCIAS), data).then(res => res.data);
export const updateAsistencia = (id, data) => axios.patch(getApiUrl(API_CONFIG.ENDPOINTS.ASISTENCIAS, id), data).then(res => res.data);

// Visitas Gestor
export const getVisitasGestor = (params = {}) => {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.VISITAS);
  return axios.get(url, { params }).then(res => res.data);
};
export const createVisitaGestor = (data) => axios.post(getApiUrl(API_CONFIG.ENDPOINTS.VISITAS), data).then(res => res.data);