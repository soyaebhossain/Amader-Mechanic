import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { EARNINGS_KEYS } from './useProviderEarnings';
import { UpdatePayoutAccountPayload, PayoutAccountDetailsResponse } from '../types/payoutAccount';

export const useUpdatePayoutAccount = () => {
  const qc = useQueryClient();

  return useMutation<PayoutAccountDetailsResponse, Error, UpdatePayoutAccountPayload>({
    mutationFn: async (payload: UpdatePayoutAccountPayload) => {
      const { data } = await apiClient.put<PayoutAccountDetailsResponse>(
        '/financial/provider/payout-account/',
        payload
      );
      return data;
    },
    onSuccess: () => {
      // Refresh wallet overview so the updated target identifier reflects on UI
      qc.invalidateQueries({ queryKey: EARNINGS_KEYS.wallet() });
      qc.invalidateQueries({ queryKey: ['provider', 'payout-account'] });
    },
  });
};
