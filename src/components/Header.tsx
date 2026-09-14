'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Zap, Youtube, Instagram } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();

  const isYouTubeActive = pathname === '/youtube' || pathname === '/';
  const isInstagramActive = pathname === '/instagram';

  return (
    <header className="w-full border-b border-obsidian-700/80 bg-black/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <Link href="/youtube" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-pearl-100 flex items-center justify-center text-black shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-105">
              <Zap className="w-3.5 h-3.5 fill-current stroke-none" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-pearl-100 text-base sm:text-lg font-sans">
                iHate<span className="text-pearl-500 font-light">Downloaders</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-obsidian-800 border border-obsidian-600 text-emerald-400 font-semibold">
                v2.0
              </span>
            </div>
          </Link>

          {/* Navigation Bar */}
          <nav className="flex items-center space-x-1 p-1 rounded-lg bg-obsidian-950 border border-obsidian-800">
            <Link
              href="/youtube"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                isYouTubeActive
                  ? 'bg-pearl-100 text-black font-semibold shadow-sm'
                  : 'text-pearl-400 hover:text-pearl-100 hover:bg-obsidian-900'
              }`}
            >
              <Youtube className={`w-3.5 h-3.5 ${isYouTubeActive ? 'text-rose-600' : 'text-rose-500'}`} />
              <span>YouTube</span>
            </Link>

            <Link
              href="/instagram"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                isInstagramActive
                  ? 'bg-pearl-100 text-black font-semibold shadow-sm'
                  : 'text-pearl-400 hover:text-pearl-100 hover:bg-obsidian-900'
              }`}
            >
              <Instagram className={`w-3.5 h-3.5 ${isInstagramActive ? 'text-pink-600' : 'text-pink-400'}`} />
              <span>Instagram</span>
            </Link>
          </nav>

          {/* Minimal Status Indicators */}
          <div className="flex items-center space-x-2.5 text-xs font-mono">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-obsidian-900 border border-obsidian-700 text-pearl-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">10 Gbps Edge</span>
              <span className="sm:hidden">Edge</span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-obsidian-900 border border-obsidian-700 text-pearl-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-pearl-300" />
              <span>Zero-Log</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
