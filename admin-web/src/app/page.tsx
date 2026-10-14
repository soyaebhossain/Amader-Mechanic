import React from 'react';
import Link from 'next/link';
import {
  Radio,
  Users,
  BadgeCheck,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    {
      title: 'সক্রিয় লাইভ ইনসিডেন্ট',
      value: '১৪টি',
      change: '+৩টি নতুন',
      icon: Radio,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'আজকের গ্রস সার্ভিস মূল্য (GSV)',
      value: '৳ ৬৪,৫০০',
      change: '+১২.৫% বৃদ্ধি',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: '১৫% প্ল্যাটফর্ম কমিশন',
      value: '৳ ৯,৬৭৫',
      change: 'সরাসরি রেভিনিউ',
      icon: TrendingUp,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
    {
      title: 'পেন্ডিং মেকানিক KYC',
      value: '১২ জন',
      change: 'যাচাইকরণ প্রয়োজন',
      icon: BadgeCheck,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
  ];

  const recentRequests = [
    {
      id: 'SR-DHAKA-109',
      service: 'টায়ার পাংচার ও পরিবর্তন',
      vehicle: 'Toyota Corolla (ঢাকা মেট্রো-গ ১২-৩৪৩২)',
      location: 'বিজয় সরণি ফ্লাইওভার, ঢাকা',
      status: 'en_route',
      statusLabel: 'মেকানিক রওনা হয়েছে',
      provider: 'মোঃ রফিকুল ইসলাম',
      amount: '৳ ৭৫০',
      time: '৪ মিনিট আগে',
    },
    {
      id: 'SR-DHAKA-108',
      service: 'ব্যাটারি জাম্পস্টার্ট',
      vehicle: 'Honda Grace (ঢাকা মেট্রো-খ ২১-৯৮৭৬)',
      location: 'মিরপুর ১০ গোলচত্বর',
      status: 'inspection',
      statusLabel: 'পরিদর্শন ও কোটেশন',
      provider: 'আলমগীর কবির',
      amount: '৳ ৬০০',
      time: '১২ মিনিট আগে',
    },
    {
      id: 'SR-HWY-052',
      service: 'হাইড্রোলিক টোয়িং সাপোর্ট',
      vehicle: 'Hino 1J Bus (ঢাকা মেট্রো-ব ১৪-৫৫৬৬)',
      location: 'পদ্মা সেতু জাজিরা এক্সপ্রেসওয়ে সংযোগ',
      status: 'matching',
      statusLabel: 'হেভি টো-ট্রাক খোঁজা হচ্ছে',
      provider: 'অ্যাসাইনমেন্ট অপেক্ষমাণ',
      amount: '৳ ৩,৫০০',
      time: '১৬ মিনিট আগে',
    },
    {
      id: 'SR-DHAKA-107',
      service: 'ইঞ্জিন ওভারহিটিং ও মেকানিক্যাল',
      vehicle: 'Nissan X-Trail (ঢাকা মেট্রো-ঘ ১১-০০১২)',
      location: 'বনানী ১১ নম্বর রোড',
      status: 'completed',
      statusLabel: 'সফলভাবে সম্পন্ন ও পেইড',
      provider: 'মোঃ করিম হোসেন',
      amount: '৳ ১,৪৫০',
      time: '২৮ মিনিট আগে',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">এক্সিকিউটিভ কন্ট্রোল প্যানেল</h1>
          <p className="text-xs text-slate-400 mt-1">
            সারা দেশে চলমান সকল রোডসাইড ইমার্জেন্সি রিকোয়েস্ট ও মেকানিক নেটওয়ার্কের লাইভ দৃশ্য
          </p>
        </div>

        <Link
          href="/dispatch"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <Radio className="w-4 h-4 animate-pulse text-white" />
          লাইভ ডিসপ্যাচ কনসোল খুলুন
        </Link>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{st.title}</span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${st.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{st.value}</div>
                <div className="text-[11px] font-semibold text-teal-400 mt-1">{st.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Incidents Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">সাম্প্রতিক রিকোয়েস্ট ও ডিসপ্যাচ মনিটর</h3>
            <p className="text-xs text-slate-400 mt-0.5">রিয়েল-টাইম লাইভ ফিল্টার্ড ডেটা</p>
          </div>
          <Link
            href="/dispatch"
            className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
          >
            সবগুলো দেখুন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">রিকোয়েস্ট আইডি</th>
                <th className="py-3.5 px-6">সার্ভিস ও গাড়ি</th>
                <th className="py-3.5 px-6">ঘটনাস্থল</th>
                <th className="py-3.5 px-6">নিযুক্ত মেকানিক</th>
                <th className="py-3.5 px-6">স্ট্যাটাস</th>
                <th className="py-3.5 px-6">বিল</th>
                <th className="py-3.5 px-6 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6 font-bold text-teal-400">{req.id}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{req.service}</div>
                    <div className="text-slate-400 text-[11px]">{req.vehicle}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {req.location}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{req.time}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-200">{req.provider}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        req.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'matching'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}
                    >
                      {req.statusLabel}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-extrabold text-white">{req.amount}</td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href="/dispatch"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-lg text-[11px] transition"
                    >
                      হস্তক্ষেপ করুন
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
