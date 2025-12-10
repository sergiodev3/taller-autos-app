from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Owner(Base):
    __tablename__ = "owners"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String(200), nullable=False)
    telefono = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relación con vehículos
    vehiculos = relationship("Vehicle", back_populates="propietario")


class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String(100), nullable=False)
    modelo = Column(String(100), nullable=False)
    anio = Column(Integer, nullable=False)
    color = Column(String(50), nullable=False)
    placas = Column(String(20), unique=True, nullable=False)
    problema_ingreso = Column(Text, nullable=False)
    
    # Foreign key al propietario
    propietario_id = Column(Integer, ForeignKey("owners.id"), nullable=False)
    
    # Fechas
    fecha_ingreso = Column(DateTime, default=datetime.utcnow)
    fecha_salida = Column(DateTime, nullable=True)
    
    # Relaciones
    propietario = relationship("Owner", back_populates="vehiculos")
    defectos = relationship("Defect", back_populates="vehiculo", cascade="all, delete-orphan")
    historial = relationship("ServiceHistory", back_populates="vehiculo", cascade="all, delete-orphan")


class Defect(Base):
    __tablename__ = "defects"
    
    id = Column(Integer, primary_key=True, index=True)
    vehiculo_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    descripcion = Column(Text, nullable=False)
    tipo = Column(String(50), nullable=False)  # 'golpe', 'rayón', 'abolladira', etc.
    ubicacion = Column(String(100), nullable=True)  # 'puerta delantera izquierda', etc.
    imagen_url = Column(String(500), nullable=True)
    detectado_automaticamente = Column(Integer, default=0)  # 0=manual, 1=AI
    deteccion_data = Column(JSON, nullable=True)  # Datos de la detección AI (bounding box, score, etc.)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    
    # Relación
    vehiculo = relationship("Vehicle", back_populates="defectos")


class ServiceHistory(Base):
    __tablename__ = "service_history"
    
    id = Column(Integer, primary_key=True, index=True)
    vehiculo_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    descripcion_servicio = Column(Text, nullable=False)
    costo = Column(Integer, nullable=True)
    fecha_servicio = Column(DateTime, default=datetime.utcnow)
    mecanico = Column(String(200), nullable=True)
    notas = Column(Text, nullable=True)
    
    # Relación
    vehiculo = relationship("Vehicle", back_populates="historial")
