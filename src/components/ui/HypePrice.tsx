'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useHypePrice } from '@/hooks/useHypePrice';
import { cn } from '@/utils/cn';

interface HypePriceProps {
  variant?: 'navbar' | 'card' | 'inline';
  className?: string;
  showChange?: boolean;
  showVolume?: boolean;
  refreshInterval?: number;
}

const HypePrice: React.FC<HypePriceProps> = ({
  variant = 'navbar',
  className,
  showChange = true,
  showVolume = false,
  refreshInterval = 30000
}) => {
  const { data, loading, error, lastUpdated } = useHypePrice(refreshInterval);

  if (error && variant === 'navbar') {
    return (
      <div className={cn('flex items-center gap-2 text-red-400', className)}>
        <Activity className="h-4 w-4" />
        <span className="text-sm">Price Error</span>
      </div>
    );
  }

  if (loading && !data && variant === 'navbar') {
    return (
      <div className={cn('flex items-center gap-2 text-gray-400', className)}>
        <div className="w-4 h-4 border-2 border-hyperliquid-500/30 border-t-hyperliquid-500 rounded-full animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!data) return null;

  const isPositive = data.price_change_percentage_24h >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  if (variant === 'navbar') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg glass-card border border-dark-700/50 hover:border-hyperliquid-500/30 transition-all duration-300',
          className
        )}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-gradient-to-br from-hyperliquid-500 to-hyperliquid-600 rounded-full flex items-center justify-center">
            <DollarSign className="h-3 w-3 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              ${data.current_price.toFixed(2)}
            </span>
            {showChange && (
              <div className={cn('flex items-center gap-1 text-xs', changeColor)}>
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(data.price_change_percentage_24h).toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
        <span className="font-semibold text-hyperliquid-400">
          ${data.current_price.toFixed(2)}
        </span>
        {showChange && (
          <span className={cn('flex items-center gap-0.5', changeColor)}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(data.price_change_percentage_24h).toFixed(2)}%
          </span>
        )}
      </span>
    );
  }

  // Card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card p-6 border border-dark-700/50', className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-hyperliquid-500 to-hyperliquid-600 rounded-xl flex items-center justify-center shadow-lg shadow-hyperliquid-500/25">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">HYPE Token</h3>
            <p className="text-sm text-gray-400">Hyperliquid Native Token</p>
          </div>
        </div>
        {loading && (
          <div className="w-5 h-5 border-2 border-hyperliquid-500/30 border-t-hyperliquid-500 rounded-full animate-spin" />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">
            ${data.current_price.toFixed(2)}
          </span>
          {showChange && (
            <div className={cn('flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-800/50', changeColor)}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-semibold">
                {isPositive ? '+' : ''}{data.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700/50">
          <div>
            <p className="text-sm text-gray-400 mb-1">Market Cap</p>
            <p className="text-lg font-semibold text-white">
              ${(data.market_cap / 1000000).toFixed(1)}M
            </p>
          </div>
          {showVolume && (
            <div>
              <p className="text-sm text-gray-400 mb-1">24h Volume</p>
              <p className="text-lg font-semibold text-white">
                ${(data.total_volume / 1000000).toFixed(1)}M
              </p>
            </div>
          )}
        </div>

        {lastUpdated && (
          <div className="pt-2 border-t border-dark-700/50">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Dedicated card component for detailed price displays
export const HypePriceCard: React.FC<Omit<HypePriceProps, 'variant'>> = (props) => (
  <HypePrice {...props} variant="card" showVolume />
);

export default HypePrice;