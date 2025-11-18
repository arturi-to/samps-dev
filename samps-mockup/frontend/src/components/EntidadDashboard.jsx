import { useState, useEffect } from 'react';
import RutInput from './RutInput';
import HorarioSelector from './HorarioSelector';
import DataTable from './DataTable';
import { validateRut } from '../utils/rutValidator';
import { getEntidades, getMonitores, getTalleres, getCursos, createMonitor, createTaller, updateMonitor, updateTaller, deleteMonitor, deleteTaller } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';

const EntidadDashboard = () => {
  const [entidades, setEntidades] = useState([]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);
  const [monitores, setMonitores] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [showMonitorForm, setShowMonitorForm] = useState(false);
  const [showTallerForm, setShowTallerForm] = useState(false);
  const [monitorForm, setMonitorForm] = useState({ nombre: '', rut: '' });
  const [tallerForm, setTallerForm] = useState({ 
    nombre: '', 
    disciplina: '', 
    monitor_id: '', 
    curso_id: '', 
    horarios: [] 
  });
  const [editingMonitor, setEditingMonitor] = useState(null);
  const [editingTaller, setEditingTaller] = useState(null);
  const { loading, error, handleAsync } = useErrorHandler();

  useEffect(() => {
    fetchEntidades();
  }, []);

  useEffect(() => {
    if (entidadSeleccionada) {
      fetchData();
    }
  }, [entidadSeleccionada]);

  const fetchEntidades = () => handleAsync(async () => {
    const data = await getEntidades();
    setEntidades(data);
    if (data.length > 0) {
      setEntidadSeleccionada(data[0].id);
    }
  });

  const fetchData = () => {
    if (!entidadSeleccionada) return;
    
    handleAsync(async () => {
      const [monitoresData, talleresData, cursosData] = await Promise.all([
        getMonitores({ entidad_id: entidadSeleccionada }),
        getTalleres({ entidad_id: entidadSeleccionada }),
        getCursos()
      ]);
      
      setMonitores(monitoresData);
      setTalleres(talleresData);
      setCursos(cursosData);
    });
  };

  const handleMonitorSubmit = (e) => {
    e.preventDefault();
    
    if (!validateRut(monitorForm.rut)) {
      alert('RUT inválido. Por favor verifica el formato y dígito verificador.');
      return;
    }
    
    handleAsync(async () => {
      await createMonitor({
        ...monitorForm,
        entidad_id: entidadSeleccionada
      });
      setMonitorForm({ nombre: '', rut: '' });
      setShowMonitorForm(false);
      fetchData();
    });
  };

  const handleTallerSubmit = (e) => {
    e.preventDefault();
    handleAsync(async () => {
      await createTaller({
        ...tallerForm,
        entidad_id: entidadSeleccionada,
        monitor_id: parseInt(tallerForm.monitor_id),
        curso_id: parseInt(tallerForm.curso_id),
        calendario: tallerForm.horarios.map(h => `${h.dia} ${h.inicio}-${h.fin}`).join(', ')
      });
      setTallerForm({ nombre: '', disciplina: '', monitor_id: '', curso_id: '', horarios: [] });
      setShowTallerForm(false);
      fetchData();
    });
  };

  return (
    <div className="dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="header">
        <h1>Dashboard - Entidad Ejecutora</h1>
        <div className="form-group" style={{ marginTop: '10px', maxWidth: '300px' }}>
          <label style={{ color: '#ffffff', fontWeight: '600' }}>Seleccionar Entidad:</label>
          <select
            value={entidadSeleccionada || ''}
            onChange={(e) => setEntidadSeleccionada(parseInt(e.target.value))}
            style={{ padding: '8px', fontSize: '14px' }}
          >
            <option value="">Seleccionar entidad...</option>
            {entidades.map(entidad => (
              <option key={entidad.id} value={entidad.id}>
                {entidad.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!entidadSeleccionada && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
            Por favor selecciona una entidad para continuar.
          </p>
        </div>
      )}

      {entidadSeleccionada && (
        <>
          {/* Gestión de Monitores */}
          <div className="card">
        <h2>Gestión de Monitores</h2>
        <button className="btn" onClick={() => setShowMonitorForm(!showMonitorForm)}>
          {showMonitorForm ? 'Cancelar' : 'Agregar Monitor'}
        </button>

        {showMonitorForm && (
          <form onSubmit={handleMonitorSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={monitorForm.nombre}
                onChange={(e) => setMonitorForm({...monitorForm, nombre: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>RUT:</label>
              <RutInput
                value={monitorForm.rut}
                onChange={(value) => setMonitorForm({...monitorForm, rut: value})}
                required
              />
            </div>
            <button type="submit" className="btn">Crear Monitor</button>
          </form>
        )}

        <h3>Monitores Registrados</h3>
        <DataTable
          data={monitores}
          columns={[
            { key: 'nombre', label: 'Nombre', sortable: true },
            { key: 'rut', label: 'RUT', sortable: true }
          ]}
          searchFields={['nombre', 'rut']}
          onEdit={(monitor) => setEditingMonitor(monitor.id)}
          onDelete={(monitor) => {
            if(confirm(`¿Eliminar monitor "${monitor.nombre}"?`)) {
              handleAsync(async () => {
                await deleteMonitor(monitor.id);
                fetchData();
              });
            }
          }}
        />
        
        {editingMonitor && (
          <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Editar Monitor</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const rut = formData.get('rut');
              
              if (!validateRut(rut)) {
                alert('RUT inválido. Por favor verifica el formato y dígito verificador.');
                return;
              }
              
              handleAsync(async () => {
                await updateMonitor(editingMonitor, {
                  nombre: formData.get('nombre'),
                  rut: rut
                });
                setEditingMonitor(null);
                fetchData();
              });
            }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'end' }}>
                <div className="form-group" style={{ flex: '1' }}>
                  <label>Nombre:</label>
                  <input 
                    name="nombre" 
                    defaultValue={monitores.find(m => m.id === editingMonitor)?.nombre} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: '1' }}>
                  <label>RUT:</label>
                  <input 
                    name="rut" 
                    defaultValue={monitores.find(m => m.id === editingMonitor)?.rut} 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-success">Guardar</button>
                  <button type="button" className="btn" onClick={() => setEditingMonitor(null)}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Gestión de Talleres */}
      <div className="card">
        <h2>Gestión de Talleres</h2>
        <button className="btn" onClick={() => setShowTallerForm(!showTallerForm)}>
          {showTallerForm ? 'Cancelar' : 'Crear Taller'}
        </button>

        {showTallerForm && (
          <form onSubmit={handleTallerSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Nombre del Taller:</label>
              <input
                type="text"
                value={tallerForm.nombre}
                onChange={(e) => setTallerForm({...tallerForm, nombre: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Disciplina:</label>
              <input
                type="text"
                value={tallerForm.disciplina}
                onChange={(e) => setTallerForm({...tallerForm, disciplina: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Monitor:</label>
              <select
                value={tallerForm.monitor_id}
                onChange={(e) => setTallerForm({...tallerForm, monitor_id: e.target.value})}
                required
              >
                <option value="">Seleccionar Monitor</option>
                {monitores.map(monitor => (
                  <option key={monitor.id} value={monitor.id}>{monitor.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Curso:</label>
              <select
                value={tallerForm.curso_id}
                onChange={(e) => setTallerForm({...tallerForm, curso_id: e.target.value})}
                required
              >
                <option value="">Seleccionar Curso</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre_establecimiento} - {curso.curso}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Horarios:</label>
              <HorarioSelector
                value={tallerForm.horarios}
                onChange={(horarios) => setTallerForm({...tallerForm, horarios})}
              />
            </div>
            <button type="submit" className="btn">Crear Taller</button>
          </form>
        )}

        <h3>Talleres Creados</h3>
        <DataTable
          data={talleres}
          columns={[
            { key: 'nombre', label: 'Taller', sortable: true },
            { key: 'disciplina', label: 'Disciplina', sortable: true },
            { 
              key: 'horarios', 
              label: 'Horarios', 
              render: (horarios, taller) => 
                Array.isArray(horarios) ? 
                  horarios.map(h => `${h.dia} ${h.inicio}-${h.fin}`).join(', ') : 
                  taller.calendario || 'No definido'
            },
            { 
              key: 'monitor_id', 
              label: 'Monitor', 
              render: (monitorId) => monitores.find(m => m.id === monitorId)?.nombre || 'No asignado'
            }
          ]}
          searchFields={['nombre', 'disciplina']}
          onEdit={(taller) => setEditingTaller(taller.id)}
          onDelete={(taller) => {
            if(confirm(`¿Eliminar taller "${taller.nombre}"?`)) {
              handleAsync(async () => {
                await deleteTaller(taller.id);
                fetchData();
              });
            }
          }}
        />
        
        {editingTaller && (
          <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Editar Taller</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAsync(async () => {
                await updateTaller(editingTaller, {
                  nombre: formData.get('nombre'),
                  disciplina: formData.get('disciplina')
                });
                setEditingTaller(null);
                fetchData();
              });
            }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'end' }}>
                <div className="form-group" style={{ flex: '1' }}>
                  <label>Nombre:</label>
                  <input 
                    name="nombre" 
                    defaultValue={talleres.find(t => t.id === editingTaller)?.nombre} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: '1' }}>
                  <label>Disciplina:</label>
                  <input 
                    name="disciplina" 
                    defaultValue={talleres.find(t => t.id === editingTaller)?.disciplina} 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-success">Guardar</button>
                  <button type="button" className="btn" onClick={() => setEditingTaller(null)}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        )}
          </div>
        </>
      )}
    </div>
  );
};

export default EntidadDashboard;