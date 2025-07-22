'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StakingPoolSkeleton, LoadingOverlay } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import {
  ChartBarIcon,
  FireIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  totalStaked: number;
  userStaked: number;
  rewards: number;
  lockPeriod: string;
  multiplier: number;
  isActive: boolean;
}

interface UserStats {
  totalStaked: number;
  totalRewards: number;
  activePools: number;
  nextReward: string;
}

export default function StakePage() {
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  // Load staking data
  useEffect(() => {
    const loadStakingData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock data - replace with actual data from blockchain/API
        setUserStats({
          totalStaked: 12,
          totalRewards: 2847.5,
          activePools: 3,
          nextReward: '2h 34m'
        });

        setStakingPools([
          {
            id: 'diamond',
            name: 'Diamond Pool',
            apy: 150,
            totalStaked: 2847,
            userStaked: 5,
            rewards: 1250.75,
            lockPeriod: '90 days',
            multiplier: 3.0,
            isActive: true
          },
          {
            id: 'gold',
            name: 'Gold Pool',
            apy: 100,
            totalStaked: 5692,
            userStaked: 4,
            rewards: 892.25,
            lockPeriod: '60 days',
            multiplier: 2.0,
            isActive: true
          },
          {
            id: 'silver',
            name: 'Silver Pool',
            apy: 75,
            totalStaked: 8439,
            userStaked: 3,
            rewards: 704.5,
            lockPeriod: '30 days',
            multiplier: 1.5,
            isActive: true
          },
          {
            id: 'bronze',
            name: 'Bronze Pool',
            apy: 50,
            totalStaked: 12847,
            userStaked: 0,
            rewards: 0,
            lockPeriod: '7 days',
            multiplier: 1.0,
            isActive: true
          }
        ]);
        
      } catch (err) {
        setError('Failed to load staking data. Please try again.');
        errorToast('Loading Error', 'Failed to load staking data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStakingData();
  }, [errorToast]);

  const handleStake = async (poolId: string) => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      errorToast('Invalid Amount', 'Please enter a valid number of NFTs to stake');
      return;
    }
    
    const amount = parseFloat(stakeAmount);
    if (amount > 10) {
      errorToast('Amount Too High', 'You can only stake up to 10 NFTs at once');
      return;
    }
    
    setIsStaking(true);
    
    try {
      // Simulate staking transaction
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure (15% chance)
          if (Math.random() < 0.15) {
            reject(new Error('Transaction failed'));
          } else {
            resolve(true);
          }
        }, 3000);
      });
      
      // Update pool data
      setStakingPools(prev => prev.map(pool =>
        pool.id === poolId
          ? { ...pool, userStaked: pool.userStaked + amount, totalStaked: pool.totalStaked + amount }
          : pool
      ));
      
      // Update user stats
      setUserStats(prev => prev ? { ...prev, totalStaked: prev.totalStaked + amount } : prev);
      
      successToast('Staking Successful!', `Successfully staked ${amount} NFT${amount > 1 ? 's' : ''} in ${stakingPools.find(p => p.id === poolId)?.name}`);
      setStakeAmount('');
      setSelectedPool(null);
      
    } catch (error: any) {
      console.error('Staking failed:', error);
      errorToast('Staking Failed', error?.message || 'Transaction failed');
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaimRewards = async (poolId: string) => {
    const pool = stakingPools.find(p => p.id === poolId);
    if (!pool || pool.rewards === 0) {
      errorToast('No Rewards', 'No rewards available to claim');
      return;
    }
    
    setIsClaiming(true);
    
    try {
      // Simulate claim transaction
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure (10% chance)
          if (Math.random() < 0.1) {
            reject(new Error('Transaction failed'));
          } else {
            resolve(true);
          }
        }, 2000);
      });
      
      const rewardAmount = pool.rewards;
      
      // Update pool data
      setStakingPools(prev => prev.map(p =>
        p.id === poolId ? { ...p, rewards: 0 } : p
      ));
      
      // Update user stats
      setUserStats(prev => prev ? { ...prev, totalRewards: prev.totalRewards + rewardAmount } : prev);
      
      successToast('Rewards Claimed!', `Successfully claimed ${rewardAmount.toLocaleString()} $HYPE tokens`);
      
    } catch (error: any) {
      console.error('Claim failed:', error);
      errorToast('Claim Failed', error?.message || 'Transaction failed');
    } finally {
      setIsClaiming(false);
    }
  };

  const getPoolGradient = (poolId: string) => {
    switch (poolId) {
      case 'diamond': return 'from-purple-400 via-pink-400 to-purple-400';
      case 'gold': return 'from-yellow-400 via-orange-400 to-yellow-400';
      case 'silver': return 'from-gray-300 via-gray-400 to-gray-300';
      case 'bronze': return 'from-orange-600 via-yellow-600 to-orange-600';
      default: return 'from-cyan-400 via-green-400 to-cyan-400';
    }
  };

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <StakingPoolSkeleton />;
  }

  // Show error state if data failed to load
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-center">
          <ErrorDisplay
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  // Don't render if userStats is null
  if (!userStats) {
    return <StakingPoolSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              HYPERCATZ STAKING
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Stake your Hypercatz NFTs to earn $HYPE tokens and unlock exclusive utilities
            </motion.p>
          </div>

          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                <span className="text-gray-400 text-xs sm:text-sm">Total Staked</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{userStats.totalStaked}</div>
              <div className="text-xs sm:text-sm text-gray-400">NFTs</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                <span className="text-gray-400 text-xs sm:text-sm">Total Rewards</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{userStats.totalRewards.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-gray-400">$HYPE</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                <FireIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                <span className="text-gray-400 text-xs sm:text-sm">Active Pools</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{userStats.activePools}</div>
              <div className="text-xs sm:text-sm text-gray-400">Pools</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                <span className="text-gray-400 text-xs sm:text-sm">Next Reward</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{userStats.nextReward}</div>
              <div className="text-xs sm:text-sm text-gray-400">Remaining</div>
            </div>
          </motion.div>

          {/* Staking Pools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-4 sm:space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Staking Pools</h2>
            
            {stakingPools.map((pool, index) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className={`bg-gradient-to-r p-[1px] rounded-xl sm:rounded-2xl ${getPoolGradient(pool.id)}`}
              >
                <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                    {/* Pool Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${getPoolGradient(pool.id)} flex items-center justify-center`}>
                          <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{pool.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-400">
                            <span>Lock: {pool.lockPeriod}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{pool.multiplier}x Multiplier</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                        <div>
                          <div className="text-xs sm:text-sm text-gray-400">APY</div>
                          <div className="text-lg sm:text-xl font-bold text-green-400">{pool.apy}%</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-400">Total Staked</div>
                          <div className="text-lg sm:text-xl font-bold text-white">{pool.totalStaked.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-400">Your Staked</div>
                          <div className="text-lg sm:text-xl font-bold text-cyan-400">{pool.userStaked}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-400">Your Rewards</div>
                          <div className="text-lg sm:text-xl font-bold text-yellow-400">{pool.rewards.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-3 lg:ml-8">
                      {pool.userStaked > 0 && (
                        <Button
                          onClick={() => handleClaimRewards(pool.id)}
                          disabled={isClaiming || pool.rewards === 0}
                          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                          variant="primary"
                        >
                          {isClaiming ? (
                            <div className="flex items-center space-x-2">
                              <LoadingSpinner size="sm" />
                              <span>Claiming...</span>
                            </div>
                          ) : (
                            <>
                              <BoltIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Claim Rewards
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => setSelectedPool(selectedPool === pool.id ? null : pool.id)}
                        className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                        variant="secondary"
                      >
                        {selectedPool === pool.id ? 'Cancel' : 'Stake NFTs'}
                      </Button>
                    </div>
                  </div>

                  {/* Staking Interface */}
                  {selectedPool === pool.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700"
                    >
                      <div className="flex flex-col space-y-3 sm:space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                        <div className="flex-1">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Number of NFTs to Stake
                          </label>
                          <input
                            type="number"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="1"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={() => handleStake(pool.id)}
                            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                            className="w-full md:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                            variant="primary"
                          >
                            {isStaking ? (
                              <div className="flex items-center space-x-2">
                                <LoadingSpinner size="sm" />
                                <span>Staking...</span>
                              </div>
                            ) : (
                              'Stake Now'
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl">
                        <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                          <div>• Lock period: {pool.lockPeriod}</div>
                          <div>• Reward multiplier: {pool.multiplier}x</div>
                          <div>• Estimated daily rewards: ~{((parseFloat(stakeAmount) || 0) * pool.apy / 365).toFixed(2)} $HYPE</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8 sm:mt-12 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-4 sm:mb-6">Staking Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Earn $HYPE Tokens</h4>
                <ul className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li>• Passive income from staked NFTs</li>
                  <li>• Higher APY for longer lock periods</li>
                  <li>• Compound rewards automatically</li>
                  <li>• No impermanent loss risk</li>
                </ul>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Exclusive Utilities</h4>
                <ul className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li>• Access to premium games</li>
                  <li>• Discounted marketplace fees</li>
                  <li>• Priority in new drops</li>
                  <li>• Governance voting rights</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}