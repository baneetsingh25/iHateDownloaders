import { PlatformType, MediaMetadata, VideoFormat, AudioFormat, PlaylistItem } from '@/types';

export function detectPlatform(url: string): PlatformType {
  const clean = url.trim().toLowerCase();
  if (clean.includes('youtube.com/shorts') || (clean.includes('youtu.be') && clean.includes('shorts'))) {
    return 'shorts';
  }
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    return 'youtube';
  }
  return 'unknown';
}

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const match = str.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(mins / 60);
  if (hours > 0) {
    const remMins = mins % 60;
    return `${hours}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatSecondsToTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

export function parseTimecodeToSeconds(timecode: string): number {
  const parts = timecode.split(':');
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return mins * 60 + secs;
  }
  return parseFloat(timecode) || 0;
}

export function formatViews(views: number): string {
  if (!views) return '0';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toLocaleString();
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

// Built-in high-fidelity demo streams for instantaneous testing & offline resilience
export const DEMO_STREAMS: Record<string, MediaMetadata> = {
  youtube_4k: {
    id: 'demo-yt-4k',
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    platform: 'youtube',
    title: 'COSTA RICA IN 4K 60fps HDR (Ultra HD) - Cinematic Wildlife & Nature Odyssey',
    author: 'Jacob + Katie Schwarz',
    authorUrl: 'https://www.youtube.com/@jacobkatieschwarz',
    duration: 314,
    durationFormatted: '05:14',
    viewCount: 124890210,
    likeCount: 842000,
    uploadDate: '2024-04-12',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    dynamicRange: 'HDR10',
    videoFormats: [
      { formatId: 'yt-4k-60', quality: '4K UHD (2160p 60fps)', resolution: '3840x2160', fps: 60, container: 'mp4', vcodec: 'av01.0.12M.08', hasAudio: true, filesizeApproxMB: 482.4, bitrateKbps: 22400 },
      { formatId: 'yt-1440p', quality: '1440p QHD (60fps)', resolution: '2560x1440', fps: 60, container: 'mp4', vcodec: 'vp9', hasAudio: true, filesizeApproxMB: 265.1, bitrateKbps: 11800 },
      { formatId: 'yt-1080p', quality: '1080p FHD (60fps Master)', resolution: '1920x1080', fps: 60, container: 'mp4', vcodec: 'avc1.64002a', hasAudio: true, filesizeApproxMB: 142.8, bitrateKbps: 5200 },
      { formatId: 'yt-720p', quality: '720p HD (60fps)', resolution: '1280x720', fps: 60, container: 'mp4', vcodec: 'avc1.4d401f', hasAudio: true, filesizeApproxMB: 76.2, bitrateKbps: 2800 },
      { formatId: 'yt-480p', quality: '480p SD', resolution: '854x480', fps: 30, container: 'mp4', vcodec: 'avc1.4d401e', hasAudio: true, filesizeApproxMB: 38.5, bitrateKbps: 1200 },
    ],
    audioFormats: [
      { formatId: 'yt-mp3-320', label: 'MP3 320 kbps (CBR Studio Master)', codec: 'mp3', bitrateKbps: 320, sampleRate: 48000, channels: 2, filesizeApproxMB: 12.6 },
      { formatId: 'yt-m4a-256', label: 'M4A / AAC 256 kbps (Apple CoreAudio)', codec: 'm4a', bitrateKbps: 256, sampleRate: 48000, channels: 2, filesizeApproxMB: 10.1 },
      { formatId: 'yt-wav-lossless', label: 'WAV 24-bit PCM (Lossless Broadcast Master)', codec: 'wav', bitrateKbps: 2304, sampleRate: 48000, channels: 2, filesizeApproxMB: 86.4 },
      { formatId: 'yt-opus-160', label: 'Opus 160 kbps (Native YouTube WebM Stream)', codec: 'opus', bitrateKbps: 160, sampleRate: 48000, channels: 2, filesizeApproxMB: 6.3 },
    ],
  },
  youtube_shorts: {
    id: 'demo-yt-shorts',
    url: 'https://www.youtube.com/shorts/3f5Wp8M0x9E',
    platform: 'shorts',
    isShorts: true,
    title: 'Sound Design Magic: Creating the Cyberpunk Blaster FX from Scratch',
    author: 'AudioArchitect Labs',
    authorUrl: 'https://www.youtube.com/@audioarchitect',
    duration: 52,
    durationFormatted: '00:52',
    viewCount: 4210500,
    likeCount: 295000,
    uploadDate: '2024-05-18',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    dynamicRange: 'SDR',
    videoFormats: [
      { formatId: 'shorts-1080p', quality: '1080x1920 FHD (60fps Vertical)', resolution: '1080x1920', fps: 60, container: 'mp4', vcodec: 'avc1.64002a', hasAudio: true, filesizeApproxMB: 28.4, bitrateKbps: 4500 },
      { formatId: 'shorts-720p', quality: '720x1280 HD (60fps Vertical)', resolution: '720x1280', fps: 60, container: 'mp4', vcodec: 'avc1.4d401f', hasAudio: true, filesizeApproxMB: 16.1, bitrateKbps: 2400 },
    ],
    audioFormats: [
      { formatId: 'shorts-mp3-320', label: 'MP3 320 kbps (CBR Studio Master)', codec: 'mp3', bitrateKbps: 320, sampleRate: 48000, channels: 2, filesizeApproxMB: 2.1 },
      { formatId: 'shorts-wav', label: 'WAV 24-bit PCM (Lossless)', codec: 'wav', bitrateKbps: 2304, sampleRate: 48000, channels: 2, filesizeApproxMB: 14.3 },
    ],
  },
  youtube_playlist: {
    id: 'demo-yt-playlist',
    url: 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn5nZ4J6k7q8X2a9e3',
    platform: 'youtube',
    isPlaylist: true,
    title: 'Electronic Odyssey: Atmospheric Synthesizers & Modular Soundscapes 2026',
    author: 'Modular Waves Collective',
    authorUrl: 'https://www.youtube.com/@modularwaves',
    duration: 2180,
    durationFormatted: '36:20',
    viewCount: 890450,
    uploadDate: '2024-03-01',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    dynamicRange: 'SDR',
    videoFormats: [
      { formatId: 'pl-1080p', quality: '1080p FHD (Batch Default)', resolution: '1920x1080', fps: 60, container: 'mp4', vcodec: 'avc1', hasAudio: true, filesizeApproxMB: 110.0, bitrateKbps: 4500 },
      { formatId: 'pl-720p', quality: '720p HD', resolution: '1280x720', fps: 30, container: 'mp4', vcodec: 'avc1', hasAudio: true, filesizeApproxMB: 55.0, bitrateKbps: 2200 },
    ],
    audioFormats: [
      { formatId: 'pl-mp3-320', label: 'MP3 320 kbps (All Tracks Batch)', codec: 'mp3', bitrateKbps: 320, sampleRate: 48000, channels: 2, filesizeApproxMB: 8.5 },
    ],
    playlistItems: [
      { id: 'track-1', title: '01. Neon Horizon (Analog Drift Synth Intro)', duration: 245, durationFormatted: '04:05', thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', author: 'Modular Waves', url: 'https://www.youtube.com/watch?v=track1', selected: true, estSizeMB: 74.2 },
      { id: 'track-2', title: '02. Sub-Bass Pulse in D Minor (Moog Sub 37 Live)', duration: 312, durationFormatted: '05:12', thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80', author: 'Modular Waves', url: 'https://www.youtube.com/watch?v=track2', selected: true, estSizeMB: 94.5 },
      { id: 'track-3', title: '03. Polyphonic Echoes across the Obsidian Grid', duration: 280, durationFormatted: '04:40', thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80', author: 'Modular Waves', url: 'https://www.youtube.com/watch?v=track3', selected: true, estSizeMB: 85.0 },
      { id: 'track-4', title: '04. Glitch Sequence 09 (Eurorack Granular Texture)', duration: 198, durationFormatted: '03:18', thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80', author: 'Modular Waves', url: 'https://www.youtube.com/watch?v=track4', selected: true, estSizeMB: 59.8 },
      { id: 'track-5', title: '05. Low-Frequency Oscillations & Tape Delay', duration: 350, durationFormatted: '05:50', thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80', author: 'Modular Waves', url: 'https://www.youtube.com/watch?v=track5', selected: true, estSizeMB: 106.1 },
      { id: 'track-6', title: '06. Midnight Filter Sweep (Oberheim Matrix-12)', duration: 265, durationFormatted: '04:25', thumbnailUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80', author: 'Modular Waves', url: 'https://www.youtube.com/watch?v=track6', selected: true, estSizeMB: 80.3 },
      { id: 'track-7', title: '07. Ambient Resonance & Convolution Reverb Outro', duration: 530, durationFormatted: '08:50', thumbnailUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80', author: 'Modular Waves', url: 'https://www.youtube.com/watch?v=track7', selected: true, estSizeMB: 160.7 },
    ],
  },
};
