'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  ShoppingBagIcon,
  GiftIcon,
  SparklesIcon,
  TrophyIcon,
  CubeIcon,
  PaintBrushIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { LoadingOverlay, LoadingButton } from '@/components/ui/LoadingStates';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useToast, useSuccessToast, useErrorToast } from '@/components/ui/Toast';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'cosmetic' | 'utility' | 'exclusive' | 'boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  available: number;
  owned?: boolean;
}

const mockRewardItems: RewardItem[] = [
  {
    id: '1',
    name: 'Neon Aura',
    description: 'Glowing neon outline for your Hypercatz NFT',
    cost: 500,
    category: 'cosmetic',
    rarity: 'common',
    image: '/api/placeholder/200/200',
    available: 999
  },
  {
    id: '2',
    name: 'Cyber Wings',
    description: 'Holographic wings that pulse with energy',
    cost: 1200,
    category: 'cosmetic',
    rarity: 'rare',
    image: '/api/placeholder/200/200',
    available: 500
  },
  {
    id: '3',
    name: 'Staking Boost 2x',
    description: 'Double your staking rewards for 7 days',
    cost: 2000,
    category: 'boost',
    rarity: 'epic',
    image: '/api/placeholder/200/200',
    available: 100
  },
  {
    id: '4',
    name: 'Diamond Crown',
    description: 'Exclusive crown for top-tier holders',
    cost: 5000,
    category: 'exclusive',
    rarity: 'legendary',
    image: '/api/placeholder/200/200',
    available: 25
  },
  {
    id: '5',
    name: 'Holographic Skin',
    description: 'Shimmering holographic texture overlay',
    cost: 800,
    category: 'cosmetic',
    rarity: 'common',
    image: '/api/placeholder/200/200',
    available: 750
  },
  {
    id: '6',
    name: 'Portal Access Key',
    description: 'Unlock exclusive portal areas in games',
    cost: 3000,
    category: 'utility',
    rarity: 'epic',
    image: '/api/placeholder/200/200',
    available: 200
  },
  {
    id: '7',
    name: 'Cosmic Trail',
    description: 'Leave a trail of stars when moving',
    cost: 1500,
    category: 'cosmetic',
    rarity: 'rare',
    image: '/api/placeholder/200/200',
    available: 300
  },
  {
    id: '8',
    name: 'VIP Badge',
    description: 'Exclusive VIP status and perks',
    cost: 10000,
    category: 'exclusive',
    rarity: 'legendary',
    image: '/api/placeholder/200/200',
    available: 10
  }
];

const categoryIcons = {
  cosmetic: PaintBrushIcon,
  utility: CubeIcon,
  exclusive: TrophyIcon,
  boost: SparklesIcon
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

const rarityGlow = {
  common: 'shadow-gray-500/20',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/40',
  legendary: 'shadow-yellow-500/50'
};

export default function RewardsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [userPoints, setUserPoints] = useState(7500); // Mock user points
  const [purchaseModal, setPurchaseModal] = useState<RewardItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([]);
  
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  // Simulate loading reward items and user points
  useEffect(() => {
    const loadRewardsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRewardItems(mockRewardItems);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load rewards data. Please try again.');
        setIsLoading(false);
      }
    };

    loadRewardsData();
  }, []);

  // Simulate refreshing user points
  const refreshPoints = async () => {
    try {
      setIsLoadingPoints(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoadingPoints(false);
      showSuccess('Points refreshed successfully!');
    } catch (err) {
      setIsLoadingPoints(false);
      showError('Failed to refresh points.');
    }
  };

  const retryLoadData = () => {
    setError(null);
    setIsLoading(true);
    // Simulate retry
    setTimeout(() => {
      setRewardItems(mockRewardItems);
      setIsLoading(false);
    }, 1000);
  };

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBagIcon },
    { id: 'cosmetic', name: 'Cosmetic', icon: PaintBrushIcon },
    { id: 'utility', name: 'Utility', icon: CubeIcon },
    { id: 'exclusive', name: 'Exclusive', icon: TrophyIcon },
    { id: 'boost', name: 'Boosts', icon: SparklesIcon }
  ];

  const rarities = [
    { id: 'all', name: 'All Rarities' },
    { id: 'common', name: 'Common' },
    { id: 'rare', name: 'Rare' },
    { id: 'epic', name: 'Epic' },
    { id: 'legendary', name: 'Legendary' }
  ];

  const filteredItems = rewardItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || item.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const handlePurchase = (item: RewardItem) => {
    if (userPoints >= item.cost) {
      setPurchaseModal(item);
    } else {
      showError('Insufficient points to purchase this item.');
    }
  };

  const confirmPurchase = async () => {
    if (!purchaseModal) return;
    
    try {
      setIsPurchasing(true);
      // Simulate purchase transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user points
      setUserPoints(prev => prev - purchaseModal.cost);
      
      // Update item availability
      setRewardItems(prev => prev.map(item =>
        item.id === purchaseModal.id
          ? { ...item, available: item.available - 1, owned: true }
          : item
      ));
      
      showSuccess(`Successfully purchased ${purchaseModal.name}!`);
      setPurchaseModal(null);
    } catch (err) {
      showError('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <ErrorDisplay error={error} onRetry={retryLoadData} />
        </div>
      </div>
    );
  }

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
              Reward Store
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Spend your earned points on exclusive cosmetics, utilities, and boosts for your Hypercatz
            </p>
          </motion.div>

        {/* Points Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Your Points</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{userPoints.toLocaleString()}</p>
              </div>
            </div>
            <LoadingButton
              onClick={refreshPoints}
              isLoading={isLoadingPoints}
              className="px-3 py-2 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
            >
              Refresh
            </LoadingButton>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          {/* Category Filter */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-all text-sm sm:text-base ${
                      selectedCategory === category.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-black/20 border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rarity Filter */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Rarity</h3>
            <div className="flex flex-wrap gap-2">
              {rarities.map((rarity) => (
                <button
                  key={rarity.id}
                  onClick={() => setSelectedRarity(rarity.id)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-all text-sm sm:text-base ${
                    selectedRarity === rarity.id
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'bg-black/20 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {rarity.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredItems.map((item, index) => {
            const CategoryIcon = categoryIcons[item.category];
            const canAfford = userPoints >= item.cost;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black/40 backdrop-blur-sm border rounded-2xl p-3 sm:p-4 hover:scale-105 transition-all duration-300 ${rarityGlow[item.rarity]}`}
                style={{
                  borderImage: `linear-gradient(135deg, ${rarityColors[item.rarity].replace('from-', '').replace('to-', ', ')}) 1`
                }}
              >
                {/* Item Image */}
                <div className="relative mb-3 sm:mb-4">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                    <CategoryIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500" />
                  </div>
                  
                  {/* Rarity Badge */}
                  <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${rarityColors[item.rarity]} text-white`}>
                    {item.rarity.toUpperCase()}
                  </div>
                  
                  {/* Available Count */}
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs text-gray-300">
                    {item.available} left
                  </div>
                </div>

                {/* Item Info */}
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold text-sm sm:text-base">{item.cost.toLocaleString()}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded self-start sm:self-auto ${
                      canAfford ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {canAfford ? 'Can Afford' : 'Insufficient'}
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || item.available === 0}
                  className={`w-full text-sm sm:text-base py-2 sm:py-3 ${
                    !canAfford || item.available === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105'
                  }`}
                >
                  {item.available === 0 ? 'Sold Out' : 'Purchase'}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Purchase Confirmation Modal */}
        {purchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPurchaseModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="p-3 bg-hyperliquid-500/10 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <GiftIcon className="h-12 w-12 sm:h-16 sm:w-16 text-hyperliquid-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Confirm Purchase</h3>
                <p className="text-dark-300 text-sm sm:text-base">
                  Are you sure you want to purchase <span className="text-hyperliquid-400 font-bold">{purchaseModal.name}</span>?
                </p>
              </div>

              <div className="glass p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg">
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-dark-400 font-medium">Item Cost:</span>
                  <div className="flex items-center space-x-1">
                    <div className="p-1 bg-hyperliquid-500/10 rounded">
                      <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-hyperliquid-400" />
                    </div>
                    <span className="text-hyperliquid-400 font-bold">{purchaseModal.cost.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                  <span className="text-dark-400 font-medium">Your Points:</span>
                  <div className="flex items-center space-x-1">
                    <div className="p-1 bg-hyperliquid-500/10 rounded">
                      <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-hyperliquid-400" />
                    </div>
                    <span className="text-hyperliquid-400 font-bold">{userPoints.toLocaleString()}</span>
                  </div>
                </div>
                <hr className="border-dark-600 my-2" />
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-dark-400 font-medium">Remaining:</span>
                  <div className="flex items-center space-x-1">
                    <div className="p-1 bg-hyperliquid-500/10 rounded">
                      <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-hyperliquid-400" />
                    </div>
                    <span className="text-hyperliquid-400 font-bold">{(userPoints - purchaseModal.cost).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={() => setPurchaseModal(null)}
                  disabled={isPurchasing}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                >
                  Cancel
                </Button>
                <LoadingButton
                  onClick={confirmPurchase}
                  isLoading={isPurchasing}
                  className="flex-1 text-sm sm:text-base py-2 sm:py-3 btn-primary"
                >
                  Confirm Purchase
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