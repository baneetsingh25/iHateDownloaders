# ⚡ iHateDownloaders (v2.0-EDGE)

> **High-Fidelity YouTube & Instagram Media Studio**  
> Anti-bloat, direct stream de-muxing utility for YouTube (4K UHD & 320 kbps MP3) and Instagram (Reels, Carousels, Stories & Audio Extraction). Zero ads, zero popups, zero telemetry.

---

## ⚡ Overview & Features

### 1. YouTube 4K Video & Audio Downloader
- **Direct Edge De-muxing**: Merges separated video (AV1/VP9) and high-bitrate audio streams directly into clean MP4 files with full sound.
- **Resolution Matrix**: 4K UHD (2160p 60fps), 1440p QHD, 1080p FHD (60fps Master), 720p HD, and 480p SD.
- **Shorts Support**: Vertical 1080x1920 60fps extraction for all YouTube Shorts.
- **Studio Master Audio**: MP3 320 kbps (CBR Studio Master), MP3 256 kbps, WAV 24-bit Lossless PCM, and M4A Apple CoreAudio.
- **Playlist Batch Exporter**: Multi-track checklist with 1-click compressed ZIP archive bundling.

### 2. Instagram Reels, Posts & Audio Studio (v2.0 New)
- **Instagram Reels**: Pristine vertical 1080x1920 MP4 video extraction directly from edge CDNs.
- **Soundtrack MP3 Ripping**: Extract background audio and music tracks from Reels as 320 kbps CBR MP3.
- **Multi-Slide Carousel Explorer**: View all individual photos and videos from Instagram carousel posts with 1-click downloads per slide.
- **Direct File Attachment Streaming**: Bypasses browser tab previews and CDN hotlink protections with server-proxied attachment downloads.
- **Zero-Log & Zero-Telemetry**: No credentials required; public media only.

---

## 🔑 Environment & API Configuration

To enable live Instagram media inspection, configure your API credentials:

### 1. Local Development (`.env.local`)
Create a `.env.local` file in the project root:

```env
# RapidAPI Key for Instagram Media Downloader
INSTAGRAM_API_KEY=your_rapidapi_key_here

# (Optional) RapidAPI Host (defaults to RapidAPI Instagram Downloader)
INSTAGRAM_API_HOST=instagram-downloader-download-instagram-videos-stories.p.rapidapi.com

# (Optional) Custom endpoint override
# INSTAGRAM_API_URL=https://my-backend.com/api/instagram?url=
```

### 2. Production Deployment (Vercel)
1. Go to your **Vercel Dashboard** &rarr; Select your project &rarr; **Settings** &rarr; **Environment Variables**.
2. Add `INSTAGRAM_API_KEY` (and optionally `INSTAGRAM_API_HOST`).
3. Redeploy.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) & React 18
- **Styling**: Tailwind CSS with Obsidian / Pitch Black palette (`#000000`, `#0A0A0A`, `#1F1F1F`, `#FDFBF7`)
- **Iconography**: Lucide React inline SVGs
- **Deployment**: Vercel-ready with serverless route optimizations
- **Packaging**: Streaming ZIP generation via `archiver`

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start development server
npm run dev
```

The application runs on `http://localhost:3000`.
