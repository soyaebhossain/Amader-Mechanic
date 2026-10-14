export interface ServiceCategory {
  id: string;
  name_bn: string;
  name_en: string;
  code:
    | 'FLAT_TIRE'
    | 'BATTERY_JUMPSTART'
    | 'MECHANICAL_BREAKDOWN'
    | 'ELECTRICAL_FAULT'
    | 'TOWING_RECOVERY'
    | 'LOCKOUT'
    | 'EMERGENCY_FUEL';
  description_bn: string;
  icon_name: string;
  base_price_bdt: number;
  is_emergency: boolean;
}
