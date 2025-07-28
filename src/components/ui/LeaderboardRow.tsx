'use client';

import { motion } from 'framer-motion';
import { useWalletDisplay } from '@/hooks/useHypeDomain';
import { useFormattedHyperPointsBalance } from '@/hooks/useHyperPoints';
import { Address } from 'viem';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';

interface LeaderboardRowProps {
  entry: {
    rank: number;
    wallet_address: Address;
    referrals: number;
    tier: string;
  };
  index: number;
}

const tierIcons = {
  Bronze: TrophyIcon,
  Silver: TrophyIcon,
  Gold: TrophyIcon,
  Platinum: TrophyIcon, // Replace with actual icons
  Diamond: TrophyIcon,
};

const tierColors = {
  Bronze: 'from-amber-600 to-amber-800',
  Silver: 'from-gray-400 to-gray-600',
  Gold: 'from-yellow-400 to-yellow-600',
  Platinum: 'from-purple-400 to-purple-600',
  Diamond: 'from-hyperliquid-400 to-hyperliquid-600'
};

export const LeaderboardRow: FC<LeaderboardRowProps> = ({ entry, index }) => {
  const { displayName } = useWalletDisplay(entry.wallet_address);
  const { formattedBalance: hyperPointsBalance } = useFormattedHyperPointsBalance(entry.wallet_address);
  
  const TierIcon = tierIcons[entry.tier as keyof typeof tierIcons] || TrophyIcon;
  const tierGradient = tierColors[entry.tier as keyof typeof tierColors];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all hover:scale-105 group ${
        entry.rank <= 3
          ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/20'
          : 'bg-dark-800/50 border-dark-600 hover:border-dark-500 hover:bg-dark-700/50'
      }`}
    >
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0 shadow-lg ${
          entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
          entry.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
          entry.rank === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
          'bg-dark-700 text-dark-300'
        }`}>
          {entry.rank}
        </div>
        
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-sm sm:text-base truncate group-hover:text-hyperliquid-400 transition-colors">{displayName}</p>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${tierGradient} shadow-lg`}>
              <TierIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              <span className="text-xs font-bold text-white">{entry.tier}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-bold text-white text-sm sm:text-base">{hyperPointsBalance}</p>
        <p className="text-xs sm:text-sm text-dark-400">{entry.referrals} referrals</p>
      </div>
    </motion.div>
  );
};