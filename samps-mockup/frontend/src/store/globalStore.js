import { create } from 'zustand';

// Store principal de la aplicación
export const useAppStore = create((set, get) => ({
  // Estado de usuario
  user: null,
  userRole: null,
  selectedEntity: null,
  
  // Estado de UI
  loading: false,
  notifications: [],
  
  // Cache de datos
  entidades: [],
  monitores: [],
  talleres: [],
  cursos: [],
  alumnos: [],
  
  // Acciones de usuario
  setUser: (user, role) => set({ user, userRole: role }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  logout: () => set({ user: null, userRole: null, selectedEntity: null }),
  
  // Acciones de UI
  setLoading: (loading) => set({ loading }),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { 
      id: Date.now(), 
      ...notification 
    }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),
  
  // Acciones de datos
  setEntidades: (entidades) => set({ entidades }),
  setMonitores: (monitores) => set({ monitores }),
  setTalleres: (talleres) => set({ talleres }),
  setCursos: (cursos) => set({ cursos }),
  setAlumnos: (alumnos) => set({ alumnos }),
  
  // Selectores
  getEntidadById: (id) => get().entidades.find(e => e.id === id),
  getMonitorById: (id) => get().monitores.find(m => m.id === id),
  getTallerById: (id) => get().talleres.find(t => t.id === id),
  getCursoById: (id) => get().cursos.find(c => c.id === id),
  getAlumnoById: (id) => get().alumnos.find(a => a.id === id),
  
  // Filtros
  getMonitoresByEntidad: (entidadId) => 
    get().monitores.filter(m => m.entidad_id === entidadId),
  getTalleresByEntidad: (entidadId) => 
    get().talleres.filter(t => t.entidad_id === entidadId),
  getAlumnosByCurso: (cursoId) => 
    get().alumnos.filter(a => a.curso_id === cursoId),
}));

// Store para sesiones de check-in
export const useSessionStore = create((set, get) => ({
  activeSessions: [],
  currentSession: null,
  asistencias: [],
  
  setActiveSessions: (sessions) => set({ activeSessions: sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setAsistencias: (asistencias) => set({ asistencias }),
  
  addSession: (session) => set((state) => ({
    activeSessions: [...state.activeSessions, session]
  })),
  
  removeSession: (sessionId) => set((state) => ({
    activeSessions: state.activeSessions.filter(s => s.id !== sessionId),
    currentSession: state.currentSession?.id === sessionId ? null : state.currentSession
  })),
  
  updateAsistencia: (asistencia) => set((state) => ({
    asistencias: state.asistencias.map(a => 
      a.id === asistencia.id ? asistencia : a
    )
  })),
  
  addAsistencia: (asistencia) => set((state) => ({
    asistencias: [...state.asistencias, asistencia]
  })),
  
  getAsistenciasBySession: (sessionId) => 
    get().asistencias.filter(a => a.sesion_id === sessionId),
}));