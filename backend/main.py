from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime
from dotenv import load_dotenv

import models
import schemas
from database import engine, get_db
from pdf_generator import generate_vehicle_receipt

# Cargar variables de entorno
load_dotenv()

# Crear tablas
models.Base.metadata.create_all(bind=engine)

# Inicializar FastAPI
app = FastAPI(
    title="Taller Autos API",
    description="API para gestión de taller mecánico con registro de vehículos y defectos",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://192.168.1.100:5173",  # Para acceso desde red local
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear directorios necesarios
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/images", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/pdfs", exist_ok=True)

# Montar carpeta de archivos estáticos
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ==================== ENDPOINTS ====================

@app.get("/")
def read_root():
    return {
        "message": "Taller Autos API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "vehicles": "/api/vehicles",
            "owners": "/api/owners",
            "defects": "/api/defects"
        }
    }


# ==================== OWNERS ====================

@app.post("/api/owners", response_model=schemas.Owner, status_code=status.HTTP_201_CREATED)
def create_owner(owner: schemas.OwnerCreate, db: Session = Depends(get_db)):
    """Crear un nuevo propietario"""
    db_owner = models.Owner(**owner.dict())
    db.add(db_owner)
    db.commit()
    db.refresh(db_owner)
    return db_owner


@app.get("/api/owners", response_model=List[schemas.Owner])
def get_owners(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener lista de propietarios"""
    owners = db.query(models.Owner).offset(skip).limit(limit).all()
    return owners


@app.get("/api/owners/{owner_id}", response_model=schemas.Owner)
def get_owner(owner_id: int, db: Session = Depends(get_db)):
    """Obtener un propietario por ID"""
    owner = db.query(models.Owner).filter(models.Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Propietario no encontrado")
    return owner


# ==================== VEHICLES ====================

@app.post("/api/vehicles", response_model=schemas.Vehicle, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: schemas.VehicleCreate, db: Session = Depends(get_db)):
    """Crear un nuevo registro de vehículo"""
    # Si se proporciona información del propietario, crearlo
    if vehicle.propietario and not vehicle.propietario_id:
        owner = models.Owner(**vehicle.propietario.dict())
        db.add(owner)
        db.commit()
        db.refresh(owner)
        propietario_id = owner.id
    elif vehicle.propietario_id:
        propietario_id = vehicle.propietario_id
    else:
        raise HTTPException(status_code=400, detail="Debe proporcionar propietario_id o datos del propietario")
    
    # Crear vehículo
    vehicle_data = vehicle.dict(exclude={'propietario'})
    vehicle_data['propietario_id'] = propietario_id
    
    db_vehicle = models.Vehicle(**vehicle_data)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@app.get("/api/vehicles", response_model=List[schemas.Vehicle])
def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    activos: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Obtener lista de vehículos"""
    query = db.query(models.Vehicle)
    
    if activos is not None:
        if activos:
            query = query.filter(models.Vehicle.fecha_salida.is_(None))
        else:
            query = query.filter(models.Vehicle.fecha_salida.isnot(None))
    
    vehicles = query.offset(skip).limit(limit).all()
    return vehicles


@app.get("/api/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Obtener un vehículo por ID con toda su información"""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehicle


@app.put("/api/vehicles/{vehicle_id}", response_model=schemas.Vehicle)
def update_vehicle(
    vehicle_id: int,
    vehicle_update: schemas.VehicleUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar información de un vehículo"""
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    update_data = vehicle_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vehicle, key, value)
    
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@app.delete("/api/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Eliminar un vehículo"""
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    db.delete(db_vehicle)
    db.commit()
    return None


# ==================== DEFECTS ====================

@app.post("/api/defects", response_model=schemas.Defect, status_code=status.HTTP_201_CREATED)
def create_defect(defect: schemas.DefectCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo defecto"""
    # Verificar que el vehículo existe
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == defect.vehiculo_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    db_defect = models.Defect(**defect.dict())
    db.add(db_defect)
    db.commit()
    db.refresh(db_defect)
    return db_defect


@app.get("/api/defects/vehicle/{vehicle_id}", response_model=List[schemas.Defect])
def get_vehicle_defects(vehicle_id: int, db: Session = Depends(get_db)):
    """Obtener todos los defectos de un vehículo"""
    defects = db.query(models.Defect).filter(models.Defect.vehiculo_id == vehicle_id).all()
    return defects


# ==================== IMAGE UPLOAD ====================

@app.post("/api/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Subir imagen de vehículo
    """
    # Guardar imagen
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    image_path = os.path.join(UPLOAD_DIR, "images", filename)
    
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "success": True,
        "filename": filename,
        "url": f"/uploads/images/{filename}"
    }


# ==================== PDF GENERATION ====================

@app.post("/api/generate-receipt/{vehicle_id}")
def generate_receipt(vehicle_id: int, db: Session = Depends(get_db)):
    """Generar PDF de comprobante de ingreso"""
    # Obtener vehículo con toda la información
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Preparar datos
    vehiculo_dict = {
        "id": vehicle.id,
        "marca": vehicle.marca,
        "modelo": vehicle.modelo,
        "anio": vehicle.anio,
        "color": vehicle.color,
        "placas": vehicle.placas,
        "problema_ingreso": vehicle.problema_ingreso
    }
    
    propietario_dict = {
        "nombre_completo": vehicle.propietario.nombre_completo,
        "telefono": vehicle.propietario.telefono
    }
    
    defectos_list = [
        {
            "tipo": d.tipo,
            "ubicacion": d.ubicacion or "N/A",
            "descripcion": d.descripcion,
            "detectado_automaticamente": d.detectado_automaticamente
        }
        for d in vehicle.defectos
    ]
    
    # Generar PDF
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"comprobante_{vehicle.placas}_{timestamp}.pdf"
    pdf_path = os.path.join(UPLOAD_DIR, "pdfs", pdf_filename)
    
    generate_vehicle_receipt(
        vehiculo=vehiculo_dict,
        propietario=propietario_dict,
        defectos=defectos_list,
        output_path=pdf_path
    )
    
    return FileResponse(
        path=pdf_path,
        filename=pdf_filename,
        media_type="application/pdf"
    )


# ==================== SERVICE HISTORY ====================

@app.post("/api/service-history", response_model=schemas.ServiceHistory, status_code=status.HTTP_201_CREATED)
def create_service_history(service: schemas.ServiceHistoryCreate, db: Session = Depends(get_db)):
    """Agregar una entrada al historial de servicio"""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == service.vehiculo_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    db_service = models.ServiceHistory(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


@app.get("/api/service-history/vehicle/{vehicle_id}", response_model=List[schemas.ServiceHistory])
def get_vehicle_service_history(vehicle_id: int, db: Session = Depends(get_db)):
    """Obtener historial de servicio de un vehículo"""
    history = db.query(models.ServiceHistory).filter(
        models.ServiceHistory.vehiculo_id == vehicle_id
    ).order_by(models.ServiceHistory.fecha_servicio.desc()).all()
    return history


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
