'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Disc,
  Zap,
  Truck,
  Fuel,
  Cpu,
  MapPin,
  Car,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function RequestAssistancePage() {
  const router = useRouter();

  // Wizard state
  const [selectedCategory, setSelectedCategory] = useState('FLAT_TIRE');
  const [vehicleCategory, setVehicleCategory] = useState('PRIVATE_CAR');
  const [vehicleReg, setVehicleReg] = useState('ঢাকা মেট্রো-গ ১২-৩৪৫৬');
  const [address, setAddress] = useState('বিজয় সরণি মোড়, তেজগাঁও শিল্প এলাকা, ঢাকা');
  const [landmark, setLandmark] = useState('পেট্রোল পাম্পের সামনে');
  const [problemNotes, setProblemNotes] = useState('');
  const [urgency, setUrgency] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'FLAT_TIRE', name: 'টায়ার পাংচার / পরিবর্তন', icon: Disc, price: '৳ ৪০০' },
    { id: 'BATTERY_JUMPSTART', name: 'ব্যাটারি জাম্পস্টার্ট', icon: Zap, price: '৳ ৫০০' },
    { id: 'MECHANICAL_BREAKDOWN', name: 'ইঞ্জিন / মেকানিক্যাল ত্রুটি', icon: Wrench, price: '৳ ৮০০' },
    { id: 'TOWING_RECOVERY', name: 'টোয়িং ও উদ্ধার সাপোর্ট', icon: Truck, price: '৳ ২৫০০' },
    { id: 'ELECTRICAL_FAULT', name: 'ইলেকট্রিক্যাল সমস্যা', icon: Cpu, price: '৳ ৬০০' },
    { id: 'EMERGENCY_FUEL', name: 'জরুরি জ্বালানি ডেলিভারি', icon: Fuel, price: '৳ ৩০০' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API creation or trigger
    setTimeout(() => {
      setIsSubmitting(false);
      // Route to live tracking page
      router.push('/tracking/SR-DHAKA-202610');
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          জরুরি সহায়তা ফর্ম
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          রোডসাইড মেকানিক রিকোয়েস্ট
        </h1>
        <p className="text-sm text-slate-500">
          নিচের তথ্যগুলো পূরণ করুন। কয়েক মিনিটেই আপনার জিপিএস অবস্থানে মেকানিক পৌঁছাবে।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        {/* 1. Category Selection */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">১</span>
            সার্ভিস নির্বাচন করুন
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left p-4 rounded-2xl border transition flex items-center gap-3.5 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{cat.name}</div>
                    <div className="text-[11px] font-semibold text-teal-700 mt-1">{cat.price} থেকে</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Vehicle details */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">২</span>
            গাড়ির তথ্য
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">গাড়ির ধরন</label>
              <select
                value={vehicleCategory}
                onChange={(e) => setVehicleCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-teal-500"
              >
                <option value="PRIVATE_CAR">প্রাইভেট কার / সেডান</option>
                <option value="MOTORCYCLE">মোটরসাইকেল</option>
                <option value="MICROBUS">মাইক্রোবাস / হায়েস</option>
                <option value="VAN">পিকআপ / ভ্যান</option>
                <option value="BUS">বাস</option>
                <option value="TRUCK">ট্রাক</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">রেজিস্ট্রেশন নম্বর</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  placeholder="যেমন: ঢাকা মেট্রো-গ ১১-২২৩৩"
                  className="w-full text-sm border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 bg-slate-50 focus:outline-none focus:border-teal-500 font-medium"
                />
                <Car className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Incident Location */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">৩</span>
            ঘটনাস্থল ও অবস্থান
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">বর্তমান ঠিকানা / রোড নম্বর</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="রাস্তার বিবরণ লিখুন"
                  className="w-full text-sm border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 bg-slate-50 focus:outline-none focus:border-teal-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">নিকটবর্তী ল্যান্ডমার্ক (ঐচ্ছিক)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="যেমন: ব্রিজের গোড়ায়, পেট্রোল পাম্পের উল্টো পাশে"
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Problem & Urgency */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">৪</span>
            সমস্যার বিবরণ ও জরুরিতা
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">সমস্যার লক্ষণ</label>
              <textarea
                rows={3}
                value={problemNotes}
                onChange={(e) => setProblemNotes(e.target.value)}
                placeholder="যেমন: গাড়ি স্টার্ট হচ্ছে না, ব্যাটারি থেকে শব্দ হচ্ছে..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">জরুরিতা স্তর</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency('NORMAL')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                    urgency === 'NORMAL' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  সাধারণ (Normal)
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('HIGH')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                    urgency === 'HIGH' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  জরুরি (High Priority)
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('CRITICAL')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                    urgency === 'CRITICAL' ? 'border-red-600 bg-red-50 text-red-800' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  বিপদজনক স্থান (Highway Hazard)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            যেকোনো সময় কোনো চার্জ ছাড়াই বাতিল করা যাবে
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-8 py-4 rounded-xl shadow-md transition disabled:bg-slate-400"
          >
            {isSubmitting ? 'মেকানিক খোঁজা হচ্ছে...' : 'অনুরোধ নিশ্চিত করুন'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
