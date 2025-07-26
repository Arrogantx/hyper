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
      console.log('useUserNFTs: fetchUserTokenIds called', {
        address,
        balance: balance?.toString(),
        balanceType: typeof balance,
        balanceNumber: balance ? Number(balance) : 'undefined',
        balanceRaw: balance
      });
      
      if (!address) {
        console.log('useUserNFTs: No address, setting empty token IDs');
        setUserTokenIds([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      if (!balance || Number(balance) === 0) {
        console.log('useUserNFTs: No balance or zero balance detected, but checking for token ownership anyway...');
        
        // Even if balanceOf returns 0, the user might still own tokens
        // This can happen due to contract issues or wallet connection problems
        // Let's check for token ownership directly
        setIsLoading(true);
        setError(null);
        
        try {
          const tokenIds: number[] = [];
          
          // Check a reasonable range of token IDs for ownership
          // Start with common low token IDs including 0, then check some higher ranges
          const tokenIdsToCheck = [
            // Low token IDs (most common)
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            // Some mid-range tokens
            50, 51, 52, 53, 54, 55, 100, 101, 102, 103, 104, 105,
            // Some higher tokens
            500, 501, 502, 1000, 1001, 1002, 2000, 2001, 2002
          ];
          
          console.log('Checking token ownership for IDs:', tokenIdsToCheck);
          
          for (const tokenId of tokenIdsToCheck) {
            try {
              const owner = await readContract(config, {
                address: HYPERCATZ_NFT_ADDRESS,
                abi: HYPERCATZ_NFT_ABI,
                functionName: 'ownerOf',
                args: [BigInt(tokenId)],
              });
              
              if (owner && (owner as string).toLowerCase() === address.toLowerCase()) {
                tokenIds.push(tokenId);
                console.log(`User owns token #${tokenId} (despite balanceOf returning 0)`);
              }
            } catch (ownerError) {
              // Token doesn't exist or other error, continue
              continue;
            }
          }
          
          if (tokenIds.length > 0) {
            console.log(`Found ${tokenIds.length} tokens despite balanceOf returning 0:`, tokenIds);
            setUserTokenIds(tokenIds.sort((a, b) => a - b));
          } else {
            console.log('No tokens found even with direct ownership check');
            setUserTokenIds([]);
          }
          
        } catch (err) {
          console.error('Error in fallback token ownership check:', err);
          setError(err as Error);
          setUserTokenIds([]);
        } finally {
          setIsLoading(false);
        }
        
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
              
              // Fallback: Check a wider range of token IDs to find user's actual tokens
              // Since we know the user has `userBalance` NFTs, we need to find them
              console.warn('Using fallback method to find user tokens');
              
              // Check tokens in batches to avoid overwhelming the RPC
              const maxTokenId = 4444; // Based on MAX_SUPPLY
              const batchSize = 50;
              
              for (let start = 0; start <= maxTokenId && tokenIds.length < userBalance; start += batchSize) {
                const end = Math.min(start + batchSize - 1, maxTokenId);
                const batch = [];
                
                // Create batch of ownership checks
                for (let testTokenId = start; testTokenId <= end && tokenIds.length < userBalance; testTokenId++) {
                  batch.push(
                    readContract(config, {
                      address: HYPERCATZ_NFT_ADDRESS,
                      abi: HYPERCATZ_NFT_ABI,
                      functionName: 'ownerOf',
                      args: [BigInt(testTokenId)],
                    }).then(owner => ({ tokenId: testTokenId, owner }))
                    .catch(() => ({ tokenId: testTokenId, owner: null })) // Token doesn't exist
                  );
                }
                
                try {
                  const results = await Promise.all(batch);
                  
                  for (const result of results) {
                    if (tokenIds.length >= userBalance) break;
                    
                    if (result.owner &&
                        (result.owner as string).toLowerCase() === address.toLowerCase()) {
                      tokenIds.push(result.tokenId);
                      console.log(`User owns token #${result.tokenId}`);
                    }
                  }
                } catch (batchError) {
                  console.error(`Error in batch ${start}-${end}:`, batchError);
                  // Continue with next batch
                }
                
                // Small delay to avoid rate limiting
                if (start + batchSize <= maxTokenId) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              }
              break; // Exit the main loop since we're using fallback method
            }
          }
        }

        console.log(`Found ${tokenIds.length} actual token IDs for user:`, tokenIds);
        
        // Final validation: ensure we found the expected number of tokens
        if (tokenIds.length !== userBalance) {
          console.warn(`Expected ${userBalance} tokens but found ${tokenIds.length}. This might indicate an issue with token enumeration.`);
        }
        
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