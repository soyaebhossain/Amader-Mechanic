'use client';

import React, { useState } from 'react';
import {
  BadgeCheck,
  Check,
  X,
  FileText,
  User,
  Phone,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';

export default function VerificationReviewPage() {
  const [mechanics, setMechanics] = useState([
    {
      id: 'PROV-101',
      name: 'মোস্তাফিজুর রহমান',
      phone: '+8801711229988',
      type: 'অটোমোটিভ টেকনিশিয়ান (লাইট ভেহিকেল)',
      district: 'ঢাকা (মিরপুর জোন)',
      nid: '১৯৮৮২৬১২৩৪৫৬৭৮৯০১',
      tradeLicense: 'TRAD/DNCC/09876/2024',
      experienceYears: '৭ বছর',
      status: 'pending',
    },
    {
      id: 'PROV-102',
      name: 'জাহাঙ্গীর আলম',
      phone: '+8801819887766',
      type: 'হেভি টোয়িং ও রিকভারি অপারেটর',
      district: 'মুন্সীগঞ্জ (মাওয়া এক্সপ্রেসওয়ে)',
      nid: '১৯৮২০৮৭৬১২৩৪৫৬৭৮৯',
      tradeLicense: 'TRAD/MUNSHI/11223/2023',
      experienceYears: '১২ বছর',
      status: 'pending',
    },
    {
      id: 'PROV-103',
      name: 'মোঃ রুহুল আমিন',
      phone: '+8801912334455',
      type: 'টায়ার ও ব্যাটারি স্পেশালিস্ট',
      district: 'চট্টগ্রাম (জিইসি সার্কেল)',
      nid: '১৯৯১২৩৪৫৬৭৮৯০১২৩৪',
      tradeLicense: 'TRAD/CCC/55443/2024',
      experienceYears: '৫ বছর',
      status: 'pending',
    },
  ]);

  const handleApprove = (id: string) => {
    setMechanics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'verified' } : m))
    );
    alert(`প্রোভাইডার ${id} সফলভাবে ভেরিফায়েড হিসেবে অনুমোদিত হয়েছে!`);
  };

  const handleReject = (id: string) => {
    setMechanics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'rejected' } : m))
    );
    alert(`প্রোভাইডার ${id} আবেদন বাতিল করা হয়েছে।`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">মেকানিক ও পার্টনার ভেরিফিকেশন (KYC)</h1>
          <p className="text-xs text-slate-400 mt-1">
            এনআইডি, ট্রেড লাইসেন্স এবং কারিগরি সার্টিফিকেট যাচাই করে সিস্টেমে অনবোর্ড করুন
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
          ৩টি আবেদন পর্যালোচনার অপেক্ষায়
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.map((m) => (
          <div
            key={m.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-teal-400">{m.id}</span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    m.status === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : m.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {m.status === 'verified' ? 'অনুমোদিত' : m.status === 'rejected' ? 'বাতিল' : 'পর্যালোচনায়'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{m.name}</h3>
                <p className="text-xs text-teal-300 font-semibold mt-0.5">{m.type}</p>
                <p className="text-xs text-slate-400">{m.district} • অভিজ্ঞতা: {m.experienceYears}</p>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">মোবাইল:</span>
                  <span className="text-slate-200 font-bold">{m.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">জাতীয় পরিচয়পত্র (NID):</span>
                  <span className="text-slate-200 font-bold">{m.nid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ট্রেড লাইসেন্স নং:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[150px]">{m.tradeLicense}</span>
                </div>
              </div>
            </div>

            {m.status === 'pending' ? (
              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => handleReject(m.id)}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <X className="w-3.5 h-3.5" />
                  বাতিল
                </button>
                <button
                  onClick={() => handleApprove(m.id)}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  অনুমোদন দিন
                </button>
              </div>
            ) : (
              <div className="text-center pt-2 text-xs font-bold text-slate-500">
                সিদ্ধান্ত গ্রহণ সম্পন্ন
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
