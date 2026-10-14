export const BD_MSISDN_REGEX = /^(?:\+?880|0)?(1[3-9]\d{8})$/;
export const BD_ROUTING_NUMBER_REGEX = /^\d{9}$/;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePayoutForm(
  method: 'BKASH' | 'BANK_TRANSFER',
  fields: {
    bkashWallet: string;
    bankName: string;
    branchName: string;
    routingNumber: string;
    accountNumber: string;
    accountHolderName: string;
  }
): ValidationResult {
  const errors: Record<string, string> = {};

  if (method === 'BKASH') {
    const cleaned = fields.bkashWallet.replace(/[\s-]/g, '');
    if (!cleaned) {
      errors.bkashWallet = 'বিকাশ নম্বর দেওয়া বাধ্যতামূলক';
    } else if (!BD_MSISDN_REGEX.test(cleaned)) {
      errors.bkashWallet = 'সঠিক বাংলাদেশি বিকাশ নম্বর দিন (যেমন: 017XXXXXXXX)';
    }
  } else {
    if (!fields.accountHolderName.trim()) {
      errors.accountHolderName = 'অ্যাকাউন্টধারীর নাম আবশ্যক';
    }
    if (!fields.bankName.trim()) {
      errors.bankName = 'ব্যাংকের নাম আবশ্যক';
    }
    if (!fields.branchName.trim()) {
      errors.branchName = 'শাখার নাম আবশ্যক';
    }
    if (!fields.accountNumber.trim()) {
      errors.accountNumber = 'অ্যাকাউন্ট নম্বর আবশ্যক';
    }
    const cleanRouting = fields.routingNumber.trim();
    if (!cleanRouting) {
      errors.routingNumber = 'রাউটিং নম্বর আবশ্যক';
    } else if (!BD_ROUTING_NUMBER_REGEX.test(cleanRouting)) {
      errors.routingNumber = 'রাউটিং নম্বরটি অবশ্যই ৯ ডিজিটের হতে হবে';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
