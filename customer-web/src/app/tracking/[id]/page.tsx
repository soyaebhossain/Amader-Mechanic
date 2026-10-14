'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  PhoneCall,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';

export default function TrackingPage({ params }: { params: { id: string } }) {
  const [quoteApproved, setQuoteApproved] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 transition">
        <ArrowLeft className="w-4 h-4" />
        হোম পেজে ফিরে যান
      </Link>

      {/* Incident Status Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <span className="text-xs font-bold text-teal-600">অনুরোধ নম্বর: {params.id}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              টায়ার পাংচার ও পরিবর্তন সার্ভিস
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">গাড়ি: Toyota Allion (ঢাকা মেট্রো-গ ১২-৩৪৫৬)</p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold w-fit">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            মেকানিক আপনার উদ্দেশ্যে রওনা হয়েছেন
          </div>
        </div>

        {/* 4-step progress line */}
        <div className="grid grid-cols-4 gap-2 text-center pt-2">
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mx-auto">✓</div>
            <div className="text-[11px] font-bold text-slate-900">অনুরোধ গ্রহণ</div>
          </div>
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mx-auto">২</div>
            <div className="text-[11px] font-bold text-teal-700">রওনা হয়েছেন</div>
          </div>
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center mx-auto">৩</div>
            <div className="text-[11px] font-medium text-slate-500">পরিদর্শন ও কোটেশন</div>
          </div>
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center mx-auto">৪</div>
            <div className="text-[11px] font-medium text-slate-500">সম্পন্ন ও পেমেন্ট</div>
          </div>
        </div>

        {/* Provider Profile Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl">
              কে
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-slate-900 text-base">মোঃ করিম হোসেন</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ভেরিফায়েড
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> ৪.৯ (১২৮টি রিভিউ)
                </span>
                <span>• বাইসাইকেল/মোটর মেকানিক</span>
              </div>
            </div>
          </div>

          <a
            href="tel:+8801700112233"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
          >
            <PhoneCall className="w-4 h-4" />
            কল করুন (01700112233)
          </a>
        </div>

        {/* Live location block */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">আনুমানিক পৌঁছানোর সময় (ETA)</div>
              <div className="text-base font-extrabold text-white">৮ থেকে ১২ মিনিট (১.৮ কিমি দূরে)</div>
            </div>
          </div>
          <span className="text-xs text-teal-400 font-bold bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20 hidden sm:block">
            জিপিএস লাইভ সংযুক্ত
          </span>
        </div>
      </div>

      {/* Itemized Quotation Preview Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">কাজের আইটেমাইজড কোটেশন</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            {quoteApproved ? 'অনুমোদিত' : 'অনুমোদনের অপেক্ষায়'}
          </span>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 text-sm">
          <div className="flex justify-between pt-2">
            <span className="text-slate-600">মেকানিক পরিদর্শন ও সার্ভিস চার্জ</span>
            <span className="font-bold text-slate-900">৳ ৪০০.০০</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-600">টায়ার পাংচার সিলিং উপাদান (২টি লিকেজ)</span>
            <span className="font-bold text-slate-900">৳ ২০০.০০</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-600">যাতায়াত ও দূরত্ব ফি</span>
            <span className="font-bold text-slate-900">৳ ১৫০.০০</span>
          </div>
          <div className="flex justify-between pt-3 font-extrabold text-base text-slate-900 border-t-2 border-slate-200">
            <span>সর্বমোট প্রদেয় বিল</span>
            <span className="text-teal-700">৳ ৭৫০.০০</span>
          </div>
        </div>

        {!quoteApproved ? (
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setQuoteApproved(true)}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-xl shadow-md transition"
            >
              কোটেশন অনুমোদন করুন (৳ ৭৫০.০০)
            </button>
            <button
              className="px-6 py-3.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition"
            >
              প্রত্যাখ্যান
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              কোটেশন অনুমোদিত হয়েছে। কাজ সম্পন্ন হলে নিচে পেমেন্ট সম্পন্ন করুন।
            </div>

            {!isPaid ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">পেমেন্ট মাধ্যম নির্বাচন করুন:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setIsPaid(true)}
                    className="p-3 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-pink-100 transition"
                  >
                    বিকাশ (bKash)
                  </button>
                  <button
                    onClick={() => setIsPaid(true)}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-100 transition"
                  >
                    নগদ (Nagad)
                  </button>
                  <button
                    onClick={() => setIsPaid(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition"
                  >
                    নগদ ক্যাশ দিন
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500 text-white p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm">পেমেন্ট সফলভাবে গৃহীত হয়েছে!</div>
                  <div className="text-xs opacity-90">ট্রানজেকশন আইডি: TRX-AMADER-998877</div>
                </div>
                <span className="text-xs font-bold underline cursor-pointer">রসিদ ডাউনলোড</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
