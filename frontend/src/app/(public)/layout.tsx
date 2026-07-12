import React from 'react';
import { Navbar } from '@/components/Navbar';
import { BreakingNewsTicker } from '@/components/BreakingNewsTicker';
import { Footer } from '@/components/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <BreakingNewsTicker />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
