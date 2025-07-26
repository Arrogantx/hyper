'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Users,
  Coins,
  Target
} from 'lucide-react';

interface StakingMetrics {
  totalValueLocked: number;
  totalStakers: number;
  averageAPY: number;
  totalRewardsDistributed: number;
  poolDistribution: {
    poolName: string;
    percentage: number;
    totalStaked: number;
  }[];
  stakingTrends: {
    date: string;
    totalStaked: number;
    newStakers: number;
  }[];
}

interface StakingAnalyticsProps {
  className?: string;
}

export function StakingAnalytics({ className = '' }: StakingAnalyticsProps) {
  const [metrics, setMetrics] = useState<StakingMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call - replace with actual analytics endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with real analytics data
        setMetrics({
          totalValueLocked: 125000,
          totalStakers: 2847,
          averageAPY: 87.5,
          totalRewardsDistributed: 45000,
          poolDistribution: [
            { poolName: 'Diamond Pool', percentage: 45, totalStaked: 56250 },
            { poolName: 'Gold Pool', percentage: 30, totalStaked: 37500 },
            { poolName: 'Silver Pool', percentage: 15, totalStaked: 18750 },
            { poolName: 'Bronze Pool', percentage: 10, totalStaked: 12500 },
          ],
          stakingTrends: [
            { date: '2024-01-01', totalStaked: 100000, newStakers: 150 },
            { date: '2024-01-02', totalStaked: 105000, newStakers: 200 },
            { date: '2024-01-03', totalStaked: 110000, newStakers: 180 },
            { date: '2024-01-04', totalStaked: 115000, newStakers: 220 },
            { date: '2024-01-05', totalStaked: 120000, newStakers: 190 },
            { date: '2024-01-06', totalStaked: 122000, newStakers: 160 },
            { date: '2024-01-07', totalStaked: 125000, newStakers: 210 },
          ],
        });
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [timeframe]);

  const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-dark-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-dark-700 rounded"></div>
            <div className="h-64 bg-dark-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  const latestTrend = metrics.stakingTrends[metrics.stakingTrends.length - 1];
  const previousTrend = metrics.stakingTrends[metrics.stakingTrends.length - 2];
  const stakingTrend = calculateTrend(latestTrend.totalStaked, previousTrend.totalStaked);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-hyperliquid-400 mb-2">Staking Analytics</h2>
          <p className="text-gray-400">Real-time insights into staking performance and trends</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-hyperliquid-500 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="feature-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-hyperliquid-500/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-hyperliquid-500" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              stakingTrend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {stakingTrend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stakingTrend.value.toFixed(1)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.totalValueLocked.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Value Locked</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="feature-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-purple" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              12.3%
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.totalStakers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Stakers</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="feature-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-yellow/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-accent-yellow" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              5.2%
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.averageAPY}%
          </div>
          <div className="text-sm text-gray-400">Average APY</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="feature-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-green/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-green" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              18.7%
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics.totalRewardsDistributed.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Rewards Distributed</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pool Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="feature-card"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-hyperliquid-500" />
            <h3 className="text-lg font-semibold text-white">Pool Distribution</h3>
          </div>
          
          <div className="space-y-4">
            {metrics.poolDistribution.map((pool, index) => {
              const colors = [
                'bg-accent-purple',
                'bg-accent-yellow', 
                'bg-accent-green',
                'bg-accent-orange'
              ];
              
              return (
                <div key={pool.poolName} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{pool.poolName}</span>
                    <span className="text-white font-medium">{pool.percentage}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pool.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`h-2 rounded-full ${colors[index]}`}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    {pool.totalStaked.toLocaleString()} NFTs staked
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Staking Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="feature-card"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-hyperliquid-500" />
            <h3 className="text-lg font-semibold text-white">Staking Trends</h3>
          </div>
          
          {/* Simple trend visualization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-400 border-b border-dark-700 pb-2">
              <span>Date</span>
              <span>Total Staked</span>
              <span>New Stakers</span>
            </div>
            
            {metrics.stakingTrends.slice(-5).map((trend, index) => (
              <motion.div
                key={trend.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-300">
                  {new Date(trend.date).toLocaleDateString()}
                </span>
                <span className="text-hyperliquid-400 font-medium">
                  {trend.totalStaked.toLocaleString()}
                </span>
                <span className="text-accent-green">
                  +{trend.newStakers}
                </span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-dark-700">
            <div className="text-sm text-gray-400">
              Total growth: <span className="text-green-400 font-medium">+25%</span> this {timeframe}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="feature-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-hyperliquid-400 mb-2">
              {((metrics.totalValueLocked / metrics.totalStakers) || 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Average Stake per User</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-yellow mb-2">
              {metrics.poolDistribution[0].poolName}
            </div>
            <div className="text-sm text-gray-400">Most Popular Pool</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-green mb-2">
              {latestTrend.newStakers}
            </div>
            <div className="text-sm text-gray-400">New Stakers Today</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}