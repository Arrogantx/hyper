'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { Address, formatAddress, getDisplayName, getAvatarUrl, isValidAddress } from '@/utils/hypeResolver';
import { getCurrentNetworkAddresses } from '@/contracts/addresses';
import { 
  DOT_HYPE_REGISTRY_ABI, 
  DOT_HYPE_RESOLVER_ABI, 
  namehash, 
  isValidHypeDomain 
} from '@/contracts/abis';

/**
 * Hook to resolve primary .hype domain for a wallet address using proper Registry → Resolver flow
 * @param address - The wallet address to resolve
 * @returns Object with domain name, loading state, and error
 */
export function usePrimaryDomain(address?: Address) {
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();

  const resolveDomain = useCallback(async (addr: Address) => {
    if (!addr || !isValidAddress(addr)) {
      setPrimaryDomain(null);
      setError(null);
      return;
    }

    if (!publicClient) {
      setPrimaryDomain(null);
      setError(null);
      return;
    }

    // Skip resolution if registry address is not available
    if (!addresses.DOT_HYPE_REGISTRY || addresses.DOT_HYPE_REGISTRY === '0x0000000000000000000000000000000000000000') {
      setPrimaryDomain(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create reverse lookup node for the address
      // For reverse lookups, we use addr.reverse format
      const reverseNode = await namehash(`${addr.toLowerCase().slice(2)}.addr.reverse`);

      // Step 2: Get the resolver for this reverse node from the registry
      const resolverAddress = await publicClient.readContract({
        address: addresses.DOT_HYPE_REGISTRY,
        abi: DOT_HYPE_REGISTRY_ABI,
        functionName: 'resolver',
        args: [reverseNode],
      });

      // Step 3: If no resolver is set, there's no primary domain
      if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
        setPrimaryDomain(null);
        return;
      }

      // Step 4: Query the resolver for the name
      const domainName = await publicClient.readContract({
        address: resolverAddress as Address,
        abi: DOT_HYPE_RESOLVER_ABI,
        functionName: 'name',
        args: [reverseNode],
      });

      // Step 5: Validate the returned domain name
      if (domainName && typeof domainName === 'string' && domainName.trim() !== '') {
        const cleanDomain = domainName.trim();
        if (isValidHypeDomain(cleanDomain)) {
          setPrimaryDomain(cleanDomain);
        } else {
          setPrimaryDomain(null);
        }
      } else {
        setPrimaryDomain(null);
      }
    } catch (err) {
      console.error('Error fetching primary domain:', err);

      // Silently handle resolver errors to prevent page crashes
      // This is expected when no domain is set or resolver doesn't exist
      setPrimaryDomain(null);
      
      // Only set error for debugging, don't crash the UI
      if (process.env.NODE_ENV === 'development') {
        let errorMessage = 'Failed to resolve domain';
        if (err instanceof Error) {
          if (err.message.includes('execution reverted') || err.message.includes('resolver')) {
            errorMessage = 'No primary domain set for this address';
          } else {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
      } else {
        setError(null); // Don't show errors in production
      }
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, addresses]);

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
 * Hook to resolve address from .hype domain name using proper Registry → Resolver flow
 * @param domain - The .hype domain to resolve
 * @returns Object with resolved address, loading state, and error
 */
export function useAddressFromDomain(domain?: string) {
  const [resolvedAddress, setResolvedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();

  const resolveAddress = useCallback(async (domainName: string) => {
    if (!isValidHypeDomain(domainName)) {
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
      // Step 1: Convert domain name to node hash
      const node = await namehash(domainName);

      // Step 2: Get the resolver for this domain from the registry
      const resolverAddress = await publicClient.readContract({
        address: addresses.DOT_HYPE_REGISTRY,
        abi: DOT_HYPE_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node],
      });

      // Step 3: If no resolver is set, the domain doesn't resolve to an address
      if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
        setResolvedAddress(null);
        setError('Domain has no resolver configured');
        return;
      }

      // Step 4: Query the resolver for the address
      const address = await publicClient.readContract({
        address: resolverAddress as Address,
        abi: DOT_HYPE_RESOLVER_ABI,
        functionName: 'addr',
        args: [node],
      });

      // Step 5: Validate the returned address
      if (address && isValidAddress(address as string)) {
        setResolvedAddress(address as Address);
      } else {
        setResolvedAddress(null);
        setError('Domain does not resolve to a valid address');
      }
    } catch (err) {
      console.error('Error resolving address from domain:', err);
      setError(err instanceof Error ? err.message : 'Failed to resolve address');
      setResolvedAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, addresses]);

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
 * Hook to get user avatar from .hype domain using proper Registry → Resolver flow
 * @param address - User's wallet address
 * @returns Object with avatar URL, loading state, and error
 */
export function useUserAvatar(address?: Address) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();

  // Get the primary domain for this address first
  const { primaryDomain } = usePrimaryDomain(address);

  const fetchAvatar = useCallback(async (userAddress: Address, domain?: string) => {
    if (!publicClient) {
      setError('No public client available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let avatarRecord = '';

      if (domain && isValidHypeDomain(domain)) {
        // Step 1: Convert domain name to node hash
        const node = await namehash(domain);

        // Step 2: Get the resolver for this domain from the registry
        const resolverAddress = await publicClient.readContract({
          address: addresses.DOT_HYPE_REGISTRY,
          abi: DOT_HYPE_REGISTRY_ABI,
          functionName: 'resolver',
          args: [node],
        });

        // Step 3: If resolver exists, query for avatar text record
        if (resolverAddress && resolverAddress !== '0x0000000000000000000000000000000000000000') {
          avatarRecord = await publicClient.readContract({
            address: resolverAddress as Address,
            abi: DOT_HYPE_RESOLVER_ABI,
            functionName: 'text',
            args: [node, 'avatar'],
          }) as string;
        }
      }

      if (avatarRecord && avatarRecord.trim()) {
        setAvatar(avatarRecord.trim());
      } else {
        // Generate a default avatar based on the primary domain or address
        if (domain) {
          const seed = domain.replace('.hype', '');
          setAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=22c55e&size=40`);
        } else {
          setAvatar(getAvatarUrl(userAddress));
        }
      }
    } catch (err) {
      console.error('Error fetching avatar:', err);
      // Fallback to generated avatar on error
      if (domain) {
        const seed = domain.replace('.hype', '');
        setAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=22c55e&size=40`);
      } else {
        setAvatar(getAvatarUrl(userAddress));
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch avatar');
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, addresses]);

  useEffect(() => {
    if (address) {
      fetchAvatar(address, primaryDomain || undefined);
    } else {
      setAvatar(null);
      setError(null);
    }
  }, [address, primaryDomain, fetchAvatar]);

  return {
    avatar,
    isLoading,
    error,
    refetch: () => address && fetchAvatar(address, primaryDomain || undefined),
  };
}

/**
 * Hook to check if a .hype domain is available for registration
 * @param domain - The .hype domain to check
 * @returns Object with availability status, loading state, and error
 */
export function useDomainAvailability(domain?: string) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();

  const checkAvailability = useCallback(async (domainName: string) => {
    if (!isValidHypeDomain(domainName)) {
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
      // Step 1: Convert domain name to node hash
      const node = await namehash(domainName);

      // Step 2: Check if record exists in registry
      const recordExists = await publicClient.readContract({
        address: addresses.DOT_HYPE_REGISTRY,
        abi: DOT_HYPE_REGISTRY_ABI,
        functionName: 'recordExists',
        args: [node],
      });

      setIsAvailable(!recordExists);
    } catch (err) {
      console.error('Error checking domain availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to check availability');
      setIsAvailable(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, addresses]);

  useEffect(() => {
    if (domain) {
      checkAvailability(domain);
    } else {
      setIsAvailable(null);
      setError(null);
    }
  }, [domain, checkAvailability]);

  return {
    isAvailable,
    isLoading,
    error,
    refetch: () => domain && checkAvailability(domain),
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