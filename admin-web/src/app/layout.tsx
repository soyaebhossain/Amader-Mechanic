import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'আমাদের মেকানিক - Admin & Dispatch Command Center',
  description: 'রোডসাইড অ্যাসিস্ট্যান্স সেন্ট্রাল অপারেশন ও ডিসপ্যাচ ম্যানেজমেন্ট সিস্টেম।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex bg-slate-950 text-slate-100 antialiased font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <header className="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-300">
              অপারেশনাল কন্ট্রোল হাব — <span className="text-teal-400">ঢাকা সেন্ট্রাল ডিসপ্যাচ</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                সিস্টেম রেডি (PostGIS / Celery Online)
              </span>
            </div>
          </header>
          <main className="flex-1 p-8 bg-slate-950">{children}</main>
        </div>
      </body>
    </html>
  );
}
