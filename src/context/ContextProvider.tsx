'use client';

import React, { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, cookieToInitialState, type Config } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { config, networks, projectId, wagmiAdapter } from '@/config/reown-appkit';
import { HYPEREVM_CONFIG } from '@/lib/constants';
import { ToastProvider } from '@/components/ui/Toast';
import Navigation from '@/components/layout/Navigation';
// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// 1. Define the metadata for the application
const metadata = {
  name: 'Hypercatz NFT Utility Hub',
  description: 'The ultimate minting and utility hub for the Hypercatz NFT collection on HyperEVM.',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://hypercatz.com',
  icons: ['/favicon.ico'], // Using the existing favicon
};

// 2. Initialize Reown AppKit
if (!projectId) {
  // This check is for type safety; the config file already throws an error.
  console.error("AppKit Initialization Error: Project ID is missing.");
} else {
  createAppKit({
    adapters: [wagmiAdapter],
    // Use non-null assertion `!` because the project ID is checked at runtime.
    projectId: projectId!,
    // Pass the networks array from the config file.
    networks: networks,
    // Set the default network to HyperEVM.
    defaultNetwork: {
      id: HYPEREVM_CONFIG.id,
      name: HYPEREVM_CONFIG.name,
      nativeCurrency: HYPEREVM_CONFIG.nativeCurrency,
      rpcUrls: {
        default: { http: HYPEREVM_CONFIG.rpcUrls.default.http },
        public: { http: HYPEREVM_CONFIG.rpcUrls.public.http }
      },
      blockExplorers: {
        default: {
          name: HYPEREVM_CONFIG.blockExplorers.default.name,
          url: HYPEREVM_CONFIG.blockExplorers.default.url
        }
      }
    },
    metadata,
    // Optional: Enable analytics or other features
    features: { analytics: true },
  });
}

// 3. Define the context provider component
export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null; // Receive cookies from the server for SSR hydration
}) {
  // Calculate the initial state for Wagmi to prevent hydration mismatches
  const initialState = cookieToInitialState(config as Config, cookies);

  return (
    // Set up the Wagmi provider with the new config
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="min-h-screen bg-dark-bg text-white">
            <Navigation />
            <main className="relative">{children}</main>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-30" />
              <div className="absolute inset-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-neon-cyan rounded-full animate-float opacity-20"
                    style={{
                      left: `${(i * 5.26) % 100}%`,
                      top: `${(i * 7.89) % 100}%`,
                      animationDelay: `${(i * 0.15) % 3}s`,
                      animationDuration: `${3 + (i * 0.1) % 2}s`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-pink/5 via-transparent to-neon-cyan/5" />
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-neon-purple/10 to-transparent" />
              <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-neon-green/10 to-transparent" />
            </div>
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}