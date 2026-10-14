import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Radio,
  Users,
  BadgeCheck,
  CreditCard,
  Building2,
  Settings,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <span className="text-sm font-extrabold text-white block tracking-tight">আমাদের মেকানিক</span>
          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">Admin & Dispatch</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1 text-sm font-semibold">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-teal-600/10 text-teal-400 border border-teal-500/20"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>ওভারভিউ ড্যাশবোর্ড</span>
        </Link>

        <Link
          href="/dispatch"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>লাইভ ডিসপ্যাচ সেন্টার</span>
          <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            ৪ লাইভ
          </span>
        </Link>

        <Link
          href="/verifications"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          <span>মেকানিক ভেরিফিকেশন (KYC)</span>
          <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
            ১২ পেন্ডিং
          </span>
        </Link>

        <Link
          href="/ledger"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <CreditCard className="w-4 h-4 text-teal-400" />
          <span>ফাইন্যান্স ও পে-আউট লেজার</span>
        </Link>

        <Link
          href="/fleet"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>পার্টনার গ্যারেজ ও ফ্লিট</span>
        </Link>
      </nav>

      {/* Dispatcher on-duty status */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs font-bold">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="text-xs font-bold text-white block truncate">এডমিন অপারেটর</span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> অন-ডিউটি সক্রিয়
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
