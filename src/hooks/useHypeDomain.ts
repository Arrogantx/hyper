'use client';

import { useState, useEffect, useCallback } from 'react';
import { Address, formatAddress, getDisplayName, getAvatarUrl, isValidAddress } from '../utils/hypeResolver';

// Mock data for demonstration - replace with actual contract calls
const MOCK_DOMAINS: Record<string, string> = {
  '0x1234567890123456789012345678901234567890': 'alice.hype',
  '0x0987654321098765432109876543210987654321': 'bob.hype',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': 'charlie.hype',
};

const MOCK_ADDRESSES: Record<string, string> = {
  'alice.hype': '0x1234567890123456789012345678901234567890',
  'bob.hype': '0x0987654321098765432109876543210987654321',
  'charlie.hype': '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
};

/**
 * Hook to resolve primary .hype domain for a wallet address
 * @param address - The wallet address to resolve
 * @returns Object with domain name, loading state, and error
 */
export function usePrimaryDomain(address?: Address) {
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveDomain = useCallback(async (addr: Address) => {
    if (!isValidAddress(addr)) {
      setError('Invalid address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock resolution - replace with actual contract call
      const domain = MOCK_DOMAINS[addr.toLowerCase()] || null;
      setPrimaryDomain(domain);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve domain');
      setPrimaryDomain(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      resolveDomain(address);
    } else {
      setPrimaryDomain(null);
      setError(null);
    }
  }, [address, resolveDomain]);

  return {
    primaryDomain,
    isLoading,
    error,
    refetch: () => address && resolveDomain(address),
  };
}

/**
 * Hook to resolve address from .hype domain name
 * @param domain - The .hype domain to resolve
 * @returns Object with resolved address, loading state, and error
 */
export function useAddressFromDomain(domain?: string) {
  const [resolvedAddress, setResolvedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveAddress = useCallback(async (domainName: string) => {
    if (!domainName || !domainName.endsWith('.hype')) {
      setError('Invalid .hype domain');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock resolution - replace with actual contract call
      const address = MOCK_ADDRESSES[domainName.toLowerCase()] || null;
      setResolvedAddress(address as Address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve address');
      setResolvedAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (domain) {
      resolveAddress(domain);
    } else {
      setResolvedAddress(null);
      setError(null);
    }
  }, [domain, resolveAddress]);

  return {
    resolvedAddress,
    isLoading,
    error,
    refetch: () => domain && resolveAddress(domain),
  };
}

/**
 * Hook to get user avatar from .hype domain or address
 * @param identifier - Either a .hype domain or wallet address
 * @returns Object with avatar URL, loading state, and error
 */
export function useUserAvatar(identifier?: string) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveAvatar = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For now, generate avatar from identifier
      // In production, this would query text records from the resolver
      const avatarUrl = getAvatarUrl(id);
      setAvatar(avatarUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve avatar');
      setAvatar(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (identifier) {
      resolveAvatar(identifier);
    } else {
      setAvatar(null);
      setError(null);
    }
  }, [identifier, resolveAvatar]);

  return {
    avatar,
    isLoading,
    error,
    refetch: () => identifier && resolveAvatar(identifier),
  };
}

/**
 * Combined hook for wallet display information
 * @param address - The wallet address
 * @returns Object with display name, avatar, and loading states
 */
export function useWalletDisplay(address?: Address) {
  const { primaryDomain, isLoading: domainLoading } = usePrimaryDomain(address);
  const { avatar, isLoading: avatarLoading } = useUserAvatar(address || primaryDomain || '');

  const displayName = address ? getDisplayName(address, primaryDomain || undefined) : '';
  const isLoading = domainLoading || avatarLoading;

  return {
    displayName,
    primaryDomain,
    avatar,
    isLoading,
    formattedAddress: address ? formatAddress(address) : '',
  };
}