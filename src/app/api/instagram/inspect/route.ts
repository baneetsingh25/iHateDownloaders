import { NextRequest, NextResponse } from 'next/server';
import { extractInstagramShortcode } from '@/lib/engine';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { MediaMetadata, InstagramMediaItem, VideoFormat, AudioFormat } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Defense-in-depth rate limiting
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`${ip}:instagram-inspect`, RATE_LIMITS.instagramInspect.max, RATE_LIMITS.instagramInspect.windowMs);
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

    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid Instagram URL is required.' },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim().replace(/\/reels\//i, '/reel/');
    const { type: detectedType, code: shortcode } = extractInstagramShortcode(cleanUrl);

    // Check environment configuration
    const apiKey = process.env.INSTAGRAM_API_KEY?.trim() || '';
    const configuredHost = process.env.INSTAGRAM_API_HOST?.trim() || 'instagram-downloader38.p.rapidapi.com';

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'INSTAGRAM_API_KEY is not configured in .env.local. Please add your RapidAPI key to enable Instagram media extraction.',
        },
        { status: 401 }
      );
    }

    // Call RapidAPI endpoint as specified:
    // GET https://instagram-downloader38.p.rapidapi.com/download?url={url}&json=true&strategy=largest
    const targetFetchUrl = `https://${configuredHost}/download?url=${encodeURIComponent(cleanUrl)}&json=true&strategy=largest`;

    const headers: Record<string, string> = {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': configuredHost,
      'Accept': 'application/json',
    };

    const response = await fetch(targetFetchUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000), // wait up to 30s as supported by the API
    });

    const responseText = await response.text();
    let resJson: any = null;
    try {
      resJson = JSON.parse(responseText);
    } catch (parseErr) {
      console.warn('API returned non-JSON response:', responseText.substring(0, 200));
    }

    if (!response.ok) {
      const errorMsg = resJson?.detail || resJson?.message || resJson?.error || `API responded with status ${response.status}`;
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          host: configuredHost,
        },
        { status: response.status }
      );
    }

    // If API returned a detail with error (like shortcode parse error)
    if (resJson?.detail && typeof resJson.detail === 'string' && resJson.detail.toLowerCase().includes('error')) {
      return NextResponse.json(
        {
          success: false,
          error: resJson.detail,
        },
        { status: 400 }
      );
    }

    // Parse and normalize the API response into unified MediaMetadata
    const parsedData = normalizeInstagramResponse(resJson, cleanUrl, shortcode, detectedType, configuredHost);
    if (parsedData) {
      return NextResponse.json({
        success: true,
        source: 'rapidapi_live',
        host: configuredHost,
        data: parsedData,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to parse media information from the Instagram response. Please verify the post is public.',
      },
      { status: 502 }
    );
  } catch (err: any) {
    const isTimeout = err.name === 'TimeoutError' || err.message?.includes('aborted') || err.message?.includes('timeout');
    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? 'The Instagram request timed out. The post may be slow to respond or private.'
          : err.message || 'Instagram inspection failed due to an internal error.',
      },
      { status: 500 }
    );
  }
}

/**
 * Normalizes response payloads from instagram-downloader38.p.rapidapi.com
 * into our standard MediaMetadata schema.
 */
function normalizeInstagramResponse(
  raw: any,
  sourceUrl: string,
  shortcode: string | null,
  detectedType: string,
  apiHost: string
): MediaMetadata | null {
  if (!raw) return null;

  const root = raw.result || raw.data || raw;
  const candidates: any[] = Array.isArray(root.candidates) ? root.candidates : [];

  // Extract author / username
  const author =
    root.username ||
    root.author?.username ||
    root.owner?.username ||
    root.user?.username ||
    'instagram.user';
  const authorUrl = `https://instagram.com/${author.replace(/^@/, '')}`;

  // Extract title / caption
  const caption =
    root.caption ||
    root.title ||
    root.description ||
    root.text ||
    'Instagram Media';
  const title = caption.length > 90 ? caption.substring(0, 87) + '...' : caption;

  // Extract thumbnail from display_url, thumbnail_url, or candidates
  const imageCandidate = candidates.find(
    (c) => c.kind === 'image' || c.kind === 'thumbnail' || c.kind === 'poster'
  );

  const fallbackThumbnailProxy = shortcode
    ? `/api/instagram/download?type=image&shortcode=${shortcode}&postUrl=${encodeURIComponent(sourceUrl)}`
    : `/api/instagram/download?type=image&postUrl=${encodeURIComponent(sourceUrl)}`;

  const thumbnailUrl =
    root.display_url ||
    root.thumbnail_url ||
    root.thumbnail ||
    root.cover ||
    root.picture ||
    imageCandidate?.url ||
    (shortcode ? `https://www.instagram.com/p/${shortcode}/media/?size=l` : fallbackThumbnailProxy);

  // Check if carousel (multiple slides)
  let carouselItems: InstagramMediaItem[] = [];
  const mediaList = Array.isArray(root.media)
    ? root.media
    : Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.carousel)
    ? root.carousel
    : [];

  if (mediaList.length > 1) {
    carouselItems = mediaList.map((item: any, idx: number) => {
      const isVideo = item.type === 'video' || !!item.video_url || !!item.video || item.is_video;
      const mediaUrl = item.download_url || item.video_url || item.video || item.url || item.image_url || item.image;
      const itemThumb = item.thumbnail || item.thumbnail_url || item.thumb || item.display_url || thumbnailUrl;

      return {
        id: `slide-${idx + 1}`,
        type: (isVideo ? 'video' : 'image') as 'video' | 'image',
        url: mediaUrl,
        thumbnailUrl: itemThumb,
        width: item.width || 1080,
        height: item.height || 1080,
        filesizeApproxMB: item.filesizeApproxMB || (isVideo ? 15.0 : 2.5),
      };
    }).filter((item: any) => Boolean(item.url));
  }

  // Direct video URL or API fallback endpoint
  const directApiDownloadUrl = `https://${apiHost}/download?url=${encodeURIComponent(sourceUrl)}&strategy=largest`;
  const directApiAudioUrl = `https://${apiHost}/download?url=${encodeURIComponent(sourceUrl)}&audio=true`;

  // Find video candidate (prefer the highest size / chosen stream)
  const videoCandidates = candidates.filter((c) => c.kind === 'video' || c.tracks?.includes('vide'));
  videoCandidates.sort((a, b) => (b.size || 0) - (a.size || 0));

  const videoDownloadUrl =
    root.chosen ||
    videoCandidates[0]?.url ||
    root.download_url ||
    root.video_url ||
    root.video ||
    root.url ||
    (Array.isArray(root.links) && root.links[0]?.url) ||
    directApiDownloadUrl;

  // Find audio stream from candidates or fallback to audio=true endpoint
  const audioCandidate = candidates.find(
    (c) => c.kind === 'audio' || c.tracks?.includes('soun') || c.type === 'audio'
  );

  const audioUrl =
    audioCandidate?.url ||
    root.audio_url ||
    root.music_url ||
    root.audio ||
    directApiAudioUrl;

  const isCarousel = carouselItems.length > 1;
  const isVideo = root.is_video !== false && !isCarousel;
  const isReel = detectedType === 'reel' || root.is_video || root.type === 'reel' || isVideo || root.type === 'video';

  const finalType: 'reel' | 'post' | 'carousel' | 'story' = isCarousel
    ? 'carousel'
    : isReel
    ? 'reel'
    : detectedType === 'story'
    ? 'story'
    : 'post';

  // Video formats
  const videoFormats: VideoFormat[] = [];
  if (videoCandidates.length > 0) {
    videoCandidates.forEach((vc, idx) => {
      const sizeMB = vc.size ? Math.round((vc.size / (1024 * 1024)) * 10) / 10 : (idx === 0 ? 16.4 : 9.8);
      const qualityLabel = idx === 0 ? '1080p Full HD (Master MP4)' : `${idx === 1 ? '720p HD' : '480p SD'} Stream`;
      videoFormats.push({
        formatId: `ig-candidate-${idx + 1}`,
        quality: qualityLabel,
        resolution: idx === 0 ? '1080x1920' : '720x1280',
        fps: 30,
        container: 'mp4',
        vcodec: 'avc1',
        hasAudio: true,
        filesizeApproxMB: sizeMB,
        bitrateKbps: idx === 0 ? 3500 : 1800,
        isDirectDownload: true,
      });
    });
  } else if (videoDownloadUrl && !isCarousel) {
    videoFormats.push(
      {
        formatId: 'ig-hd-1080p',
        quality: '1080p Full HD (Master MP4)',
        resolution: '1080x1920',
        fps: 30,
        container: 'mp4',
        vcodec: 'avc1',
        hasAudio: true,
        filesizeApproxMB: root.filesize_mb || 16.4,
        bitrateKbps: 3500,
        isDirectDownload: true,
      },
      {
        formatId: 'ig-sd-720p',
        quality: '720p HD (Compressed Stream)',
        resolution: '720x1280',
        fps: 30,
        container: 'mp4',
        vcodec: 'avc1',
        hasAudio: true,
        filesizeApproxMB: 9.8,
        bitrateKbps: 2000,
        isDirectDownload: true,
      }
    );
  }

  // Audio formats: ALWAYS provide audio formats for any video or reel
  const audioFormats: AudioFormat[] = [];
  if (isReel || isVideo || audioCandidate || root.type === 'video') {
    const audioSizeMB = audioCandidate?.size
      ? Math.round((audioCandidate.size / (1024 * 1024)) * 10) / 10
      : 2.1;

    audioFormats.push(
      {
        formatId: 'ig-mp3-320',
        label: 'MP3 320 kbps (Reel Audio CBR Master)',
        codec: 'mp3',
        bitrateKbps: 320,
        sampleRate: 48000,
        channels: 2,
        filesizeApproxMB: audioSizeMB > 0 ? audioSizeMB : 2.1,
      },
      {
        formatId: 'ig-m4a-aac',
        label: 'M4A / AAC 256 kbps (Apple CoreAudio)',
        codec: 'm4a',
        bitrateKbps: 256,
        sampleRate: 48000,
        channels: 2,
        filesizeApproxMB: Math.max(1.2, Math.round((audioSizeMB * 0.8) * 10) / 10),
      }
    );
  }

  return {
    id: shortcode || root.shortcode || root.id || `ig-${Date.now()}`,
    url: sourceUrl,
    platform: 'instagram',
    instagramType: finalType,
    shortcode: shortcode || root.shortcode || undefined,
    title,
    caption,
    author,
    authorUrl,
    duration: root.duration || 30,
    durationFormatted: root.duration ? `${Math.floor(root.duration / 60)}:${(root.duration % 60).toString().padStart(2, '0')}` : '00:30',
    viewCount: root.views || root.play_count || 0,
    likeCount: root.likes || root.like_count || 0,
    uploadDate: root.taken_at ? new Date(root.taken_at * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    thumbnailUrl,
    dynamicRange: 'SDR',
    directDownloadUrl: videoDownloadUrl,
    carouselItems: isCarousel ? carouselItems : undefined,
    videoFormats,
    audioFormats,
    audioUrl,
    audioTitle: root.music_title ? `${root.music_title} • ${root.music_artist || author}` : `Original Audio • @${author}`,
  };
}
