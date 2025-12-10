from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Owner Schemas
class OwnerBase(BaseModel):
    nombre_completo: str = Field(..., min_length=1, max_length=200)
    telefono: str = Field(..., min_length=1, max_length=20)


class OwnerCreate(OwnerBase):
    pass


class Owner(OwnerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Defect Schemas
class DefectBase(BaseModel):
    descripcion: str
    tipo: str = Field(..., max_length=50)
    ubicacion: Optional[str] = Field(None, max_length=100)
    imagen_url: Optional[str] = None
    detectado_automaticamente: int = 0
    deteccion_data: Optional[dict] = None


class DefectCreate(DefectBase):
    vehiculo_id: int


class Defect(DefectBase):
    id: int
    vehiculo_id: int
    fecha_registro: datetime

    class Config:
        from_attributes = True


# Service History Schemas
class ServiceHistoryBase(BaseModel):
    descripcion_servicio: str
    costo: Optional[int] = None
    mecanico: Optional[str] = Field(None, max_length=200)
    notas: Optional[str] = None


class ServiceHistoryCreate(ServiceHistoryBase):
    vehiculo_id: int


class ServiceHistory(ServiceHistoryBase):
    id: int
    vehiculo_id: int
    fecha_servicio: datetime

    class Config:
        from_attributes = True


# Vehicle Schemas
class VehicleBase(BaseModel):
    marca: str = Field(..., max_length=100)
    modelo: str = Field(..., max_length=100)
    anio: int = Field(..., ge=1900, le=2100)
    color: str = Field(..., max_length=50)
    placas: str = Field(..., max_length=20)
    problema_ingreso: str


class VehicleCreate(VehicleBase):
    propietario_id: Optional[int] = None
    propietario: Optional[OwnerCreate] = None


class VehicleUpdate(BaseModel):
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    color: Optional[str] = None
    placas: Optional[str] = None
    problema_ingreso: Optional[str] = None
    fecha_salida: Optional[datetime] = None


class Vehicle(VehicleBase):
    id: int
    propietario_id: int
    fecha_ingreso: datetime
    fecha_salida: Optional[datetime] = None
    propietario: Owner
    defectos: List[Defect] = []
    historial: List[ServiceHistory] = []

    class Config:
        from_attributes = True


# Damage Detection Response
class DamageDetectionResult(BaseModel):
    detecciones: List[dict]
    imagen_procesada_url: str
    total_danos: int


# PDF Generation Request
class PDFGenerationRequest(BaseModel):
    vehiculo_id: int
