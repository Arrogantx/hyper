import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI, HypercatzPhase, type ContractInfo, type UserMintInfo } from '@/contracts/HypercatzNFT';

export const useHypercatzContract = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Remove aggressive timeout that causes fallback data issues
  // Let the RPC calls take their natural time to complete

  // Read contract data with balanced polling - prioritize getting real data first
  // Static data - shorter cache to ensure initial load, then longer cache
  const { data: maxSupply } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'MAX_SUPPLY',
    query: {
      staleTime: 30 * 1000, // 30 seconds initially
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  const { data: maxPerWalletGuaranteed } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'maxPerWalletGuaranteed',
    query: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  const { data: maxPerWalletWhitelist } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'maxPerWalletWhitelist',
    query: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  const { data: maxPerWalletPublic } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'maxPerWalletPublic',
    query: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  // Semi-dynamic data - moderate caching
  const { data: currentPhase } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'currentPhase',
    query: {
      staleTime: 10 * 1000, // 10 seconds
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000, // Poll every 30 seconds
    },
  });

  // Dynamic data - minimal caching for real-time updates
  const { data: totalSupply } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'totalSupply',
    query: {
      staleTime: 5 * 1000, // 5 seconds
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000, // Poll every 15 seconds
    },
  });

  const { data: totalMinted } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'totalMinted',
    query: {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  });

  // User-specific data - balanced approach for real data loading
  const { data: userPhaseAccess } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'phaseAccess',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  const { data: userBalance } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 10 * 1000, // 10 seconds
      refetchOnWindowFocus: false,
      refetchInterval: 20 * 1000, // Poll every 20 seconds when connected
    },
  });

  const { data: mintedInGuaranteed } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'mintedPerPhase',
    args: address ? [address, HypercatzPhase.GUARANTEED] : undefined,
    query: {
      enabled: !!address,
      staleTime: 15 * 1000, // 15 seconds
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  const { data: mintedInWhitelist } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'mintedPerPhase',
    args: address ? [address, HypercatzPhase.WHITELIST] : undefined,
    query: {
      enabled: !!address,
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  const { data: mintedInPublic } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'mintedPerPhase',
    args: address ? [address, HypercatzPhase.PUBLIC] : undefined,
    query: {
      enabled: !!address,
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  });

  // Contract info object with fallback data
  const hasContractData = maxSupply !== undefined && totalSupply !== undefined && totalMinted !== undefined && currentPhase !== undefined && maxPerWalletGuaranteed !== undefined && maxPerWalletWhitelist !== undefined && maxPerWalletPublic !== undefined;
  const contractInfo: ContractInfo = hasContractData ? {
    maxSupply: maxSupply as bigint,
    totalSupply: totalSupply as bigint,
    totalMinted: totalMinted as bigint,
    currentPhase: currentPhase as HypercatzPhase,
    maxPerWalletGuaranteed: maxPerWalletGuaranteed as bigint,
    maxPerWalletWhitelist: maxPerWalletWhitelist as bigint,
    maxPerWalletPublic: maxPerWalletPublic as bigint,
  } : {
    // Fallback data when RPC calls fail or timeout
    maxSupply: BigInt(4444),
    totalSupply: BigInt(1234),
    totalMinted: BigInt(1234),
    currentPhase: HypercatzPhase.PUBLIC,
    maxPerWalletGuaranteed: BigInt(1),
    maxPerWalletWhitelist: BigInt(3),
    maxPerWalletPublic: BigInt(5),
  };

  // User mint info object - only provide data when we have real contract data
  const userMintInfo: UserMintInfo | null = isConnected && userPhaseAccess !== undefined && mintedInGuaranteed !== undefined && mintedInWhitelist !== undefined && mintedInPublic !== undefined && userBalance !== undefined ? {
    phaseAccess: userPhaseAccess as HypercatzPhase,
    mintedInGuaranteed: mintedInGuaranteed as bigint,
    mintedInWhitelist: mintedInWhitelist as bigint,
    mintedInPublic: mintedInPublic as bigint,
    balance: userBalance as bigint,
  } : null;

  // Helper functions
  const getPhaseString = (phase: HypercatzPhase): string => {
    switch (phase) {
      case HypercatzPhase.CLOSED:
        return 'CLOSED';
      case HypercatzPhase.GUARANTEED:
        return 'GUARANTEED';
      case HypercatzPhase.WHITELIST:
        return 'WHITELIST';
      case HypercatzPhase.PUBLIC:
        return 'PUBLIC';
      default:
        return 'UNKNOWN';
    }
  };

  const getMaxMintForCurrentPhase = (): bigint => {
    if (!contractInfo) return BigInt(0);
    
    switch (contractInfo.currentPhase) {
      case HypercatzPhase.GUARANTEED:
        return contractInfo.maxPerWalletGuaranteed;
      case HypercatzPhase.WHITELIST:
        return contractInfo.maxPerWalletWhitelist;
      case HypercatzPhase.PUBLIC:
        return contractInfo.maxPerWalletPublic;
      default:
        return BigInt(0);
    }
  };

  const getUserMintedInCurrentPhase = (): bigint => {
    if (!userMintInfo || !contractInfo) return BigInt(0);
    
    switch (contractInfo.currentPhase) {
      case HypercatzPhase.GUARANTEED:
        return userMintInfo.mintedInGuaranteed;
      case HypercatzPhase.WHITELIST:
        return userMintInfo.mintedInWhitelist;
      case HypercatzPhase.PUBLIC:
        return userMintInfo.mintedInPublic;
      default:
        return BigInt(0);
    }
  };

  const canUserMintInCurrentPhase = (): boolean => {
    if (!userMintInfo || !contractInfo) return false;
    
    // Check if user has access to current phase
    return userMintInfo.phaseAccess <= contractInfo.currentPhase;
  };

  const getRemainingMintsForUser = (): bigint => {
    if (!canUserMintInCurrentPhase()) return BigInt(0);
    
    const maxMint = getMaxMintForCurrentPhase();
    const userMinted = getUserMintedInCurrentPhase();
    
    return maxMint > userMinted ? maxMint - userMinted : BigInt(0);
  };

  // Get user's actual phase access (returns null if not available)
  const getUserPhaseAccess = (): HypercatzPhase | null => {
    return userMintInfo?.phaseAccess ?? null;
  };

  // Check if user phase data is loading
  const isUserPhaseLoading = (): boolean => {
    return isConnected && userPhaseAccess === undefined;
  };

  // Get user phase access string with loading/error states
  const getUserPhaseString = (): string => {
    if (!isConnected) return 'Connect wallet to check phase access';
    if (isUserPhaseLoading()) return 'Loading phase access...';
    if (userMintInfo === null) return 'Unable to determine phase access';
    return getPhaseString(userMintInfo.phaseAccess);
  };

  // Check if user has valid phase access for current phase
  const hasValidPhaseAccess = (): boolean => {
    if (!isConnected || !userMintInfo || !contractInfo) return false;
    return userMintInfo.phaseAccess <= contractInfo.currentPhase;
  };

  // Get phase access status with detailed information
  const getPhaseAccessStatus = (): {
    hasAccess: boolean;
    userPhase: HypercatzPhase | null;
    currentPhase: HypercatzPhase;
    isLoading: boolean;
    message: string;
  } => {
    const currentPhase = contractInfo.currentPhase;
    const userPhase = getUserPhaseAccess();
    const isLoading = isUserPhaseLoading();

    if (!isConnected) {
      return {
        hasAccess: false,
        userPhase: null,
        currentPhase,
        isLoading: false,
        message: 'Connect wallet to check phase access'
      };
    }

    if (isLoading) {
      return {
        hasAccess: false,
        userPhase: null,
        currentPhase,
        isLoading: true,
        message: 'Loading phase access...'
      };
    }

    if (userPhase === null) {
      return {
        hasAccess: false,
        userPhase: null,
        currentPhase,
        isLoading: false,
        message: 'Unable to determine phase access'
      };
    }

    const hasAccess = userPhase <= currentPhase;
    const userPhaseStr = getPhaseString(userPhase);
    const currentPhaseStr = getPhaseString(currentPhase);

    return {
      hasAccess,
      userPhase,
      currentPhase,
      isLoading: false,
      message: hasAccess
        ? `You have ${userPhaseStr} access for ${currentPhaseStr} phase`
        : `You have ${userPhaseStr} access, but current phase is ${currentPhaseStr}`
    };
  };

  // Mint functions
  const mintSingle = async () => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    writeContract({
      address: HYPERCATZ_NFT_ADDRESS,
      abi: HYPERCATZ_NFT_ABI,
      functionName: 'mint',
    });
  };

  const mintBatch = async (amount: number) => {
    if (!isConnected) throw new Error('Wallet not connected');
    if (amount <= 0) throw new Error('Invalid mint amount');
    
    writeContract({
      address: HYPERCATZ_NFT_ADDRESS,
      abi: HYPERCATZ_NFT_ABI,
      functionName: 'mintBatch',
      args: [BigInt(amount)],
    });
  };

  const mint = async (amount: number) => {
    if (amount === 1) {
      await mintSingle();
    } else {
      await mintBatch(amount);
    }
  };

  return {
    // Contract data
    contractInfo,
    userMintInfo,
    
    // Helper functions
    getPhaseString,
    getMaxMintForCurrentPhase,
    getUserMintedInCurrentPhase,
    canUserMintInCurrentPhase,
    getRemainingMintsForUser,
    
    // New phase access functions
    getUserPhaseAccess,
    getUserPhaseString,
    hasValidPhaseAccess,
    getPhaseAccessStatus,
    isUserPhaseLoading,
    
    // Mint functions
    mint,
    mintSingle,
    mintBatch,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    
    // Loading states
    isLoading: maxSupply === undefined || totalSupply === undefined || totalMinted === undefined || currentPhase === undefined,
    isUserDataLoading: isConnected && (userPhaseAccess === undefined || userBalance === undefined || mintedInGuaranteed === undefined || mintedInWhitelist === undefined || mintedInPublic === undefined),
  };
};