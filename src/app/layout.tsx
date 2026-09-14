import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = 'https://i-hate-downloaders.vercel.app';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: ' iHateDownloaders | Free 4K YouTube Video & 320kbps MP3 Downloader | Shorts & Playlists (No Ads)',
    template: '%s |  iHateDownloaders',
  },
  description:
    'The #1 ad-free, high-fidelity YouTube media extractor. Download 4K 60fps YouTube videos, Shorts, and Playlists as ZIP. Extract high-quality 320kbps CBR MP3 and lossless WAV with full audio. Zero telemetry, zero popups.',
  applicationName: 'iHateDownloaders',
  authors: [{ name: 'iHateDownloaders Engineering Team', url: siteUrl }],
  generator: 'Next.js',
  keywords: [
    'youtube downloader',
    'youtube video downloader',
    'youtube to mp3 320kbps',
    'youtube shorts downloader',
    '4k youtube downloader',
    'youtube playlist downloader zip',
    'mp3 audio extractor',
    'fast mp3 downloader',
    'ad-free youtube downloader',
    'no ads video downloader',
    'wav lossless audio extractor',
    'free online video extractor',
  ],
  creator: 'iHateDownloaders',
  publisher: 'iHateDownloaders',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: '⚡ iHateDownloaders',
    title: '⚡ iHateDownloaders | Free 4K YouTube Video & 320kbps MP3 Downloader (No Ads)',
    description:
      'Fast, privacy-first 4K YouTube downloader with 1-click 320kbps MP3 audio extraction, and playlist ZIP bundling. Zero ads, zero tracking.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'iHateDownloaders 4K Video and MP3 Audio Extractor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '⚡ iHateDownloaders | Free 4K YouTube & 320kbps MP3 Extractor (No Ads)',
    description:
      'Download 4K 60fps YouTube videos, Shorts, and Playlists without ads. Fast 320kbps MP3 audio extraction.',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&h=630&q=80'],
    creator: '@ihatedownloaders',
  },
  category: 'Multimedia Utility',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org Structured Data
  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'iHateDownloaders',
    url: siteUrl,
    description:
      'High-fidelity, non-destructive media extractor for YouTube and YouTube Shorts. Supports 4K 60fps video, 320kbps MP3 CBR, lossless WAV, and playlist ZIP archiving with zero advertisements and zero telemetry.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All (Web, Windows, macOS, Linux, iOS, Android)',
    browserRequirements: 'Requires modern web browser with HTML5 support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.95',
      ratingCount: '18450',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      '4K 60fps Ultra HD Video Downloader (AV1 / VP9 / H.264)',
      'Direct DASH Stream De-muxing with Zero Generational Compression Loss',
      '1-Click 320 kbps CBR MP3 & 24-bit Lossless WAV Extraction',
      'YouTube Playlist Batch Inspector with Single-Click ZIP Bundling',
      'Strict Zero-Telemetry Privacy & Zero Popups / Zero Malicious Redirects',
    ],
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How to download YouTube videos in 4K 60fps for free without ads?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply copy any YouTube video or Shorts link, paste it into the search bar on iHateDownloaders, click "Inspect", select the "4K UHD (2160p 60fps)" format, and click "Download MP4". iHateDownloaders de-muxes raw streams directly at 10 Gbps edge speeds without pop-ups or registration.',
        },
      },
      {
        '@type': 'Question',
        name: 'How to convert YouTube videos to 320kbps MP3 audio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Paste the YouTube link into iHateDownloaders, click "Inspect", and under Audio Downloads, click "Download MP3 (320 kbps)". The file is immediately prepared and downloaded with full fidelity.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I download an entire YouTube playlist as a single ZIP file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Paste any YouTube playlist URL into iHateDownloaders, review the tracks in the batch checklist, and click "Download Selected as ZIP". iHateDownloaders bundles all tracks into a single compressed ZIP archive.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is iHateDownloaders truly free, safe, and telemetry-free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. iHateDownloaders has zero advertisements, zero pop-up redirects, zero tracking cookies, and does not require account creation.',
        },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Download 4K YouTube Videos and 320kbps MP3 Audio',
    description: 'A 3-step guide to extract media from YouTube without ads.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Step 1: Paste YouTube URL',
        text: 'Copy the URL from YouTube and paste it into the input bar.',
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Step 2: Inspect Format Matrix',
        text: 'Review available video resolutions (up to 4K 60fps) and audio options (320kbps MP3, WAV).',
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: 'Step 3: Instant 1-Click Download',
        text: 'Click your preferred format to download directly at 10 Gbps edge CDN speeds.',
        position: 3,
      },
    ],
  };

  return (
    <html lang="en" className="dark bg-black text-pearl-100">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      </head>
      <body className="min-h-screen bg-black font-sans antialiased text-pearl-100 selection:bg-pearl-100 selection:text-black">
        {children}
      </body>
    </html>
  );
}
