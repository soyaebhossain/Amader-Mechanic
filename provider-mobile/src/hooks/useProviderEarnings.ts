import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ProviderWalletBalance, JobEarningSummary, PayoutDisbursementRecord } from '../types/earnings';

export const EARNINGS_KEYS = {
  all: ['provider', 'earnings'] as const,
  wallet: () => ['provider', 'wallet'] as const,
  jobs: () => ['provider', 'jobs'] as const,
  payouts: () => ['provider', 'payouts'] as const,
};

export const useProviderWallet = () => {
  return useQuery<ProviderWalletBalance>({
    queryKey: EARNINGS_KEYS.wallet(),
    queryFn: async () => {
      const { data } = await apiClient.get<ProviderWalletBalance>('/financial/provider/wallet/');
      return data;
    },
  });
};

export const useProviderJobEarnings = () => {
  return useQuery<JobEarningSummary[]>({
    queryKey: EARNINGS_KEYS.jobs(),
    queryFn: async () => {
      const { data } = await apiClient.get<JobEarningSummary[]>('/financial/provider/earnings/jobs/');
      return data;
    },
  });
};

export const useProviderPayoutHistory = () => {
  return useQuery<PayoutDisbursementRecord[]>({
    queryKey: EARNINGS_KEYS.payouts(),
    queryFn: async () => {
      const { data } = await apiClient.get<PayoutDisbursementRecord[]>('/financial/provider/payouts/');
      return data;
    },
  });
};

export interface RequestWithdrawalPayload {
  amount: number;
}

export const useRequestPayoutWithdrawal = () => {
  const qc = useQueryClient();

  return useMutation<{ message: string; withdrawal_id?: string }, Error, RequestWithdrawalPayload>({
    mutationFn: async (payload: RequestWithdrawalPayload) => {
      const { data } = await apiClient.post('/financial/provider/payouts/request/', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.wallet() });
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.payouts() });
    },
  });
};
