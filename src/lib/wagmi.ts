'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem';
import { HYPEREVM_CONFIG } from './constants';
import { createHybridTransport } from './rpcTransport';

// Define HyperEVM chain with enhanced configuration and RPC manager integration
const hyperEVM: Chain = {
  id: HYPEREVM_CONFIG.id,
  name: HYPEREVM_CONFIG.name,
  nativeCurrency: HYPEREVM_CONFIG.nativeCurrency,
  rpcUrls: HYPEREVM_CONFIG.rpcUrls,
  blockExplorers: HYPEREVM_CONFIG.blockExplorers,
  testnet: false, // Mainnet configuration
  // Add contract addresses for better wallet integration
  contracts: {
    // Add multicall contract if available for better performance
  },
};

// Enhanced Wagmi configuration with RPC manager transport
export const config = getDefaultConfig({
  appName: 'Hypercatz NFT Utility Hub',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '951ac8e94a777fccfd25cd03077ca1e0',
  chains: [hyperEVM],
  transports: {
    [hyperEVM.id]: createHybridTransport(),
  },
  ssr: true,
});

// Custom RainbowKit theme
export const customTheme = {
  blurs: {
    modalOverlay: 'blur(4px)',
  },
  colors: {
    accentColor: '#00ffff',
    accentColorForeground: '#000000',
    actionButtonBorder: '#00ffff',
    actionButtonBorderMobile: '#00ffff',
    actionButtonSecondaryBackground: '#1a1a1a',
    closeButton: '#ffffff',
    closeButtonBackground: '#2a2a2a',
    connectButtonBackground: '#0a0a0a',
    connectButtonBackgroundError: '#ff0040',
    connectButtonInnerBackground: '#1a1a1a',
    connectButtonText: '#ffffff',
    connectButtonTextError: '#ffffff',
    connectionIndicator: '#39ff14',
    downloadBottomCardBackground: '#1a1a1a',
    downloadTopCardBackground: '#2a2a2a',
    error: '#ff0040',
    generalBorder: '#3a3a3a',
    generalBorderDim: '#2a2a2a',
    menuItemBackground: '#1a1a1a',
    modalBackdrop: 'rgba(0, 0, 0, 0.8)',
    modalBackground: '#0a0a0a',
    modalBorder: '#00ffff',
    modalText: '#ffffff',
    modalTextDim: '#cccccc',
    modalTextSecondary: '#999999',
    profileAction: '#2a2a2a',
    profileActionHover: '#3a3a3a',
    profileForeground: '#1a1a1a',
    selectedOptionBorder: '#00ffff',
    standby: '#ff6600',
  },
  fonts: {
    body: 'JetBrains Mono, monospace',
  },
  radii: {
    actionButton: '8px',
    connectButton: '8px',
    menuButton: '8px',
    modal: '12px',
    modalMobile: '12px',
  },
  shadows: {
    connectButton: '0 0 10px rgba(0, 255, 255, 0.3)',
    dialog: '0 0 20px rgba(0, 255, 255, 0.2)',
    profileDetailsAction: '0 2px 8px rgba(0, 0, 0, 0.5)',
    selectedOption: '0 0 10px rgba(0, 255, 255, 0.5)',
    selectedWallet: '0 0 15px rgba(0, 255, 255, 0.4)',
    walletLogo: '0 0 5px rgba(0, 255, 255, 0.2)',
  },
};

// Custom wallet button styles
export const walletButtonStyles = {
  background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a)',
  border: '1px solid #00ffff',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
  color: '#ffffff',
  fontFamily: 'JetBrains Mono, monospace',
  fontWeight: '500',
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
};

// Chain configuration for wallet display
export const chainConfig = {
  [hyperEVM.id]: {
    color: '#00ffff',
    iconUrl: '/images/hyperevm-logo.png', // Add this image to public folder
    iconBackground: '#0a0a0a',
  },
};