import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'আমাদের মেকানিক | Amader Mechanic - Roadside Assistance BD',
  description: 'সারা বাংলাদেশে জরুরি রোডসাইড ভেহিকেল অ্যাসিস্ট্যান্স ও উদ্ধার সেবা। মেকানিক, টোয়িং, ব্যাটারি জাম্পস্টার্ট ও টায়ার সার্ভিস।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
