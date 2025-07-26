import { Address } from 'viem';

// Network configuration for .hype contract addresses
export interface NetworkAddresses {
  DOT_HYPE_REGISTRY: Address;
  DOT_HYPE_CONTROLLER: Address;
  DOT_HYPE_RESOLVER: Address;
  DOT_HYPE_PRICE_ORACLE: any;
  HYPER_POINTS: Address;
}

// HyperEVM Mainnet addresses
const MAINNET_ADDRESSES: NetworkAddresses = {
   DOT_HYPE_RESOLVER: '0x4d5e4ed4D5e4A160Fa136853597cDc2eBBe66494', // dotHYPE Resolver on Hyperliquid EVM
    DOT_HYPE_CONTROLLER: '0xCd0A58e078c57B69A3Da6703213aa69085E2AC65', // dotHYPE Controller
    DOT_HYPE_REGISTRY: '0xBf7cE65e6E920052C11690a80EAa3ed2fE752Dd8', // dotHYPE Registry
    DOT_HYPE_PRICE_ORACLE: '0x09fAB7D96dB646a0f164E3EA84782B45F650Fb51', // dotHYPE Price Oracle
    HYPER_POINTS: '0x3456C11F8A305074d1EfE4974411230157f510a2' // HyperPoints Token Contract
};

// Chain ID for HyperEVM mainnet
export const HYPER_EVM_MAINNET_CHAIN_ID = 999;

/**
 * Get the current network addresses
 * Always returns mainnet addresses since testnet is not used
 */
export function getCurrentNetworkAddresses(): NetworkAddresses {
  return MAINNET_ADDRESSES;
}

/**
 * Get addresses for a specific network
 */
export function getNetworkAddresses(chainId: number): NetworkAddresses {
  if (chainId === HYPER_EVM_MAINNET_CHAIN_ID) {
    return MAINNET_ADDRESSES;
  }
  throw new Error(`Unsupported chain ID: ${chainId}. Only HyperEVM mainnet (${HYPER_EVM_MAINNET_CHAIN_ID}) is supported.`);
}