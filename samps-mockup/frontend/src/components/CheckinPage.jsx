import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RutInput from './RutInput';
import { validateRut } from '../utils/rutValidator';
import { getSesionCheckin, getTaller, getEntidad, getAlumnos, createAsistencia } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';

const CheckinPage = () => {
  const { sesionId } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ rut: '', codigo: '', otp: '' });
  const [sesion, setSesion] = useState(null);
  const [alumno, setAlumno] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [message, setMessage] = useState('');
  const [tallerInfo, setTallerInfo] = useState(null);
  const { loading, error, handleAsync } = useErrorHandler();

  useEffect(() => {
    fetchSesion();
  }, [sesionId]);

  const fetchSesion = () => handleAsync(async () => {
    console.log('Buscando sesión:', sesionId);
    
    const sesionRes = await getSesionCheckin(sesionId);
    console.log('Sesión encontrada:', sesionRes.data);
    setSesion(sesionRes.data);
    
    // Obtener información del taller
    if (sesionRes.data.taller_id) {
      const tallerRes = await getTaller(sesionRes.data.taller_id);
      const entidadRes = await getEntidad(tallerRes.data.entidad_id);
      
      setTallerInfo({
        nombre: tallerRes.data.nombre,
        disciplina: tallerRes.data.disciplina,
        entidad: entidadRes.data.nombre
      });
    }
    
    setMessage('');
  });

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    
    if (!sesion) {
      setMessage('Sesión no válida');
      return;
    }

    if (!validateRut(formData.rut)) {
      setMessage('RUT inválido');
      return;
    }

    if (formData.codigo !== sesion.codigo_pantalla) {
      setMessage('Código de pantalla incorrecto');
      return;
    }

    handleAsync(async () => {
      const alumnosRes = await getAlumnos();
      const alumnosFiltrados = alumnosRes.data.filter(a => a.rut === formData.rut);
      
      if (alumnosFiltrados.length === 0) {
        setMessage('RUT no encontrado en el sistema');
        return;
      }

      const alumno = alumnosFiltrados[0];
      setAlumno(alumno);

      // Generar OTP localmente
      const otp = Math.floor(100000 + Math.random() * 900000);
      console.log(`*** OTP para ${alumno.nombre} (${formData.rut}): ${otp} ***`);
      setGeneratedOtp(otp.toString());
      setStep(2);
      setMessage('');
    });
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    
    if (formData.otp !== generatedOtp) {
      setMessage('OTP incorrecto');
      return;
    }

    handleAsync(async () => {
      // Calcular estado basado en tiempo
      const inicioSesion = new Date(sesion.timestamp_inicio);
      const ahora = new Date();
      const minutosTranscurridos = (ahora - inicioSesion) / (1000 * 60);
      
      let estado = 'Presente';
      if (minutosTranscurridos > 5 && minutosTranscurridos <= 10) {
        estado = 'Con Atraso';
      } else if (minutosTranscurridos > 10) {
        estado = 'Ausente';
        setMessage('El tiempo de check-in ha expirado');
        return;
      }

      // Guardar asistencia
      await createAsistencia({
        sesion_id: sesionId,
        alumno_id: alumno.id,
        estado: estado,
        timestamp: new Date().toISOString()
      });

      setMessage(`¡Check-in exitoso! Estado: ${estado}`);
      setStep(3);
    });
  };

  if (step === 3) {
    return (
      <>
        <div className="header">
          <h1>✅ Check-in Completado</h1>
          <p>Asistencia registrada exitosamente</p>
        </div>
        <div className="dashboard">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ color: '#28a745', marginBottom: '20px' }}>{message}</h2>
            <p style={{ fontSize: '1.1em', marginBottom: '30px' }}>
              Hola <strong>{alumno?.nombre}</strong>, tu asistencia ha sido registrada correctamente.
            </p>
            
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
              <p style={{ margin: '0', color: '#495057', fontSize: '14px' }}>
                🕰️ Registrado el {new Date().toLocaleString('es-CL')}
              </p>
            </div>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => window.close()}
              style={{ marginRight: '10px' }}
            >
              Cerrar Ventana
            </button>
            
            <button 
              className="btn" 
              onClick={() => window.location.reload()}
            >
              Nuevo Check-in
            </button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="header">
          <h1>Check-in de Alumno</h1>
          <p>Sistema SAMPS - MINEDUC</p>
        </div>
        <div className="card text-center">
          <div className="loading"></div>
          <p>Cargando sesión: {sesionId}</p>
          <small>Conectando a: http://localhost:3001</small>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="header">
        <h1>🎓 Check-in de Alumno</h1>
        <p>Sistema SAMPS - Registro de Asistencia</p>
        {tallerInfo && (
          <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '1.2em', fontWeight: '600' }}>
              {tallerInfo.nombre}
            </p>
            <p style={{ margin: '0', fontSize: '0.95em', opacity: '0.9' }}>
              {tallerInfo.disciplina} • {tallerInfo.entidad}
            </p>
          </div>
        )}
      </div>
      
      <div className="dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      {message && (
        <div className={`alert ${message.includes('exitoso') || message.includes('Completado') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {!sesion && !loading && (
        <div className="card">
          <h3>Información de Debug</h3>
          <p><strong>Sesión ID:</strong> {sesionId}</p>
          <p><strong>Backend URL:</strong> http://localhost:3001</p>
          <p><strong>Estado:</strong> {message || 'Sin errores reportados'}</p>
          
          <button 
            className="btn" 
            onClick={fetchSesion}
          >
            Reintentar Conexión
          </button>
        </div>
      )}

        {step === 1 && (
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '3em', marginBottom: '15px' }}>🔒</div>
              <h2 style={{ margin: '0 0 10px 0' }}>Paso 1: Verificación de Identidad</h2>
              <p style={{ color: '#6c757d', margin: '0' }}>Ingresa tus datos para acceder al check-in</p>
            </div>
            
            <form onSubmit={handleStep1Submit}>
              <div className="form-group">
                <label>🆔 Tu RUT:</label>
                <RutInput
                  value={formData.rut}
                  onChange={(value) => setFormData({...formData, rut: value})}
                  placeholder="Ej: 12.345.678-5"
                  required
                  aria-describedby="rut-help"
                />
                <small id="rut-help" style={{ color: '#6c757d', fontSize: '13px' }}>Ingresa tu RUT con puntos y guión</small>
              </div>
              
              <div className="form-group">
                <label>🔢 Código de Pantalla:</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  placeholder="Código de 4 dígitos mostrado por el monitor"
                  maxLength="4"
                  required
                  aria-describedby="codigo-help"
                  style={{ textAlign: 'center', fontSize: '1.5em', letterSpacing: '0.2em' }}
                />
                <small id="codigo-help" style={{ color: '#6c757d', fontSize: '13px' }}>Mira la pantalla del monitor para obtener este código</small>
              </div>
              
              <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '16px' }}>
                ➡️ Continuar al Paso 2
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '3em', marginBottom: '15px' }}>🔐</div>
              <h2 style={{ margin: '0 0 10px 0' }}>Paso 2: Verificación de Seguridad</h2>
              <p style={{ color: '#6c757d', margin: '0 0 20px 0' }}>Hola <strong style={{ color: '#2c3e50' }}>{alumno?.nombre}</strong></p>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', color: '#495057' }}>📱 Se ha generado tu código de verificación</p>
              <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>Revisa la consola del navegador (F12) para ver el código</p>
            </div>
            
            <form onSubmit={handleStep2Submit}>
              <div className="form-group">
                <label>🔢 Código de Verificación (OTP):</label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value})}
                  placeholder="Código de 6 dígitos"
                  maxLength="6"
                  required
                  aria-describedby="otp-help"
                  style={{ textAlign: 'center', fontSize: '1.5em', letterSpacing: '0.3em' }}
                />
                <small id="otp-help" style={{ color: '#6c757d', fontSize: '13px' }}>Ingresa el código de 6 dígitos que aparece en la consola</small>
              </div>
              
              <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '16px' }}>
                ✓ Completar Check-in
              </button>
            </form>
            
            <div className="alert alert-info">
              <strong>💻 Para testing:</strong> El OTP se muestra en la consola del navegador.<br/>
              <strong>Código actual:</strong> <code style={{ fontSize: '1.2em', padding: '8px 12px' }}>{generatedOtp}</code>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CheckinPage;