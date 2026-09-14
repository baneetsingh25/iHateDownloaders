import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '⚡ iHateDownloaders | Free 4K Media & MP3 Extractor',
    short_name: '⚡ iHateDownloaders',
    description:
      'High-fidelity ad-free 4K YouTube downloader, YouTube Shorts & Playlist ZIP extractor, and 320kbps MP3 audio extractor.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
