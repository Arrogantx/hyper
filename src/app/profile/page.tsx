'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  CubeIcon,
  TrophyIcon,
  FireIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { LoadingOverlay, LoadingButton } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useSuccessToast, useErrorToast, useInfoToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Mock NFT data
const mockNFTs = [
  {
    id: 1,
    name: 'Hypercatz #1337',
    image: '/api/placeholder/300/300',
    rarity: 'Legendary',
    traits: { Background: 'Neon City', Eyes: 'Laser', Fur: 'Holographic' },
    staked: true,
    level: 15,
    power: 2500
  },
  {
    id: 2,
    name: 'Hypercatz #0420',
    image: '/api/placeholder/300/300',
    rarity: 'Epic',
    traits: { Background: 'Cyber Space', Eyes: 'RGB', Fur: 'Electric Blue' },
    staked: false,
    level: 8,
    power: 1200
  },
  {
    id: 3,
    name: 'Hypercatz #2077',
    image: '/api/placeholder/300/300',
    rarity: 'Rare',
    traits: { Background: 'Matrix', Eyes: 'Glitch', Fur: 'Neon Pink' },
    staked: true,
    level: 12,
    power: 1800
  },
  {
    id: 4,
    name: 'Hypercatz #3333',
    image: '/api/placeholder/300/300',
    rarity: 'Epic',
    traits: { Background: 'Digital Void', Eyes: 'Plasma', Fur: 'Chrome' },
    staked: false,
    level: 20,
    power: 3200
  },
  {
    id: 5,
    name: 'Hypercatz #1111',
    image: '/api/placeholder/300/300',
    rarity: 'Legendary',
    traits: { Background: 'Quantum Realm', Eyes: 'Void', Fur: 'Shadow' },
    staked: true,
    level: 25,
    power: 4500
  },
  {
    id: 6,
    name: 'Hypercatz #0001',
    image: '/api/placeholder/300/300',
    rarity: 'Mythic',
    traits: { Background: 'Genesis', Eyes: 'Cosmic', Fur: 'Prismatic' },
    staked: false,
    level: 30,
    power: 6000
  }
];

const mockActivity = [
  { type: 'mint', item: 'Hypercatz #3333', time: '2 hours ago', value: '0.5 ETH' },
  { type: 'stake', item: 'Hypercatz #1337', time: '1 day ago', value: '+50 HCAT' },
  { type: 'game', item: 'Neon Runner Victory', time: '2 days ago', value: '+200 XP' },
  { type: 'trade', item: 'Hypercatz #0420', time: '3 days ago', value: '1.2 ETH' },
  { type: 'reward', item: 'Daily Login Bonus', time: '1 week ago', value: '+100 HCAT' }
];

const rarityColors = {
  Common: 'from-gray-400 to-gray-600',
  Rare: 'from-blue-400 to-blue-600',
  Epic: 'from-purple-400 to-purple-600',
  Legendary: 'from-yellow-400 to-yellow-600',
  Mythic: 'from-pink-400 to-pink-600'
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('collection');
  const [viewMode, setViewMode] = useState('grid');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nftData, setNftData] = useState(mockNFTs);
  const [activityData, setActivityData] = useState(mockActivity);
  const [profileStats, setProfileStats] = useState({
    nftsOwned: 6,
    staked: 3,
    rewards: 15750,
    tier: 'Gold'
  });
  const [isStaking, setIsStaking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Toast hooks
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  const showInfo = useInfoToast();

  // Data loading simulation
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Reduced loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Removed error simulation for production
        
        // Load data successfully
        setNftData(mockNFTs);
        setActivityData(mockActivity);
        setProfileStats({
          nftsOwned: mockNFTs.length,
          staked: mockNFTs.filter(nft => nft.staked).length,
          rewards: 15750,
          tier: 'Gold'
        });
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [showError]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update data
      setNftData([...mockNFTs]);
      setActivityData([...mockActivity]);
      
      showSuccess('Profile data refreshed successfully');
    } catch (err) {
      showError('Failed to refresh profile data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle NFT staking
  const handleStakeNFT = async (nftId: number, stake: boolean) => {
    try {
      setIsStaking(true);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update NFT staking status
      setNftData(prev => prev.map(nft =>
        nft.id === nftId ? { ...nft, staked: stake } : nft
      ));
      
      // Update profile stats
      setProfileStats(prev => ({
        ...prev,
        staked: stake ? prev.staked + 1 : prev.staked - 1
      }));
      
      showSuccess(`NFT ${stake ? 'staked' : 'unstaked'} successfully!`);
      
      // Close modal
      setSelectedNFT(null);
    } catch (err) {
      showError(`Failed to ${stake ? 'stake' : 'unstake'} NFT`);
    } finally {
      setIsStaking(false);
    }
  };

  // Retry function for error handling
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger data reload
    window.location.reload();
  };

  const filteredNFTs = nftData.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = filterRarity === 'all' || nft.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'level': return b.level - a.level;
      case 'power': return b.power - a.power;
      case 'rarity': return b.id - a.id; // Mock rarity sort
      default: return b.id - a.id; // newest first
    }
  });

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <ErrorDisplay error={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-16 sm:pt-20">
      <LoadingOverlay isLoading={isLoading}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-1 sm:mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">HyperCatz Collector</h1>
                  <LoadingButton
                    isLoading={isRefreshing}
                    onClick={handleRefresh}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </LoadingButton>
                </div>
                <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">0x1234...5678</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-400">{profileStats.nftsOwned}</div>
                    <div className="text-xs sm:text-sm text-gray-400">NFTs Owned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400">{profileStats.staked}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Staked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">{profileStats.rewards.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Rewards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-400">{profileStats.tier}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Tier</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <CubeIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">View on Explorer</span>
                  <span className="sm:hidden">Explorer</span>
                </Button>
                <Button variant="primary" size="sm" className="w-full sm:w-auto">
                  <TrophyIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Achievements</span>
                  <span className="sm:hidden">Awards</span>
                </Button>
              </div>
            </div>
          </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6 sm:mb-8"
        >
          {[
            { id: 'collection', label: 'Collection', icon: CubeIcon },
            { id: 'activity', label: 'Activity', icon: ClockIcon },
            { id: 'stats', label: 'Statistics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Filters and Controls */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col gap-4">
                {/* Top Row - Search and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 sm:max-w-xs">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search NFTs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row - Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Rarity Filter */}
                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                  >
                    <option value="all">All Rarities</option>
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Mythic">Mythic</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                  >
                    <option value="newest">Newest First</option>
                    <option value="level">Highest Level</option>
                    <option value="power">Highest Power</option>
                    <option value="rarity">Rarity</option>
                  </select>
                </div>
              </div>
            </div>

            {/* NFT Grid/List */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
              : 'space-y-3 sm:space-y-4'
            }>
              {sortedNFTs.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedNFT(nft)}
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 overflow-hidden cursor-pointer hover:border-purple-500/40 transition-all group ${
                    viewMode === 'list' ? 'flex items-center p-3 sm:p-4' : 'p-3 sm:p-4'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* NFT Image */}
                      <div className="relative mb-3 sm:mb-4">
                        <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                          <CubeIcon className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400" />
                        </div>
                        {nft.staked && (
                          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            Staked
                          </div>
                        )}
                        <div className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full`}>
                          {nft.rarity}
                        </div>
                      </div>

                      {/* NFT Info */}
                      <div>
                        <h3 className="text-white font-semibold mb-2 group-hover:text-purple-400 transition-colors text-sm sm:text-base">
                          {nft.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-2">
                          <span>Level {nft.level}</span>
                          <span className="flex items-center gap-1">
                            <BoltIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            {nft.power}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {Object.entries(nft.traits).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="truncate">{key}: {value}</div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                        <CubeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors text-sm sm:text-base truncate">
                            {nft.name}
                          </h3>
                          <div className={`bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0`}>
                            {nft.rarity}
                          </div>
                          {nft.staked && (
                            <div className="bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                              Staked
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                          <span>Level {nft.level}</span>
                          <span className="flex items-center gap-1">
                            <BoltIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            {nft.power}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 sm:p-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h2>
            <div className="space-y-3 sm:space-y-4">
              {activityData.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-700/30 rounded-xl"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'mint' ? 'bg-green-500/20 text-green-400' :
                    activity.type === 'stake' ? 'bg-blue-500/20 text-blue-400' :
                    activity.type === 'game' ? 'bg-purple-500/20 text-purple-400' :
                    activity.type === 'trade' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-pink-500/20 text-pink-400'
                  }`}>
                    {activity.type === 'mint' && <StarIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    {activity.type === 'stake' && <CubeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    {activity.type === 'game' && <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    {activity.type === 'trade' && <FireIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    {activity.type === 'reward' && <BoltIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm sm:text-base truncate">{activity.item}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">{activity.time}</div>
                  </div>
                  <div className="text-green-400 font-semibold text-sm sm:text-base flex-shrink-0">{activity.value}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
          >
            {/* Collection Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Collection Statistics</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Total NFTs</span>
                  <span className="text-white font-semibold text-sm sm:text-base">{profileStats.nftsOwned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Rarest NFT</span>
                  <span className="text-pink-400 font-semibold text-sm sm:text-base">Mythic</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Average Level</span>
                  <span className="text-white font-semibold text-sm sm:text-base">18.3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Total Power</span>
                  <span className="text-yellow-400 font-semibold text-sm sm:text-base">19,200</span>
                </div>
              </div>
            </div>

            {/* Earning Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Earning Statistics</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Total Staking Rewards</span>
                  <span className="text-green-400 font-semibold text-sm sm:text-base">12,500 HCAT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Game Rewards</span>
                  <span className="text-purple-400 font-semibold text-sm sm:text-base">2,750 HCAT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Referral Rewards</span>
                  <span className="text-blue-400 font-semibold text-sm sm:text-base">500 HCAT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Daily Average</span>
                  <span className="text-white font-semibold text-sm sm:text-base">125 HCAT</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* NFT Detail Modal */}
        {selectedNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-2xl border border-purple-500/20 p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white pr-4">{selectedNFT.name}</h3>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-gray-400 hover:text-white text-xl sm:text-2xl flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                <CubeIcon className="w-20 h-20 sm:w-24 sm:h-24 text-purple-400" />
              </div>

              <div className="space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Rarity</span>
                  <span className={`bg-gradient-to-r ${rarityColors[selectedNFT.rarity as keyof typeof rarityColors]} bg-clip-text text-transparent font-semibold text-sm sm:text-base`}>
                    {selectedNFT.rarity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Level</span>
                  <span className="text-white font-semibold text-sm sm:text-base">{selectedNFT.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Power</span>
                  <span className="text-yellow-400 font-semibold text-sm sm:text-base">{selectedNFT.power}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Status</span>
                  <span className={`${selectedNFT.staked ? 'text-green-400' : 'text-gray-400'} text-sm sm:text-base`}>
                    {selectedNFT.staked ? 'Staked' : 'Available'}
                  </span>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Traits</h4>
                <div className="space-y-2">
                  {Object.entries(selectedNFT.traits).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">{key}</span>
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 text-sm sm:text-base">
                  <span className="hidden sm:inline">View on Explorer</span>
                  <span className="sm:hidden">Explorer</span>
                </Button>
                <LoadingButton
                  isLoading={isStaking}
                  onClick={() => handleStakeNFT(selectedNFT.id, !selectedNFT.staked)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  {selectedNFT.staked ? 'Unstake' : 'Stake'}
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}
        </div>
      </LoadingOverlay>
    </div>
  );
}
            