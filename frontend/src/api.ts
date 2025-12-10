import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Owner {
  id: number;
  nombre_completo: string;
  telefono: string;
  created_at: string;
}

export interface Defect {
  id: number;
  vehiculo_id: number;
  descripcion: string;
  tipo: string;
  ubicacion: string | null;
  imagen_url: string | null;
  detectado_automaticamente: number;
  deteccion_data: any;
  fecha_registro: string;
}

export interface ServiceHistory {
  id: number;
  vehiculo_id: number;
  descripcion_servicio: string;
  costo: number | null;
  fecha_servicio: string;
  mecanico: string | null;
  notas: string | null;
}

export interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  placas: string;
  problema_ingreso: string;
  propietario_id: number;
  fecha_ingreso: string;
  fecha_salida: string | null;
  propietario: Owner;
  defectos: Defect[];
  historial: ServiceHistory[];
}

export interface VehicleCreate {
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  placas: string;
  problema_ingreso: string;
  propietario_id?: number;
  propietario?: {
    nombre_completo: string;
    telefono: string;
  };
}

// API functions

// Owners
export const getOwners = async (): Promise<Owner[]> => {
  const response = await api.get('/api/owners');
  return response.data;
};

export const createOwner = async (owner: { nombre_completo: string; telefono: string }): Promise<Owner> => {
  const response = await api.post('/api/owners', owner);
  return response.data;
};

// Vehicles
export const getVehicles = async (activos?: boolean): Promise<Vehicle[]> => {
  const params = activos !== undefined ? { activos } : {};
  const response = await api.get('/api/vehicles', { params });
  return response.data;
};

export const getVehicle = async (id: number): Promise<Vehicle> => {
  const response = await api.get(`/api/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (vehicle: VehicleCreate): Promise<Vehicle> => {
  const response = await api.post('/api/vehicles', vehicle);
  return response.data;
};

export const updateVehicle = async (id: number, updates: Partial<Vehicle>): Promise<Vehicle> => {
  const response = await api.put(`/api/vehicles/${id}`, updates);
  return response.data;
};

export const deleteVehicle = async (id: number): Promise<void> => {
  await api.delete(`/api/vehicles/${id}`);
};

// Defects
export const createDefect = async (defect: {
  vehiculo_id: number;
  descripcion: string;
  tipo: string;
  ubicacion?: string;
  imagen_url?: string;
}): Promise<Defect> => {
  const response = await api.post('/api/defects', defect);
  return response.data;
};

export const getVehicleDefects = async (vehicleId: number): Promise<Defect[]> => {
  const response = await api.get(`/api/defects/vehicle/${vehicleId}`);
  return response.data;
};

// PDF Generation
export const generateReceipt = async (vehicleId: number): Promise<Blob> => {
  const response = await api.post(`/api/generate-receipt/${vehicleId}`, null, {
    responseType: 'blob',
  });
  return response.data;
};

// Service History
export const createServiceHistory = async (service: {
  vehiculo_id: number;
  descripcion_servicio: string;
  costo?: number;
  mecanico?: string;
  notas?: string;
}): Promise<ServiceHistory> => {
  const response = await api.post('/api/service-history', service);
  return response.data;
};

export const getVehicleServiceHistory = async (vehicleId: number): Promise<ServiceHistory[]> => {
  const response = await api.get(`/api/service-history/vehicle/${vehicleId}`);
  return response.data;
};

export default api;
