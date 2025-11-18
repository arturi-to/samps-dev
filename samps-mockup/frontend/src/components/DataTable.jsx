import { useState } from 'react';

const DataTable = ({ data, columns, onEdit, onDelete, searchFields = [], showActions = true }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredData = data.filter(item => {
    if (!search) return true;
    return searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(search.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField]?.toString().toLowerCase() || '';
    const bVal = b[sortField]?.toString().toLowerCase() || '';
    
    if (sortDirection === 'asc') {
      return aVal.localeCompare(bVal);
    }
    return bVal.localeCompare(aVal);
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            padding: '10px 15px', 
            border: '2px solid #e9ecef', 
            borderRadius: '8px',
            flex: '1',
            maxWidth: '300px'
          }}
        />
        <span style={{ color: '#6c757d', fontSize: '14px' }}>
          {sortedData.length} registro{sortedData.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ background: '#003d7a', color: 'white' }}>
              {columns.map(col => (
                <th 
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ 
                    padding: '15px 12px', 
                    textAlign: 'left',
                    cursor: col.sortable ? 'pointer' : 'default',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  {col.label}
                  {col.sortable && sortField === col.key && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
              {showActions && (
                <th style={{ padding: '15px 12px', textAlign: 'center', width: '120px' }}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr 
                key={item.id}
                style={{ 
                  borderBottom: '1px solid #e9ecef',
                  background: index % 2 === 0 ? '#f8f9fa' : 'white'
                }}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '12px', fontSize: '14px' }}>
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {showActions && (
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {item.estado === 'Ausente' ? (
                      <button 
                        className="btn btn-success" 
                        onClick={() => onEdit(item)}
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '12px',
                          minWidth: 'auto'
                        }}
                      >
                        ✓ Presente
                      </button>
                    ) : item.estado ? (
                      <button 
                        className="btn" 
                        onClick={() => onEdit(item)}
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '12px',
                          minWidth: 'auto'
                        }}
                      >
                        ✏️ Editar
                      </button>
                    ) : (
                      <>
                        <button 
                          className="btn" 
                          onClick={() => onEdit(item)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px', 
                            marginRight: '5px',
                            minWidth: 'auto'
                          }}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => onDelete(item)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            minWidth: 'auto'
                          }}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#6c757d',
          background: 'white',
          borderRadius: '8px',
          marginTop: '10px'
        }}>
          No se encontraron registros
        </div>
      )}
    </div>
  );
};

export default DataTable;