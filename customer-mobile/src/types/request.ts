import { CustomerVehicle } from './vehicle';
import { ServiceCategory } from './service';
import { Quote } from './quote';

export type RequestStatus =
  | 'requested'
  | 'matching'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'inspection'
  | 'awaiting_quote_approval'
  | 'in_progress'
  | 'awaiting_completion_confirmation'
  | 'completed'
  | 'awaiting_payment'
  | 'closed'
  | 'cancelled'
  | 'disputed';

export type RequestUrgency = 'NORMAL' | 'HIGH' | 'CRITICAL_HIGHWAY';

export interface AssignedProvider {
  id: string;
  name: string;
  phone: string;
  photo_url?: string;
  rating: number;
  total_completed_jobs: number;
  current_location?: {
    latitude: number;
    longitude: number;
    updated_at: string;
  };
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  vehicle: CustomerVehicle;
  service_category: ServiceCategory;
  pickup_address: string;
  pickup_landmark?: string;
  pickup_latitude: number;
  pickup_longitude: number;
  problem_description: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  assigned_provider?: AssignedProvider | null;
  active_quote?: Quote | null;
  payment_status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  paid_amount?: number;
  payment_method?: 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'CASH';
  created_at: string;
  updated_at: string;
}

export interface CreateAssistancePayload {
  vehicle_id: string;
  service_category_id: string;
  pickup_address: string;
  pickup_landmark?: string;
  pickup_latitude: number;
  pickup_longitude: number;
  problem_description: string;
  urgency: RequestUrgency;
}
