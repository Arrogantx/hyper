/**
 * DoTHype Resolver Contract Configuration
 * 
 * This file contains the contract addresses and ABI for the DoTHype resolver
 * system on HyperEVM network.
 */

// DoTHype Resolver ABI - ENS-compatible functions
export const DOT_HYPE_RESOLVER_ABI = [
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'addr',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'getName',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    name: 'text',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'contenthash',
    outputs: [{ name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Network-specific contract addresses
export const NETWORK_ADDRESSES = {
  // HyperEVM Mainnet (chainId: 999)
  999: {
    dotHypeResolver: '0x0000000000000000000000000000000000000000', // Replace with actual address
    dotHypeRegistry: '0x0000000000000000000000000000000000000000', // Replace with actual address
  },
  // HyperEVM Testnet (if available)
  998: {
    dotHypeResolver: '0x0000000000000000000000000000000000000000', // Replace with actual testnet address
    dotHypeRegistry: '0x0000000000000000000000000000000000000000', // Replace with actual testnet address
  },
} as const;

// Type definitions
export type SupportedChainId = keyof typeof NETWORK_ADDRESSES;
export type NetworkAddresses = typeof NETWORK_ADDRESSES[SupportedChainId];

/**
 * Get contract addresses for the current network
 * @param chainId - The chain ID to get addresses for
 * @returns Contract addresses for the specified network
 */
export function getCurrentNetworkAddresses(chainId: number): NetworkAddresses | null {
  if (chainId in NETWORK_ADDRESSES) {
    return NETWORK_ADDRESSES[chainId as SupportedChainId];
  }
  return null;
}

/**
 * Check if a chain ID is supported by DoTHype
 * @param chainId - The chain ID to check
 * @returns True if the chain is supported
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return chainId in NETWORK_ADDRESSES;
}

/**
 * Default configuration for DoTHype integration
 */
export const DOT_HYPE_CONFIG = {
  defaultChainId: 999, // HyperEVM Mainnet
  resolverInterface: DOT_HYPE_RESOLVER_ABI,
  supportedChains: Object.keys(NETWORK_ADDRESSES).map(Number) as SupportedChainId[],
  
  // Text record keys for additional metadata
  textRecords: {
    avatar: 'avatar',
    description: 'description',
    display: 'display',
    email: 'email',
    keywords: 'keywords',
    mail: 'mail',
    notice: 'notice',
    location: 'location',
    phone: 'phone',
    url: 'url',
    'com.github': 'com.github',
    'com.twitter': 'com.twitter',
    'com.discord': 'com.discord',
  },
  
  // Cache settings
  cache: {
    ttl: 300000, // 5 minutes in milliseconds
    maxEntries: 1000,
  },
} as const;

/**
 * Contract interaction utilities
 */
export const CONTRACT_UTILS = {
  /**
   * Get the resolver address for a specific chain
   */
  getResolverAddress: (chainId: number) => {
    const addresses = getCurrentNetworkAddresses(chainId);
    return addresses?.dotHypeResolver;
  },
  
  /**
   * Get the registry address for a specific chain
   */
  getRegistryAddress: (chainId: number) => {
    const addresses = getCurrentNetworkAddresses(chainId);
    return addresses?.dotHypeRegistry;
  },
  
  /**
   * Validate contract address format
   */
  isValidContractAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address) && address !== '0x0000000000000000000000000000000000000000';
  },
} as const;

/**
 * Error types for contract interactions
 */
export class ContractError extends Error {
  constructor(message: string, public code: string, public chainId?: number) {
    super(message);
    this.name = 'ContractError';
  }
}

export const CONTRACT_ERROR_CODES = {
  UNSUPPORTED_CHAIN: 'UNSUPPORTED_CHAIN',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  CALL_FAILED: 'CALL_FAILED',
} as const;