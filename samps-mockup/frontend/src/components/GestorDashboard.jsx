import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { getUsuarios, getTalleres, getVisitasGestor, createVisitaGestor } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';

const GestorDashboard = () => {
  const [gestores, setGestores] = useState([]);
  const [gestorSeleccionado, setGestorSeleccionado] = useState(null);
  const [talleres, setTalleres] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState(null);
  const [formData, setFormData] = useState({
    tipo: '',
    fecha: '',
    observaciones: ''
  });
  const { loading, error, handleAsync } = useErrorHandler();

  useEffect(() => {
    fetchGestores();
  }, []);

  useEffect(() => {
    if (gestorSeleccionado) {
      fetchData();
    }
  }, [gestorSeleccionado]);

  const fetchGestores = () => handleAsync(async () => {
    const data = await getUsuarios({ rol: 'gestor' });
    setGestores(data);
    if (data.length > 0) {
      setGestorSeleccionado(data[0].id);
    }
  });

  const fetchData = () => {
    if (!gestorSeleccionado) return;
    
    handleAsync(async () => {
      const [talleresData, visitasData] = await Promise.all([
        getTalleres(),
        getVisitasGestor()
      ]);
      
      setTalleres(talleresData);
      setVisitas(visitasData);
    });
  };

  const iniciarAuditoria = (taller) => {
    setSelectedTaller(taller);
    setShowForm(true);
    setFormData({
      tipo: '',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    handleAsync(async () => {
      const gestorActual = gestores.find(g => g.id === gestorSeleccionado);
      await createVisitaGestor({
        taller_id: selectedTaller.id,
        taller_nombre: selectedTaller.nombre,
        gestor: gestorActual?.nombre || 'Gestor',
        ...formData,
        timestamp: new Date().toISOString()
      });
      
      setFormData({ tipo: '', fecha: '', observaciones: '' });
      setShowForm(false);
      setSelectedTaller(null);
      fetchData();
    });
  };

  return (
    <div className="dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="header">
        <h1>Dashboard - Gestor Territorial</h1>
        <div className="form-group" style={{ marginTop: '10px', maxWidth: '300px' }}>
          <label style={{ color: '#ffffff', fontWeight: '600' }}>Seleccionar Gestor:</label>
          <select
            value={gestorSeleccionado || ''}
            onChange={(e) => setGestorSeleccionado(parseInt(e.target.value))}
            style={{ padding: '8px', fontSize: '14px' }}
          >
            <option value="">Seleccionar gestor...</option>
            {gestores.map(gestor => (
              <option key={gestor.id} value={gestor.id}>
                {gestor.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!gestorSeleccionado && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
            Por favor selecciona un gestor para continuar.
          </p>
        </div>
      )}

      {gestorSeleccionado && (
        <>
          <div className="card">
        <h2>Talleres Disponibles para Auditoría</h2>
        
        <DataTable
          data={talleres.map(t => ({...t, accion: 'Auditar'}))}
          columns={[
            { key: 'nombre', label: 'Taller', sortable: true },
            { key: 'disciplina', label: 'Disciplina', sortable: true },
            { 
              key: 'calendario', 
              label: 'Horario', 
              render: (calendario, taller) => 
                Array.isArray(taller.horarios) ? 
                  taller.horarios.map(h => `${h.dia} ${h.inicio}-${h.fin}`).join(', ') : 
                  calendario || 'No definido'
            }
          ]}
          searchFields={['nombre', 'disciplina']}
          onEdit={(taller) => iniciarAuditoria(taller)}
          onDelete={() => {}}
        />
      </div>

      {showForm && (
        <div className="card">
          <h2>Registrar Visita de Auditoría</h2>
          <h3>Taller: {selectedTaller?.nombre}</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tipo de Visita:</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Supervisión Rutinaria">Supervisión Rutinaria</option>
                <option value="Auditoría de Calidad">Auditoría de Calidad</option>
                <option value="Seguimiento de Incidencias">Seguimiento de Incidencias</option>
                <option value="Evaluación de Resultados">Evaluación de Resultados</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Fecha de Visita:</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Observaciones:</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                rows="4"
                placeholder="Describe los hallazgos, recomendaciones y observaciones de la visita..."
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <button type="submit" className="btn btn-success">
                Guardar Visita
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Historial de Visitas</h2>
        
        {visitas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            No hay visitas registradas aún.
          </div>
        ) : (
          <DataTable
            data={visitas}
            columns={[
              { key: 'taller_nombre', label: 'Taller', sortable: true },
              { key: 'tipo', label: 'Tipo de Visita', sortable: true },
              { key: 'fecha', label: 'Fecha', sortable: true },
              { 
                key: 'observaciones', 
                label: 'Observaciones',
                render: (obs) => obs.length > 50 ? `${obs.substring(0, 50)}...` : obs
              },
              { 
                key: 'timestamp', 
                label: 'Registrado',
                render: (timestamp) => new Date(timestamp).toLocaleDateString('es-CL')
              }
            ]}
            searchFields={['taller_nombre', 'tipo', 'observaciones']}
            showActions={false}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )}
          </div>
        </>
      )}
    </div>
  );
};

export default GestorDashboard;