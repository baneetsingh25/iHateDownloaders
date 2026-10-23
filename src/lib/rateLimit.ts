export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds: number;
}

interface ClientRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window store
const rateLimitStore = new Map<string, ClientRecord>();

// Periodic garbage collection to keep memory minimal
let lastCleanup = Date.now();
function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup > 120_000) { // Every 2 minutes
    lastCleanup = now;
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }
}

/**
 * Extracts the real client IP address from request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list of proxies; first is the real client
    const clientIp = forwarded.split(',')[0].trim();
    if (clientIp) return clientIp;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

/**
 * Checks and updates rate limit for a given identifier and bucket.
 * 
 * @param identifier Unique key (e.g. `${ip}:${endpoint}`)
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    // New or expired window
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTimeMs: resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  // Active window
  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTimeMs: existing.resetAt,
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, maxRequests - existing.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    limit: maxRequests,
    remaining,
    resetTimeMs: existing.resetAt,
    retryAfterSeconds,
  };
}

// Pre-defined limits per endpoint category
export const RATE_LIMITS = {
  // Probing and inspecting streams (15 per minute)
  inspect: { max: 15, windowMs: 60_000 },

  // Video / Audio stream downloads (8 per minute)
  download: { max: 8, windowMs: 60_000 },

  // MaxRes Thumbnail grabber (20 per minute)
  thumbnail: { max: 20, windowMs: 60_000 },

  // Playlist batch ZIP exports (3 per 2 minutes)
  zip: { max: 3, windowMs: 120_000 },

  // Instagram Reel / Post inspection (10 per minute)
  instagramInspect: { max: 10, windowMs: 60_000 },

  // Instagram Media download proxy (12 per minute)
  instagramDownload: { max: 12, windowMs: 60_000 },

  // Audio DSP transcode (6 per minute)
  audioTranscode: { max: 6, windowMs: 60_000 },
};
