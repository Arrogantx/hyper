'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  ShareIcon,
  GiftIcon,
  TrophyIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { LeaderboardRow } from '@/components/ui/LeaderboardRow';
import { Address } from 'viem';

interface User {
  id: string;
  wallet_address: Address;
  hype_domain?: string;
  referral_code: string;
  referral_count: number;
  total_points: number;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  currentTier: string;
  nextTierProgress: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  referrals: number;
  earnings: number;
  tier: string;
  wallet_address: Address;
}

const mockReferralStats: ReferralStats = {
  totalReferrals: 0,
  activeReferrals: 0,
  totalEarned: 0,
  currentTier: 'Bronze',
  nextTierProgress: 0
};

const mockLeaderboard: LeaderboardEntry[] = [];

const tierColors = {
  Bronze: 'from-amber-600 to-amber-800',
  Silver: 'from-gray-400 to-gray-600',
  Gold: 'from-yellow-400 to-yellow-600',
  Platinum: 'from-purple-400 to-purple-600',
  Diamond: 'from-hyperliquid-400 to-hyperliquid-600'
};

const tierIcons = {
  Bronze: TrophyIcon,
  Silver: TrophyIcon,
  Gold: TrophyIcon,
  Platinum: StarIcon,
  Diamond: FireIcon
};

export default function CommunityPage() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'leaderboard' | 'rewards'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  const showSuccessToast = useSuccessToast();
  const showErrorToast = useErrorToast();

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      const formattedLeaderboard: LeaderboardEntry[] = data.map((entry: any) => ({
        rank: entry.rank,
        username: entry.hype_domain || entry.username || `${entry.wallet_address.slice(0, 6)}...${entry.wallet_address.slice(-4)}`,
        referrals: entry.referral_count,
        earnings: entry.total_points,
        tier: entry.tier,
        wallet_address: entry.wallet_address,
      }));
      setLeaderboard(formattedLeaderboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load leaderboard');
      showErrorToast(err instanceof Error ? err.message : 'Could not load leaderboard');
    }
  }, [showErrorToast]);

  const fetchUser = useCallback(async (walletAddress: Address) => {
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load user data');
      showErrorToast(err instanceof Error ? err.message : 'Could not load user data');
    }
  }, [showErrorToast]);

  useEffect(() => {
    if (isConnected && address) {
      fetchUser(address);
    } else {
      setUser(null);
    }
    if (selectedTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [address, isConnected, fetchUser, selectedTab, fetchLeaderboard]);

  const referralStats = user ? {
    totalReferrals: user.referral_count,
    activeReferrals: 0, // Placeholder
    totalEarned: user.total_points,
    currentTier: 'Bronze', // Placeholder
    nextTierProgress: 0, // Placeholder
  } : null;

  const copyReferralCode = async () => {
    if (!user) {
      showErrorToast('Please connect your wallet first.');
      return;
    }
    try {
      setIsGeneratingLink(true);
      await navigator.clipboard.writeText(`https://hypercatz.com/r?ref=${user.referral_code}`);
      setCopied(true);
      showSuccessToast('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      showErrorToast('Failed to copy referral link. Please try again.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const retryLoadData = () => {
    setError(null);
    // Trigger useEffect again
    window.location.reload();
  };

  if (error && !referralStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-16 sm:pt-20">
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay error={error} onRetry={retryLoadData} />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UsersIcon },
    { id: 'leaderboard', name: 'Leaderboard', icon: TrophyIcon },
    { id: 'rewards', name: 'Rewards', icon: GiftIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-16 sm:pt-20">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <span className="px-3 py-1 bg-hyperliquid-500/10 border border-hyperliquid-500/20 rounded-full text-hyperliquid-400 text-sm font-medium">
              Active
            </span>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
              Community Rewards
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold hyperliquid-gradient-text mb-2 sm:mb-4">
            Community Hub
          </h1>
          <p className="text-dark-300 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Join the Hypercatz community, refer friends, and earn exclusive rewards together
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <div className="glass-card p-1 sm:p-2 flex space-x-1 sm:space-x-2 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'bg-hyperliquid-500/20 border border-hyperliquid-500/30 text-hyperliquid-400 shadow-lg shadow-hyperliquid-500/20'
                      : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                  }`}
                >
                  <div className={`p-1 rounded ${selectedTab === tab.id ? 'bg-hyperliquid-500/20' : 'bg-dark-700/50'}`}>
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Referral Code Section */}
            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-2 bg-hyperliquid-500/10 rounded-lg">
                    <ShareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-hyperliquid-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Your Referral Code</h2>
                </div>
              </div>
              
              <div className="glass rounded-xl p-3 sm:p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-dark-400 text-sm mb-1 font-medium">Referral Link</p>
                    <p className="text-hyperliquid-400 font-mono text-sm sm:text-lg truncate">
                      {user ? `https://hypercatz.com/r?ref=${user.referral_code}` : 'Connect wallet to get your link'}
                    </p>
                  </div>
                  <LoadingButton
                    onClick={copyReferralCode}
                    isLoading={isGeneratingLink}
                    className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </LoadingButton>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                { isConnected && !user ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="stat-card animate-pulse">
                            <div className="h-6 bg-dark-700 rounded-md w-1/2 mb-2"></div>
                            <div className="h-8 bg-dark-700 rounded-md w-3/4"></div>
                        </div>
                    ))
                ) : (
                <>
                <div className="stat-card">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                    <div className="p-1 bg-hyperliquid-500/10 rounded">
                      <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-hyperliquid-400" />
                    </div>
                    <span className="text-hyperliquid-400 font-medium text-xs sm:text-sm">Total</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{(referralStats?.totalReferrals || 0).toLocaleString()}</p>
                </div>

                <div className="stat-card">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                    <div className="p-1 bg-blue-500/10 rounded">
                      <BoltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    </div>
                    <span className="text-blue-400 font-medium text-xs sm:text-sm">Active</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{(referralStats?.activeReferrals || 0).toLocaleString()}</p>
                </div>

                <div className="stat-card">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                    <div className="p-1 bg-yellow-500/10 rounded">
                      <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                    </div>
                    <span className="text-yellow-400 font-medium text-xs sm:text-sm">Points</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{(referralStats?.totalEarned || 0).toLocaleString()}</p>
                </div>

                <div className="stat-card">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                    <div className="p-1 bg-purple-500/10 rounded">
                      <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                    <span className="text-purple-400 font-medium text-xs sm:text-sm">Tier</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{referralStats?.currentTier || 'Bronze'}</p>
                </div>
                </>
                )}
              </div>
            </div>

            {/* Tier Progress */}
            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Tier Progress</h2>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-dark-400 text-sm sm:text-base font-medium">Progress to Platinum</span>
                  <span className="text-hyperliquid-400 font-bold text-sm sm:text-base">{referralStats?.nextTierProgress || 0}%</span>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-2 sm:h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${referralStats?.nextTierProgress || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-400 h-2 sm:h-3 rounded-full glow-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
                {Object.entries(tierColors).map(([tier, gradient]) => {
                  const IconComponent = tierIcons[tier as keyof typeof tierIcons];
                  const isCurrentTier = tier === (referralStats?.currentTier || 'Bronze');
                  
                  return (
                    <div
                      key={tier}
                      className={`relative p-2 sm:p-4 rounded-xl border transition-all hover:scale-105 ${
                        isCurrentTier
                          ? 'border-hyperliquid-500/50 bg-hyperliquid-500/10 shadow-lg shadow-hyperliquid-500/20'
                          : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <p className={`font-bold text-xs sm:text-sm ${isCurrentTier ? 'text-hyperliquid-400' : 'text-dark-400'}`}>
                          {tier}
                        </p>
                      </div>
                      {isCurrentTier && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-hyperliquid-500 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                          Current
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How It Works */}
            <div className="glass-card p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">How Referrals Work</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="feature-card text-center p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-400 rounded-full flex items-center justify-center shadow-lg shadow-hyperliquid-500/30">
                    <ShareIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">1. Share Your Link</h3>
                  <p className="text-dark-400 text-sm sm:text-base">Share your unique referral link with friends and on social media</p>
                </div>

                <div className="feature-card text-center p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">2. Friends Join</h3>
                  <p className="text-dark-400 text-sm sm:text-base">When someone uses your link to mint, they become your referral</p>
                </div>

                <div className="feature-card text-center p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                    <GiftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">3. Earn Rewards</h3>
                  <p className="text-dark-400 text-sm sm:text-base">Get points for each successful referral and unlock tier bonuses</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {selectedTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 sm:p-6"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Top Referrers</h2>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <LeaderboardRow key={entry.rank} entry={entry} index={index} />
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <TrophyIcon className="h-12 w-12 sm:h-16 sm:w-16 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-400 text-base sm:text-lg font-medium">No referrers yet</p>
                  <p className="text-dark-500 text-sm sm:text-base mt-2">Be the first to start referring friends!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Rewards Tab */}
        {selectedTab === 'rewards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="p-2 bg-hyperliquid-500/10 rounded-lg">
                  <GiftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-hyperliquid-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Referral Rewards</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-hyperliquid-400">Per Referral Rewards</h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center p-2.5 sm:p-3 glass rounded-lg">
                      <span className="text-dark-300 text-sm sm:text-base font-medium">Successful Mint</span>
                      <span className="text-hyperliquid-400 font-bold text-sm sm:text-base">+200 Points</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 sm:p-3 glass rounded-lg">
                      <span className="text-dark-300 text-sm sm:text-base font-medium">First Stake</span>
                      <span className="text-blue-400 font-bold text-sm sm:text-base">+100 Points</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 sm:p-3 glass rounded-lg">
                      <span className="text-dark-300 text-sm sm:text-base font-medium">Game Participation</span>
                      <span className="text-purple-400 font-bold text-sm sm:text-base">+50 Points</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-purple-400">Tier Bonuses</h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {Object.entries(tierColors).map(([tier, gradient]) => {
                      const multiplier = tier === 'Bronze' ? '1.0x' :
                                       tier === 'Silver' ? '1.2x' :
                                       tier === 'Gold' ? '1.5x' :
                                       tier === 'Platinum' ? '2.0x' : '3.0x';
                      
                      return (
                        <div key={tier} className="flex justify-between items-center p-2.5 sm:p-3 glass rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r ${gradient} shadow-lg`} />
                            <span className="text-dark-300 text-sm sm:text-base font-medium">{tier}</span>
                          </div>
                          <span className="text-yellow-400 font-bold text-sm sm:text-base">{multiplier}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Special Milestones</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="feature-card p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300 border-hyperliquid-500/30">
                  <div className="p-2 bg-hyperliquid-500/10 rounded-lg w-fit mx-auto mb-2">
                    <HeartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-hyperliquid-400" />
                  </div>
                  <h4 className="font-bold text-white mb-1 text-sm sm:text-base">10 Referrals</h4>
                  <p className="text-hyperliquid-400 font-bold text-xs sm:text-sm">+1,000 Bonus Points</p>
                </div>

                <div className="feature-card p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300 border-blue-500/30">
                  <div className="p-2 bg-blue-500/10 rounded-lg w-fit mx-auto mb-2">
                    <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                  </div>
                  <h4 className="font-bold text-white mb-1 text-sm sm:text-base">25 Referrals</h4>
                  <p className="text-blue-400 font-bold text-xs sm:text-sm">Exclusive NFT Badge</p>
                </div>

                <div className="feature-card p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300 border-purple-500/30">
                  <div className="p-2 bg-purple-500/10 rounded-lg w-fit mx-auto mb-2">
                    <FireIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-white mb-1 text-sm sm:text-base">50 Referrals</h4>
                  <p className="text-purple-400 font-bold text-xs sm:text-sm">VIP Community Access</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </div>
    </div>
  );
}