import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ServiceRequest } from '../types/request';

export const REQUEST_KEYS = {
  active: ['customer', 'active-request'] as const,
  history: ['customer', 'request-history'] as const,
};

export const useActiveRequest = () => {
  return useQuery<ServiceRequest | null>({
    queryKey: REQUEST_KEYS.active,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ServiceRequest>('/service-requests/me/active/');
        return data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        return null;
      }
    },
    refetchInterval: (query) => {
      const activeStatus = query.state.data?.status;
      // Auto-poll every 4 seconds during live progress states
      if (
        activeStatus &&
        ['requested', 'matching', 'assigned', 'en_route', 'arrived', 'inspection', 'in_progress'].includes(
          activeStatus
        )
      ) {
        return 4000;
      }
      return false;
    },
  });
};

export const useApproveQuote = () => {
  const qc = useQueryClient();

  return useMutation<{ message: string }, Error, { quoteId: string }>({
    mutationFn: async ({ quoteId }) => {
      const { data } = await apiClient.post(`/pricing-quotes/quotes/${quoteId}/approve/`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUEST_KEYS.active });
    },
  });
};

export const useRejectQuote = () => {
  const qc = useQueryClient();

  return useMutation<{ message: string }, Error, { quoteId: string; reason: string }>({
    mutationFn: async ({ quoteId, reason }) => {
      const { data } = await apiClient.post(`/pricing-quotes/quotes/${quoteId}/reject/`, { reason });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUEST_KEYS.active });
    },
  });
};

export const useInitiateCheckout = () => {
  const qc = useQueryClient();

  return useMutation<
    { checkout_url?: string; payment_intent_id: string; message?: string },
    Error,
    { requestId: string; provider: 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'CASH' }
  >({
    mutationFn: async ({ requestId, provider }) => {
      const { data } = await apiClient.post('/payments/checkout/initiate/', {
        service_request_id: requestId,
        provider,
        callback_url: 'amader-mechanic://payment-callback',
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUEST_KEYS.active });
    },
  });
};
