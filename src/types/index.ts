export type PlatformType = 'youtube' | 'shorts' | 'unknown';

export interface VideoFormat {
  formatId: string;
  quality: string; // e.g., '4K UHD', '1440p QHD', '1080p FHD', '720p HD', '480p SD'
  resolution: string; // e.g., '3840x2160', '1920x1080'
  fps: number;
  container: 'mp4' | 'webm' | 'mkv';
  vcodec: string;
  hasAudio: boolean;
  filesizeApproxMB: number;
  bitrateKbps: number;
  isDirectDownload?: boolean;
}

export interface AudioFormat {
  formatId: string;
  label: string; // e.g., 'MP3 320 kbps (CBR Studio Master)', 'WAV Lossless PCM'
  codec: 'mp3' | 'wav' | 'm4a' | 'opus' | 'ogg';
  bitrateKbps: number;
  sampleRate: number; // e.g. 48000, 44100
  channels: number;
  filesizeApproxMB: number;
}

export interface PlaylistItem {
  id: string;
  title: string;
  duration: number; // seconds
  durationFormatted: string;
  thumbnailUrl: string;
  author: string;
  url: string;
  selected?: boolean;
  estSizeMB: number;
  status?: 'idle' | 'queued' | 'downloading' | 'completed' | 'error';
}

export interface MediaMetadata {
  id: string;
  url: string;
  platform: PlatformType;
  title: string;
  author: string;
  authorUrl?: string;
  duration: number;
  durationFormatted: string;
  viewCount: number;
  likeCount?: number;
  uploadDate: string;
  thumbnailUrl: string;
  dynamicRange: 'SDR' | 'HDR10' | 'Dolby Vision';
  videoFormats: VideoFormat[];
  audioFormats: AudioFormat[];
  // Platform specific:
  isShorts?: boolean;
  isPlaylist?: boolean;
  playlistItems?: PlaylistItem[];
  isolatedAudioUrl?: string;
}

export interface AudioStudioOptions {
  sourceUrl?: string;
  sourceBlob?: Blob;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
  albumArtUrl: string;
  format: 'mp3-320' | 'mp3-256' | 'wav' | 'm4a' | 'ogg';
  trimStart: number; // in seconds
  trimEnd: number; // in seconds
  dspNormalization: boolean; // -14 LUFS target
  dspBassBoost: boolean; // +4.5 dB low shelf at 80Hz
  dspVocalRemoval: boolean; // Mid-Side vocal cancellation
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  platform: PlatformType;
  format: string;
  filesizeMB: number;
  durationFormatted: string;
  downloadUrl?: string;
}
