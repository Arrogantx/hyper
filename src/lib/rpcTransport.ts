import { http, Transport, fallback } from 'viem';
import { getRPCManager } from '@/utils/rpcManager';

// Custom transport that uses our RPC manager
export function createRPCManagerTransport(): Transport {
  return ({ chain, retryCount = 3, timeout = 10_000 }) => ({
    config: {
      key: 'rpcManager',
      name: 'RPC Manager Transport',
      request: async ({ method, params }) => {
        const rpcManager = getRPCManager();
        
        try {
          const result = await rpcManager.request(method, Array.isArray(params) ? params : []);
          return result.result;
        } catch (error: any) {
          // Transform RPC manager errors to viem-compatible format
          throw new Error(error.message || 'RPC request failed');
        }
      },
      retryCount,
      timeout,
      type: 'rpcManager',
    },
    request: async ({ method, params }) => {
      const rpcManager = getRPCManager();
      
      try {
        const result = await rpcManager.request(method, Array.isArray(params) ? params : []);
        return result.result;
      } catch (error: any) {
        // Transform RPC manager errors to viem-compatible format
        throw new Error(error.message || 'RPC request failed');
      }
    },
    value: {},
  });
}

// Create a fallback transport with multiple RPC endpoints
export function createEnhancedTransport(): Transport {
  const rpcUrls = [
    'https://api.hyperliquid.xyz',
    'https://hyperliquid.drpc.org',
    'https://hyperliquid.rpc.hypersync.xyz',
    'https://hyperliquid-mainnet.rpc.thirdweb.com',
    'https://rpc.hyperliquid.xyz/evm',
    'https://hyperliquid-rpc.publicnode.com',
    'https://rpc.hyperliquid.xyz',
  ];

  // Create HTTP transports for each URL
  const transports = rpcUrls.map(url => http(url, {
    timeout: 15_000,
    retryCount: 2,
    retryDelay: 1000,
  }));

  // Use fallback transport to rotate between endpoints
  return fallback(transports, {
    rank: false, // Don't rank by speed, use round-robin
  });
}

// Hybrid transport that tries RPC manager first, then falls back to standard HTTP
export function createHybridTransport(): Transport {
  const fallbackTransport = createEnhancedTransport();

  return ({ chain, retryCount = 3, timeout = 10_000 }) => {
    const fallback = fallbackTransport({ chain, retryCount, timeout });

    return {
      config: {
        key: 'hybrid',
        name: 'Hybrid RPC Transport',
        request: async ({ method, params }) => {
          try {
            // Try RPC manager first
            const rpcManager = getRPCManager();
            const result = await rpcManager.request(method, Array.isArray(params) ? params : []);
            return result.result;
          } catch (error) {
            console.warn('RPC Manager failed, falling back to standard transport:', error);
            // Fall back to standard HTTP transport
            return await fallback.request({ method, params });
          }
        },
        retryCount,
        timeout,
        type: 'hybrid',
      },
      request: async ({ method, params }) => {
        try {
          // Try RPC manager first
          const rpcManager = getRPCManager();
          const result = await rpcManager.request(method, Array.isArray(params) ? params : []);
          return result.result;
        } catch (error) {
          console.warn('RPC Manager failed, falling back to standard transport:', error);
          // Fall back to standard HTTP transport
          return await fallback.request({ method, params });
        }
      },
      value: {},
    };
  };
}