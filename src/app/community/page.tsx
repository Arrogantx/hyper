'use client';

import { useState, useEffect } from 'react';
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
import { LoadingOverlay, LoadingButton } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';

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
}

const mockReferralStats: ReferralStats = {
  totalReferrals: 12,
  activeReferrals: 8,
  totalEarned: 2400,
  currentTier: 'Gold',
  nextTierProgress: 65
};

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'CyberKing', referrals: 156, earnings: 31200, tier: 'Diamond' },
  { rank: 2, username: 'NeonQueen', referrals: 134, earnings: 26800, tier: 'Diamond' },
  { rank: 3, username: 'HyperLord', referrals: 98, earnings: 19600, tier: 'Platinum' },
  { rank: 4, username: 'QuantumCat', referrals: 87, earnings: 17400, tier: 'Platinum' },
  { rank: 5, username: 'DigitalNinja', referrals: 76, earnings: 15200, tier: 'Gold' },
  { rank: 6, username: 'CryptoWizard', referrals: 65, earnings: 13000, tier: 'Gold' },
  { rank: 7, username: 'MetaVerse', referrals: 54, earnings: 10800, tier: 'Gold' },
  { rank: 8, username: 'BlockChainer', referrals: 43, earnings: 8600, tier: 'Silver' },
  { rank: 9, username: 'TokenMaster', referrals: 32, earnings: 6400, tier: 'Silver' },
  { rank: 10, username: 'NFTCollector', referrals: 21, earnings: 4200, tier: 'Bronze' }
];

const tierColors = {
  Bronze: 'from-amber-600 to-amber-800',
  Silver: 'from-gray-400 to-gray-600',
  Gold: 'from-yellow-400 to-yellow-600',
  Platinum: 'from-purple-400 to-purple-600',
  Diamond: 'from-cyan-400 to-blue-500'
};

const tierIcons = {
  Bronze: TrophyIcon,
  Silver: TrophyIcon,
  Gold: TrophyIcon,
  Platinum: StarIcon,
  Diamond: FireIcon
};

export default function CommunityPage() {
  const [referralCode] = useState('HYPER-CAT-2024');
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'leaderboard' | 'rewards'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  const showSuccessToast = useSuccessToast();
  const showErrorToast = useErrorToast();

  // Simulate loading data on component mount
  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate potential error (10% chance)
        if (Math.random() < 0.1) {
          throw new Error('Failed to load community data. Please try again.');
        }
        
        setReferralStats(mockReferralStats);
        setLeaderboard(mockLeaderboard);
        showSuccessToast('Community data loaded successfully!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load community data';
        setError(errorMessage);
        showErrorToast(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunityData();
  }, [showSuccessToast, showErrorToast]);

  const copyReferralCode = async () => {
    try {
      setIsGeneratingLink(true);
      
      // Simulate link generation delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await navigator.clipboard.writeText(`https://hypercatz.com/mint?ref=${referralCode}`);
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

  const refreshStats = async () => {
    try {
      setIsRefreshingStats(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate potential error (15% chance)
      if (Math.random() < 0.15) {
        throw new Error('Failed to refresh stats. Please try again.');
      }
      
      // Simulate updated stats
      const updatedStats = {
        ...mockReferralStats,
        totalReferrals: mockReferralStats.totalReferrals + Math.floor(Math.random() * 3),
        totalEarned: mockReferralStats.totalEarned + Math.floor(Math.random() * 500),
      };
      
      setReferralStats(updatedStats);
      showSuccessToast('Stats refreshed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh stats';
      showErrorToast(errorMessage);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const retryLoadData = () => {
    setError(null);
    setIsLoading(true);
    // Trigger useEffect again
    window.location.reload();
  };

  if (error && !referralStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20">
      <LoadingOverlay isLoading={isLoading}>
        <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-4">
            Community Hub
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto px-2">
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
          <div className="bg-black/30 backdrop-blur-sm border border-gray-600 rounded-2xl p-1 sm:p-2 flex space-x-1 sm:space-x-2 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
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
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <ShareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Your Referral Code</h2>
                </div>
                <LoadingButton
                  onClick={refreshStats}
                  isLoading={isRefreshingStats}
                  className="text-sm px-3 py-1.5"
                >
                  Refresh Stats
                </LoadingButton>
              </div>
              
              <div className="bg-black/30 rounded-xl p-3 sm:p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-sm mb-1">Referral Link</p>
                    <p className="text-cyan-400 font-mono text-sm sm:text-lg truncate">
                      https://hypercatz.com/mint?ref={referralCode}
                    </p>
                  </div>
                  <LoadingButton
                    onClick={copyReferralCode}
                    isLoading={isGeneratingLink}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto"
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
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                    <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    <span className="text-green-400 font-medium text-xs sm:text-sm">Total</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{referralStats?.totalReferrals || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                    <BoltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    <span className="text-blue-400 font-medium text-xs sm:text-sm">Active</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{referralStats?.activeReferrals || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                    <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium text-xs sm:text-sm">Points</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{referralStats?.totalEarned.toLocaleString() || '0'}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
                    <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    <span className="text-purple-400 font-medium text-xs sm:text-sm">Tier</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{referralStats?.currentTier || 'Bronze'}</p>
                </div>
              </div>
            </div>

            {/* Tier Progress */}
            <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Tier Progress</h2>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm sm:text-base">Progress to Platinum</span>
                  <span className="text-purple-400 font-bold text-sm sm:text-base">{referralStats?.nextTierProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${referralStats?.nextTierProgress || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full"
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
                      className={`relative p-2 sm:p-4 rounded-xl border transition-all ${
                        isCurrentTier
                          ? 'border-cyan-500/50 bg-cyan-500/10'
                          : 'border-gray-600 bg-black/20'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <p className={`font-bold text-xs sm:text-sm ${isCurrentTier ? 'text-cyan-400' : 'text-gray-400'}`}>
                          {tier}
                        </p>
                      </div>
                      {isCurrentTier && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-cyan-500 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          Current
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-black/40 backdrop-blur-sm border border-gray-600 rounded-2xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">How Referrals Work</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <ShareIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">1. Share Your Link</h3>
                  <p className="text-gray-400 text-sm sm:text-base">Share your unique referral link with friends and on social media</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">2. Friends Join</h3>
                  <p className="text-gray-400 text-sm sm:text-base">When someone uses your link to mint, they become your referral</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <GiftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">3. Earn Rewards</h3>
                  <p className="text-gray-400 text-sm sm:text-base">Get points for each successful referral and unlock tier bonuses</p>
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
            className="bg-black/40 backdrop-blur-sm border border-gray-600 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Top Referrers</h2>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {leaderboard.map((entry, index) => {
                const TierIcon = tierIcons[entry.tier as keyof typeof tierIcons];
                const tierGradient = tierColors[entry.tier as keyof typeof tierColors];
                
                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all hover:scale-105 ${
                      entry.rank <= 3
                        ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                        : 'bg-black/30 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0 ${
                        entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                        entry.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                        entry.rank === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {entry.rank}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white text-sm sm:text-base truncate">{entry.username}</p>
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${tierGradient}`}>
                            <TierIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                            <span className="text-xs font-bold text-white">{entry.tier}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-white text-sm sm:text-base">{entry.referrals}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{entry.earnings.toLocaleString()}</p>
                    </div>
                  </motion.div>
                );
              })}
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
            <div className="bg-black/40 backdrop-blur-sm border border-gray-600 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <GiftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Referral Rewards</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-cyan-400">Per Referral Rewards</h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center p-2.5 sm:p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-300 text-sm sm:text-base">Successful Mint</span>
                      <span className="text-green-400 font-bold text-sm sm:text-base">+200 Points</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 sm:p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-300 text-sm sm:text-base">First Stake</span>
                      <span className="text-blue-400 font-bold text-sm sm:text-base">+100 Points</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 sm:p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-300 text-sm sm:text-base">Game Participation</span>
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
                        <div key={tier} className="flex justify-between items-center p-2.5 sm:p-3 bg-black/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r ${gradient}`} />
                            <span className="text-gray-300 text-sm sm:text-base">{tier}</span>
                          </div>
                          <span className="text-yellow-400 font-bold text-sm sm:text-base">{multiplier}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-gray-600 rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Special Milestones</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 sm:p-4 text-center">
                  <HeartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white mb-1 text-sm sm:text-base">10 Referrals</h4>
                  <p className="text-green-400 font-bold text-xs sm:text-sm">+1,000 Bonus Points</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3 sm:p-4 text-center">
                  <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white mb-1 text-sm sm:text-base">25 Referrals</h4>
                  <p className="text-blue-400 font-bold text-xs sm:text-sm">Exclusive NFT Badge</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 sm:p-4 text-center">
                  <FireIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white mb-1 text-sm sm:text-base">50 Referrals</h4>
                  <p className="text-purple-400 font-bold text-xs sm:text-sm">VIP Community Access</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </LoadingOverlay>
    </div>
  );
}