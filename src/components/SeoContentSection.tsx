'use client';

import React from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Music,
  Layers,
  Youtube,
  FileText,
  Volume2,
  HardDrive
} from 'lucide-react';

export const SeoContentSection: React.FC = () => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 border-t border-obsidian-700/80">
      {/* Editorial Search Introduction */}
      <article className="space-y-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-obsidian-900 border border-obsidian-700 text-pearl-400 text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-accent-cyan" />
          <span>SEARCH-ENGINE INDEXED ARCHITECTURE & BENCHMARKS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-pearl-100 font-sans tracking-tight">
          Why iHateDownloaders is the Internet's #1 Clean Media Engine
        </h2>
        <p className="text-sm sm:text-base text-pearl-500 leading-relaxed font-sans">
          For over a decade, online video and audio extractors have subjected users to malware redirects,
          fake download buttons, 720p resolution caps, and degraded 128kbps audio re-encoding.
          <strong> iHateDownloaders</strong> re-engineers media extraction from the ground up as an open,
          ad-free, direct 10 Gbps CDN de-muxing utility built for creators, audio engineers, researchers, and everyday consumers.
        </p>
      </article>

      {/* Comparison Matrix Table: iHateDownloaders vs Legacy Downloaders */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-pearl-100 font-sans">
            Competitive Benchmark: iHateDownloaders vs. Legacy Downloaders
          </h3>
        </div>

        <div className="obsidian-card border-obsidian-700 overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-xs font-mono border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-obsidian-950 border-b border-obsidian-700 text-pearl-400">
                <th className="py-3 px-4 font-semibold">Capability / Specification</th>
                <th className="py-3 px-4 font-semibold text-pearl-100 bg-obsidian-900 border-x border-obsidian-700">
                  ⚡ iHateDownloaders (v1.0)
                </th>
                <th className="py-3 px-4 font-semibold text-pearl-500">
                  Legacy Online Downloaders
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/80">
              <tr>
                <td className="py-3.5 px-4 text-pearl-300 font-sans font-medium">
                  Pop-up Ads, Fake Buttons & Redirects
                </td>
                <td className="py-3.5 px-4 text-emerald-400 bg-obsidian-900/50 border-x border-obsidian-700 flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Strictly 0 (Zero Ads & Zero Popups)</span>
                </td>
                <td className="py-3.5 px-4 text-rose-400">
                  <div className="flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Heavy pop-ups, malware redirects, intrusive banners</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 text-pearl-300 font-sans font-medium">
                  Maximum Video Resolution & FPS
                </td>
                <td className="py-3.5 px-4 text-pearl-100 bg-obsidian-900/50 border-x border-obsidian-700 font-bold">
                  4K UHD 60fps & 8K (AV1 / VP9 Native)
                </td>
                <td className="py-3.5 px-4 text-pearl-500">
                  Capped at 720p or 1080p without audio
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 text-pearl-300 font-sans font-medium">
                  Audio Extraction Fidelity
                </td>
                <td className="py-3.5 px-4 text-accent-cyan bg-obsidian-900/50 border-x border-obsidian-700 font-bold">
                  320 kbps CBR MP3 & 24-bit Lossless WAV
                </td>
                <td className="py-3.5 px-4 text-pearl-500">
                  128 kbps or re-compressed Opus with loss
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 text-pearl-300 font-sans font-medium">
                  1-Click Direct Audio Extraction
                </td>
                <td className="py-3.5 px-4 text-emerald-400 bg-obsidian-900/50 border-x border-obsidian-700 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant 1-Click MP3 320k / WAV Downloads</span>
                </td>
                <td className="py-3.5 px-4 text-rose-400">
                  <div className="flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Slow re-encoding with misleading buttons</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 text-pearl-300 font-sans font-medium">
                  Batch YouTube Playlist Downloading
                </td>
                <td className="py-3.5 px-4 text-pearl-100 bg-obsidian-900/50 border-x border-obsidian-700 font-bold">
                  Full 200-Track Batch Inspector & Streaming ZIP
                </td>
                <td className="py-3.5 px-4 text-pearl-500">
                  Must click tracks individually or pay for desktop app
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 text-pearl-300 font-sans font-medium">
                  YouTube Shorts Vertical 60fps
                </td>
                <td className="py-3.5 px-4 text-pearl-100 bg-obsidian-900/50 border-x border-obsidian-700 font-bold">
                  Direct 1080x1920 60fps MP4
                </td>
                <td className="py-3.5 px-4 text-pearl-500">
                  Downscaled or watermark added
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 text-pearl-300 font-sans font-medium">
                  Zero Telemetry & User Registration
                </td>
                <td className="py-3.5 px-4 text-emerald-400 bg-obsidian-900/50 border-x border-obsidian-700 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No login, no cookies, no tracking</span>
                </td>
                <td className="py-3.5 px-4 text-pearl-500">
                  Mandatory accounts or aggressive ad trackers
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Semantic Keyword Hubs (4 Deep Feature Articles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Hub 1: YouTube 4K & Shorts */}
        <article className="obsidian-card p-6 border-obsidian-700 space-y-3 bg-obsidian-950">
          <div className="flex items-center space-x-2 text-pearl-100">
            <Youtube className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold font-sans">
              4K 60fps YouTube Video & Shorts Downloader
            </h3>
          </div>
          <p className="text-xs text-pearl-500 leading-relaxed font-sans">
            Extract YouTube videos in true <strong>4K UHD (3840x2160)</strong>, <strong>1440p QHD</strong>, and
            <strong> 1080p FHD 60fps</strong>. Our backend utilizes direct DASH stream de-muxing, grabbing the
            uncompressed AV1 or VP9 video track and merging it with native high-bitrate Opus/AAC audio into a pristine
            MP4 master container. Also supports vertical <strong>YouTube Shorts (1080x1920)</strong> with 1-click
            downloads.
          </p>
          <ul className="text-xs font-mono text-pearl-400 space-y-1 list-disc list-inside pt-1">
            <li>Zero re-encoding generational quality loss</li>
            <li>Direct 10 Gbps Edge CDN handshake</li>
            <li>No software download or browser plugin required</li>
          </ul>
        </article>

        {/* Hub 2: High-Quality Audio & 320kbps MP3 */}
        <article className="obsidian-card p-6 border-obsidian-700 space-y-3 bg-obsidian-950">
          <div className="flex items-center space-x-2 text-pearl-100">
            <Music className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-bold font-sans">
              Pristine 320kbps MP3 & Lossless WAV Downloader
            </h3>
          </div>
          <p className="text-xs text-pearl-500 leading-relaxed font-sans">
            Designed for music lovers, DJs, and audio enthusiasts. Convert YouTube audio to
            <strong> 320 kbps CBR MP3 (LAME Master)</strong> or <strong>24-bit PCM WAV</strong> with a single click.
            Fast, clean, non-destructive sound extraction without confusing controls.
          </p>
          <ul className="text-xs font-mono text-pearl-400 space-y-1 list-disc list-inside pt-1">
            <li>1-Click MP3 320 kbps, MP3 256 kbps, M4A, and WAV options</li>
            <li>Full 20 Hz - 20 kHz frequency fidelity</li>
            <li>No waiting, no transcoding compression artifacts</li>
          </ul>
        </article>

        {/* Hub 3: YouTube Playlist Batch ZIP */}
        <article className="obsidian-card p-6 border-obsidian-700 space-y-3 bg-obsidian-950">
          <div className="flex items-center space-x-2 text-pearl-100">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold font-sans">
              Full YouTube Playlist Downloader to Single ZIP
            </h3>
          </div>
          <p className="text-xs text-pearl-500 leading-relaxed font-sans">
            Paste any YouTube playlist or album URL and instantly inspect up to 200 tracks. Use batch selection
            tools ("Select All", "Invert", "Clear"), preview total file payload calculations, and click
            <strong> "Download Selected as ZIP"</strong> to stream all items bundled into a single organized ZIP
            archive with extraction manifests.
          </p>
          <ul className="text-xs font-mono text-pearl-400 space-y-1 list-disc list-inside pt-1">
            <li>Batch MP3 320kbps or MP4 1080p profile selection</li>
            <li>Automated numbering (`01_`, `02_`) for clean media library importing</li>
            <li>Asynchronous streaming archiver with no server timeouts</li>
          </ul>
        </article>

        {/* Hub 4: YouTube Shorts 60fps */}
        <article className="obsidian-card p-6 border-obsidian-700 space-y-3 bg-obsidian-950">
          <div className="flex items-center space-x-2 text-pearl-100">
            <Youtube className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold font-sans">
              YouTube Shorts 60fps & Audio Extractor
            </h3>
          </div>
          <p className="text-xs text-pearl-500 leading-relaxed font-sans">
            Download <strong>YouTube Shorts in 1080x1920 60fps</strong> MP4 format with pristine synchronized audio,
            or extract isolated high-bitrate background audio in 320 kbps MP3 without loss or watermarks.
          </p>
          <ul className="text-xs font-mono text-pearl-400 space-y-1 list-disc list-inside pt-1">
            <li>Direct vertical 1080x1920 60fps MP4 download</li>
            <li>Full audio-video de-muxing with pristine sound</li>
            <li>1-click extraction of Shorts background music</li>
          </ul>
        </article>
      </div>

      {/* Step-by-Step Crawlable Guides */}
      <div className="obsidian-card p-8 border-obsidian-700 bg-obsidian-950 space-y-6">
        <h3 className="text-xl font-bold text-pearl-100 font-sans text-center">
          How to Use iHateDownloaders: 3-Step Master Guide
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-pearl-100 text-black font-mono font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="text-sm font-bold text-pearl-200">Copy & Paste URL</h4>
            <p className="text-xs text-pearl-500 leading-relaxed">
              Copy any link from YouTube (video, Shorts, or playlist) and paste
              it into the universal search bar.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-pearl-100 text-black font-mono font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="text-sm font-bold text-pearl-200">Choose Quality & Format</h4>
            <p className="text-xs text-pearl-500 leading-relaxed">
              Inspect video bitrate, codecs (AV1/VP9/H.264), resolutions up to 4K 60fps, or select clean audio
              formats (320 kbps MP3, WAV Lossless).
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-pearl-100 text-black font-mono font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="text-sm font-bold text-pearl-200">Instant 1-Click Download</h4>
            <p className="text-xs text-pearl-500 leading-relaxed">
              Click to download directly at 10 Gbps edge speeds in high-fidelity MP4 video or pristine 320kbps MP3 audio.
            </p>
          </div>
        </div>
      </div>

      {/* Semantic Keyword Cloud / Topical Authority Pills */}
      <div className="space-y-3 text-center">
        <span className="text-xs font-mono text-pearl-500">Popular Search Queries & Topics:</span>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto text-[11px] font-mono text-pearl-400">
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">YouTube 4K Downloader</span>
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">YouTube to MP3 320kbps</span>
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">YouTube 1080p 60fps</span>
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">YouTube Audio Master</span>
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">YouTube Playlist to ZIP</span>
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">Ad-Free Video Downloader</span>
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">Fast MP3 Downloader</span>
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">Lossless WAV Extractor</span>
          <span className="px-2.5 py-1 rounded bg-obsidian-900 border border-obsidian-800">YouTube Shorts Downloader 60fps</span>
        </div>
      </div>
    </section>
  );
};
