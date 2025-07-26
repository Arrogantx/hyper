'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TrophyIcon,
  CubeIcon,
  PaintBrushIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DemoItem {
  id: string;
  category: 'cosmetic' | 'utility' | 'exclusive' | 'boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const demoItems: DemoItem[] = [
  { id: '1', category: 'cosmetic', rarity: 'common' },
  { id: '2', category: 'cosmetic', rarity: 'rare' },
  { id: '3', category: 'boost', rarity: 'epic' },
  { id: '4', category: 'exclusive', rarity: 'legendary' },
  { id: '5', category: 'cosmetic', rarity: 'common' },
  { id: '6', category: 'utility', rarity: 'epic' },
  { id: '7', category: 'cosmetic', rarity: 'rare' },
  { id: '8', category: 'exclusive', rarity: 'legendary' },
  { id: '9', category: 'utility', rarity: 'rare' },
  { id: '10', category: 'boost', rarity: 'common' },
  { id: '11', category: 'cosmetic', rarity: 'epic' },
  { id: '12', category: 'exclusive', rarity: 'rare' }
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

  const filteredItems = demoItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || item.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 pt-16 sm:pt-20">
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
            Exclusive rewards and utilities for your Hypercatz NFTs
          </p>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-hyperliquid-500/20 to-purple-500/20 backdrop-blur-sm border border-hyperliquid-500/30 rounded-2xl p-6 sm:p-8 mb-8 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-hyperliquid-500/20 rounded-full">
              <ClockIcon className="h-8 w-8 text-hyperliquid-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Coming Soon</h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-lg mx-auto">
            The reward store is currently under development. Exciting rewards and utilities will be available soon!
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8 blur-sm pointer-events-none"
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

        {/* Demo Items Grid - Blurred */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 blur-sm pointer-events-none"
        >
          {filteredItems.map((item, index) => {
            const CategoryIcon = categoryIcons[item.category];
            
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
                    ??? left
                  </div>
                </div>

                {/* Item Info */}
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">Demo Item</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">Exclusive reward item description</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold text-sm sm:text-base">???</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded self-start sm:self-auto bg-gray-500/20 text-gray-400">
                      Coming Soon
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  disabled
                  className="w-full text-sm sm:text-base py-2 sm:py-3 px-4 rounded-lg bg-gray-600/20 text-gray-500 cursor-not-allowed border border-gray-600/30"
                >
                  Coming Soon
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Coming Soon Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-black/30 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">What to Expect</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <PaintBrushIcon className="h-5 w-5 text-hyperliquid-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Cosmetic Items</h4>
                  <p className="text-gray-400 text-xs">Unique visual enhancements for your NFTs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CubeIcon className="h-5 w-5 text-hyperliquid-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Utility Items</h4>
                  <p className="text-gray-400 text-xs">Functional upgrades and special access</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <SparklesIcon className="h-5 w-5 text-hyperliquid-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Boost Items</h4>
                  <p className="text-gray-400 text-xs">Temporary enhancements and multipliers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrophyIcon className="h-5 w-5 text-hyperliquid-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Exclusive Items</h4>
                  <p className="text-gray-400 text-xs">Limited edition rewards for top holders</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}