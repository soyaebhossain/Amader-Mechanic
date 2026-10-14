export type VehicleCategory =
  | 'MOTORCYCLE'
  | 'PRIVATE_CAR'
  | 'MICROBUS'
  | 'VAN'
  | 'BUS'
  | 'TRUCK'
  | 'THREE_WHEELER';

export interface CustomerVehicle {
  id: string;
  category: VehicleCategory;
  make: string;
  model: string;
  year?: number;
  registration_number: string;
  color?: string;
  fuel_type?: 'OCTANE' | 'PETROL' | 'DIESEL' | 'CNG' | 'LPG' | 'HYBRID' | 'ELECTRIC';
  is_primary: boolean;
}

export interface CreateVehiclePayload {
  category: VehicleCategory;
  make: string;
  model: string;
  year?: number;
  registration_number: string;
  color?: string;
  fuel_type?: string;
  is_primary?: boolean;
}
