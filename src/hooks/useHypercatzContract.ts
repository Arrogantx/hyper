import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI, HypercatzPhase, type ContractInfo, type UserMintInfo } from '@/contracts/HypercatzNFT';

export const useHypercatzContract = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract data
  const { data: maxSupply } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'MAX_SUPPLY',
  });

  const { data: totalSupply } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'totalSupply',
  });

  const { data: totalMinted } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'totalMinted',
  });

  const { data: currentPhase } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'currentPhase',
  });

  const { data: maxPerWalletGuaranteed } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'maxPerWalletGuaranteed',
  });

  const { data: maxPerWalletWhitelist } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'maxPerWalletWhitelist',
  });

  const { data: maxPerWalletPublic } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'maxPerWalletPublic',
  });

  // User-specific data
  const { data: userPhaseAccess } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'phaseAccess',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: userBalance } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: mintedInGuaranteed } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'mintedPerPhase',
    args: address ? [address, HypercatzPhase.GUARANTEED] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: mintedInWhitelist } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'mintedPerPhase',
    args: address ? [address, HypercatzPhase.WHITELIST] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: mintedInPublic } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'mintedPerPhase',
    args: address ? [address, HypercatzPhase.PUBLIC] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Contract info object with fallback data
  const contractInfo: ContractInfo = maxSupply && totalSupply !== undefined && totalMinted !== undefined && currentPhase !== undefined && maxPerWalletGuaranteed && maxPerWalletWhitelist && maxPerWalletPublic ? {
    maxSupply: maxSupply as bigint,
    totalSupply: totalSupply as bigint,
    totalMinted: totalMinted as bigint,
    currentPhase: currentPhase as HypercatzPhase,
    maxPerWalletGuaranteed: maxPerWalletGuaranteed as bigint,
    maxPerWalletWhitelist: maxPerWalletWhitelist as bigint,
    maxPerWalletPublic: maxPerWalletPublic as bigint,
  } : {
    // Fallback data for demo purposes
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
    
    // Loading states - properly detect when we're loading user data
    isLoading: maxSupply === undefined || totalSupply === undefined || totalMinted === undefined || currentPhase === undefined,
    isUserDataLoading: isConnected && (userPhaseAccess === undefined || userBalance === undefined || mintedInGuaranteed === undefined || mintedInWhitelist === undefined || mintedInPublic === undefined),
  };
};