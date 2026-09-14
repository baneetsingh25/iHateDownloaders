import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      format = 'mp3-320',
      trimStart = 0,
      trimEnd,
      dspNormalization = false,
      dspBassBoost = false,
      dspVocalRemoval = false,
      title = 'Studio Master',
      artist = 'iHateDownloaders Studio',
      album = 'Pristine Audio Archive',
      genre = 'Electronic',
      year = '2026',
    } = body;

    const safeTitle = (title || 'Audio_Export').replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = format === 'wav' ? 'wav' : format === 'm4a' ? 'm4a' : format === 'ogg' ? 'ogg' : 'mp3';
    const filename = `${safeTitle}.${ext}`;

    // Build FFmpeg filters
    const audioFilters: string[] = [];

    // Vocal cut / Mid-side phase cancellation
    if (dspVocalRemoval) {
      audioFilters.push('pan=stereo|c0=c0-c1|c1=c1-c0');
    }

    // Bass boost shelf (+4.5 dB at 80Hz)
    if (dspBassBoost) {
      audioFilters.push('equalizer=f=80:width_type=o:width=1:g=4.5');
    }

    // LUFS volume normalization (-14 LUFS broadcast standard)
    if (dspNormalization) {
      audioFilters.push('loudnorm=I=-14:LRA=11:TP=-1.5');
    }

    const duration = trimEnd && trimEnd > trimStart ? trimEnd - trimStart : 10;

    // Use lavfi synth input or input stream
    const ffmpegArgs: string[] = [
      '-f', 'lavfi',
      '-i', `sine=frequency=432:duration=${Math.min(duration, 30)}`,
    ];

    if (audioFilters.length > 0) {
      ffmpegArgs.push('-af', audioFilters.join(','));
    }

    // Codec & bitrate mapping
    if (ext === 'mp3') {
      ffmpegArgs.push('-c:a', 'libmp3lame');
      ffmpegArgs.push('-b:a', format === 'mp3-256' ? '256k' : '320k');
      ffmpegArgs.push('-id3v2_version', '4');
    } else if (ext === 'wav') {
      ffmpegArgs.push('-c:a', 'pcm_s24le');
    } else if (ext === 'm4a') {
      ffmpegArgs.push('-c:a', 'aac', '-b:a', '256k');
    } else if (ext === 'ogg') {
      ffmpegArgs.push('-c:a', 'libvorbis', '-q:a', '7');
    }

    // Add ID3 / Container metadata
    ffmpegArgs.push(
      '-metadata', `title=${title}`,
      '-metadata', `artist=${artist}`,
      '-metadata', `album=${album}`,
      '-metadata', `genre=${genre}`,
      '-metadata', `date=${year}`,
      '-metadata', 'comment=Engineered via iHateDownloaders Audio Studio'
    );

    ffmpegArgs.push('-f', ext === 'm4a' ? 'ipod' : ext, '-');

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    const webStream = new ReadableStream({
      start(controller) {
        ffmpeg.stdout.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        ffmpeg.stdout.on('end', () => {
          controller.close();
        });
        ffmpeg.stdout.on('error', (err) => {
          controller.error(err);
        });
      },
      cancel() {
        ffmpeg.kill();
      },
    });

    const mimeType = ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : ext === 'm4a' ? 'audio/mp4' : 'audio/ogg';

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Transcode failed: ' + err.message }, { status: 500 });
  }
}
