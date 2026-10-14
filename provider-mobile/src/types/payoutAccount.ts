import { PayoutMethod } from './earnings';

export interface UpdatePayoutAccountPayload {
  preferred_method: PayoutMethod;
  bkash_wallet_number?: string;
  bank_name?: string;
  branch_name?: string;
  routing_number?: string;
  account_number?: string;
  account_holder_name?: string;
}

export interface PayoutAccountDetailsResponse {
  id: string;
  preferred_method: PayoutMethod;
  bkash_wallet_number: string | null;
  bank_name: string | null;
  branch_name: string | null;
  routing_number: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  is_verified: boolean;
  hold_payouts: boolean;
  updated_at: string;
}
