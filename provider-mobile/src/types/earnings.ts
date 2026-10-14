export type PayoutMethod = 'BKASH' | 'BANK_TRANSFER';
export type PayoutStatus = 'QUEUED' | 'SUBMITTED' | 'PAID' | 'FAILED' | 'REJECTED';

export interface ProviderWalletBalance {
  withdrawable_balance: number; // In BDT (৳)
  pending_clearance: number;    // Unsettled active jobs
  lifetime_earnings: number;
  currency: string;
  minimum_withdrawal_limit: number;
  payout_account: {
    preferred_method: PayoutMethod;
    target_identifier: string; // e.g. bKash 017XXXXXXXX or Bank A/C
    is_verified: boolean;
    hold_payouts: boolean;
  };
}

export interface JobEarningSummary {
  id: string;
  service_request_id: string;
  vehicle_type: string;
  pickup_address: string;
  completed_at: string;
  gross_service_amount: number;
  platform_fee_deducted: number;
  provider_net_earning: number;
  payment_method: 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'CASH';
}

export interface PayoutDisbursementRecord {
  id: string;
  batch_reference: string;
  amount: number;
  payout_method: PayoutMethod;
  destination_target: string;
  status: PayoutStatus;
  gateway_trx_id?: string;
  processed_at?: string;
  created_at: string;
  failure_reason?: string;
}
