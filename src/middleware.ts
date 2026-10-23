import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limit protection for all API endpoints
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(req);

    // Select rate limit bucket based on endpoint
    let config = { max: 30, windowMs: 60_000 };
    let bucket = pathname.split('/')[2] || 'api';

    if (pathname.startsWith('/api/instagram/inspect')) {
      config = RATE_LIMITS.instagramInspect;
      bucket = 'instagram-inspect';
    } else if (pathname.startsWith('/api/instagram/download')) {
      config = RATE_LIMITS.instagramDownload;
      bucket = 'instagram-download';
    } else if (pathname.startsWith('/api/audio/transcode')) {
      config = RATE_LIMITS.audioTranscode;
      bucket = 'audio-transcode';
    } else if (pathname.startsWith('/api/inspect')) {
      config = RATE_LIMITS.inspect;
      bucket = 'inspect';
    } else if (pathname.startsWith('/api/download')) {
      config = RATE_LIMITS.download;
      bucket = 'download';
    } else if (pathname.startsWith('/api/thumbnail')) {
      config = RATE_LIMITS.thumbnail;
      bucket = 'thumbnail';
    } else if (pathname.startsWith('/api/playlist/zip')) {
      config = RATE_LIMITS.zip;
      bucket = 'zip';
    }

    const bucketKey = `${ip}:${bucket}`;
    const result = checkRateLimit(bucketKey, config.max, config.windowMs);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: `Rate limit reached. Please wait ${result.retryAfterSeconds} seconds before trying again.`,
          retryAfter: result.retryAfterSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(result.retryAfterSeconds),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetTimeMs),
          },
        }
      );
    }

    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit', String(result.limit));
    res.headers.set('X-RateLimit-Remaining', String(result.remaining));
    res.headers.set('X-RateLimit-Reset', String(result.resetTimeMs));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
