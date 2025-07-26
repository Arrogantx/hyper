import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
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

export const useHypercatzStaking = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);
  const [userNFTs, setUserNFTs] = useState<number[]>([]);

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

  // Read staking contract data
  const { data: stakedTokenIds } = useReadContract({
    address: HYPERCATZ_STAKING_ADDRESS,
    abi: HYPERCATZ_STAKING_ABI,
    functionName: 'getStaked',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: claimableRewards } = useReadContract({
    address: HYPERCATZ_STAKING_ADDRESS,
    abi: HYPERCATZ_STAKING_ABI,
    functionName: 'getClaimable',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: totalEarned } = useReadContract({
    address: HYPERCATZ_STAKING_ADDRESS,
    abi: HYPERCATZ_STAKING_ABI,
    functionName: 'getTotalEarned',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: totalClaimed } = useReadContract({
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

  // Load user's available NFTs (not staked)
  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!address || !nftBalance || Number(nftBalance) === 0) {
        setUserNFTs([]);
        return;
      }

      try {
        // Get all user's NFTs
        const allNFTs: number[] = [];
        for (let i = 0; i < Math.min(Number(nftBalance), 50); i++) {
          // This would typically involve calling tokenOfOwnerByIndex
          // For now, simulate with sequential IDs
          allNFTs.push(i + 1);
        }

        // Filter out staked NFTs
        const stakedIds = stakedTokenIds ? stakedTokenIds.map(id => Number(id)) : [];
        const availableNFTs = allNFTs.filter(id => !stakedIds.includes(id));
        
        setUserNFTs(availableNFTs);
      } catch (error) {
        console.error('Error loading user NFTs:', error);
        setUserNFTs([]);
      }
    };

    loadUserNFTs();
  }, [address, nftBalance, stakedTokenIds]);

  // User staking data
  const userStakingData: UserStakingData = {
    stakedTokenIds: stakedTokenIds ? [...stakedTokenIds] : [],
    claimableRewards: claimableRewards || BigInt(0),
    totalEarned: totalEarned || BigInt(0),
    totalClaimed: totalClaimed || BigInt(0),
  };

  // Staking functions
  const stakeNFTs = useCallback(async (tokenIds: number[]) => {
    if (!isConnected) throw new Error('Wallet not connected');
    if (!contractsDeployed) throw new Error('Staking contract not deployed');
    if (tokenIds.length === 0) throw new Error('No NFTs selected');

    // Validate token IDs
    const invalidIds = tokenIds.filter(id => !isValidTokenId(id));
    if (invalidIds.length > 0) {
      throw new Error(`Invalid token IDs: ${invalidIds.join(', ')}`);
    }

    try {
      writeContract({
        address: HYPERCATZ_STAKING_ADDRESS,
        abi: HYPERCATZ_STAKING_ABI,
        functionName: 'stake',
        args: [tokenIds.map(id => BigInt(id))],
      });
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    }
  }, [isConnected, contractsDeployed, writeContract]);

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
    return !!(contractsDeployed && isConnected && userNFTs.length > 0);
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

  return {
    // Contract state
    contractsDeployed,
    isConnected,
    
    // User data
    userStakingData,
    userNFTs,
    selectedNFTs,
    setSelectedNFTs,
    nftBalance: nftBalance ? Number(nftBalance) : 0,
    hyperPointsBalance: hyperPointsBalance ? Number(formatUnits(hyperPointsBalance, 18)) : 0,
    
    // Contract functions
    stakeNFTs,
    unstakeNFTs,
    claimRewards,
    
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
    isLoading: false, // We provide fallback data
  };
};