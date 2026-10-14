'use client';

import React, { useState } from 'react';
import {
  Building2,
  Truck,
  Wrench,
  ShieldCheck,
  Plus,
  Phone,
  MapPin,
  Clock,
  Car,
  FileText,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface PartnerGarage {
  id: string;
  name: string;
  location: string;
  baysCount: number;
  activeTechnicians: number;
  rating: number;
  slaRate: string;
  activeJobs: number;
  phone: string;
  status: 'ACTIVE' | 'BUSY' | 'OFFLINE';
}

interface CorporateFleet {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  vehicleCount: number;
  vehicleTypes: string[];
  billingPlan: 'PREPAID' | 'POSTPAID_NET30';
  creditBalance: string;
  slaGuarantee: string;
  status: 'ACTIVE' | 'REVIEW';
}

export default function FleetAndGaragePage() {
  const [activeTab, setActiveTab] = useState<'GARAGES' | 'FLEETS'>('GARAGES');
  const [showAddModal, setShowAddModal] = useState(false);

  const garages: PartnerGarage[] = [
    {
      id: 'GAR-001',
      name: 'নাভানা অটোমোবাইলস সার্ভিস হাব',
      location: 'তেজগাঁও শিল্প এলাকা, ঢাকা',
      baysCount: 8,
      activeTechnicians: 14,
      rating: 4.9,
      slaRate: '৯৮.৫%',
      activeJobs: 3,
      phone: '+880 1711-002233',
      status: 'ACTIVE',
    },
    {
      id: 'GAR-002',
      name: 'উত্তরা মোটরস ডায়াগনস্টিক অ্যান্ড রিকভারি',
      location: 'বিমানবন্দর রোড, উত্তরা, ঢাকা',
      baysCount: 6,
      activeTechnicians: 9,
      rating: 4.8,
      slaRate: '৯৬.২%',
      activeJobs: 4,
      phone: '+880 1819-445566',
      status: 'ACTIVE',
    },
    {
      id: 'GAR-003',
      name: 'রহিমাফ্রুজ ব্যাটারি অ্যান্ড অটো কেয়ার',
      location: 'জিইসি মোড়, চট্টগ্রাম',
      baysCount: 4,
      activeTechnicians: 6,
      rating: 4.7,
      slaRate: '৯৫.৮%',
      activeJobs: 1,
      phone: '+880 1912-778899',
      status: 'ACTIVE',
    },
    {
      id: 'GAR-004',
      name: 'মেঘনা হাইওয়ে হেভি রিকভারি স্টেশন',
      location: 'কাঁচপুর ব্রিজ সংলগ্ন, নারায়ণগঞ্জ',
      baysCount: 3,
      activeTechnicians: 5,
      rating: 4.6,
      slaRate: '৯২.১%',
      activeJobs: 2,
      phone: '+880 1613-112244',
      status: 'BUSY',
    },
  ];

  const fleets: CorporateFleet[] = [
    {
      id: 'FLT-101',
      companyName: 'পাঠাও লজিস্টিকস ও এক্সপ্রেস',
      contactPerson: 'তানভীর আহমেদ (হেড অব ফ্লিট)',
      phone: '+880 1710-123456',
      vehicleCount: 240,
      vehicleTypes: ['মোটরসাইকেল', 'মাইক্রোবাস', 'পিকআপ'],
      billingPlan: 'POSTPAID_NET30',
      creditBalance: '৳ ৩,৫০,০০০',
      slaGuarantee: '১৫ মিনিট ইমার্জেন্সি রেসপন্স',
      status: 'ACTIVE',
    },
    {
      id: 'FLT-102',
      companyName: 'চালডাল গ্রোসারি ডেলিভারি ফ্লিট',
      contactPerson: 'ফারহান চৌধুরী (অপারেশনস)',
      phone: '+880 1811-987654',
      vehicleCount: 85,
      vehicleTypes: ['ইলেকট্রিক ভ্যান', 'মিনি ট্রাক'],
      billingPlan: 'POSTPAID_NET30',
      creditBalance: '৳ ১,৮০,০০০',
      slaGuarantee: '২০ মিনিট রেসপন্স',
      status: 'ACTIVE',
    },
    {
      id: 'FLT-103',
      companyName: 'পেপারফ্লাই কুরিয়ার নেটওয়ার্ক',
      contactPerson: 'সাইফুল ইসলাম',
      phone: '+880 1911-345678',
      vehicleCount: 110,
      vehicleTypes: ['কাভার্ড ভ্যান', 'মোটরসাইকেল'],
      billingPlan: 'PREPAID',
      creditBalance: '৳ ৭৫,০০০',
      slaGuarantee: '২৫ মিনিট রেসপন্স',
      status: 'ACTIVE',
    },
    {
      id: 'FLT-104',
      companyName: 'প্রাণ-আরএফএল ডিস্ট্রিবিউশন হাব',
      contactPerson: 'মনিরুল হক (ট্রান্সপোর্ট ম্যানেজার)',
      phone: '+880 1713-654321',
      vehicleCount: 320,
      vehicleTypes: ['হেভি ডিউটি ট্রাক', 'প্রাইম মুভার'],
      billingPlan: 'POSTPAID_NET30',
      creditBalance: '৳ ৫,২০,০০০',
      slaGuarantee: '৩০ মিনিট হাইওয়ে সাপোর্ট',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">পার্টনার গ্যারেজ ও কর্পোরেট ফ্লিট পোর্টাল</h1>
          <p className="text-xs text-slate-400 mt-1">
            রেজিস্টার্ড গ্যারেজ হাবসমূহ, সার্ভিস বে মনিটরিং এবং এন্টারপ্রাইজ ফ্লিট রোডসাইড সাপোর্ট ম্যানেজমেন্ট
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'GARAGES' ? 'নতুন পার্টনার গ্যারেজ যুক্ত করুন' : 'নতুন কর্পোরেট ফ্লিট যোগ করুন'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('GARAGES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'GARAGES'
              ? 'bg-teal-600/10 text-teal-400 border border-teal-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          পার্টনার গ্যারেজ সমূহ ({garages.length})
        </button>
        <button
          onClick={() => setActiveTab('FLEETS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'FLEETS'
              ? 'bg-teal-600/10 text-teal-400 border border-teal-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          কর্পোরেট ফ্লিট অ্যাকাউন্টস ({fleets.length})
        </button>
      </div>

      {/* Tab 1: Partner Garages */}
      {activeTab === 'GARAGES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {garages.map((garage) => (
            <div
              key={garage.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    {garage.id}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1.5">{garage.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{garage.location}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    garage.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {garage.status === 'ACTIVE' ? 'সক্রিয় ও প্রস্তুত' : 'ব্যস্ত'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">সার্ভিস বে</div>
                  <div className="text-sm font-black text-white mt-0.5">{garage.baysCount}টি বে</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">সক্রিয় টেকনিশিয়ান</div>
                  <div className="text-sm font-black text-teal-400 mt-0.5">{garage.activeTechnicians} জন</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">SLA রেট</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">{garage.slaRate}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span className="font-semibold text-slate-300">{garage.phone}</span>
                </div>
                <div className="text-[11px] font-bold text-amber-400">
                  চলমান কাজ: {garage.activeJobs}টি
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Corporate Fleets */}
      {activeTab === 'FLEETS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">কর্পোরেট আইডি ও কোম্পানি</th>
                    <th className="py-3.5 px-6">কন্টাক্ট পার্সন</th>
                    <th className="py-3.5 px-6">মোট যানবাহন ও টাইপ</th>
                    <th className="py-3.5 px-6">বিলিং প্ল্যান</th>
                    <th className="py-3.5 px-6">ক্রেডিট লিমিট</th>
                    <th className="py-3.5 px-6">SLA গ্যারান্টি</th>
                    <th className="py-3.5 px-6 text-right">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {fleets.map((fleet) => (
                    <tr key={fleet.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-teal-400">{fleet.id}</div>
                        <div className="font-extrabold text-white text-sm mt-0.5">{fleet.companyName}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-200">{fleet.contactPerson}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {fleet.phone}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-black text-white">{fleet.vehicleCount}টি গাড়ি</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {fleet.vehicleTypes.join(', ')}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-300">
                          {fleet.billingPlan === 'POSTPAID_NET30' ? 'Postpaid (Net 30)' : 'Prepaid Wallet'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-black text-emerald-400">{fleet.creditBalance}</td>
                      <td className="py-4 px-6">
                        <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded text-[11px] font-bold">
                          {fleet.slaGuarantee}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                          {fleet.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5">
            <h3 className="text-base font-extrabold text-white">
              {activeTab === 'GARAGES' ? 'নতুন পার্টনার গ্যারেজ অনবোর্ডিং' : 'নতুন কর্পোরেট ফ্লিট অনবোর্ডিং'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  {activeTab === 'GARAGES' ? 'গ্যারেজের নাম' : 'কোম্পানির নাম'}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ইউনিক অটো ওয়ার্কশপ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">মোবাইল নম্বর / হটলাইন</label>
                <input
                  type="text"
                  placeholder="+880 17XXXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  {activeTab === 'GARAGES' ? 'লোকেশন / ঠিকানা' : 'মোট যানবাহনের সংখ্যা'}
                </label>
                <input
                  type="text"
                  placeholder={activeTab === 'GARAGES' ? 'মিরপুর, ঢাকা' : '৫০'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                বাতিল
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition"
              >
                অনবোর্ড করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
