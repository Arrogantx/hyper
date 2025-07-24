'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { Address, formatAddress, getDisplayName, getAvatarUrl, isValidAddress } from '../utils/hypeResolver';
import { getCurrentNetworkAddresses } from '@/contracts/addresses';
import { DOT_HYPE_RESOLVER_ABI } from '@/contracts/abis';

/**
 * Hook to resolve primary .hype domain for a wallet address using real contract calls
 * @param address - The wallet address to resolve
 * @returns Object with domain name, loading state, and error
 */
export function usePrimaryDomain(address?: Address) {
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();
  const resolverAddress = addresses.DOT_HYPE_RESOLVER as Address;

  const resolveDomain = useCallback(async (addr: Address) => {
    if (!isValidAddress(addr)) {
      setError('Invalid address');
      return;
    }

    if (!publicClient) {
      setError('No public client available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call getName function on the .hype resolver contract
      const domainName = await publicClient.readContract({
        address: resolverAddress,
        abi: DOT_HYPE_RESOLVER_ABI,
        functionName: 'getName',
        args: [addr],
      });

      // Check if we got a valid domain name
      if (domainName && typeof domainName === 'string' && domainName.trim() !== '') {
        setPrimaryDomain(domainName.trim());
      } else {
        setPrimaryDomain(null);
      }
    } catch (err) {
      console.error('Error fetching primary domain:', err);

      // Handle specific error cases
      let errorMessage = 'Failed to resolve domain';
      if (err instanceof Error) {
        if (err.message.includes('execution reverted')) {
          errorMessage = 'No primary domain set for this address';
        } else if (err.message.includes('OpcodeNotFound')) {
          errorMessage = 'Resolver contract does not support getName function';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setPrimaryDomain(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, resolverAddress]);

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
 * Hook to resolve address from .hype domain name using real contract calls
 * @param domain - The .hype domain to resolve
 * @returns Object with resolved address, loading state, and error
 */
export function useAddressFromDomain(domain?: string) {
  const [resolvedAddress, setResolvedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();
  const resolverAddress = addresses.DOT_HYPE_RESOLVER as Address;

  const resolveAddress = useCallback(async (domainName: string) => {
    if (!domainName || !domainName.endsWith('.hype')) {
      setError('Invalid .hype domain');
      return;
    }

    if (!publicClient) {
      setError('No public client available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call getAddress function on the .hype resolver contract
      const address = await publicClient.readContract({
        address: resolverAddress,
        abi: DOT_HYPE_RESOLVER_ABI,
        functionName: 'getAddress',
        args: [domainName],
      });

      // Check if we got a valid address
      if (address && isValidAddress(address as string)) {
        setResolvedAddress(address as Address);
      } else {
        setResolvedAddress(null);
      }
    } catch (err) {
      console.error('Error resolving address from domain:', err);
      setError(err instanceof Error ? err.message : 'Failed to resolve address');
      setResolvedAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, resolverAddress]);

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
 * Hook to get user avatar from .hype domain using real contract calls
 * @param address - User's wallet address
 * @returns Object with avatar URL, loading state, and error
 */
export function useUserAvatar(address?: Address) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();
  const resolverAddress = addresses.DOT_HYPE_RESOLVER as Address;

  // Get the primary domain for this address first
  const { primaryDomain } = usePrimaryDomain(address);

  const fetchAvatar = useCallback(async (userAddress: Address) => {
    if (!publicClient) {
      setError('No public client available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get avatar text record from the .hype resolver using the address
      const avatarRecord = await publicClient.readContract({
        address: resolverAddress,
        abi: DOT_HYPE_RESOLVER_ABI,
        functionName: 'getValue',
        args: [userAddress, 'avatar'],
      });

      if (avatarRecord && typeof avatarRecord === 'string' && avatarRecord.trim()) {
        setAvatar(avatarRecord.trim());
      } else {
        // Generate a default avatar based on the primary domain or address
        if (primaryDomain) {
          const seed = primaryDomain.replace('.hype', '');
          setAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=22c55e&size=40`);
        } else {
          setAvatar(getAvatarUrl(userAddress));
        }
      }
    } catch (err) {
      console.error('Error fetching avatar:', err);
      // Fallback to generated avatar on error
      if (primaryDomain) {
        const seed = primaryDomain.replace('.hype', '');
        setAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=22c55e&size=40`);
      } else {
        setAvatar(getAvatarUrl(userAddress));
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch avatar');
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, resolverAddress, primaryDomain]);

  useEffect(() => {
    if (address) {
      fetchAvatar(address);
    } else {
      setAvatar(null);
      setError(null);
    }
  }, [address, fetchAvatar]);

  return {
    avatar,
    isLoading,
    error,
    refetch: () => address && fetchAvatar(address),
  };
}

/**
 * Combined hook for wallet display information
 * @param address - The wallet address
 * @returns Object with display name, avatar, and loading states
 */
export function useWalletDisplay(address?: Address) {
  const { primaryDomain, isLoading: domainLoading } = usePrimaryDomain(address);
  const { avatar, isLoading: avatarLoading } = useUserAvatar(address);

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