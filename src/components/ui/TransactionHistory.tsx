'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Address } from 'viem';
import {
  ClockIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import {
  SwapTransaction,
  loadTransactionHistory,
  getRecentTransactions,
  formatTransactionTime,
  getTransactionStatusColor,
  getTransactionStatusIcon,
  clearTransactionHistory
} from '@/lib/transactionHistory';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';

interface TransactionHistoryProps {
  userAddress?: Address;
  showAll?: boolean;
  className?: string;
}

export default function TransactionHistory({ 
  userAddress, 
  showAll = false, 
  className = '' 
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<SwapTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadTransactions = () => {
      try {
        setIsLoading(true);
        const txs = showAll 
          ? loadTransactionHistory(userAddress)
          : getRecentTransactions(userAddress);
        setTransactions(txs);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hypercatz_swap_history') {
        loadTransactions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userAddress, showAll]);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all transaction history?')) {
      clearTransactionHistory();
      setTransactions([]);
    }
  };

  const getExplorerUrl = (hash: string) => {
    // This would be the actual HyperEVM explorer URL
    return `https://explorer.hyperliquid.xyz/tx/${hash}`;
  };

  const displayTransactions = isExpanded ? transactions : transactions.slice(0, 3);

  if (isLoading) {
    return (
      <div className={`glass-card p-4 sm:p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-dark-400">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={`glass-card p-4 sm:p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <ClockIcon className="w-5 h-5 text-hyperliquid-400" />
          <h3 className="text-lg font-bold text-white">
            {showAll ? 'Transaction History' : 'Recent Swaps'}
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-dark-400">No transactions yet</p>
          <p className="text-sm text-dark-500 mt-1">
            Your swap history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <ClockIcon className="w-5 h-5 text-hyperliquid-400" />
          <h3 className="text-lg font-bold text-white">
            {showAll ? 'Transaction History' : 'Recent Swaps'}
          </h3>
          <span className="px-2 py-1 bg-hyperliquid-500/20 text-hyperliquid-400 text-xs rounded-full">
            {transactions.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {!showAll && transactions.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-dark-400 hover:text-white transition-colors"
              title={isExpanded ? 'Show less' : 'Show all'}
            >
              {isExpanded ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          )}
          
          {showAll && transactions.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
              title="Clear history"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-700/30 rounded-xl p-3 sm:p-4 border border-dark-600/30 hover:border-hyperliquid-500/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {getTransactionStatusIcon(tx.status)}
                  </span>
                  <span className={`text-sm font-medium ${getTransactionStatusColor(tx.status)}`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-dark-400">
                    {formatTransactionTime(tx.timestamp)}
                  </span>
                  <a
                    href={getExplorerUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-dark-400 hover:text-hyperliquid-400 transition-colors"
                    title="View on explorer"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{tx.fromToken.icon}</span>
                    <div className="text-left">
                      <div className="text-white font-medium text-sm">
                        {parseFloat(tx.fromAmount).toFixed(4)} {tx.fromToken.symbol}
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRightIcon className="w-4 h-4 text-dark-400 flex-shrink-0" />
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{tx.toToken.icon}</span>
                    <div className="text-left">
                      <div className="text-white font-medium text-sm">
                        {parseFloat(tx.toAmount).toFixed(4)} {tx.toToken.symbol}
                      </div>
                    </div>
                  </div>
                </div>

                {tx.priceImpact && (
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className={`text-xs ${
                      tx.priceImpact < 0.1 ? 'text-green-400' :
                      tx.priceImpact < 0.5 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {tx.priceImpact.toFixed(2)}% impact
                    </div>
                  </div>
                )}
              </div>

              {tx.route && tx.route.length > 2 && (
                <div className="mt-2 pt-2 border-t border-dark-600/30">
                  <div className="text-xs text-dark-400">
                    Route: {tx.route.join(' → ')}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!showAll && !isExpanded && transactions.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-hyperliquid-400 hover:text-hyperliquid-300 transition-colors"
          >
            Show {transactions.length - 3} more transactions
          </button>
        </div>
      )}
    </div>
  );
}

// Recent swaps component for the main swap page
export function RecentSwaps({ userAddress, className = '' }: { userAddress?: Address; className?: string }) {
  return (
    <TransactionHistory 
      userAddress={userAddress} 
      showAll={false} 
      className={className}
    />
  );
}

// Full transaction history component
export function FullTransactionHistory({ userAddress, className = '' }: { userAddress?: Address; className?: string }) {
  return (
    <TransactionHistory 
      userAddress={userAddress} 
      showAll={true} 
      className={className}
    />
  );
}