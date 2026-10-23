import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Defense-in-depth rate limiting
  const ip = getClientIp(req);
  const limitCheck = checkRateLimit(`${ip}:download`, RATE_LIMITS.download.max, RATE_LIMITS.download.windowMs);
  if (!limitCheck.success) {
    return NextResponse.json(
      {
        error: `Download rate limit reached. Please wait ${limitCheck.retryAfterSeconds} seconds before downloading again.`,
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
  const formatId = searchParams.get('formatId') || 'best';
  const type = searchParams.get('type') || 'video';
  const rawTitle = searchParams.get('title') || 'iHateDownloaders_Media';
  const ext = searchParams.get('ext') || (type === 'audio' ? 'mp3' : 'mp4');

  if (!url || !url.startsWith('http')) {
    return NextResponse.json(
      { error: 'Valid media URL is required.' },
      { status: 400 }
    );
  }

  // Sanitize filename
  const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80);
  const filename = `${cleanTitle}.${ext}`;

  const isAudio = type === 'audio' || ext === 'mp3' || ext === 'wav' || ext === 'm4a' || ext === 'ogg';

  const mimeType = isAudio
    ? ext === 'mp3'
      ? 'audio/mpeg'
      : ext === 'wav'
      ? 'audio/wav'
      : ext === 'm4a'
      ? 'audio/mp4'
      : 'audio/ogg'
    : ext === 'webm'
    ? 'video/webm'
    : 'video/mp4';

  // YouTube and standard video/audio extraction with sound
  const tempId = crypto.randomBytes(8).toString('hex');
  const tempTemplate = path.join(os.tmpdir(), `ihd_${tempId}.%(ext)s`);

  try {
    let ytDlpArgs: string[] = [];

    if (isAudio) {
      // Extract audio only at max quality (320 kbps MP3 or lossless WAV)
      const audioFormat = ext === 'mp3' ? 'mp3' : ext === 'wav' ? 'wav' : ext === 'm4a' ? 'm4a' : 'mp3';
      ytDlpArgs = [
        '-m', 'yt_dlp',
        '--no-warnings',
        '-x',
        '--audio-format', audioFormat,
        '--audio-quality', '0',
        '-o', tempTemplate,
        url,
      ];
    } else {
      // Mux video + audio together so downloaded video always has full sound!
      let formatSpecifier: string;
      if (!formatId || formatId === 'best' || formatId === 'default') {
        formatSpecifier = 'bestvideo+bestaudio/best';
      } else if (formatId.includes('+')) {
        formatSpecifier = formatId;
      } else {
        formatSpecifier = `${formatId}+bestaudio/bestvideo+bestaudio/best`;
      }

      ytDlpArgs = [
        '-m', 'yt_dlp',
        '--no-warnings',
        '-f', formatSpecifier,
        '--merge-output-format', ext === 'webm' ? 'webm' : 'mp4',
        '-o', tempTemplate,
        url,
      ];
    }

    // Run yt-dlp to completion
    await new Promise<void>((resolve, reject) => {
      const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
      const child = spawn(pythonExecutable, ytDlpArgs);
      let stderrData = '';

      child.stderr.on('data', (d) => {
        stderrData += d.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`yt-dlp exited with code ${code}: ${stderrData.substring(0, 300)}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });

    // Locate the generated file in tmpdir
    const tmpDir = os.tmpdir();
    const files = fs.readdirSync(tmpDir);
    const matchedFile = files.find((f) => f.startsWith(`ihd_${tempId}`));

    if (!matchedFile) {
      throw new Error('Downloaded media file was not found on server disk.');
    }

    const fullFilePath = path.join(tmpDir, matchedFile);
    const stat = fs.statSync(fullFilePath);

    const fileStream = fs.createReadStream(fullFilePath);

    // Clean up temporary file after transmission completes or errors
    const cleanup = () => {
      fs.unlink(fullFilePath, () => {});
    };
    fileStream.on('close', cleanup);
    fileStream.on('error', cleanup);

    const webStream = Readable.toWeb(fileStream);

    return new NextResponse(webStream as any, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Download processing failed:', err);

    // Clean up any stray temp files
    try {
      const tmpDir = os.tmpdir();
      const files = fs.readdirSync(tmpDir);
      for (const f of files) {
        if (f.startsWith(`ihd_${tempId}`)) {
          fs.unlinkSync(path.join(tmpDir, f));
        }
      }
    } catch {}

    return NextResponse.json(
      { error: `Download failed: ${err.message || 'Media stream processing error'}` },
      { status: 500 }
    );
  }
}
