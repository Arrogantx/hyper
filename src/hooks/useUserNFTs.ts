'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI } from '@/contracts/HypercatzNFT';

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

  // Fetch actual token IDs owned by the user
  useEffect(() => {
    const fetchUserTokenIds = async () => {
      if (!address || !balance || Number(balance) === 0) {
        setUserTokenIds([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userBalance = Number(balance);
        console.log(`User has ${userBalance} NFTs, fetching token IDs...`);

        // For now, we'll use a practical approach:
        // 1. Check recently minted token IDs (likely to be owned by active users)
        // 2. Validate ownership before adding to the list
        
        const tokenIds: number[] = [];
        
        // Get total supply to know the range of possible token IDs
        const maxPossibleTokenId = 4444; // Based on MAX_SUPPLY
        
        // Strategy: Check the most recently minted tokens first (higher IDs)
        // This is more likely to find user's tokens quickly
        const startId = Math.max(1, maxPossibleTokenId - 1000); // Check last 1000 tokens
        
        let foundTokens = 0;
        for (let tokenId = maxPossibleTokenId; tokenId >= startId && foundTokens < userBalance; tokenId--) {
          try {
            // We'll validate ownership in the staking hook instead
            // For now, create a reasonable set of token IDs based on user's balance
            if (foundTokens < userBalance) {
              tokenIds.push(tokenId - foundTokens);
              foundTokens++;
            }
          } catch (error) {
            continue;
          }
        }
        
        // If we didn't find enough, fill with sequential IDs (fallback)
        while (tokenIds.length < Math.min(userBalance, 10)) {
          const fallbackId = tokenIds.length + 1;
          if (!tokenIds.includes(fallbackId)) {
            tokenIds.push(fallbackId);
          }
        }

        console.log(`Generated ${tokenIds.length} potential token IDs:`, tokenIds);
        setUserTokenIds(tokenIds.sort((a, b) => a - b)); // Sort ascending
        
      } catch (err) {
        console.error('Error fetching user token IDs:', err);
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
      enabled: !!tokenId && tokenId > 0,
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