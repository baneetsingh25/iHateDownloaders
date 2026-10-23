import { NextRequest, NextResponse } from 'next/server';
import { extractInstagramShortcode } from '@/lib/engine';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    // Defense-in-depth rate limiting
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`${ip}:instagram-download`, RATE_LIMITS.instagramDownload.max, RATE_LIMITS.instagramDownload.windowMs);
    if (!limitCheck.success) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Please wait ${limitCheck.retryAfterSeconds} seconds before downloading again.`,
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
    const mediaUrl = searchParams.get('url');
    const postUrl = searchParams.get('postUrl');
    const shortcodeParam = searchParams.get('shortcode');
    const rawFilename = searchParams.get('filename') || 'instagram_media';
    const type = searchParams.get('type') || 'video'; // 'video' | 'image' | 'audio'
    const strategy = searchParams.get('strategy') || 'largest';

    const targetPostUrl = postUrl || (mediaUrl?.includes('instagram.com') ? mediaUrl : '');

    if (!mediaUrl && !targetPostUrl && !shortcodeParam) {
      return NextResponse.json(
        { error: 'Valid media URL, postUrl, or shortcode is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.INSTAGRAM_API_KEY?.trim() || '';
    const apiHost = process.env.INSTAGRAM_API_HOST?.trim() || 'instagram-downloader38.p.rapidapi.com';

    // Sanitize filename
    const cleanFilename = rawFilename
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 75);

    // 1. Audio Extraction Request: /download?url=YOUR_URL&audio=true
    if (type === 'audio') {
      const finalAudioFilename = `${cleanFilename}.mp3`;
      const audioFetchUrl = `https://${apiHost}/download?url=${encodeURIComponent(targetPostUrl || mediaUrl || '')}&audio=true`;

      const audioRes = await fetch(audioFetchUrl, {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': apiHost,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
          'Accept': '*/*',
        },
      });

      if (!audioRes.ok || !audioRes.body) {
        return NextResponse.json(
          { error: `Audio extraction failed with status: ${audioRes.status}` },
          { status: audioRes.status }
        );
      }

      const responseHeaders: Record<string, string> = {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${finalAudioFilename}"`,
        'Cache-Control': 'no-cache',
      };
      const len = audioRes.headers.get('content-length');
      if (len) responseHeaders['Content-Length'] = len;

      return new NextResponse(audioRes.body as any, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // 2. Image / Thumbnail Request
    if (type === 'image') {
      const finalImageFilename = `${cleanFilename}.jpg`;
      let imageFetchUrl = mediaUrl || '';
      const sc = shortcodeParam || (targetPostUrl ? extractInstagramShortcode(targetPostUrl).code : null);

      if (!imageFetchUrl || imageFetchUrl.startsWith('/api')) {
        if (sc) {
          imageFetchUrl = `https://www.instagram.com/p/${sc}/media/?size=l`;
        }
      }

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      };

      const imgRes = await fetch(imageFetchUrl, { headers, redirect: 'follow' });
      if (!imgRes.ok || !imgRes.body) {
        return NextResponse.json(
          { error: `Image fetch failed with status: ${imgRes.status}` },
          { status: imgRes.status }
        );
      }

      const responseHeaders: Record<string, string> = {
        'Content-Type': imgRes.headers.get('content-type') || 'image/jpeg',
        'Content-Disposition': `attachment; filename="${finalImageFilename}"`,
        'Cache-Control': 'public, max-age=86400',
      };
      const len = imgRes.headers.get('content-length');
      if (len) responseHeaders['Content-Length'] = len;

      return new NextResponse(imgRes.body as any, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // 3. Video Download Request: Call /download?url=YOUR_URL&strategy=largest
    const finalVideoFilename = `${cleanFilename}.mp4`;
    const videoFetchUrl = targetPostUrl
      ? `https://${apiHost}/download?url=${encodeURIComponent(targetPostUrl)}&strategy=${strategy}`
      : (mediaUrl || '');

    const rapidHeaders = {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://www.instagram.com/',
      'Accept': '*/*',
    };

    // Attempt smart muxing with ffmpeg if available to guarantee audio is present in the MP4
    const tempId = crypto.randomBytes(8).toString('hex');
    const tmpDir = os.tmpdir();
    const tempVideoPath = path.join(tmpDir, `ig_vid_${tempId}.mp4`);
    const tempAudioPath = path.join(tmpDir, `ig_aud_${tempId}.mp4`);
    const tempMergedPath = path.join(tmpDir, `ig_merged_${tempId}.mp4`);

    try {
      // Fetch video using strategy=largest
      const videoRes = await fetch(videoFetchUrl, { headers: rapidHeaders });
      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video with status ${videoRes.status}`);
      }

      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      fs.writeFileSync(tempVideoPath, videoBuffer);

      // Check if ffmpeg is present to verify/mux audio
      let hasAudioStream = false;
      try {
        await new Promise<void>((resolve, reject) => {
          const probe = spawn('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_name', '-of', 'default=noprint_wrappers=1', tempVideoPath]);
          let out = '';
          probe.stdout.on('data', (d) => { out += d.toString(); });
          probe.on('close', (code) => {
            if (code === 0 && out.trim().length > 0) {
              hasAudioStream = true;
            }
            resolve();
          });
          probe.on('error', () => resolve());
        });
      } catch {}

      // If the MP4 stream already has audio merged, transmit directly!
      if (hasAudioStream) {
        const fileStream = fs.createReadStream(tempVideoPath);
        const cleanup = () => {
          fs.unlink(tempVideoPath, () => {});
        };
        fileStream.on('close', cleanup);
        fileStream.on('error', cleanup);

        const stat = fs.statSync(tempVideoPath);
        return new NextResponse(Readable.toWeb(fileStream) as any, {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename="${finalVideoFilename}"`,
            'Content-Length': stat.size.toString(),
            'Cache-Control': 'no-cache',
          },
        });
      }

      // If audio stream is missing in DASH video, fetch audio=true and merge seamlessly
      if (!hasAudioStream && targetPostUrl) {
        try {
          const audioFetchUrl = `https://${apiHost}/download?url=${encodeURIComponent(targetPostUrl)}&audio=true`;
          const audioRes = await fetch(audioFetchUrl, { headers: rapidHeaders });

          if (audioRes.ok) {
            const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
            fs.writeFileSync(tempAudioPath, audioBuffer);

            // Mux video + audio together into a single clean MP4 file
            await new Promise<void>((resolve, reject) => {
              const ffmpeg = spawn('ffmpeg', [
                '-y',
                '-i', tempVideoPath,
                '-i', tempAudioPath,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-movflags', '+faststart',
                tempMergedPath,
              ]);

              ffmpeg.on('close', (code) => {
                if (code === 0 && fs.existsSync(tempMergedPath)) {
                  resolve();
                } else {
                  reject(new Error(`ffmpeg exited with code ${code}`));
                }
              });

              ffmpeg.on('error', (err) => reject(err));
            });

            // Transmit merged file with full sound!
            if (fs.existsSync(tempMergedPath)) {
              const stat = fs.statSync(tempMergedPath);
              const fileStream = fs.createReadStream(tempMergedPath);
              const cleanup = () => {
                fs.unlink(tempVideoPath, () => {});
                fs.unlink(tempAudioPath, () => {});
                fs.unlink(tempMergedPath, () => {});
              };
              fileStream.on('close', cleanup);
              fileStream.on('error', cleanup);

              return new NextResponse(Readable.toWeb(fileStream) as any, {
                headers: {
                  'Content-Type': 'video/mp4',
                  'Content-Disposition': `attachment; filename="${finalVideoFilename}"`,
                  'Content-Length': stat.size.toString(),
                  'Cache-Control': 'no-cache',
                },
              });
            }
          }
        } catch (muxErr) {
          console.warn('Audio mux fallback skipped or failed:', muxErr);
        }
      }

      // Fallback: Send original largest video stream
      const fileStream = fs.createReadStream(tempVideoPath);
      const cleanup = () => {
        fs.unlink(tempVideoPath, () => {});
        if (fs.existsSync(tempAudioPath)) fs.unlink(tempAudioPath, () => {});
        if (fs.existsSync(tempMergedPath)) fs.unlink(tempMergedPath, () => {});
      };
      fileStream.on('close', cleanup);
      fileStream.on('error', cleanup);

      const stat = fs.statSync(tempVideoPath);
      return new NextResponse(Readable.toWeb(fileStream) as any, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${finalVideoFilename}"`,
          'Content-Length': stat.size.toString(),
          'Cache-Control': 'no-cache',
        },
      });
    } catch (streamErr: any) {
      // Clean up temp files if error occurred
      try {
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
        if (fs.existsSync(tempMergedPath)) fs.unlinkSync(tempMergedPath);
      } catch {}

      // Direct fallback stream
      const upstreamRes = await fetch(videoFetchUrl, { headers: rapidHeaders });
      if (!upstreamRes.ok || !upstreamRes.body) {
        return NextResponse.json(
          { error: `Media download failed: ${streamErr.message}` },
          { status: 500 }
        );
      }

      return new NextResponse(upstreamRes.body as any, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${finalVideoFilename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }
  } catch (err: any) {
    console.error('Instagram download proxy error:', err);
    return NextResponse.json(
      { error: `Download stream failed: ${err.message}` },
      { status: 500 }
    );
  }
}
