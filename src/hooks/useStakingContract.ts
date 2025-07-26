import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import {
  STAKING_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ABI,
  HYPE_TOKEN_ADDRESS,
  HYPE_TOKEN_ABI,
  DEFAULT_STAKING_POOLS,
  type StakeInfo,
  type PoolInfo,
  type UserStakingStats,
  type StakingPoolDisplay,
  formatLockPeriod,
  calculateDailyRewards,
  isStakeLocked
} from '@/contracts/hypercatzStaking';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI } from '@/contracts/HypercatzNFT';

export const useStakingContract = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [selectedPool, setSelectedPool] = useState<number | null>(null);
  const [stakingAmount, setStakingAmount] = useState<string>('');
  const [userNFTs, setUserNFTs] = useState<number[]>([]);
  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);

  // Check if contracts are deployed (not zero address)
  const contractsDeployed = STAKING_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

  // Read pool count
  const { data: poolCount } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getPoolCount',
    query: {
      enabled: contractsDeployed && isConnected,
    },
  });

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

  // Read user's HYPE token balance
  const { data: hypeBalance } = useReadContract({
    address: HYPE_TOKEN_ADDRESS,
    abi: HYPE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  // Read user staking stats
  const { data: userTotalStaked } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserTotalStaked',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: userTotalRewards } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserTotalRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  const { data: userActivePoolsCount } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserActivePoolsCount',
    args: address ? [address] : undefined,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  // Read pool information for all pools
  const poolContracts = DEFAULT_STAKING_POOLS.map((pool) => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getPoolInfo',
    args: [pool.id],
  }));

  const { data: poolsData } = useReadContracts({
    contracts: poolContracts,
    query: {
      enabled: contractsDeployed,
    },
  });

  // Read user stake info for all pools
  const userStakeContracts = DEFAULT_STAKING_POOLS.map((pool) => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserStakeInfo',
    args: address ? [address, pool.id] : undefined,
  }));

  const { data: userStakesData } = useReadContracts({
    contracts: userStakeContracts,
    query: {
      enabled: contractsDeployed && !!address,
    },
  });

  // Load user's NFTs
  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!address || !nftBalance || Number(nftBalance) === 0) {
        setUserNFTs([]);
        return;
      }

      try {
        // This would typically involve calling tokenOfOwnerByIndex for each NFT
        // For now, we'll simulate with a range based on balance
        const nfts: number[] = [];
        for (let i = 0; i < Math.min(Number(nftBalance), 10); i++) {
          nfts.push(i + 1); // Simulate token IDs
        }
        setUserNFTs(nfts);
      } catch (error) {
        console.error('Error loading user NFTs:', error);
        setUserNFTs([]);
      }
    };

    loadUserNFTs();
  }, [address, nftBalance]);

  // Process pool data
  const stakingPools: StakingPoolDisplay[] = DEFAULT_STAKING_POOLS.map((defaultPool, index) => {
    const poolData = poolsData?.[index]?.result as PoolInfo | undefined;
    const userStakeData = userStakesData?.[index]?.result as StakeInfo | undefined;

    return {
      id: defaultPool.id,
      name: defaultPool.name,
      tier: defaultPool.tier,
      multiplier: defaultPool.multiplier,
      // Use contract data if available, otherwise use defaults
      apy: poolData ? Number(poolData.apy) : defaultPool.apy,
      totalStaked: poolData ? Number(formatUnits(poolData.totalStaked, 0)) : 0,
      userStaked: userStakeData ? Number(formatUnits(userStakeData.amount, 0)) : 0,
      rewards: userStakeData ? Number(formatUnits(userStakeData.pendingRewards, 18)) : 0,
      lockPeriod: formatLockPeriod(defaultPool.lockPeriod),
      isActive: poolData ? poolData.isActive : defaultPool.isActive,
      isLocked: userStakeData ? isStakeLocked(userStakeData.lockEndTime) : false,
    };
  });

  // User stats
  const userStats: UserStakingStats & { nextReward: string } = {
    totalStaked: contractsDeployed && userTotalStaked ? userTotalStaked : BigInt(0),
    totalRewards: contractsDeployed && userTotalRewards ? userTotalRewards : BigInt(0),
    activePoolsCount: contractsDeployed && userActivePoolsCount ? userActivePoolsCount : BigInt(0),
    nextReward: contractsDeployed ? calculateNextRewardTime() : '--',
  };

  // Calculate next reward time
  function calculateNextRewardTime(): string {
    if (!contractsDeployed || !userStakesData) return '--';
    
    // For now, return a simple placeholder until we have real staking data
    const hasActiveStakes = stakingPools.some(pool => pool.userStaked > 0);
    if (!hasActiveStakes) return '--';
    
    // Simulate next reward time (24 hours from now)
    return '24h 0m';
  }

  // Staking functions
  const stakeNFTs = useCallback(async (poolId: number, tokenIds: number[]) => {
    if (!isConnected) throw new Error('Wallet not connected');
    if (!contractsDeployed) throw new Error('Staking contract not deployed');
    if (tokenIds.length === 0) throw new Error('No NFTs selected');

    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'stakeNFTs',
        args: [BigInt(poolId), tokenIds.map(id => BigInt(id))],
      });
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    }
  }, [isConnected, contractsDeployed, writeContract]);

  const unstakeNFTs = useCallback(async (poolId: number, tokenIds: number[]) => {
    if (!isConnected) throw new Error('Wallet not connected');
    if (!contractsDeployed) throw new Error('Staking contract not deployed');
    if (tokenIds.length === 0) throw new Error('No NFTs selected');

    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'unstakeNFTs',
        args: [BigInt(poolId), tokenIds.map(id => BigInt(id))],
      });
    } catch (error) {
      console.error('Unstaking failed:', error);
      throw error;
    }
  }, [isConnected, contractsDeployed, writeContract]);

  const claimRewards = useCallback(async (poolId: number) => {
    if (!isConnected) throw new Error('Wallet not connected');
    if (!contractsDeployed) throw new Error('Staking contract not deployed');

    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'claimRewards',
        args: [BigInt(poolId)],
      });
    } catch (error) {
      console.error('Claim failed:', error);
      throw error;
    }
  }, [isConnected, contractsDeployed, writeContract]);

  const claimAllRewards = useCallback(async () => {
    if (!isConnected) throw new Error('Wallet not connected');
    if (!contractsDeployed) throw new Error('Staking contract not deployed');

    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'claimAllRewards',
      });
    } catch (error) {
      console.error('Claim all failed:', error);
      throw error;
    }
  }, [isConnected, contractsDeployed, writeContract]);

  // Helper functions
  const getPoolById = (poolId: number) => {
    return stakingPools.find(pool => pool.id === poolId);
  };

  const canStakeInPool = (poolId: number): boolean => {
    const pool = getPoolById(poolId);
    return !!(pool && pool.isActive && userNFTs.length > 0);
  };

  const canUnstakeFromPool = (poolId: number): boolean => {
    const pool = getPoolById(poolId);
    if (!pool) return false;
    
    const userStake = userStakesData?.[poolId]?.result as StakeInfo | undefined;
    if (!userStake || userStake.amount === BigInt(0)) return false;
    
    return !isStakeLocked(userStake.lockEndTime);
  };

  const canClaimFromPool = (poolId: number): boolean => {
    const pool = getPoolById(poolId);
    return !!(pool && pool.rewards > 0);
  };

  const getTotalPendingRewards = (): number => {
    return stakingPools.reduce((total, pool) => total + pool.rewards, 0);
  };

  return {
    // Contract state
    contractsDeployed,
    isConnected,
    
    // User data
    userStats,
    stakingPools,
    userNFTs,
    selectedNFTs,
    setSelectedNFTs,
    nftBalance: nftBalance ? Number(nftBalance) : 0,
    hypeBalance: hypeBalance ? Number(formatUnits(hypeBalance, 18)) : 0,
    
    // Pool selection
    selectedPool,
    setSelectedPool,
    stakingAmount,
    setStakingAmount,
    
    // Contract functions
    stakeNFTs,
    unstakeNFTs,
    claimRewards,
    claimAllRewards,
    
    // Helper functions
    getPoolById,
    canStakeInPool,
    canUnstakeFromPool,
    canClaimFromPool,
    getTotalPendingRewards,
    
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