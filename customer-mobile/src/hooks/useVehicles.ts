import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { CustomerVehicle, CreateVehiclePayload } from '../types/vehicle';

export const VEHICLE_KEYS = {
  all: ['customer', 'vehicles'] as const,
};

export const useCustomerVehicles = () => {
  return useQuery<CustomerVehicle[]>({
    queryKey: VEHICLE_KEYS.all,
    queryFn: async () => {
      const { data } = await apiClient.get<CustomerVehicle[]>('/vehicles/me/');
      return data;
    },
  });
};

export const useCreateVehicle = () => {
  const qc = useQueryClient();

  return useMutation<CustomerVehicle, Error, CreateVehiclePayload>({
    mutationFn: async (payload: CreateVehiclePayload) => {
      const { data } = await apiClient.post<CustomerVehicle>('/vehicles/', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VEHICLE_KEYS.all });
    },
  });
};
