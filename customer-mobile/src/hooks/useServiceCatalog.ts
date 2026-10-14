import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ServiceCategory } from '../types/service';

export const SERVICE_KEYS = {
  categories: ['service-catalog', 'categories'] as const,
};

export const useServiceCategories = () => {
  return useQuery<ServiceCategory[]>({
    queryKey: SERVICE_KEYS.categories,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ServiceCategory[]>('/service-catalog/categories/');
        return data;
      } catch (err) {
        // Fallback default service categories for offline/instant availability
        return [
          {
            id: 'cat-1',
            name_bn: 'টায়ার পাংচার / পরিবর্তন',
            name_en: 'Flat Tire Replacement',
            code: 'FLAT_TIRE',
            description_bn: 'টায়ার লিক সারা বা অতিরিক্ত টায়ার স্থাপন',
            icon_name: 'car-sport-outline',
            base_price_bdt: 400,
            is_emergency: true,
          },
          {
            id: 'cat-2',
            name_bn: 'ব্যাটারি জাম্পস্টার্ট',
            name_en: 'Battery Jumpstart',
            code: 'BATTERY_JUMPSTART',
            description_bn: 'ডেড ব্যাটারি স্টার্ট বা জাম্পার ক্যাবল সার্ভিস',
            icon_name: 'flash-outline',
            base_price_bdt: 500,
            is_emergency: true,
          },
          {
            id: 'cat-3',
            name_bn: 'ইঞ্জিন / মেকানিক্যাল ত্রুটি',
            name_en: 'Mechanical Breakdown',
            code: 'MECHANICAL_BREAKDOWN',
            description_bn: 'ওভারহিটিং, ক্লাচ, ব্রেক বা ইঞ্জিনের গোলযোগ',
            icon_name: 'construct-outline',
            base_price_bdt: 800,
            is_emergency: true,
          },
          {
            id: 'cat-4',
            name_bn: 'ইলেকট্রিক্যাল সমস্যা',
            name_en: 'Electrical Fault',
            code: 'ELECTRICAL_FAULT',
            description_bn: 'ফিউজ, ওয়্যারিং, লাইটিং বা অল্টারনেটর ত্রুটি',
            icon_name: 'hardware-chip-outline',
            base_price_bdt: 600,
            is_emergency: false,
          },
          {
            id: 'cat-5',
            name_bn: 'টোয়িং ও উদ্ধার সার্ভিস',
            name_en: 'Towing & Recovery',
            code: 'TOWING_RECOVERY',
            description_bn: 'হাইড্রোলিক বা ফ্ল্যাটবেড টো-ট্রাক সাপোর্ট',
            icon_name: 'navigate-outline',
            base_price_bdt: 2500,
            is_emergency: true,
          },
          {
            id: 'cat-6',
            name_bn: 'জরুরি জ্বালানি সরবরাহ',
            name_en: 'Emergency Fuel Delivery',
            code: 'EMERGENCY_FUEL',
            description_bn: 'রাস্তায় তেল শেষ হলে ৫ লিটার অক্টেন বা ডিজেল সরবরাহ',
            icon_name: 'speedometer-outline',
            base_price_bdt: 300,
            is_emergency: true,
          },
        ];
      }
    },
  });
};
