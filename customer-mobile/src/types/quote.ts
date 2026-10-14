export type QuoteItemType = 'LABOR' | 'PARTS' | 'TRAVEL' | 'WAITING' | 'VAT';

export interface QuoteItem {
  id: string;
  description: string;
  item_type: QuoteItemType;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type QuoteStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Quote {
  id: string;
  quote_number: string;
  version: number;
  subtotal: number;
  vat_amount: number;
  discount_amount: number;
  total_amount: number;
  items: QuoteItem[];
  status: QuoteStatus;
  created_at: string;
  approved_at?: string;
  rejection_reason?: string;
}
