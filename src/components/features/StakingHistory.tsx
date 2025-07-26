'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  ExternalLink,
  Filter,
  Calendar,
  Search,
  Download
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface StakingTransaction {
  id: string;
  type: 'stake' | 'unstake' | 'claim';
  poolName: string;
  poolId: number;
  amount: number; // For stake/unstake: number of NFTs, for claim: reward amount
  tokenIds?: number[]; // NFT token IDs for stake/unstake
  timestamp: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasPrice?: number;
}

interface StakingHistoryProps {
  className?: string;
}

export function StakingHistory({ className = '' }: StakingHistoryProps) {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<StakingTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<StakingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'stake' | 'unstake' | 'claim'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    if (isConnected && address) {
      loadTransactionHistory();
    }
  }, [isConnected, address, dateRange]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filter, searchTerm]);

  const loadTransactionHistory = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual transaction history endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transaction data - replace with real blockchain data
      const mockTransactions: StakingTransaction[] = [
        {
          id: '1',
          type: 'stake',
          poolName: 'Diamond Pool',
          poolId: 3,
          amount: 5,
          tokenIds: [1234, 1235, 1236, 1237, 1238],
          timestamp: Date.now() - 86400000, // 1 day ago
          txHash: '0x1234567890abcdef1234567890abcdef12345678',
          status: 'confirmed',
          gasUsed: 150000,
          gasPrice: 20,
        },
        {
          id: '2',
          type: 'claim',
          poolName: 'Gold Pool',
          poolId: 2,
          amount: 125.5,
          timestamp: Date.now() - 172800000, // 2 days ago
          txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          status: 'confirmed',
          gasUsed: 80000,
          gasPrice: 18,
        },
        {
          id: '3',
          type: 'unstake',
          poolName: 'Silver Pool',
          poolId: 1,
          amount: 3,
          tokenIds: [1100, 1101, 1102],
          timestamp: Date.now() - 259200000, // 3 days ago
          txHash: '0x567890abcdef1234567890abcdef1234567890ab',
          status: 'confirmed',
          gasUsed: 120000,
          gasPrice: 22,
        },
        {
          id: '4',
          type: 'stake',
          poolName: 'Bronze Pool',
          poolId: 0,
          amount: 2,
          tokenIds: [999, 1000],
          timestamp: Date.now() - 432000000, // 5 days ago
          txHash: '0xcdef1234567890abcdef1234567890abcdef1234',
          status: 'confirmed',
          gasUsed: 100000,
          gasPrice: 15,
        },
        {
          id: '5',
          type: 'claim',
          poolName: 'Diamond Pool',
          poolId: 3,
          amount: 89.2,
          timestamp: Date.now() - 604800000, // 7 days ago
          txHash: '0x234567890abcdef1234567890abcdef123456789',
          status: 'confirmed',
          gasUsed: 75000,
          gasPrice: 19,
        },
      ];

      // Filter by date range
      const cutoffTime = dateRange === 'all' ? 0 : Date.now() - (
        dateRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
        dateRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
        90 * 24 * 60 * 60 * 1000
      );

      const filteredByDate = mockTransactions.filter(tx => tx.timestamp >= cutoffTime);
      setTransactions(filteredByDate);
      
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.type === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.poolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.includes(searchTerm)
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (type: StakingTransaction['type']) => {
    switch (type) {
      case 'stake':
        return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case 'unstake':
        return <ArrowDownLeft className="w-4 h-4 text-red-400" />;
      case 'claim':
        return <Gift className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTransactionColor = (type: StakingTransaction['type']) => {
    switch (type) {
      case 'stake':
        return 'text-green-400';
      case 'unstake':
        return 'text-red-400';
      case 'claim':
        return 'text-yellow-400';
    }
  };

  const formatTransactionAmount = (tx: StakingTransaction) => {
    if (tx.type === 'claim') {
      return `${tx.amount.toFixed(2)} $HYPE`;
    }
    return `${tx.amount} NFT${tx.amount > 1 ? 's' : ''}`;
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Pool', 'Amount', 'Transaction Hash', 'Status'].join(','),
      ...filteredTransactions.map(tx => [
        new Date(tx.timestamp).toISOString(),
        tx.type,
        tx.poolName,
        formatTransactionAmount(tx),
        tx.txHash,
        tx.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staking-history-${address}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Connect your wallet to view staking history</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-hyperliquid-400 mb-2">Staking History</h2>
          <p className="text-gray-400">Track all your staking transactions and rewards</p>
        </div>
        
        <Button
          onClick={exportTransactions}
          disabled={filteredTransactions.length === 0}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="feature-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Transaction Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-hyperliquid-500"
            >
              <option value="all">All Types</option>
              <option value="stake">Stake</option>
              <option value="unstake">Unstake</option>
              <option value="claim">Claim</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-hyperliquid-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by pool name, transaction hash..."
                className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-hyperliquid-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="feature-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg border border-dark-700 hover:border-dark-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium capitalize ${getTransactionColor(tx.type)}`}>
                        {tx.type}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-white">{tx.poolName}</span>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      {new Date(tx.timestamp).toLocaleDateString()} at{' '}
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-medium ${getTransactionColor(tx.type)}`}>
                    {tx.type === 'unstake' ? '-' : '+'}{formatTransactionAmount(tx)}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                    
                    <a
                      href={`https://hyperscan.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hyperliquid-400 hover:text-hyperliquid-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="feature-card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {filteredTransactions.filter(tx => tx.type === 'stake').length}
              </div>
              <div className="text-sm text-gray-400">Stakes</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {filteredTransactions.filter(tx => tx.type === 'unstake').length}
              </div>
              <div className="text-sm text-gray-400">Unstakes</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {filteredTransactions.filter(tx => tx.type === 'claim').length}
              </div>
              <div className="text-sm text-gray-400">Claims</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-hyperliquid-400 mb-1">
                {filteredTransactions
                  .filter(tx => tx.type === 'claim')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Total Rewards</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}