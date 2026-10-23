'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Clipboard,
  Download,
  Clock,
  Film,
  Music,
  ShieldCheck,
  Zap,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Instagram,
  ExternalLink,
  Layers,
  Heart,
  Eye,
} from 'lucide-react';
import { MediaMetadata, VideoFormat, AudioFormat, InstagramMediaItem } from '@/types';
import { formatViews } from '@/lib/engine';

interface InstagramViewProps {
  showToast: (type: 'success' | 'error' | 'info', message: string, detail?: string) => void;
}

export const InstagramView: React.FC<InstagramViewProps> = ({ showToast }) => {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');
  const hasAutoInspected = useRef(false);

  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-inspect if ?url= query parameter is passed
  useEffect(() => {
    if (urlParam && !hasAutoInspected.current) {
      hasAutoInspected.current = true;
      setUrlInput(urlParam);
      showToast('info', 'Auto-detected Instagram link', 'Probing media streams...');
      handleInspect(urlParam);
    }
  }, [urlParam]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        showToast('info', 'Pasted Instagram URL', text);
        handleInspect(text);
      }
    } catch (err) {
      showToast('error', 'Clipboard access denied', 'Paste manually with Ctrl+V');
    }
  };

  const handleInspect = async (targetUrl?: string) => {
    const queryUrl = (targetUrl || urlInput).trim();
    if (!queryUrl) {
      showToast('error', 'Input required', 'Please enter a valid Instagram Reel, Post, or Story URL');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/instagram/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: queryUrl }),
      });

      const json = await res.json();
      if (res.status === 429) {
        setMetadata(null);
        const retryAfter = json.retryAfter || 5;
        const msg = `Rate limit reached. Please wait ${retryAfter}s before inspecting again.`;
        setErrorMessage(msg);
        showToast('error', 'Rate Limit Reached', msg);
        return;
      }

      if (json.success && json.data) {
        setMetadata(json.data);
        setErrorMessage(null);
        showToast('success', 'Instagram media parsed', `${json.data.title.substring(0, 40)}...`);
      } else {
        setMetadata(null);
        const errText = json.error || 'Failed to inspect Instagram media. Please check URL and API configuration.';
        setErrorMessage(errText);
        showToast('error', 'Inspection Error', errText);
      }
    } catch (err: any) {
      setMetadata(null);
      const msg = err.message || 'Network error while attempting to inspect Instagram media.';
      setErrorMessage(msg);
      showToast('error', 'Inspection Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDirect = (url: string, filename: string, type: 'video' | 'image' | 'audio', originalPostUrl?: string) => {
    const downloadProxyUrl = `/api/instagram/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}&type=${type}${originalPostUrl ? `&postUrl=${encodeURIComponent(originalPostUrl)}` : ''}`;
    
    // Create an invisible anchor to trigger direct attachment download
    const link = document.createElement('a');
    link.href = downloadProxyUrl;
    link.setAttribute('download', `${filename}.${type === 'image' ? 'jpg' : type === 'audio' ? 'mp3' : 'mp4'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Download initiated', `Saving ${type.toUpperCase()} to your device...`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Title & Value Proposition */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-pearl-100 font-sans flex items-center justify-center gap-3 flex-wrap">
          <Instagram className="w-10 h-10 sm:w-12 sm:h-12 text-pink-500 fill-pink-500/20 shrink-0 inline-block" />
          <span>
            Instagram <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300">Reels & Post</span> Studio
          </span>
        </h1>

        <p className="text-pearl-500 text-sm sm:text-base font-sans leading-relaxed">
          High-definition media extraction for Instagram Reels, photo carousels, and original soundtrack MP3s. Direct stream downloading with zero advertising, zero pop-ups, and zero tracking.
        </p>
      </section>

      {/* Primary Input Container */}
      <div className="w-full max-w-3xl mx-auto space-y-3">
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-obsidian-950/80 border border-obsidian-700/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl focus-within:border-pink-500/60 transition-colors">
          <div className="relative flex-1 flex items-center min-w-0">
            <Search className="w-5 h-5 text-pearl-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInspect()}
              placeholder="Paste Instagram Reel, Post, or Carousel link (e.g. https://instagram.com/reel/...)"
              className="w-full bg-transparent pl-11 pr-24 py-3 text-sm font-mono text-pearl-100 placeholder-pearl-600 focus:outline-none"
            />
            {urlInput ? (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="absolute right-3 text-xs font-mono text-pearl-500 hover:text-pearl-300 px-2 py-1 rounded bg-obsidian-800"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-pearl-400 hover:text-pearl-100 hover:bg-obsidian-800 text-xs font-mono transition-all"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleInspect()}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-mono text-xs font-semibold shadow-lg shadow-pink-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Probing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Inspect Media</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="w-full max-w-3xl mx-auto p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono space-y-2 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-bold text-rose-200">Unable to retrieve Instagram media</p>
            <p className="text-rose-400 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Metadata & Download Studio Section */}
      {metadata && (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
          {/* Main Media Card */}
          <div className="p-6 rounded-2xl bg-obsidian-950/90 border border-obsidian-800 shadow-2xl backdrop-blur-md space-y-6">
            {/* Header: Author, Badge, Platform */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-pearl-200 font-mono font-bold text-sm">
                    {metadata.author ? metadata.author[0].toUpperCase() : 'I'}
                  </div>
                </div>
                <div>
                  <a
                    href={metadata.authorUrl || `https://instagram.com/${metadata.author}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-pearl-100 hover:text-pink-400 transition-colors flex items-center space-x-1.5"
                  >
                    <span>@{metadata.author}</span>
                    <ExternalLink className="w-3 h-3 text-pearl-500" />
                  </a>
                  <p className="text-xs text-pearl-500 font-mono">
                    Posted on {metadata.uploadDate}
                  </p>
                </div>
              </div>

              {/* Status / Type Pills */}
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wide bg-pink-500/10 text-pink-400 border border-pink-500/30">
                  {metadata.instagramType || 'POST'}
                </span>
                {metadata.viewCount > 0 && (
                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono bg-obsidian-900 border border-obsidian-700 text-pearl-400">
                    <Eye className="w-3 h-3" />
                    <span>{formatViews(metadata.viewCount)}</span>
                  </span>
                )}
                {metadata.likeCount && metadata.likeCount > 0 && (
                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono bg-obsidian-900 border border-obsidian-700 text-pearl-400">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>{formatViews(metadata.likeCount)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Content Display: Reel / Single Post / Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Media Preview Column */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-full aspect-[9/16] max-w-[280px] rounded-xl overflow-hidden bg-obsidian-900 border border-obsidian-800 group shadow-xl">
                  {metadata.thumbnailUrl ? (
                    <img
                      src={metadata.thumbnailUrl}
                      alt={metadata.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `/api/instagram/download?type=image&postUrl=${encodeURIComponent(metadata.url)}`;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pearl-600">
                      <Film className="w-12 h-12" />
                    </div>
                  )}

                  {metadata.instagramType === 'reel' && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-pearl-200">
                      {metadata.durationFormatted}
                    </div>
                  )}
                </div>

                {/* Quick Cover / Thumbnail Download */}
                {metadata.thumbnailUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadDirect(metadata.thumbnailUrl, `${metadata.author}_cover`, 'image', metadata.url)}
                    className="mt-3 text-xs font-mono text-pearl-400 hover:text-pearl-200 flex items-center space-x-1.5 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Download Cover Thumbnail (JPG)</span>
                  </button>
                )}
              </div>

              {/* Action Column */}
              <div className="md:col-span-7 space-y-5">
                {/* Caption / Description */}
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-pearl-100 font-sans line-clamp-2">
                    {metadata.title}
                  </h3>
                  {metadata.caption && (
                    <p className="text-xs text-pearl-500 font-sans line-clamp-3 leading-relaxed">
                      {metadata.caption}
                    </p>
                  )}
                </div>

                {/* Video Downloads (Reel or Video Post) */}
                {metadata.videoFormats && metadata.videoFormats.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-pearl-300 font-semibold">
                      <Film className="w-3.5 h-3.5 text-pink-400" />
                      <span>Video Downloads (MP4 Full Audio)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {metadata.videoFormats.map((fmt) => (
                        <button
                          key={fmt.formatId}
                          type="button"
                          onClick={() =>
                            handleDownloadDirect(
                              metadata.directDownloadUrl || metadata.videoFormats[0]?.formatId || '',
                              `${metadata.author}_reel_${fmt.quality.split(' ')[0]}`,
                              'video',
                              metadata.url
                            )
                          }
                          className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900/90 hover:bg-obsidian-800 border border-obsidian-700/80 hover:border-pink-500/50 transition-all text-left group"
                        >
                          <div>
                            <div className="text-xs font-bold text-pearl-100 group-hover:text-pink-300 transition-colors">
                              {fmt.quality}
                            </div>
                            <div className="text-[10px] font-mono text-pearl-500">
                              Direct Clean MP4 • {fmt.filesizeApproxMB} MB
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-pearl-400 group-hover:text-pearl-100 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Extraction Section */}
                {metadata.audioFormats && metadata.audioFormats.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-obsidian-800/80">
                    <div className="flex items-center justify-between text-xs font-mono text-pearl-300 font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <Music className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reel Soundtrack Extraction</span>
                      </div>
                      {metadata.audioTitle && (
                        <span className="text-[10px] text-pearl-500 truncate max-w-[200px]">
                          {metadata.audioTitle}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadDirect(
                            metadata.audioUrl || metadata.directDownloadUrl || '',
                            `${metadata.author}_reel_soundtrack_320k`,
                            'audio',
                            metadata.url
                          )
                        }
                        className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900/90 hover:bg-obsidian-800 border border-obsidian-700/80 hover:border-emerald-500/50 transition-all text-left group"
                      >
                        <div>
                          <div className="text-xs font-bold text-pearl-100 group-hover:text-emerald-300 transition-colors">
                            MP3 320 kbps Master
                          </div>
                          <div className="text-[10px] font-mono text-pearl-500">
                            Studio Audio • Full Bandwidth
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-pearl-400 group-hover:text-pearl-100 transition-colors flex-shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadDirect(
                            metadata.audioUrl || metadata.directDownloadUrl || '',
                            `${metadata.author}_reel_aac`,
                            'audio',
                            metadata.url
                          )
                        }
                        className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900/90 hover:bg-obsidian-800 border border-obsidian-700/80 hover:border-emerald-500/50 transition-all text-left group"
                      >
                        <div>
                          <div className="text-xs font-bold text-pearl-100 group-hover:text-emerald-300 transition-colors">
                            M4A / AAC 256 kbps
                          </div>
                          <div className="text-[10px] font-mono text-pearl-500">
                            Native Apple CoreAudio
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-pearl-400 group-hover:text-pearl-100 transition-colors flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Carousel Multi-Slide Gallery (if carousel post) */}
            {metadata.carouselItems && metadata.carouselItems.length > 1 && (
              <div className="pt-6 border-t border-obsidian-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-pearl-100 font-sans">
                      Carousel Slides ({metadata.carouselItems.length} Items)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-pearl-500">
                    High-Res Multi-Slide Gallery
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {metadata.carouselItems.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="relative rounded-xl overflow-hidden bg-obsidian-900 border border-obsidian-800 group shadow-md"
                    >
                      <div className="aspect-square w-full">
                        <img
                          src={slide.thumbnailUrl || slide.url}
                          alt={`Slide ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-2.5 bg-obsidian-950/90 border-t border-obsidian-800 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-pearl-400">
                          Slide {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadDirect(
                              slide.url,
                              `${metadata.author}_slide_${idx + 1}`,
                              slide.type,
                              metadata.url
                            )
                          }
                          className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-pink-600 text-pearl-300 hover:text-white transition-colors"
                          title={`Download Slide ${idx + 1}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
        <div className="p-5 rounded-2xl bg-obsidian-950/70 border border-obsidian-800/80 space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Film className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-pearl-100 font-sans">Full HD Reels in 60fps</h4>
          <p className="text-xs text-pearl-500 font-sans leading-relaxed">
            Extracts pristine 1080x1920 MP4 vertical streams directly from Instagram CDN edge nodes without generational compression.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-obsidian-950/70 border border-obsidian-800/80 space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Music className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-pearl-100 font-sans">Studio Master MP3 Audio</h4>
          <p className="text-xs text-pearl-500 font-sans leading-relaxed">
            Rip trending background soundtracks and original audio from Reels directly as high-bitrate 320 kbps MP3 files.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-obsidian-950/70 border border-obsidian-800/80 space-y-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-pearl-100 font-sans">Photo & Carousel Batch</h4>
          <p className="text-xs text-pearl-500 font-sans leading-relaxed">
            Seamlessly grab individual full-resolution slides from multi-item Instagram carousel albums without quality degradation.
          </p>
        </div>
      </section>

      {/* Instagram FAQ Section */}
      <section className="space-y-4 pt-8 border-t border-obsidian-800/80 max-w-3xl mx-auto">
        <h3 className="text-lg font-bold text-pearl-100 font-sans text-center">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {[
            {
              q: 'How do I download Instagram Reels in Full HD for free?',
              a: 'Copy the URL of the Instagram Reel from your browser or mobile app, paste it into the search box above, click "Inspect Media", and click "Download MP4". iHateDownloaders saves the video directly to your downloads.',
            },
            {
              q: 'Can I extract audio and music from Instagram Reels as MP3?',
              a: 'Yes. Every inspected Reel gives you a 1-click option to extract the soundtrack as a 320 kbps MP3 file or 256 kbps AAC file.',
            },
            {
              q: 'How does the RapidAPI integration work?',
              a: 'The server securely communicates with RapidAPI using your server-side INSTAGRAM_API_KEY stored in .env.local. Your secret key is never sent to the browser.',
            },
            {
              q: 'Can I download private Instagram posts?',
              a: 'No. To protect privacy and adhere to security guidelines, iHateDownloaders only extracts publicly accessible Reels, Posts, and Carousels.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-obsidian-950 border border-obsidian-800 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs font-mono text-pearl-200 hover:text-white transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-pearl-500 transition-transform duration-200 ${
                    openFaq === idx ? 'transform rotate-180 text-pink-400' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs font-sans text-pearl-400 leading-relaxed border-t border-obsidian-800/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
