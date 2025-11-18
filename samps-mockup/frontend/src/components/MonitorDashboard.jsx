import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import DataTable from './DataTable';
import { getMonitores, getTalleres, getAlumnos, getSesionesCheckin, getAsistencias, createSesionCheckin, createAsistencia, updateAsistencia, deleteSesionCheckin } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';

const MonitorDashboard = () => {
  const [monitores, setMonitores] = useState([]);
  const [monitorSeleccionado, setMonitorSeleccionado] = useState(null);
  const [taller, setTaller] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [sesionActiva, setSesionActiva] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [editingAsistencia, setEditingAsistencia] = useState(null);
  const [comentarioEdit, setComentarioEdit] = useState('');
  const [sesionesActivas, setSesionesActivas] = useState([]);
  const { loading, error, handleAsync } = useErrorHandler();

  useEffect(() => {
    fetchMonitores();
  }, []);

  useEffect(() => {
    if (monitorSeleccionado) {
      fetchTaller();
      fetchSesionesActivas();
    }
  }, [monitorSeleccionado]);

  useEffect(() => {
    if (sesionActiva) {
      const interval = setInterval(() => {
        fetchAsistencias();
        updateTimer();
      }, 1000); // Cambiar a 1 segundo
      return () => clearInterval(interval);
    }
  }, [sesionActiva]);

  const fetchMonitores = () => handleAsync(async () => {
    const data = await getMonitores();
    setMonitores(data);
    if (data.length > 0) {
      setMonitorSeleccionado(data[0].id);
    }
  });

  const fetchTaller = () => {
    if (!monitorSeleccionado) return;
    
    handleAsync(async () => {
      const tallerData = await getTalleres({ monitor_id: monitorSeleccionado });
      if (tallerData.length > 0) {
        const taller = tallerData[0];
        setTaller(taller);
        
        const alumnosData = await getAlumnos({ curso_id: taller.curso_id });
        setAlumnos(alumnosData);
      } else {
        setTaller(null);
        setAlumnos([]);
      }
    });
  };

  const iniciarCheckin = () => handleAsync(async () => {
    const codigo = Math.floor(1000 + Math.random() * 9000);
    const sesionId = `sesion_${Date.now()}`;
    
    const sesion = {
      id: sesionId,
      taller_id: taller.id,
      codigo_pantalla: codigo.toString(),
      timestamp_inicio: new Date().toISOString()
    };

    await createSesionCheckin(sesion);
    setSesionActiva(sesion);
    setTimeLeft(600); // 10 minutos
    fetchSesionesActivas();
  });

  const fetchAsistencias = () => {
    if (!sesionActiva) return;
    
    handleAsync(async () => {
      const data = await getAsistencias({ sesion_id: sesionActiva.id });
      setAsistencias(data);
    });
  };

  const updateTimer = () => {
    setTimeLeft(prev => {
      if (prev <= 0) {
        setSesionActiva(null);
        return 0;
      }
      return prev - 1; // Decrementar 1 segundo
    });
  };

  const marcarManual = (alumnoId, estado, comentario = '') => {
    if (!sesionActiva) return;
    
    handleAsync(async () => {
      const existingAsistencia = asistencias.find(a => a.alumno_id === alumnoId);
      
      if (existingAsistencia) {
        await updateAsistencia(existingAsistencia.id, {
          estado: estado,
          comentario: comentario,
          modificado_por: 'Monitor',
          timestamp_modificacion: new Date().toISOString()
        });
      } else {
        await createAsistencia({
          sesion_id: sesionActiva.id,
          alumno_id: alumnoId,
          estado: estado,
          manual: true,
          comentario: comentario,
          timestamp: new Date().toISOString()
        });
      }
      
      setEditingAsistencia(null);
      setComentarioEdit('');
      setShowDisclaimer(false);
      fetchAsistencias();
    });
  };

  const handleEditAsistencia = (alumno) => {
    const asistencia = asistencias.find(a => a.alumno_id === alumno.id);
    setEditingAsistencia(alumno.id);
    setComentarioEdit(asistencia?.comentario || '');
  };

  const fetchSesionesActivas = () => handleAsync(async () => {
    const data = await getSesionesCheckin();
    const ahora = new Date();
    const sesionesValidas = data.filter(sesion => {
      const inicio = new Date(sesion.timestamp_inicio);
      const tiempoTranscurrido = (ahora - inicio) / (1000 * 60);
      return tiempoTranscurrido < 15; // Sesiones activas por 15 minutos
    });
    setSesionesActivas(sesionesValidas);
  });

  const retomarSesion = (sesion) => {
    setSesionActiva(sesion);
    const ahora = new Date();
    const inicio = new Date(sesion.timestamp_inicio);
    const tiempoTranscurrido = (ahora - inicio) / 1000;
    const tiempoRestante = Math.max(0, Math.floor(600 - tiempoTranscurrido)); // Redondear a segundos enteros
    setTimeLeft(tiempoRestante);
  };

  const cerrarSesion = (sesionId) => handleAsync(async () => {
    await deleteSesionCheckin(sesionId);
    setSesionesActivas(prev => prev.filter(s => s.id !== sesionId));
    if (sesionActiva?.id === sesionId) {
      setSesionActiva(null);
    }
  });

  const getEstadoAlumno = (alumnoId) => {
    const asistencia = asistencias.find(a => a.alumno_id === alumnoId);
    return asistencia ? asistencia.estado : 'Ausente';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const monitorActual = monitores.find(m => m.id === monitorSeleccionado);

  return (
    <div className="dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="header">
        <h1>👨🏫 Dashboard - Monitor</h1>
        <div className="form-group" style={{ marginTop: '10px', maxWidth: '300px' }}>
          <label style={{ color: '#ffffff', fontWeight: '600' }}>Seleccionar Monitor:</label>
          <select
            value={monitorSeleccionado || ''}
            onChange={(e) => setMonitorSeleccionado(parseInt(e.target.value))}
            style={{ padding: '8px', fontSize: '14px' }}
          >
            <option value="">Seleccionar monitor...</option>
            {monitores.map(monitor => (
              <option key={monitor.id} value={monitor.id}>
                {monitor.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
        {!monitorSeleccionado && (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
              Por favor selecciona un monitor para continuar.
            </p>
          </div>
        )}

        {monitorSeleccionado && !taller && (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
              No hay talleres asignados a {monitorActual?.nombre}.
            </p>
          </div>
        )}

        {monitorSeleccionado && taller && (
          <>
            {/* Sesiones Activas */}
            {sesionesActivas.length > 0 && (
          <div className="card">
            <h3>📡 Sesiones Activas</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {sesionesActivas.map(sesion => {
                const esActual = sesionActiva?.id === sesion.id;
                const inicio = new Date(sesion.timestamp_inicio);
                const tiempoTranscurrido = Math.floor((new Date() - inicio) / (1000 * 60));
                
                return (
                  <div key={sesion.id} style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '15px',
                    background: esActual ? '#e3f2fd' : '#f8f9fa',
                    border: esActual ? '2px solid #2196f3' : '1px solid #dee2e6',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <strong>Código: {sesion.codigo_pantalla}</strong>
                      <small style={{ display: 'block', color: '#6c757d' }}>
                        Iniciada hace {tiempoTranscurrido} min • ID: {sesion.id}
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!esActual && (
                        <button 
                          className="btn" 
                          onClick={() => retomarSesion(sesion)}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          🔄 Retomar
                        </button>
                      )}
                      <button 
                        className="btn btn-danger" 
                        onClick={() => {
                          if(confirm('¿Cerrar esta sesión definitivamente?')) {
                            cerrarSesion(sesion.id);
                          }
                        }}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        ❌ Cerrar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0' }}>{taller.nombre}</h2>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span className="status-indicator status-active">
                  • {taller.disciplina}
                </span>
                <span style={{ color: '#6c757d', fontSize: '14px' }}>
                  🕰️ {taller.calendario}
                </span>
              </div>
            </div>
            {!sesionActiva && (
              <button className="btn btn-success btn-icon" onClick={iniciarCheckin} aria-label="Iniciar nueva sesión de check-in">
                Iniciar Check-in
              </button>
            )}
          </div>
          
          {sesionActiva && (
            <div className="qr-container">
              <h3>✅ Sesión de Check-in Activa</h3>
              <div className="timer" style={{ fontSize: '2em', margin: '20px 0' }}>
                ⏱️ {formatTime(timeLeft)}
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '12px', margin: '20px 0' }}>
                <p style={{ fontSize: '1.2em', margin: '0 0 10px 0' }}><strong>Código de Pantalla:</strong></p>
                <code style={{ fontSize: '2em', padding: '15px 25px' }}>{sesionActiva.codigo_pantalla}</code>
              </div>
              
              <div className="qr-code-wrapper">
                <QRCode 
                  value={`http://localhost:3000/check/${sesionActiva.id}`}
                  size={180}
                />
              </div>
              
              <p style={{ margin: '20px 0 10px 0' }}>Los alumnos pueden:</p>
              <p style={{ margin: '5px 0' }}>📱 Escanear el código QR</p>
              <p style={{ margin: '5px 0' }}>💻 Ir a: <code>http://localhost:3000/check/{sesionActiva.id}</code></p>
              
              <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <small style={{ color: 'rgba(255,255,255,0.8)' }}>
                  🔧 <strong>Para testing:</strong> Asegúrate de que el frontend esté corriendo en puerto 3000
                </small>
              </div>
              
              <button 
                className="btn btn-danger" 
                onClick={() => setSesionActiva(null)}
                style={{ marginTop: '20px' }}
                aria-label="Finalizar sesión de check-in"
              >
                Finalizar Sesión
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ margin: '0' }}>👥 Lista de Alumnos ({alumnos.length})</h3>
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <span className="estado estado-presente">Presente</span>
              <span className="estado estado-con-atraso">Con Atraso</span>
              <span className="estado estado-ausente">Ausente</span>
            </div>
          </div>
          
          <DataTable
            data={alumnos.map(alumno => ({
              ...alumno,
              estado: getEstadoAlumno(alumno.id)
            }))}
            columns={[
              { key: 'nombre', label: 'Nombre', sortable: true },
              { key: 'rut', label: 'RUT', sortable: true },
              { key: 'email', label: 'Email', sortable: true },
              { 
                key: 'estado', 
                label: 'Estado',
                render: (estado) => {
                  const estadoClass = estado.toLowerCase().replace(' ', '-').replace('con-atraso', 'con-atraso');
                  return <span className={`estado estado-${estadoClass}`}>{estado}</span>;
                }
              }
            ]}
            searchFields={['nombre', 'rut', 'email']}
            onEdit={(alumno) => {
              if (sesionActiva) {
                if (alumno.estado === 'Ausente') {
                  setShowDisclaimer(alumno.id);
                } else {
                  handleEditAsistencia(alumno);
                }
              }
            }}
            onDelete={() => {}}
            showActions={!!sesionActiva}
          />
          
          {sesionActiva && (
            <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
              <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                📊 <strong>Estadísticas:</strong> {asistencias.filter(a => a.estado === 'Presente').length} presentes, {asistencias.filter(a => a.estado === 'Con Atraso').length} con atraso, {alumnos.length - asistencias.length} ausentes
              </p>
            </div>
          )}
          
          {/* Modal de Disclaimer */}
          {showDisclaimer && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ color: '#003d7a', marginTop: 0 }}>⚠️ Confirmación de Asistencia Manual</h3>
                <p style={{ lineHeight: '1.6', color: '#495057' }}>
                  Al marcar manualmente la asistencia, usted declara bajo su responsabilidad que:
                </p>
                <ul style={{ color: '#495057', lineHeight: '1.6' }}>
                  <li>El alumno se encuentra físicamente presente en el taller</li>
                  <li>Ha verificado la identidad del estudiante</li>
                  <li>Comprende que esta acción queda registrada en el sistema</li>
                </ul>
                
                <div className="form-group">
                  <label>Comentario (opcional):</label>
                  <textarea
                    value={comentarioEdit}
                    onChange={(e) => setComentarioEdit(e.target.value)}
                    placeholder="Justificación o comentario sobre el marcado manual..."
                    rows="3"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button 
                    className="btn" 
                    onClick={() => {
                      setShowDisclaimer(false);
                      setComentarioEdit('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={() => {
                      marcarManual(showDisclaimer, 'Presente', comentarioEdit);
                    }}
                  >
                    Confirmar Asistencia
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal de Edición */}
          {editingAsistencia && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ color: '#003d7a', marginTop: 0 }}>✏️ Editar Asistencia</h3>
                <p><strong>Alumno:</strong> {alumnos.find(a => a.id === editingAsistencia)?.nombre}</p>
                
                <div className="form-group">
                  <label>Nuevo Estado:</label>
                  <select 
                    id="nuevoEstado"
                    defaultValue={getEstadoAlumno(editingAsistencia)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  >
                    <option value="Presente">Presente</option>
                    <option value="Con Atraso">Con Atraso</option>
                    <option value="Ausente">Ausente</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Justificación del cambio:</label>
                  <textarea
                    value={comentarioEdit}
                    onChange={(e) => setComentarioEdit(e.target.value)}
                    placeholder="Explique el motivo del cambio de estado..."
                    rows="3"
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button 
                    className="btn" 
                    onClick={() => {
                      setEditingAsistencia(null);
                      setComentarioEdit('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={() => {
                      const nuevoEstado = document.getElementById('nuevoEstado').value;
                      if (comentarioEdit.trim()) {
                        marcarManual(editingAsistencia, nuevoEstado, comentarioEdit);
                      } else {
                        alert('La justificación es obligatoria para editar la asistencia');
                      }
                    }}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}
            </div>
          </>
        )}
    </div>
  );
};

export default MonitorDashboard;