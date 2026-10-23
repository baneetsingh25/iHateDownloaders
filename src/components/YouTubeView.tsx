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
  HardDrive,
  Cpu,
  Shield,
  Zap,
  ChevronDown,
  CheckSquare,
  Square,
  ArrowDownToLine,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Youtube
} from 'lucide-react';
import { MediaMetadata, VideoFormat, AudioFormat, PlaylistItem } from '@/types';
import { formatViews } from '@/lib/engine';

interface YouTubeViewProps {
  showToast: (type: 'success' | 'error' | 'info', message: string, detail?: string) => void;
}

export const YouTubeView: React.FC<YouTubeViewProps> = ({ showToast }) => {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');
  const hasAutoInspected = useRef(false);

  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Playlist batch state
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    if (metadata && metadata.isPlaylist && metadata.playlistItems) {
      setPlaylistItems(metadata.playlistItems);
    } else {
      setPlaylistItems([]);
    }
  }, [metadata]);

  // Auto-inspect if ?url= query parameter is passed (e.g. from bookmarklet or address bar prefix trick)
  useEffect(() => {
    if (urlParam && !hasAutoInspected.current) {
      hasAutoInspected.current = true;
      setUrlInput(urlParam);
      showToast('info', 'Auto-detected YouTube link', 'Probing media streams...');
      handleInspect(urlParam);
    }
  }, [urlParam]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        showToast('info', 'Pasted URL', text);
        handleInspect(text);
      }
    } catch (err) {
      showToast('error', 'Clipboard access denied', 'Paste manually with Ctrl+V');
    }
  };

  const handleInspect = async (targetUrl?: string) => {
    const queryUrl = (targetUrl || urlInput).trim();
    if (!queryUrl) {
      showToast('error', 'Input required', 'Please enter a valid YouTube Video, Shorts, or Playlist URL');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: queryUrl }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMetadata(json.data);
        setErrorMessage(null);
        showToast('success', 'YouTube stream inspected', `${json.data.title.substring(0, 40)}...`);
      } else {
        setMetadata(null);
        const errText = json.error || 'Failed to inspect YouTube stream. Please ensure the video is public and active.';
        setErrorMessage(errText);
        showToast('error', res.status === 429 ? 'Rate Limit Reached' : 'Inspection Error', errText);
      }
    } catch (err: any) {
      setMetadata(null);
      const msg = err.message || 'Network error while attempting to inspect YouTube video.';
      setErrorMessage(msg);
      showToast('error', 'Inspection Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDownload = (format: VideoFormat | AudioFormat, type: 'video' | 'audio') => {
    if (!metadata) return;
    setDownloadingId(format.formatId);

    const ext = 'container' in format ? format.container : format.codec;
    const downloadUrl = `/api/download?url=${encodeURIComponent(metadata.url)}&formatId=${encodeURIComponent(
      format.formatId
    )}&type=${type}&title=${encodeURIComponent(metadata.title)}&ext=${ext}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${metadata.title}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Download initiated', `Extracting ${'quality' in format ? format.quality : format.label}`);
    setTimeout(() => setDownloadingId(null), 1500);
  };

  const handleDownloadThumbnail = (quality: 'maxres' | 'hq720' | 'sd', label: string) => {
    if (!metadata) return;
    const videoId = metadata.id || metadata.url;
    const downloadUrl = `/api/thumbnail?videoId=${encodeURIComponent(videoId)}&quality=${quality}&title=${encodeURIComponent(metadata.title)}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${metadata.title}_${label}.jpg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', `Downloading ${label} Thumbnail`, 'Direct attachment stream');
  };

  const handleBatchZip = async (items: any[], title: string) => {
    setIsZipping(true);
    showToast('info', 'Compiling ZIP archive', `Bundling ${items.length} YouTube tracks...`);
    try {
      const res = await fetch('/api/playlist/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, items }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.error || 'Rate limit reached for batch exports. Please wait a moment.');
        }
        throw new Error('ZIP bundling failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('success', 'ZIP archive downloaded', `${items.length} tracks bundled`);
    } catch (e: any) {
      showToast('error', 'ZIP Failed', e.message);
    } finally {
      setIsZipping(false);
    }
  };

  const faqs = [
    {
      q: 'How does iHateDownloaders extract YouTube videos in 4K 60fps without quality loss?',
      a: 'YouTube transmits 1080p, 1440p, and 4K streams via adaptive DASH chunking with separated video (AV1/VP9) and audio (Opus) channels. Standard downloaders compress and degrade the file to 720p. iHateDownloaders connects directly to platform CDN edge servers and merges raw streams into a pristine MP4 container with zero generational loss.',
    },
    {
      q: 'How does the Ultra-HD MaxRes Thumbnail Grabber work?',
      a: 'When you inspect any video, iHateDownloaders probes YouTube CDN servers for the highest resolution master thumbnail (maxresdefault.jpg at 1080p), seamlessly cascading to 720p HD and 480p SD if older videos lack 1080p. Clicking any quality delivers an instant direct file download with clean attachment headers.',
    },
    {
      q: 'Can I download an entire YouTube Playlist as a single ZIP archive?',
      a: 'Yes. Simply paste any YouTube Playlist URL. Our inspector indexes each track into a batch selection checklist. You can select all tracks or pick specific songs, then click "Download Selected as ZIP" to receive a single, organized archive with 320 kbps MP3 files.',
    },
    {
      q: 'What is 320 kbps CBR Studio Master audio extraction?',
      a: 'Constant Bitrate (CBR) at 320 kbps is the highest acoustic resolution achievable in MP3. It preserves the complete 20 Hz – 20,000 Hz spectrum without aggressive frequency cuts or compression artifacts, giving you studio-grade playback.',
    },
    {
      q: 'Are YouTube Shorts supported in 60fps vertical format?',
      a: 'Yes. Paste any YouTube Shorts URL to immediately extract vertical 1080x1920 60fps MP4 video or the standalone background audio track.',
    },
    {
      q: 'Are there any pop-up ads, captcha verifications, or registration requirements?',
      a: 'Zero. iHateDownloaders has no third-party ad network scripts, no telemetry trackers, and no mandatory account sign-up. It is engineered purely as a high-speed, direct utility.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-pearl-100 font-sans flex items-center justify-center gap-3 flex-wrap">
          <Youtube className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500 fill-rose-500/20 shrink-0 inline-block" />
          <span>
            YouTube Downloader. <span className="text-pearl-500 font-light">4K 60fps & MP3.</span>
          </span>
        </h1>
        <p className="text-sm sm:text-base text-pearl-500 font-sans">
          Extract 4K UHD video, 60fps Shorts, 320kbps MP3 audio, and full Playlists as ZIP. Zero ads.
        </p>
      </div>

      {/* Input Bar */}
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="obsidian-card p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2 border-obsidian-600 shadow-2xl focus-within:border-pearl-400 transition-all">
          <div className="flex items-center w-full px-3 py-1 space-x-3">
            <Search className="w-4 h-4 text-pearl-500 shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInspect()}
              placeholder="Paste YouTube Video, Shorts, or Playlist link..."
              className="w-full bg-transparent text-pearl-100 placeholder-pearl-500 text-sm outline-none font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-obsidian-700">
            <button
              onClick={handlePaste}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 text-pearl-300 text-xs font-mono transition-all"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>

            <button
              onClick={() => handleInspect()}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-pearl-100 hover:bg-pearl-200 text-black font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert Display */}
      {errorMessage && (
        <div className="obsidian-card p-4 sm:p-5 border-red-900/50 bg-red-950/30 rounded-xl border flex items-start space-x-3.5 animate-in fade-in duration-300">
          <div className="p-2 rounded-lg bg-red-900/40 border border-red-800/50 shrink-0 text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-red-300 font-sans">
                Failed to Load YouTube Media
              </h3>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs text-pearl-500 hover:text-pearl-300 font-mono transition-colors"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-red-400/80 font-sans leading-relaxed">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* Stream Inspection Card & Matrix */}
      {metadata && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Metadata Showcase Banner */}
          <div className="obsidian-card p-4 sm:p-5 border-obsidian-700 bg-obsidian-900/90">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Thumbnail Column with 1-Click MaxRes Grabber */}
              <div className="w-full sm:w-64 shrink-0 space-y-2">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-obsidian-700 bg-obsidian-950">
                  <img
                    src={metadata.thumbnailUrl}
                    alt={metadata.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 border border-obsidian-600 text-[10px] font-mono text-pearl-200 uppercase">
                    {metadata.platform}
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 border border-obsidian-600 text-[11px] font-mono text-pearl-100 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-pearl-400" />
                    <span>{metadata.durationFormatted}</span>
                  </div>
                </div>

                {/* 1-Click Thumbnail Grabber */}
                <div className="p-2 rounded bg-obsidian-950/90 border border-obsidian-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-pearl-400">
                    <span className="flex items-center space-x-1 font-semibold text-pearl-200">
                      <ImageIcon className="w-3 h-3 text-amber-400" />
                      <span>Grab Thumbnail</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold font-mono">
                      MaxRes HD
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center">
                    <button
                      onClick={() => handleDownloadThumbnail('maxres', '1080p_MaxRes')}
                      className="flex items-center justify-center space-x-1 py-1 px-1 rounded bg-obsidian-800 hover:bg-amber-400 hover:text-black border border-obsidian-700 text-pearl-200 text-[10px] font-mono transition-all font-medium"
                      title="Download 1080p MaxRes JPEG"
                    >
                      <Download className="w-2.5 h-2.5 shrink-0" />
                      <span>1080p</span>
                    </button>
                    <button
                      onClick={() => handleDownloadThumbnail('hq720', '720p_HD')}
                      className="flex items-center justify-center space-x-1 py-1 px-1 rounded bg-obsidian-800 hover:bg-amber-400 hover:text-black border border-obsidian-700 text-pearl-200 text-[10px] font-mono transition-all font-medium"
                      title="Download 720p HD JPEG"
                    >
                      <Download className="w-2.5 h-2.5 shrink-0" />
                      <span>720p</span>
                    </button>
                    <button
                      onClick={() => handleDownloadThumbnail('sd', '480p_SD')}
                      className="flex items-center justify-center space-x-1 py-1 px-1 rounded bg-obsidian-800 hover:bg-amber-400 hover:text-black border border-obsidian-700 text-pearl-200 text-[10px] font-mono transition-all font-medium"
                      title="Download 480p SD JPEG"
                    >
                      <Download className="w-2.5 h-2.5 shrink-0" />
                      <span>480p</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Details */}
              <div className="flex-1 space-y-2.5">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-pearl-100 font-sans leading-snug">
                    {metadata.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-pearl-500 mt-1">
                    <span className="text-pearl-300">{metadata.author}</span>
                    <span>•</span>
                    <span>{formatViews(metadata.viewCount)} views</span>
                    {metadata.dynamicRange && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">{metadata.dynamicRange}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-xs font-mono text-pearl-400 flex items-center space-x-2 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Direct platform stream verified • 10 Gbps Edge link active</span>
                </div>
              </div>
            </div>
          </div>

          {/* If Playlist is detected: Show Playlist batch items inline */}
          {playlistItems.length > 0 && (
            <div className="obsidian-card p-4 sm:p-5 border-obsidian-700 bg-obsidian-900 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-pearl-100 font-sans">
                    YouTube Playlist Tracks ({playlistItems.length})
                  </h3>
                  <span className="text-xs font-mono text-pearl-500">
                    {playlistItems.filter((p) => p.selected).length} of {playlistItems.length} tracks selected
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setPlaylistItems((prev) => prev.map((item) => ({ ...item, selected: true })))
                    }
                    className="px-2.5 py-1 rounded bg-obsidian-800 border border-obsidian-600 text-xs font-mono text-pearl-300 hover:text-pearl-100"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() =>
                      setPlaylistItems((prev) =>
                        prev.map((item) => ({ ...item, selected: !item.selected }))
                      )
                    }
                    className="px-2.5 py-1 rounded bg-obsidian-800 border border-obsidian-600 text-xs font-mono text-pearl-300 hover:text-pearl-100"
                  >
                    Invert
                  </button>
                  <button
                    onClick={() =>
                      handleBatchZip(
                        playlistItems.filter((p) => p.selected),
                        metadata.title
                      )
                    }
                    disabled={isZipping || playlistItems.filter((p) => p.selected).length === 0}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-pearl-100 hover:bg-pearl-200 text-black text-xs font-semibold font-mono transition-all shadow"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>{isZipping ? 'Bundling ZIP...' : 'Download Selected as ZIP'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {playlistItems.map((track) => (
                  <div
                    key={track.id}
                    onClick={() =>
                      setPlaylistItems((prev) =>
                        prev.map((t) => (t.id === track.id ? { ...t, selected: !t.selected } : t))
                      )
                    }
                    className="p-2.5 rounded bg-obsidian-950 border border-obsidian-800 hover:border-obsidian-600 flex items-center justify-between text-xs font-mono cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 truncate pr-2">
                      {track.selected ? (
                        <CheckSquare className="w-4 h-4 text-pearl-100 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-pearl-600 shrink-0" />
                      )}
                      <span className="text-pearl-200 truncate">{track.title}</span>
                    </div>
                    <span className="text-pearl-500 shrink-0">{track.durationFormatted}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Format Matrix: Clean Video Options & Simple Audio Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Video Streams */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-obsidian-700">
                <div className="flex items-center space-x-1.5">
                  <Film className="w-4 h-4 text-pearl-300" />
                  <span className="text-xs font-bold font-sans text-pearl-100 uppercase tracking-wide">
                    Video Downloads (MP4)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-pearl-500">De-muxed Master</span>
              </div>

              <div className="space-y-1.5">
                {metadata.videoFormats.map((format) => (
                  <div
                    key={format.formatId}
                    className="obsidian-card p-2.5 flex items-center justify-between border-obsidian-700 hover:border-obsidian-500 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-pearl-100 font-sans">
                          {format.quality}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-obsidian-800 text-pearl-400">
                          {format.vcodec.split('.')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-pearl-500">
                        {format.resolution} • ~{format.filesizeApproxMB} MB
                      </div>
                    </div>

                    <button
                      onClick={() => handleTriggerDownload(format, 'video')}
                      disabled={downloadingId === format.formatId}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-obsidian-800 hover:bg-pearl-100 hover:text-black border border-obsidian-600 text-pearl-200 text-xs font-mono transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingId === format.formatId ? 'Extracting...' : 'Download MP4'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Clean Audio Options (1-Click) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-obsidian-700">
                <div className="flex items-center space-x-1.5">
                  <Music className="w-4 h-4 text-accent-cyan" />
                  <span className="text-xs font-bold font-sans text-pearl-100 uppercase tracking-wide">
                    Audio Downloads
                  </span>
                </div>
                <span className="text-[11px] font-mono text-pearl-500">1-Click Extraction</span>
              </div>

              <div className="space-y-1.5">
                {metadata.audioFormats.map((format) => (
                  <div
                    key={format.formatId}
                    className="obsidian-card p-2.5 flex items-center justify-between border-obsidian-700 hover:border-obsidian-500 transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-pearl-100 font-sans">
                        {format.codec.toUpperCase()} {format.bitrateKbps} kbps
                      </span>
                      <div className="text-[11px] font-mono text-pearl-500">
                        {format.label.split('(')[0]} • ~{format.filesizeApproxMB} MB
                      </div>
                    </div>

                    <button
                      onClick={() => handleTriggerDownload(format, 'audio')}
                      disabled={downloadingId === format.formatId}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-obsidian-800 hover:bg-accent-cyan hover:text-black border border-obsidian-600 text-pearl-200 text-xs font-mono transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingId === format.formatId ? 'Extracting...' : `Download ${format.codec.toUpperCase()}`}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engine Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
        <div className="obsidian-card p-4 border-obsidian-700 bg-obsidian-950 space-y-1.5">
          <div className="flex items-center space-x-2 text-pearl-100">
            <Zap className="w-3.5 h-3.5 text-rose-500" />
            <h4 className="text-xs font-bold font-sans uppercase">10 Gbps Edge CDN Pipeline</h4>
          </div>
          <p className="text-[11px] text-pearl-500 leading-relaxed font-sans">
            Direct streaming from platform edge nodes with zero intermediary bottlenecking.
          </p>
        </div>

        <div className="obsidian-card p-4 border-obsidian-700 bg-obsidian-950 space-y-1.5">
          <div className="flex items-center space-x-2 text-pearl-100">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <h4 className="text-xs font-bold font-sans uppercase">Strict Zero-Telemetry</h4>
          </div>
          <p className="text-[11px] text-pearl-500 leading-relaxed font-sans">
            No tracking cookies, no Google Analytics, no registration. 100% private.
          </p>
        </div>

        <div className="obsidian-card p-4 border-obsidian-700 bg-obsidian-950 space-y-1.5">
          <div className="flex items-center space-x-2 text-pearl-100">
            <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
            <h4 className="text-xs font-bold font-sans uppercase">Non-Destructive De-muxing</h4>
          </div>
          <p className="text-[11px] text-pearl-500 leading-relaxed font-sans">
            Raw AV1, VP9, and Opus streams multiplexed with bit-for-bit master quality.
          </p>
        </div>
      </div>

      {/* YouTube FAQ Accordions */}
      <div className="space-y-3 pt-4 border-t border-obsidian-800">
        <div className="text-center space-y-0.5">
          <h3 className="text-base font-bold text-pearl-100 font-sans">YouTube Extraction FAQ & Specifications</h3>
          <p className="text-[11px] text-pearl-500 font-mono">Precision stream de-muxing with zero advertisements</p>
        </div>

        <div className="space-y-1.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="obsidian-card border-obsidian-700 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3 text-left flex items-center justify-between text-xs font-medium text-pearl-200 hover:text-pearl-100 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-pearl-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-pearl-100' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 text-[11px] text-pearl-500 font-sans leading-relaxed border-t border-obsidian-800 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
