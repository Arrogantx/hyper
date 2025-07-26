'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useHyperPoints } from '@/hooks/useHyperPoints';
import LoadingSpinner from './LoadingSpinner';
import { Coins, TrendingUp, Wallet } from 'lucide-react';

interface HyperPointsBalanceProps {
  className?: string;
  showDetails?: boolean;
  variant?: 'card' | 'inline' | 'minimal';
}

export function HyperPointsBalance({ 
  className = '', 
  showDetails = false,
  variant = 'card'
}: HyperPointsBalanceProps) {
  const { address, isConnected } = useAccount();
  const { data, isLoading, error } = useHyperPoints();

  if (!isConnected) {
    return (
      <div className={`${className} ${variant === 'card' ? 'glass-card p-6' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">HyperPoints Balance</div>
            <div className="text-lg font-semibold text-gray-500">Connect Wallet</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} ${variant === 'card' ? 'glass-card p-6' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-hyperliquid-500/20 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
          <div>
            <div className="text-sm text-gray-400">HyperPoints Balance</div>
            <div className="text-lg font-semibold text-gray-300">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} ${variant === 'card' ? 'glass-card p-6 border-red-500/30' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">HyperPoints Balance</div>
            <div className="text-lg font-semibold text-red-400">Error loading</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${className} ${variant === 'card' ? 'glass-card p-6' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <Coins className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">HyperPoints Balance</div>
            <div className="text-lg font-semibold text-gray-500">No data</div>
          </div>
        </div>
      </div>
    );
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    } else {
      return num.toFixed(2);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Coins className="w-4 h-4 text-hyperliquid-500" />
        <span className="text-sm font-medium text-white">
          {formatBalance(data.formattedBalance)} HP
        </span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-hyperliquid-500/20 flex items-center justify-center">
          <Coins className="w-4 h-4 text-hyperliquid-500" />
        </div>
        <div>
          <div className="text-xs text-gray-400">HyperPoints</div>
          <div className="text-sm font-semibold text-white">
            {formatBalance(data.formattedBalance)} HP
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-hyperliquid-500/20 flex items-center justify-center">
            <Coins className="w-6 h-6 text-hyperliquid-500" />
          </div>
          <div>
            <div className="text-sm text-gray-400">HyperPoints Balance</div>
            <div className="text-2xl font-bold text-white">
              {formatBalance(data.formattedBalance)}
            </div>
            <div className="text-sm text-hyperliquid-400">HP</div>
          </div>
        </div>
        
        {showDetails && (
          <div className="text-right">
            <div className="text-xs text-gray-400">Total Supply</div>
            <div className="text-sm font-medium text-gray-300">
              {formatBalance(data.formattedTotalSupply)} HP
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Token Symbol</span>
            <span className="text-sm font-medium text-white">{data.symbol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Token Name</span>
            <span className="text-sm font-medium text-white">{data.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Decimals</span>
            <span className="text-sm font-medium text-white">{data.decimals}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Raw Balance</span>
            <span className="text-sm font-mono text-gray-300">
              {data.balance.toString()}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function HyperPointsBalanceCard({ className = '' }: { className?: string }) {
  return <HyperPointsBalance className={className} variant="card" showDetails={true} />;
}

export function HyperPointsBalanceInline({ className = '' }: { className?: string }) {
  return <HyperPointsBalance className={className} variant="inline" />;
}

export function HyperPointsBalanceMinimal({ className = '' }: { className?: string }) {
  return <HyperPointsBalance className={className} variant="minimal" />;
}

// Hook for easy balance access in other components
export function useHyperPointsBalance() {
  const { data, isLoading, error } = useHyperPoints();
  
  return {
    balance: data?.formattedBalance || '0',
    rawBalance: data?.balance || BigInt(0),
    symbol: data?.symbol || 'HP',
    isLoading,
    error,
    hasBalance: data ? parseFloat(data.formattedBalance) > 0 : false,
  };
}