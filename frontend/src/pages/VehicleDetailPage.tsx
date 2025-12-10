import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicle, generateReceipt, createDefect, updateVehicle, type Vehicle, type Defect } from '../api';
import { format } from 'date-fns';
import './VehicleDetailPage.css';

function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showAddDefect, setShowAddDefect] = useState(false);
  const [newDefect, setNewDefect] = useState({
    descripcion: '',
    tipo: 'golpe',
    ubicacion: ''
  });
  const [defectImage, setDefectImage] = useState<File | null>(null);
  const [defectImagePreview, setDefectImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getVehicle(parseInt(id));
      setVehicle(data);
    } catch (err) {
      setError('Error al cargar el vehículo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!vehicle) return;

    try {
      setGeneratingPDF(true);
      const pdfBlob = await generateReceipt(vehicle.id);
      
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobante_${vehicle.placas}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al generar el PDF');
      console.error(err);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleAddDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    try {
      // Si hay imagen, primero subirla
      let imagen_url = null;
      if (defectImage) {
        const formData = new FormData();
        formData.append('file', defectImage);
        const response = await fetch('http://localhost:8000/api/upload-image', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        imagen_url = data.url;
      }

      await createDefect({
        vehiculo_id: vehicle.id,
        ...newDefect,
        imagen_url
      });
      
      setShowAddDefect(false);
      setNewDefect({ descripcion: '', tipo: 'golpe', ubicacion: '' });
      setDefectImage(null);
      setDefectImagePreview(null);
      loadVehicle(); // Recargar para mostrar el nuevo defecto
    } catch (err) {
      alert('Error al agregar el defecto');
      console.error(err);
    }
  };

  const handleDefectImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDefectImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDefectImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!vehicle) return;
    
    const confirmed = window.confirm('¿Marcar este vehículo como finalizado?');
    if (!confirmed) return;

    try {
      await updateVehicle(vehicle.id, {
        fecha_salida: new Date().toISOString()
      });
      loadVehicle();
    } catch (err) {
      alert('Error al actualizar el vehículo');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando vehículo...</div>;
  }

  if (error || !vehicle) {
    return (
      <div className="error-page">
        <h2>{error || 'Vehículo no encontrado'}</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="vehicle-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          ← Volver
        </button>
        <div className="header-actions">
          <button
            onClick={handleGeneratePDF}
            disabled={generatingPDF}
            className="btn btn-success"
          >
            {generatingPDF ? '📄 Generando...' : '📄 Generar PDF'}
          </button>
          {!vehicle.fecha_salida && (
            <button
              onClick={handleMarkAsCompleted}
              className="btn btn-primary"
            >
              ✓ Marcar como Finalizado
            </button>
          )}
        </div>
      </div>

      <div className="vehicle-overview card">
        <div className="overview-header">
          <div>
            <h1>{vehicle.marca} {vehicle.modelo}</h1>
            <p className="vehicle-subtitle">
              {vehicle.anio} • {vehicle.color} • {vehicle.placas}
            </p>
          </div>
          <span className={`status-badge ${vehicle.fecha_salida ? 'finalizado' : 'activo'}`}>
            {vehicle.fecha_salida ? '✓ Finalizado' : '🔧 En taller'}
          </span>
        </div>

        <div className="overview-grid">
          <div className="overview-item">
            <span className="item-label">Propietario</span>
            <span className="item-value">{vehicle.propietario.nombre_completo}</span>
          </div>
          <div className="overview-item">
            <span className="item-label">Teléfono</span>
            <span className="item-value">{vehicle.propietario.telefono}</span>
          </div>
          <div className="overview-item">
            <span className="item-label">Fecha de Ingreso</span>
            <span className="item-value">
              {format(new Date(vehicle.fecha_ingreso), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          {vehicle.fecha_salida && (
            <div className="overview-item">
              <span className="item-label">Fecha de Salida</span>
              <span className="item-value">
                {format(new Date(vehicle.fecha_salida), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          )}
        </div>

        <div className="problem-section">
          <h3>Problema de Ingreso</h3>
          <p>{vehicle.problema_ingreso}</p>
        </div>
      </div>

      <div className="defects-section card">
        <div className="section-header">
          <h2>Defectos y Daños Estéticos ({vehicle.defectos?.length || 0})</h2>
          <button
            onClick={() => setShowAddDefect(!showAddDefect)}
            className="btn btn-primary"
          >
            + Agregar Defecto
          </button>
        </div>

        {showAddDefect && (
          <form onSubmit={handleAddDefect} className="add-defect-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  className="form-select"
                  value={newDefect.tipo}
                  onChange={(e) => setNewDefect({ ...newDefect, tipo: e.target.value })}
                  required
                >
                  <option value="golpe">Golpe</option>
                  <option value="rayón">Rayón</option>
                  <option value="abolladura">Abolladura</option>
                  <option value="pintura">Pintura</option>
                  <option value="cristal">Cristal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ubicación</label>
                <input
                  type="text"
                  className="form-input"
                  value={newDefect.ubicacion}
                  onChange={(e) => setNewDefect({ ...newDefect, ubicacion: e.target.value })}
                  placeholder="Ej: Puerta delantera izquierda"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-textarea"
                value={newDefect.descripcion}
                onChange={(e) => setNewDefect({ ...newDefect, descripcion: e.target.value })}
                placeholder="Describe el defecto..."
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Foto del Defecto (Opcional)</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  id="defect-image"
                  accept="image/*"
                  capture="environment"
                  onChange={handleDefectImageSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="defect-image" className="upload-button">
                  📷 {defectImage ? 'Cambiar Foto' : 'Tomar/Seleccionar Foto'}
                </label>
                {defectImagePreview && (
                  <div className="image-preview-small">
                    <img src={defectImagePreview} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => {
                        setDefectImage(null);
                        setDefectImagePreview(null);
                      }}
                      className="btn-remove-image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowAddDefect(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-success">
                Guardar Defecto
              </button>
            </div>
          </form>
        )}

        {vehicle.defectos && vehicle.defectos.length > 0 ? (
          <div className="defects-list">
            {vehicle.defectos.map((defect: Defect) => (
              <div key={defect.id} className="defect-item">
                <div className="defect-header">
                  <span className="defect-type">{defect.tipo}</span>
                  {defect.detectado_automaticamente === 1 && (
                    <span className="ai-badge">🤖 IA</span>
                  )}
                </div>
                <div className="defect-content">
                  <p className="defect-location">📍 {defect.ubicacion || 'Sin ubicación'}</p>
                  <p className="defect-description">{defect.descripcion}</p>
                  {defect.imagen_url && (
                    <img
                      src={`http://localhost:8000${defect.imagen_url}`}
                      alt="Defecto"
                      className="defect-image"
                    />
                  )}
                </div>
                <div className="defect-footer">
                  <small>{format(new Date(defect.fecha_registro), 'dd/MM/yyyy HH:mm')}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No se han registrado defectos estéticos</p>
        )}
      </div>

      {vehicle.historial && vehicle.historial.length > 0 && (
        <div className="history-section card">
          <h2>Historial de Servicios ({vehicle.historial.length})</h2>
          <div className="history-list">
            {vehicle.historial.map((service) => (
              <div key={service.id} className="history-item">
                <div className="history-header">
                  <strong>{service.descripcion_servicio}</strong>
                  {service.costo && (
                    <span className="service-cost">${service.costo.toLocaleString()}</span>
                  )}
                </div>
                {service.mecanico && (
                  <p className="service-mechanic">👨‍🔧 {service.mecanico}</p>
                )}
                {service.notas && (
                  <p className="service-notes">{service.notas}</p>
                )}
                <div className="service-footer">
                  <small>{format(new Date(service.fecha_servicio), 'dd/MM/yyyy HH:mm')}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleDetailPage;
