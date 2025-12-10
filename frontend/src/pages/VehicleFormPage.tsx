import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVehicle, type VehicleCreate } from '../api';
import './VehicleFormPage.css';

function VehicleFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<VehicleCreate>({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
    placas: '',
    problema_ingreso: '',
    propietario: {
      nombre_completo: '',
      telefono: ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('propietario.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        propietario: {
          ...prev.propietario!,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'anio' ? parseInt(value) : value
      }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const vehicle = await createVehicle(formData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/vehiculo/${vehicle.id}`);
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Error al registrar el vehículo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="vehicle-form-page">
      <div className="form-header">
        <h1>Registro de Nuevo Vehículo</h1>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn btn-secondary"
        >
          ← Volver
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ¡Vehículo registrado exitosamente! Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-section">
          <h2>Información del Propietario</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre_completo" className="form-label">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre_completo"
                name="propietario.nombre_completo"
                className="form-input"
                value={formData.propietario?.nombre_completo || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono" className="form-label">
                Teléfono *
              </label>
              <input
                type="tel"
                id="telefono"
                name="propietario.telefono"
                className="form-input"
                value={formData.propietario?.telefono || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Información del Vehículo</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="marca" className="form-label">
                Marca *
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                className="form-input"
                value={formData.marca}
                onChange={handleInputChange}
                placeholder="Ej: Toyota"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo" className="form-label">
                Modelo *
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                className="form-input"
                value={formData.modelo}
                onChange={handleInputChange}
                placeholder="Ej: Corolla"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="anio" className="form-label">
                Año *
              </label>
              <select
                id="anio"
                name="anio"
                className="form-select"
                value={formData.anio}
                onChange={handleInputChange}
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="color" className="form-label">
                Color *
              </label>
              <input
                type="text"
                id="color"
                name="color"
                className="form-input"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Ej: Rojo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="placas" className="form-label">
                Placas *
              </label>
              <input
                type="text"
                id="placas"
                name="placas"
                className="form-input"
                value={formData.placas}
                onChange={handleInputChange}
                placeholder="Ej: ABC-123"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="problema_ingreso" className="form-label">
              Problema por el que ingresa *
            </label>
            <textarea
              id="problema_ingreso"
              name="problema_ingreso"
              className="form-textarea"
              value={formData.problema_ingreso}
              onChange={handleInputChange}
              placeholder="Describe el problema o servicio solicitado"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Foto del Vehículo (Opcional)</h2>
          <p className="section-description">
            Sube una foto del vehículo para documentación visual
          </p>

          <div className="damage-detection">
            <div className="image-upload">
              <input
                type="file"
                id="vehicle-image"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="vehicle-image" className="upload-button">
                📷 Tomar/Seleccionar Foto
              </label>
            </div>

            {imagePreview && (
              <div className="image-preview-section">
                <div className="preview-container">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                </div>
                <p className="image-note">
                  ✅ Imagen cargada correctamente. Puedes agregar defectos manualmente después de registrar el vehículo.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Registrar Vehículo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VehicleFormPage;
