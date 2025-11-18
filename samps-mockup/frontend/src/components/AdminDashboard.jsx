import { useState, useEffect } from 'react';
import RutInput from './RutInput';
import DataTable from './DataTable';
import { validateRut } from '../utils/rutValidator';
import { getEntidades, createEntidad, updateEntidad, deleteEntidad } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';

const AdminDashboard = () => {
  const [entidades, setEntidades] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', rut: '' });
  const [editingEntidad, setEditingEntidad] = useState(null);
  const { loading, error, handleAsync } = useErrorHandler();

  useEffect(() => {
    fetchEntidades();
  }, []);

  const fetchEntidades = () => handleAsync(async () => {
    const data = await getEntidades();
    setEntidades(data);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateRut(formData.rut)) {
      alert('RUT inválido. Por favor verifica el formato y dígito verificador.');
      return;
    }
    
    handleAsync(async () => {
      await createEntidad({
        ...formData,
        cursos_asignados_rbd: []
      });
      setFormData({ nombre: '', rut: '' });
      setShowForm(false);
      fetchEntidades();
    });
  };

  const asignarCurso = (entidadId, rbd) => handleAsync(async () => {
    const entidad = entidades.find(e => e.id === entidadId);
    const updatedCursos = [...entidad.cursos_asignados_rbd, parseInt(rbd)];
    
    await updateEntidad(entidadId, {
      cursos_asignados_rbd: updatedCursos
    });
    
    fetchEntidades();
  });

  return (
    <div className="dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="header">
        <h1>Dashboard - Admin Central MINEDUC</h1>
      </div>

      <div className="card">
        <h2>Gestión de Entidades Ejecutoras</h2>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Crear Nueva Entidad'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Nombre de la Entidad:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>RUT:</label>
              <RutInput
                value={formData.rut}
                onChange={(value) => setFormData({...formData, rut: value})}
                required
              />
            </div>
            <button type="submit" className="btn">Crear Entidad</button>
          </form>
        )}
      </div>

      <div className="card">
        <h3>Entidades Registradas</h3>
        <DataTable
          data={entidades}
          columns={[
            { key: 'nombre', label: 'Nombre', sortable: true },
            { key: 'rut', label: 'RUT', sortable: true },
            { 
              key: 'cursos_asignados_rbd', 
              label: 'Cursos Asignados', 
              render: (cursos) => cursos?.length ? cursos.join(', ') : 'Ninguno'
            }
          ]}
          searchFields={['nombre', 'rut']}
          onEdit={(entidad) => setEditingEntidad(entidad.id)}
          onDelete={(entidad) => {
            if(confirm(`¿Eliminar entidad "${entidad.nombre}"?`)) {
              handleAsync(async () => {
                await deleteEntidad(entidad.id);
                fetchEntidades();
              });
            }
          }}
        />
        
        {editingEntidad && (
          <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Editar Entidad</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const rut = formData.get('rut');
              
              if (!validateRut(rut)) {
                alert('RUT inválido. Por favor verifica el formato y dígito verificador.');
                return;
              }
              
              handleAsync(async () => {
                await updateEntidad(editingEntidad, {
                  nombre: formData.get('nombre'),
                  rut: rut
                });
                setEditingEntidad(null);
                fetchEntidades();
              });
            }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'end' }}>
                <div className="form-group" style={{ flex: '1' }}>
                  <label>Nombre:</label>
                  <input 
                    name="nombre" 
                    defaultValue={entidades.find(e => e.id === editingEntidad)?.nombre} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: '1' }}>
                  <label>RUT:</label>
                  <input 
                    name="rut" 
                    defaultValue={entidades.find(e => e.id === editingEntidad)?.rut} 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-success">Guardar</button>
                  <button type="button" className="btn" onClick={() => setEditingEntidad(null)}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
      
      <div className="card">
        <h3>📚 Gestión de Alumnos</h3>
        <p>Para gestionar alumnos, utiliza el menú de navegación superior.</p>
        <button className="btn" onClick={() => window.location.href = '/admin/alumnos'}>
          Ir a Gestión de Alumnos
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;