# ⚡ iHateDownloaders (v1.0-EDGE)

> **High-Fidelity YouTube 4K & MP3 Studio**  
> Anti-bloat, direct stream de-muxing utility for YouTube, YouTube Shorts, and Playlists with 4K UHD video, 320 kbps MP3 CBR audio, and Ultra-HD MaxRes Thumbnail grabber. Zero ads, zero popups, zero telemetry.

---

## ⚡ Overview & Features

### 1. YouTube 4K Video Downloader
- **Direct Edge De-muxing**: Merges separated video (AV1/VP9) and high-bitrate audio streams directly into clean MP4 files with full sound.
- **Resolution Matrix**: 4K UHD (2160p 60fps), 1440p QHD, 1080p FHD (60fps Master), 720p HD, and 480p SD.
- **Shorts Support**: Vertical 1080x1920 60fps extraction for all YouTube Shorts.

### 2. Studio Master Audio Extraction
- **Pristine Codecs**: MP3 320 kbps (CBR Studio Master), MP3 256 kbps, WAV 24-bit Lossless PCM, and M4A Apple CoreAudio.
- **Full Frequency Spectrum**: Preserves complete 20 Hz – 20,000 Hz acoustic bandwidth without compression artifacts or frequency cuts.

### 3. Ultra-HD MaxRes Thumbnail Grabber
- **Resolution Cascade**: Probes YouTube CDN edge nodes for `maxresdefault.jpg` (1080p Ultra-HD) with graceful fallback to `hq720.jpg` (720p) and `sddefault.jpg` (480p).
- **Direct File Attachment**: Streams directly with `Content-Disposition: attachment` for instant browser download without opening new tabs.

### 4. YouTube Playlist Batch Exporter
- **Automated Track Indexing**: Multi-track itemized cards with selection checkboxes.
- **Selection Controls**: "Select All", "Clear", and "Invert" buttons.
- **Single-Click ZIP Archive**: Bundles all selected tracks into a organized ZIP archive.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) & React 18
- **Styling**: Tailwind CSS with Obsidian / Pitch Black palette (`#000000`, `#0A0A0A`, `#1F1F1F`, `#FDFBF7`)
- **Iconography**: Lucide React inline SVGs
- **Deployment**: Vercel-ready with serverless route optimizations and YouTube oEmbed cloud fallback
- **Packaging**: Streaming ZIP generation via `archiver`

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm run start
# Or start development server
npm run dev
```

The application runs on `http://localhost:3000`.
