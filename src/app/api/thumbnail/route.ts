import { NextRequest, NextResponse } from 'next/server';
import { extractYouTubeId } from '@/lib/engine';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    // Defense-in-depth rate limiting
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`${ip}:thumbnail`, RATE_LIMITS.thumbnail.max, RATE_LIMITS.thumbnail.windowMs);
    if (!limitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Thumbnail rate limit reached. Please wait ${limitCheck.retryAfterSeconds} seconds.`,
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

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url') || '';
    const videoIdParam = searchParams.get('videoId') || '';
    const quality = searchParams.get('quality') || 'maxres';
    const rawTitle = searchParams.get('title') || 'youtube_thumbnail';

    const videoId = extractYouTubeId(videoIdParam) || extractYouTubeId(url);

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Valid YouTube video ID or URL is required.' },
        { status: 400 }
      );
    }

    // Define cascade order based on requested quality
    let candidates: { file: string; label: string }[] = [];
    if (quality === 'maxres') {
      candidates = [
        { file: 'maxresdefault.jpg', label: '1080p_maxres' },
        { file: 'hq720.jpg', label: '720p_hd' },
        { file: 'sddefault.jpg', label: '480p_sd' },
        { file: 'hqdefault.jpg', label: 'hq' },
      ];
    } else if (quality === 'hq720') {
      candidates = [
        { file: 'hq720.jpg', label: '720p_hd' },
        { file: 'sddefault.jpg', label: '480p_sd' },
        { file: 'hqdefault.jpg', label: 'hq' },
      ];
    } else if (quality === 'sd') {
      candidates = [
        { file: 'sddefault.jpg', label: '480p_sd' },
        { file: 'hqdefault.jpg', label: 'hq' },
      ];
    } else {
      candidates = [
        { file: 'hqdefault.jpg', label: 'hq' },
      ];
    }

    let selectedResponse: Response | null = null;
    let selectedLabel = 'thumbnail';

    for (const candidate of candidates) {
      const thumbUrl = `https://i.ytimg.com/vi/${videoId}/${candidate.file}`;
      try {
        const res = await fetch(thumbUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (res.ok && res.status === 200) {
          selectedResponse = res;
          selectedLabel = candidate.label;
          break;
        }
      } catch {
        // Fallback to next lower resolution
      }
    }

    if (!selectedResponse || !selectedResponse.body) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail not available for this YouTube video.' },
        { status: 404 }
      );
    }

    const safeTitle = rawTitle
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 60) || 'youtube_thumbnail';

    const filename = `${safeTitle}_${selectedLabel}.jpg`;

    const headers = new Headers();
    headers.set('Content-Type', 'image/jpeg');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    return new NextResponse(selectedResponse.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Thumbnail download failed' },
      { status: 500 }
    );
  }
}
