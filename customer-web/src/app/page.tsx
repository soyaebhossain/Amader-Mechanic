import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Zap,
  Disc,
  Truck,
  Fuel,
  Cpu,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const services = [
    {
      title: 'টায়ার পাংচার ও পরিবর্তন',
      desc: 'লিক মেরামত, অতিরিক্ত চাকা লাগানো ও টিউবলেস টায়ার সমাধান।',
      icon: Disc,
      price: '৳ ৪০০ থেকে শুরু',
      badge: 'জরুরি',
    },
    {
      title: 'ব্যাটারি জাম্পস্টার্ট সার্ভিস',
      desc: 'ডেড ব্যাটারি জাম্পার ক্যাবল দিয়ে তাত্ক্ষণিক ইঞ্জিন চালু।',
      icon: Zap,
      price: '৳ ৫০০ থেকে শুরু',
      badge: 'জরুরি',
    },
    {
      title: 'ইঞ্জিন ও মেকানিক্যাল সমস্যা',
      desc: 'ওভারহিটিং, ক্লাচ ফেইল, ব্রেক ত্রুটি বা ইঞ্জিন অচল হওয়া।',
      icon: Wrench,
      price: '৳ ৮০০ থেকে শুরু',
      badge: 'অন-সাইট',
    },
    {
      title: 'টোয়িং ও রিকভারি সার্ভিস',
      desc: 'হাইড্রোলিক বা ফ্ল্যাটবেড টো-ট্রাক দিয়ে নিরাপদ গ্যারেজে নিয়ে যাওয়া।',
      icon: Truck,
      price: '৳ ২৫০০ থেকে শুরু',
      badge: 'উদ্ধার',
    },
    {
      title: 'ইলেকট্রিক্যাল ও সেন্সর ত্রুটি',
      desc: 'ফিউজ বক্স, অল্টারনেটর, হেডলাইট ও ড্যাশবোর্ড ওয়্যারিং সমাধান।',
      icon: Cpu,
      price: '৳ ৬০০ থেকে শুরু',
      badge: 'বিশেষজ্ঞ',
    },
    {
      title: 'জরুরি জ্বালানি সরবরাহ',
      desc: 'হাইওয়ে বা জ্যামে তেল শেষ হলে ৫ লিটার অক্টেন বা ডিজেল ডেলিভারি।',
      icon: Fuel,
      price: '৳ ৩০০ থেকে শুরু',
      badge: 'দ্রুত সেবা',
    },
  ];

  const steps = [
    {
      number: '০১',
      title: 'অবস্থান ও সমস্যা জানান',
      desc: 'জিপিএস দিয়ে বর্তমান লোকেশন ও গাড়ির সমস্যার বিবরণ দিন।',
    },
    {
      number: '০২',
      title: 'নিকটস্থ মেকানিক রওনা হবে',
      desc: 'সিস্টেম স্বয়ংক্রিয়ভাবে ৫ কিমি-র ভেতর দক্ষ টেকনিশিয়ান পাঠাবে।',
    },
    {
      number: '০৩',
      title: 'অনুমোদন ও নিরাপদ সমাধান',
      desc: 'পরিদর্শন শেষে ডিজিটাল কোটেশন অনুমোদন দিন এবং বিকাশ/নগদে পরিশোধ করুন।',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-teal-950 via-slate-900 to-slate-950 text-white overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                ২৪ ঘণ্টা সক্রিয় রোডসাইড ইমার্জেন্সি সাপোর্ট
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                রাস্তায় গাড়ি বিকল? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                  ১৫ মিনিটে
                </span>{' '}
                পৌঁছে যাবে দক্ষ মেকানিক
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                বাইক, কার, মাইক্রোবাস কিংবা হেভি ট্রাক—ঢাকা সিটিসহ সারা বাংলাদেশের যেকোনো হাইওয়েতে গাড়ির সমস্যায় তাৎক্ষণিক উদ্ধার ও অন-সাইট মেরামত সেবা।
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/request"
                  className="flex items-center justify-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-red-600/30 text-base transition transform hover:-translate-y-0.5 active:scale-95"
                >
                  <Wrench className="w-5 h-5" />
                  জরুরি মেকানিক ডাকুন
                </Link>

                <a
                  href="tel:16789"
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-7 py-4 rounded-2xl border border-slate-700 transition"
                >
                  <PhoneCall className="w-5 h-5 text-teal-400" />
                  হটলাইন: ১৬৭৮৯
                </a>
              </div>

              {/* Trust markers */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">১৫ মি.</div>
                  <div className="text-xs text-slate-400">গড়ে পৌঁছানোর সময়</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">৯৮.৭%</div>
                  <div className="text-xs text-slate-400">সফল অন-সাইট ফিক্স</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">১২,৫০০+</div>
                  <div className="text-xs text-slate-400">উদ্ধারকৃত যানবাহন</div>
                </div>
              </div>
            </div>

            {/* Right Card: Instant Web Breakdown Request Box */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    তাৎক্ষণিক সহায়তা ফর্ম
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    কয়েক সেকেন্ডেই রিকোয়েস্ট পাঠান, জিপিএস ট্র্যাকিং স্বয়ংক্রিয়ভাবে সক্রিয় হবে
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      গাড়ির ধরন
                    </label>
                    <select className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-teal-500">
                      <option>প্রাইভেট কার / সেডান</option>
                      <option>মোটরসাইকেল / স্কুটার</option>
                      <option>এসইউভি / মাইক্রোবাস</option>
                      <option>পিকআপ / ভ্যান</option>
                      <option>বাস / ট্রাক</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      সার্ভিস প্রয়োজন
                    </label>
                    <select className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 font-medium focus:outline-none focus:border-teal-500">
                      <option>টায়ার পাংচার / পরিবর্তন</option>
                      <option>ব্যাটারি জাম্পস্টার্ট</option>
                      <option>ইঞ্জিন ও মেকানিক্যাল সমস্যা</option>
                      <option>হাইড্রোলিক টোয়িং সাপোর্ট</option>
                      <option>জরুরি জ্বালানি ডেলিভারি</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      আপনার অবস্থান
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="যেমন: কুড়িল বিশ্বরোড, ঢাকা"
                        className="w-full text-sm border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 bg-slate-50 focus:outline-none focus:border-teal-500"
                        defaultValue="বিজয় সরণি মোড়, তেজগাঁও, ঢাকা"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <Link
                    href="/request"
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95"
                  >
                    <span>পরবর্তী ধাপে এগিয়ে যান</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            আমাদের জরুরি সেবা সমূহ
          </h2>
          <p className="text-sm text-slate-600">
            যেকোনো পরিস্থিতিতে আপনার বাহন সচল রাখতে পেশাদার মেকানিক ও আধুনিক যন্ত্রপাতি নিয়ে প্রস্তুত
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-bold text-teal-700">{item.price}</span>
                  <Link
                    href="/request"
                    className="text-xs font-bold text-slate-700 hover:text-teal-600 flex items-center gap-1 transition"
                  >
                    বুকিং দিন <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              কীভাবে কাজ করে?
            </h2>
            <p className="text-sm text-slate-600">
              মাত্র ৩টি সহজ ধাপে মুহূর্তের মধ্যে মেকানিক সাপোর্ট
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm space-y-4">
                <div className="text-3xl font-black text-teal-600/30">{st.number}</div>
                <h3 className="text-lg font-bold text-slate-900">{st.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-teal-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black">
              ভেরিফায়েড টেকনিশিয়ান ও ন্যায্য মূল্য নিশ্চয়তা
            </h3>
            <p className="text-sm text-teal-100 leading-relaxed">
              কোনো অনাকাঙ্ক্ষিত অতিরিক্ত চার্জ ছাড়াই সম্পূর্ণ আইটেমাইজড কোটেশন অনুমোদনের পর কাজ শুরু হয়। বিকাশ, নগদ বা কার্ডে রয়েছে ১০০% নিরাপদ পেমেন্ট।
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-teal-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-300" /> এনআইডি ভেরিফায়েড মেকানিক</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-300" /> ডিজিটাল ট্যাক্স ইনভয়েস</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-300" /> ২৪/৭ কাস্টমার সাপোর্ট</span>
            </div>
          </div>

          <Link
            href="/request"
            className="bg-white hover:bg-slate-100 text-teal-950 font-black px-8 py-4 rounded-2xl shadow-lg transition text-base shrink-0"
          >
            এখনই সেবা নিন
          </Link>
        </div>
      </section>
    </div>
  );
}
