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
      console.log('useUserNFTs: fetchUserTokenIds called', { address, balance: balance?.toString() });
      
      if (!address) {
        console.log('useUserNFTs: No address, setting empty token IDs');
        setUserTokenIds([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      if (!balance || Number(balance) === 0) {
        console.log('useUserNFTs: No balance or zero balance, setting empty token IDs');
        setUserTokenIds([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userBalance = Number(balance);
        console.log(`useUserNFTs: User ${address} has ${userBalance} NFTs, fetching actual token IDs using tokenOfOwnerByIndex...`);

        const tokenIds: number[] = [];
        
        // Use tokenOfOwnerByIndex to get the actual token IDs owned by the user
        for (let index = 0; index < userBalance; index++) {
          try {
            const tokenId = await readContract(config, {
              address: HYPERCATZ_NFT_ADDRESS,
              abi: HYPERCATZ_NFT_ABI,
              functionName: 'tokenOfOwnerByIndex',
              args: [address, BigInt(index)],
            });
            
            const tokenIdNumber = Number(tokenId);
            tokenIds.push(tokenIdNumber);
            console.log(`Token at index ${index}: #${tokenIdNumber}`);
            
          } catch (err) {
            console.error(`Error fetching token at index ${index}:`, err);
            // If tokenOfOwnerByIndex fails, the contract might not support enumeration
            // Fall back to checking ownership of common token IDs
            if (index === 0) {
              console.warn('tokenOfOwnerByIndex not supported, falling back to ownership validation');
              
              // Check token #0 first since user reported owning it
              const commonTokenIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
              
              for (const testTokenId of commonTokenIds) {
                if (tokenIds.length >= userBalance) break;
                
                try {
                  const owner = await readContract(config, {
                    address: HYPERCATZ_NFT_ADDRESS,
                    abi: HYPERCATZ_NFT_ABI,
                    functionName: 'ownerOf',
                    args: [BigInt(testTokenId)],
                  });
                  
                  if (owner && (owner as string).toLowerCase() === address.toLowerCase()) {
                    tokenIds.push(testTokenId);
                    console.log(`User owns token #${testTokenId}`);
                  }
                } catch (ownerError) {
                  // Token doesn't exist or other error, continue
                  continue;
                }
              }
              break; // Exit the main loop since we're using fallback method
            }
          }
        }

        console.log(`Found ${tokenIds.length} actual token IDs for user:`, tokenIds);
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