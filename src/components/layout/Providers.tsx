'use client';

import React, { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config, customTheme } from '@/lib/wagmi';
import { initializeSoundEngine } from '@/utils/sound';
import { ToastProvider } from '@/components/ui/Toast';
import Navigation from './Navigation';
import '@rainbow-me/rainbowkit/styles.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Initialize sound engine on first user interaction
    const initSound = async () => {
      try {
        await initializeSoundEngine();
      } catch (error) {
        console.error('Failed to initialize sound engine:', error);
      }
    };

    // Initialize on first click or touch
    const handleFirstInteraction = () => {
      initSound();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>
          <ToastProvider>
            <div className="min-h-screen bg-dark-bg text-white">
              <Navigation />
              <main className="relative">
                {children}
              </main>
              
              {/* Background Effects */}
              <div className="fixed inset-0 pointer-events-none z-0">
                {/* Animated grid */}
                <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-30" />
                
                {/* Floating particles */}
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
                
                {/* Gradient overlays */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-pink/5 via-transparent to-neon-cyan/5" />
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-neon-purple/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-neon-green/10 to-transparent" />
              </div>
            </div>
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;