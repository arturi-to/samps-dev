import { useState, useEffect } from 'react';
import RutInput from './RutInput';
import DataTable from './DataTable';
import { validateRut } from '../utils/rutValidator';
import { getAlumnos, getCursos, createAlumno, updateAlumno, deleteAlumno } from '../services/api';

const AlumnosManager = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', rut: '', email: '', curso_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [alumnosRes, cursosRes] = await Promise.all([
        getAlumnos(),
        getCursos()
      ]);
      setAlumnos(alumnosRes.data);
      setCursos(cursosRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRut(formData.rut)) {
      alert('RUT inválido. Por favor verifica el formato y dígito verificador.');
      return;
    }
    
    try {
      await createAlumno({
        ...formData,
        curso_id: parseInt(formData.curso_id)
      });
      setFormData({ nombre: '', rut: '', email: '', curso_id: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating alumno:', error);
    }
  };

  const getCursoNombre = (cursoId) => {
    const curso = cursos.find(c => c.id === cursoId);
    return curso ? `${curso.nombre_establecimiento} - ${curso.curso}` : 'No asignado';
  };

  return (
    <div className="card">
      <h2>👥 Gestión de Alumnos</h2>
      
      <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancelar' : '+ Agregar Alumno'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Nombre:</label>
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
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Curso:</label>
            <select
              value={formData.curso_id}
              onChange={(e) => setFormData({...formData, curso_id: e.target.value})}
              required
            >
              <option value="">Seleccionar curso</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre_establecimiento} - {curso.curso}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-success">Crear Alumno</button>
        </form>
      )}

      <h3>Alumnos Registrados</h3>
      <DataTable
        data={alumnos}
        columns={[
          { key: 'nombre', label: 'Nombre', sortable: true },
          { key: 'rut', label: 'RUT', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { 
            key: 'curso_id', 
            label: 'Curso', 
            render: (cursoId) => getCursoNombre(cursoId)
          }
        ]}
        searchFields={['nombre', 'rut', 'email']}
        onEdit={(alumno) => setEditingAlumno(alumno.id)}
        onDelete={(alumno) => {
          if(confirm(`¿Eliminar alumno "${alumno.nombre}"?`)) {
            axios.delete(`http://localhost:3001/alumnos_mock_sige/${alumno.id}`).then(() => fetchData());
          }
        }}
      />
      
      {editingAlumno && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4>Editar Alumno</h4>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            axios.patch(`http://localhost:3001/alumnos_mock_sige/${editingAlumno}`, {
              nombre: formData.get('nombre'),
              email: formData.get('email'),
              curso_id: parseInt(formData.get('curso_id'))
            }).then(() => {
              setEditingAlumno(null);
              fetchData();
            });
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
              <div className="form-group">
                <label>Nombre:</label>
                <input 
                  name="nombre" 
                  defaultValue={alumnos.find(a => a.id === editingAlumno)?.nombre} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  name="email" 
                  type="email"
                  defaultValue={alumnos.find(a => a.id === editingAlumno)?.email} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Curso:</label>
                <select 
                  name="curso_id" 
                  defaultValue={alumnos.find(a => a.id === editingAlumno)?.curso_id} 
                  required
                >
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre_establecimiento} - {curso.curso}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">Guardar</button>
              <button type="button" className="btn" onClick={() => setEditingAlumno(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AlumnosManager;