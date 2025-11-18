import { useState } from 'react';

const HorarioSelector = ({ value, onChange }) => {
  const [horarios, setHorarios] = useState(value || []);

  const dias = [
    { id: 'lunes', nombre: 'Lunes' },
    { id: 'martes', nombre: 'Martes' },
    { id: 'miercoles', nombre: 'Miércoles' },
    { id: 'jueves', nombre: 'Jueves' },
    { id: 'viernes', nombre: 'Viernes' },
    { id: 'sabado', nombre: 'Sábado' }
  ];

  const agregarHorario = () => {
    const nuevoHorario = { dia: '', inicio: '', fin: '' };
    const nuevosHorarios = [...horarios, nuevoHorario];
    setHorarios(nuevosHorarios);
    onChange(nuevosHorarios);
  };

  const actualizarHorario = (index, campo, valor) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][campo] = valor;
    setHorarios(nuevosHorarios);
    onChange(nuevosHorarios);
  };

  const eliminarHorario = (index) => {
    const nuevosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(nuevosHorarios);
    onChange(nuevosHorarios);
  };

  return (
    <div>
      {horarios.map((horario, index) => (
        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
          <select
            value={horario.dia}
            onChange={(e) => actualizarHorario(index, 'dia', e.target.value)}
            style={{ flex: '1' }}
          >
            <option value="">Seleccionar día</option>
            {dias.map(dia => (
              <option key={dia.id} value={dia.id}>{dia.nombre}</option>
            ))}
          </select>
          
          <input
            type="time"
            value={horario.inicio}
            onChange={(e) => actualizarHorario(index, 'inicio', e.target.value)}
            style={{ flex: '1' }}
          />
          
          <input
            type="time"
            value={horario.fin}
            onChange={(e) => actualizarHorario(index, 'fin', e.target.value)}
            style={{ flex: '1' }}
          />
          
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => eliminarHorario(index)}
            style={{ padding: '8px 12px' }}
          >
            ✕
          </button>
        </div>
      ))}
      
      <button
        type="button"
        className="btn btn-secondary"
        onClick={agregarHorario}
      >
        + Agregar Horario
      </button>
    </div>
  );
};

export default HorarioSelector;