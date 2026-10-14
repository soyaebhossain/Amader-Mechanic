import React from 'react';
import Link from 'next/link';
import { Wrench, MapPin, Phone, Mail, ShieldAlert } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-black text-xl">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              আমাদের মেকানিক
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              সারা বাংলাদেশে জরুরি রোডসাইড ভেহিকেল অ্যাসিস্ট্যান্স ও উদ্ধার সেবা। নিরাপদ ভ্রমণ ও ঝামেলাহীন ড্রাইভের বিশ্বস্ত সঙ্গী।
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
              ২৪/৭ হাইওয়ে ইমার্জেন্সি রেসপন্স টিম
            </div>
          </div>

          {/* Service Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">সার্ভিস সমূহ</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/request" className="hover:text-teal-400 transition">টায়ার পাংচার ও পরিবর্তন</Link></li>
              <li><Link href="/request" className="hover:text-teal-400 transition">ব্যাটারি জাম্পস্টার্ট সেবা</Link></li>
              <li><Link href="/request" className="hover:text-teal-400 transition">মেকানিক্যাল ও ইঞ্জিন মেরামত</Link></li>
              <li><Link href="/request" className="hover:text-teal-400 transition">হাইড্রোলিক টোয়িং ও উদ্ধার</Link></li>
              <li><Link href="/request" className="hover:text-teal-400 transition">জরুরি হাইওয়ে জ্বালানি সরবরাহ</Link></li>
            </ul>
          </div>

          {/* Coverage Cities */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">সার্ভিস এরিয়া</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-teal-400" /> ঢাকা ও সকল হাইওয়ে লিঙ্ক</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-teal-400" /> চট্টগ্রাম মেট্রো ও কর্ণফুলী টানেল</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-teal-400" /> সিলেট ও সুনামগঞ্জ রুট</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-teal-400" /> পদ্মা সেতু ও দক্ষিণবঙ্গ এক্সপ্রেসওয়ে</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-teal-400" /> খুলনা, রাজশাহী ও রংপুর</li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">যোগাযোগ ও হেল্পডেস্ক</h4>
            <p className="text-sm text-slate-400">
              জরুরি মুহূর্তে কল করুন:
            </p>
            <a href="tel:16789" className="text-xl font-black text-teal-400 block hover:underline">
              ১৬৭৮৯ (টোল-ফ্রি)
            </a>
            <p className="text-xs text-slate-500 pt-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              support@amader-mechanic.bd
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Amader Mechanic Technologies BD. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-400">গোপনীয়তা নীতি</Link>
            <Link href="#" className="hover:text-slate-400">শর্তাবলী</Link>
            <Link href="#" className="hover:text-slate-400">মেকানিক যোগ দিন</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
