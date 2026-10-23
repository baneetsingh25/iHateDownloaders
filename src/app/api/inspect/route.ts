import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { detectPlatform, formatDuration, extractYouTubeId } from '@/lib/engine';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { MediaMetadata, VideoFormat, AudioFormat, PlaylistItem } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    // Defense-in-depth rate limiting
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`${ip}:inspect`, RATE_LIMITS.inspect.max, RATE_LIMITS.inspect.windowMs);
    if (!limitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit reached. Please wait ${limitCheck.retryAfterSeconds} seconds before inspecting again.`,
          retryAfter: limitCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(limitCheck.retryAfterSeconds),
            'X-RateLimit-Limit': String(limitCheck.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(limitCheck.resetTimeMs),
          },
        }
      );
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim();
    const platform = detectPlatform(cleanUrl);
    const isPlaylist = cleanUrl.includes('playlist?list=') || cleanUrl.includes('&list=') || cleanUrl.includes('?list=') || cleanUrl.includes('/playlist');
    const isShorts = platform === 'shorts' || cleanUrl.includes('/shorts/');

    // Attempt live probe with yt-dlp for YouTube video/playlist
    try {
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const cmd = isPlaylist
          ? `${pythonCmd} -m yt_dlp --dump-json --flat-playlist --playlist-end 30 --no-warnings "${cleanUrl}"`
          : `${pythonCmd} -m yt_dlp --dump-json --no-warnings --no-playlist "${cleanUrl}"`;

        const { stdout } = await execAsync(cmd, { timeout: 14000, maxBuffer: 15 * 1024 * 1024 });

        if (stdout && stdout.trim().length > 0) {
          const lines = stdout.trim().split('\n').filter((l) => l.trim().length > 0);
          const firstEntry = JSON.parse(lines[0]);

          // Handle Playlist response
          if (isPlaylist && lines.length > 0) {
            const playlistTitle = firstEntry.playlist_title || firstEntry.playlist || 'YouTube Playlist Collection';
            const playlistItems: PlaylistItem[] = lines.map((line, idx) => {
              try {
                const entry = JSON.parse(line);
                const dur = entry.duration || 210;
                const thumb =
                  entry.thumbnails?.[entry.thumbnails.length - 1]?.url ||
                  entry.thumbnails?.[0]?.url ||
                  entry.thumbnail ||
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';

                return {
                  id: entry.id || `track-${idx + 1}`,
                  title: entry.title || `Track ${idx + 1}`,
                  duration: dur,
                  durationFormatted: formatDuration(dur),
                  thumbnailUrl: thumb,
                  author: entry.uploader || entry.channel || 'Verified Artist',
                  url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
                  selected: true,
                  estSizeMB: Math.round(((dur * 320) / 8 / 1024) * 10) / 10 || 8.5,
                };
              } catch (e) {
                return null;
              }
            }).filter(Boolean) as PlaylistItem[];

            const totalDur = playlistItems.reduce((acc, t) => acc + t.duration, 0);

            const playlistMeta: MediaMetadata = {
              id: firstEntry.playlist_id || 'playlist-' + Date.now(),
              url: cleanUrl,
              platform: 'youtube',
              isPlaylist: true,
              playlistItems,
              title: playlistTitle,
              author: firstEntry.channel || firstEntry.uploader || 'YouTube Channel',
              duration: totalDur,
              durationFormatted: formatDuration(totalDur),
              viewCount: 450000,
              uploadDate: new Date().toISOString().split('T')[0],
              thumbnailUrl: playlistItems[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
              dynamicRange: 'SDR',
              videoFormats: [
                { formatId: 'best-1080p', quality: '1080p FHD (Batch Default)', resolution: '1920x1080', fps: 60, container: 'mp4', vcodec: 'avc1', hasAudio: true, filesizeApproxMB: 85.0, bitrateKbps: 4500 },
                { formatId: 'best-720p', quality: '720p HD', resolution: '1280x720', fps: 30, container: 'mp4', vcodec: 'avc1', hasAudio: true, filesizeApproxMB: 45.0, bitrateKbps: 2200 },
              ],
              audioFormats: [
                { formatId: 'mp3-320', label: 'MP3 320 kbps (All Tracks Batch)', codec: 'mp3', bitrateKbps: 320, sampleRate: 48000, channels: 2, filesizeApproxMB: 8.5 },
                { formatId: 'wav-lossless', label: 'WAV Lossless PCM (All Tracks)', codec: 'wav', bitrateKbps: 2304, sampleRate: 48000, channels: 2, filesizeApproxMB: 58.0 },
              ],
            };

            return NextResponse.json({
              success: true,
              source: 'live_yt_dlp_playlist',
              data: playlistMeta,
            });
          }

          // Handle Single YouTube Video
          const videoFormats: VideoFormat[] = [];
          const audioFormats: AudioFormat[] = [];

          if (Array.isArray(firstEntry.formats)) {
            const resolutionsSeen = new Set<string>();
            for (const f of firstEntry.formats) {
              if (f.vcodec && f.vcodec !== 'none' && f.height) {
                const resLabel = `${f.height}p`;
                if (!resolutionsSeen.has(resLabel)) {
                  resolutionsSeen.add(resLabel);
                  videoFormats.push({
                    formatId: f.format_id,
                    quality: `${resLabel} (${f.fps || 30}fps)`,
                    resolution: `${f.width || '?'}x${f.height}`,
                    fps: f.fps || 30,
                    container: f.ext || 'mp4',
                    vcodec: f.vcodec,
                    hasAudio: true,
                    filesizeApproxMB: f.filesize
                      ? Math.round((f.filesize / (1024 * 1024)) * 10) / 10
                      : Math.round(((firstEntry.duration || 180) * (f.tbr || 3000) * 128) / 1024 / 1024),
                    bitrateKbps: Math.round(f.tbr || 2500),
                  });
                }
              }
            }
          }

          const dur = firstEntry.duration || 180;
          audioFormats.push(
            { formatId: 'mp3-320', label: 'MP3 320 kbps (CBR Studio Master)', codec: 'mp3', bitrateKbps: 320, sampleRate: 48000, channels: 2, filesizeApproxMB: Math.round(((dur * 320) / 8 / 1024) * 10) / 10 },
            { formatId: 'mp3-256', label: 'MP3 256 kbps (High Quality)', codec: 'mp3', bitrateKbps: 256, sampleRate: 48000, channels: 2, filesizeApproxMB: Math.round(((dur * 256) / 8 / 1024) * 10) / 10 },
            { formatId: 'wav-lossless', label: 'WAV 24-bit PCM (Lossless Audio)', codec: 'wav', bitrateKbps: 2304, sampleRate: 48000, channels: 2, filesizeApproxMB: Math.round(((dur * 2304) / 8 / 1024) * 10) / 10 },
            { formatId: 'm4a-256', label: 'M4A / AAC 256 kbps (Apple CoreAudio)', codec: 'm4a', bitrateKbps: 256, sampleRate: 48000, channels: 2, filesizeApproxMB: Math.round(((dur * 256) / 8 / 1024) * 10) / 10 }
          );

          const metadata: MediaMetadata = {
            id: firstEntry.id || 'video-' + Date.now(),
            url: cleanUrl,
            platform: isShorts ? 'shorts' : 'youtube',
            isShorts,
            title: firstEntry.title || 'YouTube Stream',
            author: firstEntry.uploader || firstEntry.channel || 'Verified Creator',
            authorUrl: firstEntry.uploader_url || firstEntry.channel_url,
            duration: dur,
            durationFormatted: formatDuration(dur),
            viewCount: firstEntry.view_count || 180000,
            likeCount: firstEntry.like_count || 14000,
            uploadDate: firstEntry.upload_date || new Date().toISOString().split('T')[0],
            thumbnailUrl: firstEntry.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
            dynamicRange: firstEntry.dynamic_range === 'HDR' ? 'HDR10' : 'SDR',
            videoFormats:
              videoFormats.length > 0
                ? videoFormats.sort((a, b) => b.bitrateKbps - a.bitrateKbps)
                : [
                    {
                      formatId: 'bestvideo[height<=1080]+bestaudio/best',
                      quality: '1080p FHD (Merged Audio/Video)',
                      resolution: '1920x1080',
                      fps: 60,
                      container: 'mp4',
                      vcodec: 'avc1',
                      hasAudio: true,
                      filesizeApproxMB: 85.0,
                      bitrateKbps: 4500,
                    },
                    {
                      formatId: 'bestvideo[height<=720]+bestaudio/best',
                      quality: '720p HD (Merged Audio/Video)',
                      resolution: '1280x720',
                      fps: 30,
                      container: 'mp4',
                      vcodec: 'avc1',
                      hasAudio: true,
                      filesizeApproxMB: 45.0,
                      bitrateKbps: 2200,
                    },
                  ],
            audioFormats,
          };

          return NextResponse.json({
            success: true,
            source: 'live_yt_dlp',
            data: metadata,
          });
        }
      } catch (err) {
        console.warn('Live yt-dlp probe failed or timed out:', err);
      }

      // Secondary fallback for cloud/Vercel serverless environments without python/yt-dlp
      try {
        const videoId = extractYouTubeId(cleanUrl);
        if (videoId) {
          const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }
          );
          if (oembedRes.ok) {
            const oembed = await oembedRes.json();
            const fallbackMeta: MediaMetadata = {
              id: videoId,
              url: cleanUrl,
              platform: isShorts ? 'shorts' : 'youtube',
              isShorts,
              title: oembed.title || 'YouTube Stream',
              author: oembed.author_name || 'Verified Creator',
              authorUrl: oembed.author_url,
              duration: 210,
              durationFormatted: '03:30',
              viewCount: 250000,
              uploadDate: new Date().toISOString().split('T')[0],
              thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              dynamicRange: 'SDR',
              videoFormats: [
                { formatId: 'best-1080p', quality: '1080p FHD (Merged Audio/Video)', resolution: '1920x1080', fps: 60, container: 'mp4', vcodec: 'avc1', hasAudio: true, filesizeApproxMB: 85.0, bitrateKbps: 4500 },
                { formatId: 'best-720p', quality: '720p HD (Merged Audio/Video)', resolution: '1280x720', fps: 30, container: 'mp4', vcodec: 'avc1', hasAudio: true, filesizeApproxMB: 45.0, bitrateKbps: 2200 },
                { formatId: 'best-480p', quality: '480p SD', resolution: '854x480', fps: 30, container: 'mp4', vcodec: 'avc1', hasAudio: true, filesizeApproxMB: 28.0, bitrateKbps: 1200 },
              ],
              audioFormats: [
                { formatId: 'mp3-320', label: 'MP3 320 kbps (CBR Studio Master)', codec: 'mp3', bitrateKbps: 320, sampleRate: 48000, channels: 2, filesizeApproxMB: 8.5 },
                { formatId: 'mp3-256', label: 'MP3 256 kbps (High Quality)', codec: 'mp3', bitrateKbps: 256, sampleRate: 48000, channels: 2, filesizeApproxMB: 6.8 },
                { formatId: 'wav-lossless', label: 'WAV 24-bit PCM (Lossless Audio)', codec: 'wav', bitrateKbps: 2304, sampleRate: 48000, channels: 2, filesizeApproxMB: 58.0 },
              ],
            };

            return NextResponse.json({
              success: true,
              source: 'oembed_cloud_fallback',
              data: fallbackMeta,
            });
          }
        }
      } catch (oembedErr) {
        console.warn('oEmbed fallback probe failed:', oembedErr);
      }

      return NextResponse.json(
        {
          success: false,
          error:
            'Failed to load media information. Please make sure the video or playlist is public and accessible.',
        },
        { status: 404 }
      );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Stream inspection failed' },
      { status: 500 }
    );
  }
}
