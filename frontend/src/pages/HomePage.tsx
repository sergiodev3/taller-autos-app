import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVehicles, type Vehicle } from '../api';
import { format } from 'date-fns';
import './HomePage.css';

function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | 'activos' | 'finalizados'>('activos');
  const [searchTerm, setSearchTerm] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');

  useEffect(() => {
    loadVehicles();
  }, [filter]);

  useEffect(() => {
    applyFilters();
  }, [vehicles, searchTerm, marcaFilter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const activos = filter === 'todos' ? undefined : filter === 'activos';
      const data = await getVehicles(activos);
      setVehicles(data);
    } catch (err) {
      setError('Error al cargar los vehículos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = vehicles;

    // Filtro por marca
    if (marcaFilter) {
      filtered = filtered.filter(v => 
        v.marca.toLowerCase() === marcaFilter.toLowerCase()
      );
    }

    // Filtro por búsqueda (modelo, placas, propietario)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.modelo.toLowerCase().includes(term) ||
        v.placas.toLowerCase().includes(term) ||
        v.propietario.nombre_completo.toLowerCase().includes(term)
      );
    }

    setFilteredVehicles(filtered);
  };

  // Obtener marcas únicas para el filtro
  const uniqueMarcas = Array.from(new Set(vehicles.map(v => v.marca))).sort();

  if (loading) {
    return <div className="loading">Cargando vehículos...</div>;
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Vehículos en el Taller</h1>
        <Link to="/nuevo-vehiculo" className="btn btn-primary">
          + Nuevo Ingreso
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'activos' ? 'active' : ''}`}
          onClick={() => setFilter('activos')}
        >
          Activos ({vehicles.filter(v => !v.fecha_salida).length})
        </button>
        <button
          className={`filter-tab ${filter === 'todos' ? 'active' : ''}`}
          onClick={() => setFilter('todos')}
        >
          Todos ({vehicles.length})
        </button>
        <button
          className={`filter-tab ${filter === 'finalizados' ? 'active' : ''}`}
          onClick={() => setFilter('finalizados')}
        >
          Finalizados ({vehicles.filter(v => v.fecha_salida).length})
        </button>
      </div>

      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por modelo, placas o propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="marca-filter">
          <select
            value={marcaFilter}
            onChange={(e) => setMarcaFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las marcas</option>
            {uniqueMarcas.map(marca => (
              <option key={marca} value={marca}>{marca}</option>
            ))}
          </select>
        </div>

        {(searchTerm || marcaFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setMarcaFilter('');
            }}
            className="btn-clear-filters"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm || marcaFilter ? 'No se encontraron vehículos con esos filtros' : 'No hay vehículos registrados'}</p>
          {!searchTerm && !marcaFilter && (
            <Link to="/nuevo-vehiculo" className="btn btn-primary">
              Registrar primer vehículo
            </Link>
          )}
        </div>
      ) : (
        <div className="vehicles-grid">
          {filteredVehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              to={`/vehiculo/${vehicle.id}`}
              className="vehicle-card"
            >
              <div className="vehicle-header">
                <h3>{vehicle.marca} {vehicle.modelo}</h3>
                <span className={`status-badge ${vehicle.fecha_salida ? 'finalizado' : 'activo'}`}>
                  {vehicle.fecha_salida ? 'Finalizado' : 'En taller'}
                </span>
              </div>
              
              <div className="vehicle-info">
                <div className="info-row">
                  <span className="label">Placas:</span>
                  <span className="value">{vehicle.placas}</span>
                </div>
                <div className="info-row">
                  <span className="label">Año:</span>
                  <span className="value">{vehicle.anio}</span>
                </div>
                <div className="info-row">
                  <span className="label">Color:</span>
                  <span className="value">{vehicle.color}</span>
                </div>
                <div className="info-row">
                  <span className="label">Propietario:</span>
                  <span className="value">{vehicle.propietario.nombre_completo}</span>
                </div>
                <div className="info-row">
                  <span className="label">Teléfono:</span>
                  <span className="value">{vehicle.propietario.telefono}</span>
                </div>
              </div>

              <div className="vehicle-problem">
                <strong>Problema:</strong> {vehicle.problema_ingreso}
              </div>

              <div className="vehicle-stats">
                <div className="stat">
                  <span className="stat-value">{vehicle.defectos?.length || 0}</span>
                  <span className="stat-label">Defectos</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{vehicle.historial?.length || 0}</span>
                  <span className="stat-label">Servicios</span>
                </div>
              </div>

              <div className="vehicle-footer">
                <small>
                  Ingresó: {format(new Date(vehicle.fecha_ingreso), 'dd/MM/yyyy HH:mm')}
                </small>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
