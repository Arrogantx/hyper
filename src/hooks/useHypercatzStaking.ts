import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { readContract } from '@wagmi/core';
import { formatUnits, parseUnits } from 'viem';
import {
  HYPERCATZ_STAKING_ADDRESS,
  HYPERCATZ_STAKING_ABI,
  type UserStakingData,
  calculateRewards,
  formatStakingDuration,
  isValidTokenId
} from '@/contracts/hypercatzStaking';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI } from '@/contracts/HypercatzNFT';
import { HYPER_POINTS_ABI } from '@/contracts/abis';
import { getCurrentNetworkAddresses } from '@/contracts/addresses';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import { config } from '@/lib/wagmi';
import { useUserNFTs } from './useUserNFTs';
import { useNFTApproval } from './useNFTApproval';

export const useHypercatzStaking = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);
  
  // Use the new hook to get user's actual NFT token IDs
  const { userTokenIds, isLoading: nftsLoading, error: nftsError, refetch: refetchUserNFTs } = useUserNFTs();
  
  // Use the approval hook
  const {
    isApprovedForAll,
    isApprovalLoading,
    approveAll,
    approvalHash,
    isApprovalPending,
    isApprovalConfirming,
    isApprovalConfirmed,
    approvalError,
    refetchApprovalStatus,
  } = useNFTApproval();

  // Check if contracts are deployed (not zero address)
  const contractsDeployed = HYPERCATZ_STAKING_ADDRESS !== '0x0000000000000000000000000000000000000000';

  // Read user's NFT balance
  const { data: nftBalance } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read user's HyperPoints token balance
  const { data: hyperPointsBalance } = useReadContract({
    address: getCurrentNetworkAddresses().HYPER_POINTS,
    abi: HYPER_POINTS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  // Read staking contract data with refetch capability
  const { data: stakedTokenIds, refetch: refetchStakedTokenIds } = useReadContract({
    address: HYPERCATZ_STAKING_ADDRESS,
    abi: HYPERCATZ_STAKING_ABI,
    functionName: 'getStaked',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: claimableRewards, refetch: refetchClaimableRewards } = useReadContract({
    address: HYPERCATZ_STAKING_ADDRESS,
    abi: HYPERCATZ_STAKING_ABI,
    functionName: 'getClaimable',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: totalEarned, refetch: refetchTotalEarned } = useReadContract({
    address: HYPERCATZ_STAKING_ADDRESS,
    abi: HYPERCATZ_STAKING_ABI,
    functionName: 'getTotalEarned',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: totalClaimed, refetch: refetchTotalClaimed } = useReadContract({
    address: HYPERCATZ_STAKING_ADDRESS,
    abi: HYPERCATZ_STAKING_ABI,
    functionName: 'totalClaimed',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: rewardRatePerNFT } = useReadContract({
    address: HYPERCATZ_STAKING_ADDRESS,
    abi: HYPERCATZ_STAKING_ABI,
    functionName: 'rewardRatePerNFT',
    query: {
      enabled: contractsDeployed,
    },
  });

  // Comprehensive refetch function
  const refetchAllData = useCallback(async () => {
    console.log('Refetching all staking data...');
    try {
      await Promise.all([
        refetchStakedTokenIds(),
        refetchClaimableRewards(),
        refetchTotalEarned(),
        refetchTotalClaimed(),
        refetchUserNFTs(), // Refetch user NFTs
        refetchApprovalStatus(), // Refetch approval status
      ]);
      console.log('All data refetched successfully');
    } catch (error) {
      console.error('Error refetching data:', error);
    }
  }, [refetchStakedTokenIds, refetchClaimableRewards, refetchTotalEarned, refetchTotalClaimed, refetchUserNFTs, refetchApprovalStatus]);

  // Calculate available NFTs (user's NFTs minus staked ones)
  const availableNFTs = userTokenIds.filter(tokenId => {
    const stakedIds = stakedTokenIds ? stakedTokenIds.map(id => Number(id)) : [];
    return !stakedIds.includes(tokenId);
  });

  console.log("User's token IDs:", userTokenIds);
  console.log("Available NFTs for staking:", availableNFTs);
  console.log("Currently staked NFTs:", stakedTokenIds ? stakedTokenIds.map(id => Number(id)) : []);

  // Helper function to validate token existence on-chain
  const validateTokenExists = async (tokenId: number): Promise<boolean> => {
    try {
      const owner = await readContract(config, {
        address: HYPERCATZ_NFT_ADDRESS,
        abi: HYPERCATZ_NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      return !!owner;
    } catch (error) {
      console.log(`Token #${tokenId} does not exist or error checking:`, error);
      return false;
    }
  };

  // User staking data
  const userStakingData: UserStakingData = {
    stakedTokenIds: stakedTokenIds ? [...stakedTokenIds] : [],
    claimableRewards: claimableRewards || BigInt(0),
    totalEarned: totalEarned || BigInt(0),
    totalClaimed: totalClaimed || BigInt(0),
  };

  // Staking functions
  const stakeNFTs = useCallback(async (tokenIds: number[]) => {
    console.log("=== STAKING DEBUG INFO ===");
    console.log("Token IDs to stake:", tokenIds);
    console.log("Token IDs length:", tokenIds.length);
    console.log("Token IDs types:", tokenIds.map(id => typeof id));
    
    if (!isConnected) throw new Error('Wallet not connected');
    if (!contractsDeployed) throw new Error('Staking contract not deployed');
    if (tokenIds.length === 0) throw new Error('No NFTs selected');

    // Check approval status first
    console.log("Checking NFT approval status...");
    console.log("Is approved for all:", isApprovedForAll);
    
    if (!isApprovedForAll) {
      throw new Error('NFTs must be approved for staking first. Please approve your NFTs and try again.');
    }

    // Validate token IDs
    console.log("Validating token IDs...");
    const invalidIds = tokenIds.filter(id => {
      const isValid = isValidTokenId(id);
      console.log(`Token ID ${id}: ${isValid ? 'VALID' : 'INVALID'}`);
      return !isValid;
    });
    
    if (invalidIds.length > 0) {
      console.error(`Invalid token IDs found: ${invalidIds.join(', ')}`);
      throw new Error(`Invalid token IDs: ${invalidIds.join(', ')}`);
    }

    // Additional validation - ensure all are non-negative integers
    const invalidIds2 = tokenIds.filter(id => !Number.isInteger(id) || id < 0);
    if (invalidIds2.length > 0) {
      console.error(`Invalid token IDs found: ${invalidIds2.join(', ')}`);
      throw new Error(`Token IDs must be non-negative integers: ${invalidIds2.join(', ')}`);
    }

    // Validate that user actually owns these tokens
    const userOwnedIds = availableNFTs;
    console.log("User's available NFTs for validation:", userOwnedIds);
    console.log("Token IDs being validated:", tokenIds);
    
    const notOwnedIds = tokenIds.filter(id => !userOwnedIds.includes(id));
    if (notOwnedIds.length > 0) {
      console.error(`User does not own these token IDs: ${notOwnedIds.join(', ')}`);
      console.error(`User's available NFTs: ${userOwnedIds.join(', ')}`);
      
      // Provide more specific error message
      if (userOwnedIds.length === 0) {
        throw new Error(`No NFTs found in your wallet. Please ensure you own Hypercatz NFTs and try refreshing the page.`);
      } else {
        throw new Error(`You don't own NFT${notOwnedIds.length > 1 ? 's' : ''} #${notOwnedIds.join(', #')}. Available NFTs: #${userOwnedIds.join(', #')}`);
      }
    }

    // Additional validation: Check if tokens actually exist on-chain
    console.log("Performing on-chain token existence validation...");
    const nonExistentTokens: number[] = [];
    
    for (const tokenId of tokenIds) {
      const exists = await validateTokenExists(tokenId);
      if (!exists) {
        nonExistentTokens.push(tokenId);
      }
    }
    
    if (nonExistentTokens.length > 0) {
      console.error(`These tokens do not exist on-chain: ${nonExistentTokens.join(', ')}`);
      throw new Error(`Token${nonExistentTokens.length > 1 ? 's' : ''} #${nonExistentTokens.join(', #')} do${nonExistentTokens.length === 1 ? 'es' : ''} not exist. Please refresh the page and try again.`);
    }

    console.log("All validations passed, proceeding with staking...");
    console.log("Converting to BigInt:", tokenIds.map(id => BigInt(id)));

    try {
      const tokenIdsBigInt = tokenIds.map(id => BigInt(id));
      console.log("Staking contract call args:", tokenIdsBigInt);
      
      writeContract({
        address: HYPERCATZ_STAKING_ADDRESS,
        abi: HYPERCATZ_STAKING_ABI,
        functionName: 'stake',
        args: [tokenIdsBigInt],
      });
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    }
  }, [isConnected, contractsDeployed, writeContract, availableNFTs, isApprovedForAll]);

  const unstakeNFTs = useCallback(async (tokenIds: number[]) => {
    if (!isConnected) throw new Error('Wallet not connected');
    if (!contractsDeployed) throw new Error('Staking contract not deployed');
    if (tokenIds.length === 0) throw new Error('No NFTs selected');

    try {
      writeContract({
        address: HYPERCATZ_STAKING_ADDRESS,
        abi: HYPERCATZ_STAKING_ABI,
        functionName: 'unstake',
        args: [tokenIds.map(id => BigInt(id))],
      });
    } catch (error) {
      console.error('Unstaking failed:', error);
      throw error;
    }
  }, [isConnected, contractsDeployed, writeContract]);

  const claimRewards = useCallback(async () => {
    if (!isConnected) throw new Error('Wallet not connected');
    if (!contractsDeployed) throw new Error('Staking contract not deployed');

    try {
      writeContract({
        address: HYPERCATZ_STAKING_ADDRESS,
        abi: HYPERCATZ_STAKING_ABI,
        functionName: 'claim',
      });
    } catch (error) {
      console.error('Claim failed:', error);
      throw error;
    }
  }, [isConnected, contractsDeployed, writeContract]);

  // Helper functions
  const canStake = (): boolean => {
    return !!(contractsDeployed && isConnected && availableNFTs.length > 0);
  };

  const canUnstake = (): boolean => {
    return !!(contractsDeployed && isConnected && userStakingData.stakedTokenIds.length > 0);
  };

  const canClaim = (): boolean => {
    return !!(contractsDeployed && isConnected && userStakingData.claimableRewards > 0);
  };

  const getEstimatedDailyRewards = (): number => {
    if (!rewardRatePerNFT || userStakingData.stakedTokenIds.length === 0) return 0;
    
    const dailyRewardPerNFT = Number(formatUnits(rewardRatePerNFT, 18));
    return dailyRewardPerNFT * userStakingData.stakedTokenIds.length;
  };

  const getTotalStaked = (): number => {
    return userStakingData.stakedTokenIds.length;
  };

  const getClaimableAmount = (): number => {
    return Number(formatUnits(userStakingData.claimableRewards, 18));
  };

  const getTotalEarnedAmount = (): number => {
    return Number(formatUnits(userStakingData.totalEarned, 18));
  };

  const getTotalClaimedAmount = (): number => {
    return Number(formatUnits(userStakingData.totalClaimed, 18));
  };

  // Calculate APY based on reward rate
  const getAPY = (): number => {
    if (!rewardRatePerNFT) return 0;
    
    // This is a simplified calculation - you might need to adjust based on your tokenomics
    const dailyReward = Number(formatUnits(rewardRatePerNFT, 18));
    const yearlyReward = dailyReward * 365;
    
    // Assuming each NFT has a base value for APY calculation
    // You might want to use floor price or average trading price
    const estimatedNFTValue = 1; // Placeholder - replace with actual logic
    
    return estimatedNFTValue > 0 ? (yearlyReward / estimatedNFTValue) * 100 : 0;
  };

  // Determine if we're still loading critical data
  const isLoadingCriticalData = isConnected && (
    nftsLoading ||
    (contractsDeployed && address && stakedTokenIds === undefined) ||
    (contractsDeployed && address && claimableRewards === undefined) ||
    (contractsDeployed && address && rewardRatePerNFT === undefined)
  );

  return {
    // Contract state
    contractsDeployed,
    isConnected,
    
    // User data
    userStakingData,
    userNFTs: availableNFTs,
    selectedNFTs,
    setSelectedNFTs,
    nftBalance: nftBalance ? Number(nftBalance) : 0,
    hyperPointsBalance: hyperPointsBalance ? Number(formatUnits(hyperPointsBalance, 18)) : 0,
    
    // Approval state
    isApprovedForAll,
    isApprovalLoading,
    approveAll,
    approvalHash,
    isApprovalPending,
    isApprovalConfirming,
    isApprovalConfirmed,
    approvalError,
    
    // Contract functions
    stakeNFTs,
    unstakeNFTs,
    claimRewards,
    refetchAllData,
    refetchApprovalStatus,
    
    // Helper functions
    canStake,
    canUnstake,
    canClaim,
    getEstimatedDailyRewards,
    getTotalStaked,
    getClaimableAmount,
    getTotalEarnedAmount,
    getTotalClaimedAmount,
    getAPY,
    
    // Contract data
    rewardRatePerNFT: rewardRatePerNFT ? Number(formatUnits(rewardRatePerNFT, 18)) : 0,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    
    // Loading states
    isLoading: isLoadingCriticalData,
  };
};