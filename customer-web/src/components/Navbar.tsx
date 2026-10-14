import React from 'react';
import Link from 'next/link';
import { Wrench, PhoneCall, ShieldCheck, MapPin } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
              আমাদের মেকানিক
            </span>
            <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
              রোডসাইড অ্যাসিস্ট্যান্স বাংলাদেশ
            </span>
          </div>
        </Link>

        {/* Quick Nav & Helpline */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/request"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition"
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            সার্ভিস বুকিং
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            ১০০% ভেরিফায়েড টেকনিশিয়ান
          </div>

          <a
            href="tel:16789"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>১৬৭৮৯ (জরুরি হেল্পলাইন)</span>
          </a>
        </div>
      </div>
    </header>
  );
};
