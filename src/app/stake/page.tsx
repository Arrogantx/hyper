'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StakingPoolSkeleton, LoadingOverlay } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { HypePriceCard } from '@/components/ui/HypePrice';
import {
  TrendingUp,
  Zap,
  Coins,
  Clock,
  Star,
  Shield,
  Target,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
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
            isActive: true,
            tier: 'diamond'
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
            isActive: true,
            tier: 'gold'
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
            isActive: true,
            tier: 'silver'
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
            isActive: true,
            tier: 'bronze'
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

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return {
          gradient: 'from-accent-purple to-accent-pink',
          iconBg: 'bg-accent-purple/20',
          borderColor: 'border-accent-purple/30'
        };
      case 'gold':
        return {
          gradient: 'from-accent-yellow to-accent-orange',
          iconBg: 'bg-accent-yellow/20',
          borderColor: 'border-accent-yellow/30'
        };
      case 'silver':
        return {
          gradient: 'from-gray-400 to-gray-300',
          iconBg: 'bg-gray-400/20',
          borderColor: 'border-gray-400/30'
        };
      case 'bronze':
        return {
          gradient: 'from-accent-orange to-accent-yellow',
          iconBg: 'bg-accent-orange/20',
          borderColor: 'border-accent-orange/30'
        };
      default:
        return {
          gradient: 'from-hyperliquid-500 to-hyperliquid-400',
          iconBg: 'bg-hyperliquid-500/20',
          borderColor: 'border-hyperliquid-500/30'
        };
    }
  };

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <StakingPoolSkeleton />;
  }

  // Show error state if data failed to load
  if (error) {
    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
        <ErrorDisplay
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Don't render if userStats is null
  if (!userStats) {
    return <StakingPoolSkeleton />;
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-hyperliquid-500/30 mb-8">
              <div className="w-2 h-2 bg-hyperliquid-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-hyperliquid-400">Earn Passive Rewards</span>
            </div>
            
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6 hyperliquid-gradient-text"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              HYPERCATZ STAKING
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Stake your Hypercatz NFTs to earn $HYPE tokens and unlock exclusive utilities in our ecosystem
            </motion.p>
          </div>

          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <div className="stat-card group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-hyperliquid-500 group-hover:text-hyperliquid-400 transition-colors" />
              </div>
              <div className="stat-value">{userStats.totalStaked}</div>
              <div className="stat-label">NFTs Staked</div>
            </div>

            <div className="stat-card group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-3">
                <Coins className="w-6 h-6 text-hyperliquid-500 group-hover:text-hyperliquid-400 transition-colors" />
              </div>
              <div className="stat-value">{userStats.totalRewards.toLocaleString()}</div>
              <div className="stat-label">Total Rewards</div>
            </div>

            <div className="stat-card group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-hyperliquid-500 group-hover:text-hyperliquid-400 transition-colors" />
              </div>
              <div className="stat-value">{userStats.activePools}</div>
              <div className="stat-label">Active Pools</div>
            </div>

            <div className="stat-card group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-hyperliquid-500 group-hover:text-hyperliquid-400 transition-colors" />
              </div>
              <div className="stat-value">{userStats.nextReward}</div>
              <div className="stat-label">Next Reward</div>
            </div>
          </motion.div>

          {/* HYPE Token Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-16"
          >
            <HypePriceCard className="max-w-md mx-auto" />
          </motion.div>

          {/* Staking Pools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-8"
          >
            <h2 className="section-title hyperliquid-gradient-text">Staking Pools</h2>
            
            {stakingPools.map((pool, index) => {
              const tierConfig = getTierConfig(pool.tier);
              const isExpanded = selectedPool === pool.id;
              
              return (
                <motion.div
                  key={pool.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className={`feature-card border ${tierConfig.borderColor} ${pool.userStaked > 0 ? 'glow-green' : ''}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Pool Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tierConfig.gradient} flex items-center justify-center shadow-lg`}>
                          <Star className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{pool.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              {pool.lockPeriod}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              {pool.multiplier}x Multiplier
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">APY</div>
                          <div className="text-2xl font-bold text-hyperliquid-400">{pool.apy}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Total Staked</div>
                          <div className="text-2xl font-bold text-white">{pool.totalStaked.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Your Staked</div>
                          <div className="text-2xl font-bold text-hyperliquid-400">{pool.userStaked}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Your Rewards</div>
                          <div className="text-2xl font-bold text-accent-yellow">{pool.rewards.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:ml-8 min-w-[200px]">
                      {pool.userStaked > 0 && (
                        <Button
                          onClick={() => handleClaimRewards(pool.id)}
                          disabled={isClaiming || pool.rewards === 0}
                          className="w-full"
                          variant="primary"
                        >
                          {isClaiming ? (
                            <div className="flex items-center gap-2">
                              <LoadingSpinner size="sm" />
                              <span>Claiming...</span>
                            </div>
                          ) : (
                            <>
                              <Award className="h-4 w-4 mr-2" />
                              Claim Rewards
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => setSelectedPool(isExpanded ? null : pool.id)}
                        className="w-full"
                        variant="secondary"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Stake NFTs
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Staking Interface */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 pt-8 border-t border-dark-700"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Number of NFTs to Stake
                          </label>
                          <input
                            type="number"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            placeholder="Enter amount (1-10)"
                            min="1"
                            max="10"
                            className="input-modern w-full"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={() => handleStake(pool.id)}
                            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                            className="w-full md:w-auto min-w-[140px]"
                            variant="primary"
                          >
                            {isStaking ? (
                              <div className="flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                <span>Staking...</span>
                              </div>
                            ) : (
                              'Stake Now'
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-6 glass-card p-4 border-dark-700/50">
                        <div className="text-sm text-gray-300 space-y-2">
                          <div className="flex justify-between">
                            <span>Lock Period:</span>
                            <span className="text-hyperliquid-400">{pool.lockPeriod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Reward Multiplier:</span>
                            <span className="text-hyperliquid-400">{pool.multiplier}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Est. Daily Rewards:</span>
                            <span className="text-accent-yellow">
                              ~{((parseFloat(stakeAmount) || 0) * pool.apy / 365).toFixed(2)} $HYPE
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-16 feature-card"
          >
            <h3 className="text-2xl font-bold text-hyperliquid-400 mb-8">Staking Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-hyperliquid-500" />
                  Earn $HYPE Tokens
                </h4>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Passive income from staked NFTs
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Higher APY for longer lock periods
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Compound rewards automatically
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    No impermanent loss risk
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-hyperliquid-500" />
                  Exclusive Utilities
                </h4>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Access to premium games
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Discounted marketplace fees
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Priority in new drops
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Governance voting rights
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}