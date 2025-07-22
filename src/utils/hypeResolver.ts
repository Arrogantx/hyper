/**
 * .hype Domain Resolution Utilities
 * 
 * This module provides utilities for working with .hype domain names
 * and integrating with the DoTHype resolver system on HyperEVM.
 */

// Type definitions
export type Address = `0x${string}`;

/**
 * Generate ENS-compatible namehash for .hype domains
 * @param domain - The .hype domain name (e.g., "alice.hype")
 * @returns The namehash as a hex string
 */
export function getHypeNamehash(domain: string): string {
  // Simplified namehash implementation
  // In production, use proper ENS namehash algorithm
  const normalized = domain.toLowerCase().replace(/\s+/g, '');
  
  // Mock namehash generation - replace with actual ENS namehash
  let hash = '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  if (normalized.endsWith('.hype')) {
    // Generate a deterministic hash based on the domain
    const domainPart = normalized.replace('.hype', '');
    let hashValue = 0;
    
    for (let i = 0; i < domainPart.length; i++) {
      hashValue = ((hashValue << 5) - hashValue + domainPart.charCodeAt(i)) & 0xffffffff;
    }
    
    // Convert to hex and pad
    const hexHash = Math.abs(hashValue).toString(16).padStart(8, '0');
    hash = `0x${'0'.repeat(56)}${hexHash}`;
  }
  
  return hash;
}

/**
 * Format wallet address for display (truncated)
 * @param address - The wallet address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Formatted address string
 */
export function formatAddress(address: Address, chars: number = 4): string {
  if (!address || address.length < 10) return address;
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Validate if a string is a valid .hype domain
 * @param domain - The domain string to validate
 * @returns True if valid .hype domain
 */
export function isValidHypeDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false;
  
  const normalized = domain.toLowerCase().trim();
  
  // Must end with .hype
  if (!normalized.endsWith('.hype')) return false;
  
  // Extract subdomain part
  const subdomain = normalized.replace('.hype', '');
  
  // Subdomain must be 1-63 characters
  if (subdomain.length < 1 || subdomain.length > 63) return false;
  
  // Must contain only alphanumeric characters and hyphens
  // Cannot start or end with hyphen
  const validPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  
  return validPattern.test(subdomain);
}

/**
 * Extract subdomain from .hype domain
 * @param domain - The full .hype domain
 * @returns The subdomain part (without .hype)
 */
export function getHypeSubdomain(domain: string): string {
  if (!isValidHypeDomain(domain)) return '';
  
  return domain.toLowerCase().replace('.hype', '');
}

/**
 * Get display name for a wallet (domain name or formatted address)
 * @param address - The wallet address
 * @param domain - Optional .hype domain name
 * @returns Display-friendly name
 */
export function getDisplayName(address: Address, domain?: string): string {
  if (domain && isValidHypeDomain(domain)) {
    return domain;
  }
  
  return formatAddress(address);
}

/**
 * Generate avatar URL for a wallet or domain
 * @param identifier - Either a .hype domain or wallet address
 * @returns Avatar URL
 */
export function getAvatarUrl(identifier: string): string {
  // Use a deterministic avatar service
  // In production, this could query text records from the resolver
  const seed = identifier.toLowerCase();
  
  // Using DiceBear API for consistent avatars
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=22c55e&size=40`;
}

/**
 * Normalize .hype domain input
 * @param input - Raw domain input from user
 * @returns Normalized domain or null if invalid
 */
export function normalizeHypeDomain(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  
  let normalized = input.toLowerCase().trim();
  
  // Add .hype if missing
  if (!normalized.endsWith('.hype')) {
    normalized += '.hype';
  }
  
  return isValidHypeDomain(normalized) ? normalized : null;
}

/**
 * Validate Ethereum address format
 * @param address - The address to validate
 * @returns True if valid Ethereum address
 */
export function isValidAddress(address: string): address is Address {
  if (!address || typeof address !== 'string') return false;
  
  // Must start with 0x and be 42 characters total
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
  
  return true;
}

/**
 * Convert address to checksum format
 * @param address - The address to convert
 * @returns Checksummed address
 */
export function toChecksumAddress(address: string): Address {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address format');
  }
  
  // Simplified checksum - in production use proper EIP-55 implementation
  const addr = address.toLowerCase().replace('0x', '');
  let checksummed = '0x';
  
  for (let i = 0; i < addr.length; i++) {
    // Simple checksum logic - replace with proper implementation
    checksummed += Math.random() > 0.5 ? addr[i].toUpperCase() : addr[i];
  }
  
  return checksummed as Address;
}

/**
 * Check if two addresses are equal (case-insensitive)
 * @param address1 - First address
 * @param address2 - Second address
 * @returns True if addresses are equal
 */
export function addressesEqual(address1?: string, address2?: string): boolean {
  if (!address1 || !address2) return false;
  
  return address1.toLowerCase() === address2.toLowerCase();
}

/**
 * Utility constants for .hype integration
 */
export const HYPE_CONSTANTS = {
  DOMAIN_SUFFIX: '.hype',
  MIN_SUBDOMAIN_LENGTH: 1,
  MAX_SUBDOMAIN_LENGTH: 63,
  AVATAR_SIZE: 40,
  ADDRESS_DISPLAY_CHARS: 4,
} as const;

/**
 * Error types for .hype operations
 */
export class HypeResolverError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'HypeResolverError';
  }
}

export const HYPE_ERROR_CODES = {
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  RESOLUTION_FAILED: 'RESOLUTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;