'use client';

import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  Clock,
  UserCheck,
  Phone,
  AlertCircle,
  CheckCircle,
  Filter,
  Search,
  ArrowRight,
  Maximize2,
} from 'lucide-react';

export default function DispatchConsolePage() {
  const [selectedIncident, setSelectedIncident] = useState<string | null>('SR-HWY-052');
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [searchRadius, setSearchRadius] = useState('15');

  const incidents = [
    {
      id: 'SR-HWY-052',
      service: 'হাইড্রোলিক টোয়িং সাপোর্ট',
      category: 'TOWING_RECOVERY',
      customer: 'মাহমুদুল হক (01819283746)',
      vehicle: 'Hino 1J Bus (ঢাকা মেট্রো-ব ১৪-৫৫৬৬)',
      location: 'পদ্মা সেতু জাজিরা এক্সপ্রেসওয়ে সংযোগ, শরীয়তপুর',
      urgency: 'CRITICAL_HIGHWAY',
      status: 'matching',
      time: '১৫ মিনিট অতিবাহিত',
      note: 'বাসের ডিফারেনশিয়াল লক হয়ে গেছে, এক্সপ্রেসওয়েতে দ্রুত উদ্ধার প্রয়োজন।',
    },
    {
      id: 'SR-DHAKA-110',
      service: 'ব্যাটারি জাম্পস্টার্ট ও টেস্ট',
      category: 'BATTERY_JUMPSTART',
      customer: 'তানভীর আহমেদ (01711223344)',
      vehicle: 'Toyota Premio (ঢাকা মেট্রো-গ ১৩-৫৬৭৮)',
      location: 'গুলশান ২ নর্থ এভিনিউ, ঢাকা',
      urgency: 'HIGH',
      status: 'matching',
      time: '২ মিনিট অতিবাহিত',
      note: 'অফিস গ্যারেজ থেকে গাড়ি বের করার সময় ব্যাটারি সম্পূর্ণ ডেড।',
    },
    {
      id: 'SR-DHAKA-109',
      service: 'টায়ার পাংচার ও পরিবর্তন',
      category: 'FLAT_TIRE',
      customer: 'নাসরিন সুলতানা (01912345678)',
      vehicle: 'Toyota Corolla (ঢাকা মেট্রো-গ ১২-৩৪৩২)',
      location: 'বিজয় সরণি ফ্লাইওভার, তেজগাঁও, ঢাকা',
      urgency: 'HIGH',
      status: 'en_route',
      assignedProvider: 'মোঃ রফিকুল ইসলাম (01700998877)',
      time: '৭ মিনিট অতিবাহিত (ETA ৫ মিনিট)',
      note: 'ফ্লাইওভারের উপরে ডান চাকা ব্রাস্ট হয়েছে।',
    },
  ];

  const suggestedProviders = [
    {
      id: 'PRO-TOW-001',
      name: 'পদ্মা হেভি টোয়িং অ্যান্ড রিকভারি',
      phone: '01712001122',
      distance: '৪.২ কিমি দূরে',
      vehicleSupport: 'হেভি বাস ও ট্রাক (ফ্ল্যাটবেড বেয়ারার)',
      rating: 4.9,
      status: 'অনলাইন ও প্রস্তুত',
    },
    {
      id: 'PRO-TOW-002',
      name: 'মাওয়া এক্সপ্রেসওয়ে ক্রেন সার্ভিস',
      phone: '01819334455',
      distance: '৮.১ কিমি দূরে',
      vehicleSupport: 'হাইড্রোলিক উইঞ্চ ও টো-বার',
      rating: 4.7,
      status: 'অনলাইন ও প্রস্তুত',
    },
  ];

  const activeInc = incidents.find((i) => i.id === selectedIncident) || incidents[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h1 className="text-2xl font-black text-white">লাইভ ডিসপ্যাচ ও ট্র্যাকিং কনসোল</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            স্বয়ংক্রিয় অ্যালগরিদম ব্যর্থ হলে ডিসপ্যাচার ম্যানুয়ালি মেকানিক বা টো-ট্রাক অ্যাসাইন করতে পারেন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>রেডিয়াস ফিল্টার:</span>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(e.target.value)}
              className="bg-transparent font-bold text-teal-400 outline-none cursor-pointer"
            >
              <option value="5" className="bg-slate-900">৫ কিমি</option>
              <option value="15" className="bg-slate-900">১৫ কিমি (হাইওয়ে)</option>
              <option value="30" className="bg-slate-900">৩০ কিমি</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Incident Queue, Right Incident Details & Dispatch Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Queue list */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span>সক্রিয় ইনসিডেন্ট কিউ ({incidents.length})</span>
            <span className="text-[10px] text-amber-400 font-bold">অটো-রিফ্রেশ অন (৪ সে.)</span>
          </div>

          {incidents.map((inc) => {
            const isSelected = inc.id === selectedIncident;
            const isCritical = inc.urgency === 'CRITICAL_HIGHWAY';

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-3 ${
                  isSelected
                    ? 'bg-slate-800/90 border-teal-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-teal-400">{inc.id}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isCritical ? 'হাইওয়ে হ্যাজার্ড' : 'জরুরি'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{inc.service}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{inc.vehicle}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{inc.location}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {inc.time}
                  </span>
                  <span
                    className={`font-bold ${
                      inc.status === 'matching' ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {inc.status === 'matching' ? 'অ্যাসাইনমেন্ট পেন্ডিং' : 'মেকানিক পথে আছে'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Command Center Details Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <span className="text-xs font-bold text-teal-400">বিস্তারিত ইনসিডেন্ট ফাইল: {activeInc.id}</span>
              <h2 className="text-xl font-extrabold text-white mt-1">{activeInc.service}</h2>
              <p className="text-xs text-slate-400 mt-0.5">গাড়ি: {activeInc.vehicle}</p>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${activeInc.customer.split('(')[1]?.replace(')', '')}`}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                কাস্টমারকে কল
              </a>
            </div>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">কাস্টমার নাম ও মোবাইল:</span>
              <span className="font-bold text-white text-sm">{activeInc.customer}</span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">ইনসিডেন্ট ক্যাটাগরি:</span>
              <span className="font-bold text-teal-400 text-sm">{activeInc.category}</span>
            </div>
          </div>

          {/* Location box */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500" />
              নির্ধারিত ঘটনাস্থল:
            </span>
            <p className="text-sm font-bold text-white">{activeInc.location}</p>
            <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              বিবরণ: {activeInc.note}
            </p>
          </div>

          {/* Suggested Providers Section for Manual Intervention */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white">যোগ্য নিকটস্থ সার্ভিস প্রোভাইডার তালিকা</h3>
                <p className="text-xs text-slate-400">অটোমিক অ্যাসাইনমেন্ট লকিং নিশ্চিত করা হয়েছে</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                {searchRadius} কিমি রেডিয়াসে ফিল্টার্ড
              </span>
            </div>

            <div className="space-y-3">
              {suggestedProviders.map((pro) => (
                <div
                  key={pro.id}
                  className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{pro.name}</h4>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        ★ {pro.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{pro.vehicleSupport}</p>
                    <p className="text-xs text-teal-400 font-medium">{pro.distance} • {pro.phone}</p>
                  </div>

                  <button
                    onClick={() => {
                      alert(`মেকানিক ${pro.name}-কে রিকোয়েস্ট ${activeInc.id}-এ সফলভাবে নিযুক্ত করা হয়েছে!`);
                    }}
                    className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    ম্যানুয়াল অ্যাসাইন করুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
