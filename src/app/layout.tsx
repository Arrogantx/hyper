import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/layout/Providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hypercatz - Premier NFT Utility Hub",
  description: "The ultimate minting and utility hub for Hypercatz NFT collection on HyperEVM. Mint, stake, play games, and earn rewards.",
  keywords: ["NFT", "Hypercatz", "HyperEVM", "Hyperliquid", "Mint", "Stake", "Games", "DeFi"],
  authors: [{ name: "Hypercatz Team" }],
  creator: "Hypercatz",
  publisher: "Hypercatz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hypercatz.com'),
  openGraph: {
    title: "Hypercatz - Premier NFT Utility Hub",
    description: "The ultimate minting and utility hub for Hypercatz NFT collection on HyperEVM.",
    url: "https://hypercatz.com",
    siteName: "Hypercatz",
    images: [
      {
        url: "/images/pre-reveal.mp4",
        width: 1200,
        height: 630,
        alt: "Hypercatz NFT Collection Pre-Reveal",
      },
    ],
    videos: [
      {
        url: "/images/pre-reveal.mp4",
        width: 1200,
        height: 630,
        type: "video/mp4",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypercatz - Premier NFT Utility Hub",
    description: "The ultimate minting and utility hub for Hypercatz NFT collection on HyperEVM.",
    images: ["/images/pre-reveal.mp4"],
    creator: "@hypercatz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00ffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
