import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { CreateAssistancePayload, ServiceRequest } from '../types/request';
import { REQUEST_KEYS } from './useActiveRequest';

export const useCreateServiceRequest = () => {
  const qc = useQueryClient();

  return useMutation<ServiceRequest, Error, CreateAssistancePayload>({
    mutationFn: async (payload: CreateAssistancePayload) => {
      const { data } = await apiClient.post<ServiceRequest>('/service-requests/', payload);
      return data;
    },
    onSuccess: (newRequest) => {
      qc.setQueryData(REQUEST_KEYS.active, newRequest);
      qc.invalidateQueries({ queryKey: REQUEST_KEYS.active });
    },
  });
};
