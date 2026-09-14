'use client';

import React, { useState, Suspense } from 'react';
import { Header } from '@/components/Header';
import { YouTubeView } from '@/components/YouTubeView';
import { SeoContentSection } from '@/components/SeoContentSection';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { ShieldCheck, Zap } from 'lucide-react';

export default function YouTubePage() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, detail?: string) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, message, detail };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="min-h-screen bg-black text-pearl-100 flex flex-col justify-between selection:bg-pearl-100 selection:text-black">
      {/* Brand Header with Navbar */}
      <Header />

      {/* Dedicated YouTube Downloader View */}
      <div className="flex-1 w-full">
        <Suspense
          fallback={
            <div className="min-h-[400px] flex items-center justify-center text-pearl-500 font-mono text-sm">
              Initializing YouTube Studio...
            </div>
          }
        >
          <YouTubeView showToast={showToast} />
        </Suspense>
      </div>

      {/* Crawlable SEO Content Section */}
      <SeoContentSection />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Ultra-Minimal Footer */}
      <footer className="w-full border-t border-obsidian-700/80 bg-obsidian-950 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-pearl-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-pearl-200">iHateDownloaders</span>
            <span>•</span>
            <span>YouTube 4K & MP3 Studio • Zero telemetry. Direct stream de-muxing.</span>
          </div>

          <div className="flex items-center space-x-5">
            <span className="flex items-center space-x-1 text-pearl-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Log Guarantee</span>
            </span>
            <span className="flex items-center space-x-1 text-pearl-400">
              <Zap className="w-3.5 h-3.5 text-accent-cyan" />
              <span>10 Gbps CDN Edge</span>
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
