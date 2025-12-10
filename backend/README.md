# Taller Autos API - Sistema de Gestión para Talleres Mecánicos

API completa para la gestión de talleres mecánicos, desarrollada con FastAPI y SQLAlchemy.

## 🚀 Características

- **Gestión de Vehículos**: Registro completo de vehículos con marca, modelo, año, color, placas
- **Gestión de Propietarios**: Información de contacto y vehículos asociados
- **Registro de Defectos**: Documentación detallada de daños y problemas estéticos
- **Historial de Servicios**: Seguimiento de reparaciones y mantenimiento
- **Generación de PDFs**: Comprobantes de ingreso con firma del cliente
- **Carga de Imágenes**: Documentación fotográfica de vehículos
- **API REST**: Endpoints completos para integración con frontend

## 📋 Requisitos

- Python 3.9+
- SQLite (incluido)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
cd backend
```

### 2. Crear entorno virtual

```bash
python -m venv .venv
.\.venv\Scripts\activate  # Windows
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Variables disponibles:
- `DATABASE_URL`: Ruta a la base de datos SQLite
- `UPLOAD_DIR`: Directorio para archivos subidos
- `SECRET_KEY`: Clave secreta para la aplicación

## 🚀 Uso

### Iniciar el servidor

```bash
uvicorn main:app --reload
```

El servidor estará disponible en: `http://localhost:8000`

### Documentación interactiva

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Usando PowerShell Script

```powershell
.\start.ps1
```

## 📚 API Endpoints

### Propietarios
- `GET /api/owners` - Listar propietarios
- `POST /api/owners` - Crear propietario
- `GET /api/owners/{id}` - Obtener propietario
- `PUT /api/owners/{id}` - Actualizar propietario

### Vehículos
- `GET /api/vehicles` - Listar vehículos (filtro por activos)
- `POST /api/vehicles` - Crear vehículo
- `GET /api/vehicles/{id}` - Obtener vehículo
- `PUT /api/vehicles/{id}` - Actualizar vehículo
- `POST /api/vehicles/{id}/check-out` - Marcar salida

### Defectos
- `GET /api/defects/vehicle/{vehicle_id}` - Obtener defectos de vehículo
- `POST /api/defects` - Crear defecto
- `PUT /api/defects/{id}` - Actualizar defecto
- `DELETE /api/defects/{id}` - Eliminar defecto

### Historial de Servicios
- `GET /api/service-history/vehicle/{vehicle_id}` - Historial de vehículo
- `POST /api/service-history` - Agregar servicio
- `PUT /api/service-history/{id}` - Actualizar servicio

### Utilidades
- `POST /api/upload-image` - Subir imagen de vehículo
- `POST /api/generate-receipt/{vehicle_id}` - Generar PDF de comprobante

## 🗄️ Base de Datos

El sistema utiliza SQLite con 4 tablas principales:

### `owners` (Propietarios)
- `id`: Identificador único
- `nombre_completo`: Nombre del propietario
- `telefono`: Teléfono de contacto
- `created_at`: Fecha de registro

### `vehicles` (Vehículos)
- `id`: Identificador único
- `marca`: Marca del vehículo
- `modelo`: Modelo
- `anio`: Año
- `color`: Color
- `placas`: Placas (único)
- `problema_ingreso`: Problema reportado al ingreso
- `propietario_id`: Relación con propietario
- `fecha_ingreso`: Fecha de ingreso al taller
- `fecha_salida`: Fecha de salida (nullable)

### `defects` (Defectos)
- `id`: Identificador único
- `vehiculo_id`: Relación con vehículo
- `tipo`: Tipo de defecto
- `ubicacion`: Ubicación en el vehículo
- `descripcion`: Descripción detallada
- `imagen_url`: URL de imagen del defecto
- `fecha_registro`: Fecha de registro

### `service_history` (Historial de Servicios)
- `id`: Identificador único
- `vehiculo_id`: Relación con vehículo
- `descripcion_servicio`: Descripción del servicio
- `costo`: Costo del servicio
- `mecanico`: Mecánico asignado
- `notas`: Notas adicionales
- `fecha_servicio`: Fecha del servicio

## 📁 Estructura del Proyecto

```
backend/
├── main.py              # Aplicación FastAPI principal
├── models.py            # Modelos SQLAlchemy
├── schemas.py           # Esquemas Pydantic
├── database.py          # Configuración de base de datos
├── pdf_generator.py     # Generación de PDFs
├── requirements.txt     # Dependencias
├── .env                 # Variables de entorno
├── start.ps1           # Script de inicio
└── uploads/            # Archivos subidos
    ├── images/         # Imágenes de vehículos
    └── pdfs/           # PDFs generados
```

## 🔐 Seguridad

- CORS configurado para desarrollo local
- Validación de datos con Pydantic
- Manejo seguro de archivos subidos
- SQL injection prevention con SQLAlchemy ORM

## 🐛 Troubleshooting

### Error de base de datos
```bash
# Eliminar base de datos existente
rm taller_autos.db
# Reiniciar servidor para crear tablas nuevamente
uvicorn main:app --reload
```

### Error de permisos en uploads
```bash
# Crear directorios manualmente
mkdir uploads\images
mkdir uploads\pdfs
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.

## 📞 Soporte

Para soporte o preguntas, por favor abre un issue en el repositorio.

