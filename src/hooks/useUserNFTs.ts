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

      setIsLoading(true);
      setError(null);

      try {
        const userBalance = balance ? Number(balance) : 0;
        console.log(`useUserNFTs: User ${address} has ${userBalance} NFTs according to balanceOf`);
        console.log(`useUserNFTs: Balance raw value:`, balance);
        console.log(`useUserNFTs: Balance type:`, typeof balance);

        const tokenIds: number[] = [];
        
        // 🔍 DEBUGGING: Test ownership of token #0 specifically since user confirmed they own it
        console.log('🔍 Testing ownership of token #0 (user confirmed they own this)...');
        try {
          const owner0 = await readContract(config, {
            address: HYPERCATZ_NFT_ADDRESS,
            abi: HYPERCATZ_NFT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(0)],
          });
          console.log(`Token #0 owner from contract:`, owner0);
          console.log(`User address:`, address);
          console.log(`Addresses match:`, owner0 && (owner0 as string).toLowerCase() === address.toLowerCase());
          
          if (owner0 && (owner0 as string).toLowerCase() === address.toLowerCase()) {
            tokenIds.push(0);
            console.log('✅ CONFIRMED: User owns token #0!');
            
            // Test a few more tokens to see if user owns others
            const additionalTests = [1, 2, 3, 4, 5];
            for (const testToken of additionalTests) {
              try {
                const owner = await readContract(config, {
                  address: HYPERCATZ_NFT_ADDRESS,
                  abi: HYPERCATZ_NFT_ABI,
                  functionName: 'ownerOf',
                  args: [BigInt(testToken)],
                });
                
                if (owner && (owner as string).toLowerCase() === address.toLowerCase()) {
                  tokenIds.push(testToken);
                  console.log(`✅ User also owns token #${testToken}!`);
                }
              } catch (err) {
                // Token doesn't exist or user doesn't own it, continue
                continue;
              }
            }
            
            // If we found tokens, return them immediately
            if (tokenIds.length > 0) {
              console.log(`🎉 Found ${tokenIds.length} tokens via direct testing:`, tokenIds);
              setUserTokenIds(tokenIds.sort((a, b) => a - b));
              return;
            }
          } else {
            console.log('❌ Contract says user does NOT own token #0 - this contradicts user feedback!');
            console.log('❌ This suggests there might be a network/RPC issue or wrong contract address');
          }
        } catch (err) {
          console.error('❌ Error checking token #0 ownership:', err);
        }
        
        // First, try to use tokenOfOwnerByIndex if balance > 0
        if (userBalance > 0) {
          console.log('Attempting to use tokenOfOwnerByIndex...');
          let enumSuccess = true;
          
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
              enumSuccess = false;
              break;
            }
          }
          
          // If enumeration was successful, we're done
          if (enumSuccess && tokenIds.length === userBalance) {
            console.log(`Successfully enumerated ${tokenIds.length} tokens using tokenOfOwnerByIndex`);
            setUserTokenIds(tokenIds.sort((a, b) => a - b));
            return;
          } else {
            console.warn('tokenOfOwnerByIndex failed or incomplete, falling back to ownership scanning');
            tokenIds.length = 0; // Clear partial results
          }
        }
        
        // Fallback method: scan for token ownership
        // This handles cases where balanceOf returns 0 but user actually owns tokens,
        // or when tokenOfOwnerByIndex is not supported/fails
        console.log('Using fallback ownership scanning method...');
        
        // Define ranges to check - prioritize common token ranges
        const tokenRanges = [
          // Low token IDs (most common for early mints)
          { start: 0, end: 100 },
          // Mid-range tokens
          { start: 100, end: 500 },
          // Higher range tokens
          { start: 500, end: 1000 },
          // Even higher if needed
          { start: 1000, end: 2000 },
          // Final range up to max supply
          { start: 2000, end: 4444 }
        ];
        
        const batchSize = 25; // Smaller batch size to avoid RPC limits
        let foundTokens = 0;
        const expectedTokens = userBalance > 0 ? userBalance : 10; // If balance is 0, check up to 10 tokens
        
        for (const range of tokenRanges) {
          if (foundTokens >= expectedTokens && userBalance > 0) break;
          
          console.log(`Scanning token range ${range.start}-${range.end}...`);
          
          for (let start = range.start; start <= range.end && (foundTokens < expectedTokens || userBalance === 0); start += batchSize) {
            const end = Math.min(start + batchSize - 1, range.end);
            const batch = [];
            
            // Create batch of ownership checks
            for (let testTokenId = start; testTokenId <= end; testTokenId++) {
              batch.push(
                readContract(config, {
                  address: HYPERCATZ_NFT_ADDRESS,
                  abi: HYPERCATZ_NFT_ABI,
                  functionName: 'ownerOf',
                  args: [BigInt(testTokenId)],
                }).then(owner => ({ tokenId: testTokenId, owner, exists: true }))
                .catch(() => ({ tokenId: testTokenId, owner: null, exists: false }))
              );
            }
            
            try {
              const results = await Promise.all(batch);
              
              for (const result of results) {
                if (result.exists && result.owner &&
                    (result.owner as string).toLowerCase() === address.toLowerCase()) {
                  tokenIds.push(result.tokenId);
                  foundTokens++;
                  console.log(`User owns token #${result.tokenId}`);
                  
                  // If we found the expected number of tokens (and balance > 0), we can stop
                  if (userBalance > 0 && foundTokens >= userBalance) {
                    break;
                  }
                }
              }
              
              // Small delay to avoid rate limiting
              if (start + batchSize <= range.end) {
                await new Promise(resolve => setTimeout(resolve, 50));
              }
              
            } catch (batchError) {
              console.error(`Error in batch ${start}-${end}:`, batchError);
              // Continue with next batch
            }
          }
        }

        console.log(`Ownership scan complete. Found ${tokenIds.length} tokens for user.`);
        
        if (tokenIds.length > 0) {
          console.log(`User owns tokens:`, tokenIds.sort((a, b) => a - b));
        } else {
          console.log('No tokens found for user');
        }
        
        setUserTokenIds(tokenIds.sort((a, b) => a - b));
        
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