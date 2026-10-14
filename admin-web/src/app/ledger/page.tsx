'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  RefreshCw,
  Download,
} from 'lucide-react';

interface LedgerRecord {
  id: string;
  reference: string;
  type: 'COMMISSION' | 'DISBURSEMENT' | 'SUBSCRIPTION' | 'REFUND';
  providerName: string;
  method: 'BKASH' | 'BANK_TRANSFER' | 'NAGAD' | 'CASH';
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export default function LedgerManagementPage() {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  const stats = [
    {
      title: 'মোট গ্রস ট্রানজেকশন (MTD)',
      value: '৳ ১২,৮৪,৫০০',
      subtitle: 'চলতি মাসে',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'প্ল্যাটফর্ম কমিশন রেভিনিউ',
      value: '৳ ১,৯২,৬৭৫',
      subtitle: 'গড় ১৫% মার্কেটপ্লেস ফি',
      icon: ArrowUpRight,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
    {
      title: 'বিতরণকৃত পার্টনার পে-আউট',
      value: '৳ ১০,৯১,৮২৫',
      subtitle: 'বিকাশ ও ব্যাংক ট্রান্সফার',
      icon: ArrowDownLeft,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'অপেক্ষমাণ ক্লিয়ারেন্স ব্যালেন্স',
      value: '৳ ৩৭,২০০',
      subtitle: '৪৮ ঘণ্টার সাইকেল',
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  const records: LedgerRecord[] = [
    {
      id: 'TXN-90812',
      reference: 'SR-DHAKA-107',
      type: 'COMMISSION',
      providerName: 'মোঃ করিম হোসেন (বাইক মেকানিক)',
      method: 'BKASH',
      grossAmount: 1450,
      platformFee: 217.5,
      netPayout: 1232.5,
      status: 'COMPLETED',
      createdAt: 'আজ, দুপুর ০২:১৫',
    },
    {
      id: 'TXN-90811',
      reference: 'PAYOUT-BATCH-441',
      type: 'DISBURSEMENT',
      providerName: 'আলমগীর কবির (অটো মেকানিক)',
      method: 'BKASH',
      grossAmount: 4800,
      platformFee: 0,
      netPayout: 4800,
      status: 'COMPLETED',
      createdAt: 'আজ, দুপুর ০১:৩০',
    },
    {
      id: 'TXN-90810',
      reference: 'SR-DHAKA-106',
      type: 'COMMISSION',
      providerName: 'নাভানা অটো সার্ভিস সেন্টার',
      method: 'BANK_TRANSFER',
      grossAmount: 8500,
      platformFee: 1275,
      netPayout: 7225,
      status: 'PROCESSING',
      createdAt: 'আজ, সকাল ১১:৪৫',
    },
    {
      id: 'TXN-90809',
      reference: 'SR-HWY-051',
      type: 'COMMISSION',
      providerName: 'মেঘনা হাইওয়ে হেভি টোয়িং',
      method: 'BKASH',
      grossAmount: 5200,
      platformFee: 780,
      netPayout: 4420,
      status: 'COMPLETED',
      createdAt: 'আজ, সকাল ০৯:১০',
    },
    {
      id: 'TXN-90808',
      reference: 'SR-DHAKA-104',
      type: 'REFUND',
      providerName: 'কাষ্টমার রিফান্ড (ক্যান্সেলড জব)',
      method: 'NAGAD',
      grossAmount: 500,
      platformFee: 0,
      netPayout: 500,
      status: 'COMPLETED',
      createdAt: 'গতকাল, সন্ধ্যা ০৭:২০',
    },
  ];

  const handleRunDisbursement = () => {
    setIsProcessingBatch(true);
    setBatchMessage(null);
    setTimeout(() => {
      setIsProcessingBatch(false);
      setBatchMessage('সফল: বিকাশ B2C ও BEFTN ব্যাংকিং পে-আউট ব্যাচ প্রসেস হয়েছে (৩টি অ্যাকাউন্ট সেটেলড)!');
    }, 1500);
  };

  const filteredRecords = records.filter((r) => {
    if (filterType !== 'ALL' && r.type !== filterType) return false;
    if (
      searchQuery &&
      !r.reference.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.providerName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">ফাইন্যান্স ও পে-আউট লেজার</h1>
          <p className="text-xs text-slate-400 mt-1">
            স্বয়ংক্রিয় প্ল্যাটফর্ম কমিশন হিসাব, বিকাশ B2C ডিসবার্সমেন্ট এবং ব্যাংক সেটেলমেন্ট মনিটরিং
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDisbursement}
            disabled={isProcessingBatch}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessingBatch ? 'animate-spin' : ''}`} />
            {isProcessingBatch ? 'প্রসেসিং হচ্ছে...' : 'পে-আউট ব্যাচ সেটেলমেন্ট রান করুন'}
          </button>
        </div>
      </div>

      {batchMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {batchMessage}
        </div>
      )}

      {/* Stats Cards */}
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
                <div className="text-[11px] font-semibold text-slate-400 mt-1">{st.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="রেফারেন্স বা মেকানিকের নামে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" /> ফিল্টার:
          </span>
          {['ALL', 'COMMISSION', 'DISBURSEMENT', 'REFUND'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                filterType === type
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type === 'ALL'
                ? 'সবগুলো'
                : type === 'COMMISSION'
                ? 'কমিশন'
                : type === 'DISBURSEMENT'
                ? 'পে-আউট'
                : 'রিফান্ড'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">ট্রানজেকশন আইডি ও রেফারেন্স</th>
                <th className="py-3.5 px-6">ধরন</th>
                <th className="py-3.5 px-6">প্রাপক / মেকানিক</th>
                <th className="py-3.5 px-6">পেমেন্ট মেথড</th>
                <th className="py-3.5 px-6">গ্রস বিল</th>
                <th className="py-3.5 px-6">১৫% প্ল্যাটফর্ম ফি</th>
                <th className="py-3.5 px-6">নেট পে-আউট</th>
                <th className="py-3.5 px-6 text-right">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-teal-400">{item.id}</div>
                    <div className="text-[11px] text-slate-400">{item.reference}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.createdAt}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        item.type === 'COMMISSION'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : item.type === 'DISBURSEMENT'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-200 font-bold">{item.providerName}</td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-300">
                      {item.method === 'BKASH'
                        ? 'bKash B2C'
                        : item.method === 'BANK_TRANSFER'
                        ? 'Bank BEFTN'
                        : item.method === 'NAGAD'
                        ? 'Nagad Direct'
                        : 'Cash In Hand'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-white">৳ {item.grossAmount}</td>
                  <td className="py-4 px-6 font-semibold text-teal-400">
                    {item.platformFee > 0 ? `৳ ${item.platformFee}` : '-'}
                  </td>
                  <td className="py-4 px-6 font-black text-emerald-400">৳ {item.netPayout}</td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.status === 'PROCESSING'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {item.status}
                    </span>
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
