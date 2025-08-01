import { cookieStorage, createStorage } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { type Chain } from 'viem';
import { HYPEREVM_CONFIG } from '@/lib/constants';

// 1. Define the custom chain using the configuration from constants.ts
const hyperEVM: Chain = {
  id: HYPEREVM_CONFIG.id,
  name: HYPEREVM_CONFIG.name,
  nativeCurrency: HYPEREVM_CONFIG.nativeCurrency,
  rpcUrls: {
    default: {
      http: HYPEREVM_CONFIG.rpcUrls.default.http,
    },
    public: {
        http: HYPEREVM_CONFIG.rpcUrls.public.http
    }
  },
  blockExplorers: {
    default: {
      name: HYPEREVM_CONFIG.blockExplorers.default.name,
      url: HYPEREVM_CONFIG.blockExplorers.default.url,
    },
  },
  testnet: false,
};

// 2. Read Project ID from environment variables
// Using the existing project ID from the previous wagmi setup
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

// 3. Ensure Project ID is defined
if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined. Please set it in .env.local');
}

// 4. Define the list of supported networks
// This project only uses HyperEVM
export const networks: [Chain, ...Chain[]] = [hyperEVM];

// 5. Create the Wagmi adapter instance for Reown AppKit
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }), // Recommended for Next.js SSR
  ssr: true, // Enable Server-Side Rendering support
  projectId,
  networks,
});

// 6. Export the Wagmi config generated by the adapter
// This will replace the old Wagmi config
export const config = wagmiAdapter.wagmiConfig;