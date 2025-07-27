'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI } from '@/contracts/HypercatzNFT';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';

export interface UseUserNFTsReturn {
  userTokenIds: number[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUserNFTs(): UseUserNFTsReturn {
  const { address } = useAccount();
  const [userTokenIds, setUserTokenIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Get user's NFT balance
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch actual token IDs owned by the user using tokenOfOwnerByIndex
  useEffect(() => {
    const fetchUserTokenIds = async () => {
      if (!address || balance === undefined || balance === null) {
        setUserTokenIds([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userBalance = Number(balance);
        if (userBalance === 0) {
          setUserTokenIds([]);
          setIsLoading(false);
          return;
        }

        const tokenPromises = Array.from({ length: userBalance }, (_, index) =>
          readContract(config, {
            address: HYPERCATZ_NFT_ADDRESS,
            abi: HYPERCATZ_NFT_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(index)],
          })
        );

        const resolvedTokenIds = await Promise.all(tokenPromises);
        const sortedTokenIds = resolvedTokenIds.map(Number).sort((a, b) => a - b);
        
        setUserTokenIds(sortedTokenIds);
      } catch (err) {
        console.error('Error fetching user token IDs with tokenOfOwnerByIndex:', err);
        // If tokenOfOwnerByIndex fails, you might add a more robust fallback here,
        // but for now, we'll just set the error state.
        setError(err as Error);
        setUserTokenIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTokenIds();
  }, [address, balance, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return {
    userTokenIds,
    isLoading: isLoading || balanceLoading,
    error: error || (balanceError as Error | null),
    refetch,
  };
}

// Helper hook to validate if a user owns a specific token ID
export function useTokenOwnership(tokenId: number) {
  const { address } = useAccount();
  
  const { data: owner, isLoading, error } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'ownerOf',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId && tokenId >= 0, // Allow token ID 0
    },
  });

  const isOwner = address && owner ? address.toLowerCase() === (owner as string).toLowerCase() : false;

  return {
    owner: owner as string | undefined,
    isOwner,
    isLoading,
    error,
  };
}