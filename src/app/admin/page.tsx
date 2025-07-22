'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  CogIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  BanknotesIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { LoadingOverlay, LoadingButton } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useSuccessToast, useErrorToast, useWarningToast, useInfoToast } from '@/components/ui/Toast';

// Mock admin data
const mockStats = {
  totalUsers: 15420,
  activeUsers: 8750,
  totalNFTs: 10000,
  mintedNFTs: 7834,
  totalStaked: 4521,
  totalRewards: 125000,
  gamesSessions: 2340,
  swapVolume: 45.7
};

const mockUsers = [
  { id: 1, address: '0x1234...5678', nfts: 12, staked: 8, tier: 'Diamond', status: 'active', joined: '2024-01-15' },
  { id: 2, address: '0x2345...6789', nfts: 6, staked: 3, tier: 'Gold', status: 'active', joined: '2024-02-20' },
  { id: 3, address: '0x3456...7890', nfts: 25, staked: 20, tier: 'Diamond', status: 'banned', joined: '2024-01-08' },
  { id: 4, address: '0x4567...8901', nfts: 3, staked: 1, tier: 'Silver', status: 'active', joined: '2024-03-10' },
  { id: 5, address: '0x5678...9012', nfts: 18, staked: 15, tier: 'Platinum', status: 'active', joined: '2024-01-25' }
];

const mockRewards = [
  { id: 1, type: 'Daily Login', amount: 100, active: true, description: 'Daily reward for logging in' },
  { id: 2, type: 'First Mint', amount: 500, active: true, description: 'Bonus for first NFT mint' },
  { id: 3, type: 'Staking Bonus', amount: 50, active: true, description: 'Hourly staking rewards' },
  { id: 4, type: 'Game Victory', amount: 200, active: false, description: 'Reward for winning games' },
  { id: 5, type: 'Referral Bonus', amount: 300, active: true, description: 'Reward for successful referrals' }
];

const mockSystemStatus = {
  minting: { status: 'active', lastUpdate: '2024-01-20 14:30' },
  staking: { status: 'active', lastUpdate: '2024-01-20 14:25' },
  games: { status: 'maintenance', lastUpdate: '2024-01-20 12:00' },
  swap: { status: 'active', lastUpdate: '2024-01-20 14:35' },
  rewards: { status: 'active', lastUpdate: '2024-01-20 14:20' }
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [systemControls, setSystemControls] = useState(mockSystemStatus);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  
  // Toast hooks
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  const showWarning = useWarningToast();
  const showInfo = useInfoToast();

  // Simulate initial data loading
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate potential error (10% chance)
        if (Math.random() < 0.1) {
          throw new Error('Failed to load admin data');
        }
        
        showInfo('Admin Panel Loaded', 'All systems and data loaded successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
        showError('Loading Failed', 'Failed to load admin panel data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [showInfo, showError]);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger reload
    window.location.reload();
  };

  // Set action loading state
  const setActionLoadingState = (action: string, loading: boolean) => {
    setActionLoading(prev => ({ ...prev, [action]: loading }));
  };

  const toggleSystemStatus = async (system: string) => {
    const actionKey = `toggle-${system}`;
    try {
      setActionLoadingState(actionKey, true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate potential error (5% chance)
      if (Math.random() < 0.05) {
        throw new Error(`Failed to toggle ${system} system`);
      }
      
      const newStatus = systemControls[system as keyof typeof systemControls].status === 'active' ? 'paused' : 'active';
      
      setSystemControls(prev => ({
        ...prev,
        [system]: {
          ...prev[system as keyof typeof prev],
          status: newStatus,
          lastUpdate: new Date().toLocaleString()
        }
      }));
      
      showSuccess(
        `${system.charAt(0).toUpperCase() + system.slice(1)} System ${newStatus === 'active' ? 'Started' : 'Paused'}`,
        `System status updated successfully`
      );
    } catch (err) {
      showError(
        'System Control Failed',
        err instanceof Error ? err.message : `Failed to toggle ${system} system`
      );
    } finally {
      setActionLoadingState(actionKey, false);
    }
  };

  // Handle user actions
  const handleUserAction = async (action: string, userId?: number) => {
    const actionKey = `user-${action}-${userId || 'all'}`;
    try {
      setActionLoadingState(actionKey, true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate potential error (5% chance)
      if (Math.random() < 0.05) {
        throw new Error(`Failed to ${action} user`);
      }
      
      showSuccess(
        'User Action Completed',
        `Successfully ${action} user${userId ? ` #${userId}` : 's'}`
      );
    } catch (err) {
      showError(
        'User Action Failed',
        err instanceof Error ? err.message : `Failed to ${action} user`
      );
    } finally {
      setActionLoadingState(actionKey, false);
    }
  };

  // Handle reward actions
  const handleRewardAction = async (action: string, rewardId?: number) => {
    const actionKey = `reward-${action}-${rewardId || 'new'}`;
    try {
      setActionLoadingState(actionKey, true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate potential error (5% chance)
      if (Math.random() < 0.05) {
        throw new Error(`Failed to ${action} reward`);
      }
      
      showSuccess(
        'Reward Action Completed',
        `Successfully ${action} reward${rewardId ? ` #${rewardId}` : ''}`
      );
    } catch (err) {
      showError(
        'Reward Action Failed',
        err instanceof Error ? err.message : `Failed to ${action} reward`
      );
    } finally {
      setActionLoadingState(actionKey, false);
    }
  };

  // Handle emergency actions
  const handleEmergencyAction = async (action: string) => {
    const actionKey = `emergency-${action}`;
    try {
      setActionLoadingState(actionKey, true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate potential error (3% chance)
      if (Math.random() < 0.03) {
        throw new Error(`Failed to execute ${action}`);
      }
      
      showWarning(
        'Emergency Action Executed',
        `${action} has been executed successfully`
      );
    } catch (err) {
      showError(
        'Emergency Action Failed',
        err instanceof Error ? err.message : `Failed to execute ${action}`
      );
    } finally {
      setActionLoadingState(actionKey, false);
    }
  };

  // Handle data refresh
  const handleDataRefresh = async () => {
    const actionKey = 'refresh-data';
    try {
      setActionLoadingState(actionKey, true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Data Refreshed', 'All admin data has been refreshed');
    } catch (err) {
      showError('Refresh Failed', 'Failed to refresh admin data');
    } finally {
      setActionLoadingState(actionKey, false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'maintenance': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayIcon className="w-4 h-4" />;
      case 'paused': return <PauseIcon className="w-4 h-4" />;
      case 'maintenance': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <CogIcon className="w-4 h-4" />;
    }
  };

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <ErrorDisplay error={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-16 sm:pt-20">
      <LoadingOverlay isLoading={isLoading}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        
        {/* Status Badges */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium border border-red-500/30">
            Admin Panel
          </div>
          <div className="px-3 py-1 bg-hyperliquid-500/20 text-hyperliquid-400 rounded-full text-sm font-medium border border-hyperliquid-500/30">
            System Control
          </div>
        </motion.div>
        
        {/* Admin Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/25">
              <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold hyperliquid-gradient-text mb-1 sm:mb-2">Admin Control Panel</h1>
              <p className="text-gray-400 text-sm sm:text-base">Manage Hypercatz DApp systems and users</p>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 text-red-400">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">Admin Access Required</span>
            </div>
            <p className="text-red-300 text-xs sm:text-sm mt-1">
              This panel provides administrative controls for the Hypercatz ecosystem. Use with caution.
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-2 mb-6 sm:mb-8"
        >
          <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'users', label: 'User Management', icon: UsersIcon },
              { id: 'rewards', label: 'Reward System', icon: GiftIcon },
              { id: 'system', label: 'System Control', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-600 text-white shadow-lg shadow-hyperliquid-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <div className={`p-1 rounded-lg ${activeTab === tab.id ? 'bg-white/20' : 'bg-dark-700/50'}`}>
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
          >
            {[
              { label: 'Total Users', value: mockStats.totalUsers.toLocaleString(), icon: UsersIcon, change: '+12%' },
              { label: 'Active Users', value: mockStats.activeUsers.toLocaleString(), icon: BoltIcon, change: '+8%' },
              { label: 'NFTs Minted', value: `${mockStats.mintedNFTs}/${mockStats.totalNFTs}`, icon: TrophyIcon, change: '+15%' },
              { label: 'Total Staked', value: mockStats.totalStaked.toLocaleString(), icon: FireIcon, change: '+5%' },
              { label: 'Total Rewards', value: `${mockStats.totalRewards.toLocaleString()} HCAT`, icon: BanknotesIcon, change: '+18%' },
              { label: 'Game Sessions', value: mockStats.gamesSessions.toLocaleString(), icon: TrophyIcon, change: '+22%' },
              { label: 'Swap Volume', value: `${mockStats.swapVolume} ETH`, icon: ArrowPathIcon, change: '+35%' },
              { label: 'System Health', value: '98.5%', icon: ShieldCheckIcon, change: '+0.2%' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="stat-card group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-hyperliquid-500/20 group-hover:bg-hyperliquid-500/30 transition-colors">
                    <stat.icon className="w-5 h-5 text-hyperliquid-400" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-hyperliquid-500/20 text-hyperliquid-400 border border-hyperliquid-500/30">
                    {stat.change}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-hyperliquid-100 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold hyperliquid-gradient-text">User Management</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input-modern"
                />
                <LoadingButton
                  className="btn-primary whitespace-nowrap text-sm"
                  isLoading={actionLoading['user-add-new']}
                  onClick={() => handleUserAction('add')}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add User
                </LoadingButton>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              {mockUsers.map((user) => (
                <div key={user.id} className="feature-card p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-mono text-sm truncate">{user.address}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          user.tier === 'Diamond' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                          user.tier === 'Platinum' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                          user.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-hyperliquid-500/20 text-hyperliquid-400 border-hyperliquid-500/30'
                        }`}>
                          {user.tier}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          user.status === 'active' ? 'bg-hyperliquid-500/20 text-hyperliquid-400 border-hyperliquid-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-hyperliquid-400 hover:text-hyperliquid-300 hover:bg-hyperliquid-500/10 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <LoadingButton
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                        isLoading={actionLoading[`user-edit-${user.id}`]}
                        onClick={() => handleUserAction('edit', user.id)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </LoadingButton>
                      <LoadingButton
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        isLoading={actionLoading[`user-delete-${user.id}`]}
                        onClick={() => handleUserAction('delete', user.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </LoadingButton>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">NFTs</div>
                      <div className="text-white font-medium">{user.nfts}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Staked</div>
                      <div className="text-white font-medium">{user.staked}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Joined</div>
                      <div className="text-white font-medium">{user.joined}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Address</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">NFTs</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Staked</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="border-b border-dark-700/50 hover:bg-dark-700/20 transition-colors">
                      <td className="py-3 px-4 text-white font-mono text-sm">{user.address}</td>
                      <td className="py-3 px-4 text-white">{user.nfts}</td>
                      <td className="py-3 px-4 text-white">{user.staked}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          user.tier === 'Diamond' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                          user.tier === 'Platinum' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                          user.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-hyperliquid-500/20 text-hyperliquid-400 border-hyperliquid-500/30'
                        }`}>
                          {user.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          user.status === 'active' ? 'bg-hyperliquid-500/20 text-hyperliquid-400 border-hyperliquid-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{user.joined}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1 text-hyperliquid-400 hover:text-hyperliquid-300 hover:bg-hyperliquid-500/10 rounded transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <LoadingButton
                            className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded transition-colors"
                            isLoading={actionLoading[`user-edit-${user.id}`]}
                            onClick={() => handleUserAction('edit', user.id)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </LoadingButton>
                          <LoadingButton
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                            isLoading={actionLoading[`user-delete-${user.id}`]}
                            onClick={() => handleUserAction('delete', user.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </LoadingButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Reward System Tab */}
        {activeTab === 'rewards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold hyperliquid-gradient-text">Reward System Management</h2>
              <LoadingButton
                className="btn-primary text-sm"
                isLoading={actionLoading['reward-add-new']}
                onClick={() => handleRewardAction('add')}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Reward
              </LoadingButton>
            </div>

            <div className="space-y-4">
              {mockRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="feature-card p-4 flex items-center justify-between hover:border-hyperliquid-500/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      reward.active ? 'bg-hyperliquid-500/20' : 'bg-gray-500/20'
                    }`}>
                      <GiftIcon className={`w-6 h-6 ${reward.active ? 'text-hyperliquid-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{reward.type}</h3>
                      <p className="text-gray-400 text-sm">{reward.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-hyperliquid-400 font-semibold">{reward.amount} HCAT</div>
                      <div className={`text-xs px-2 py-1 rounded-full border ${reward.active ? 'text-hyperliquid-400 bg-hyperliquid-500/20 border-hyperliquid-500/30' : 'text-red-400 bg-red-500/20 border-red-500/30'}`}>
                        {reward.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <LoadingButton
                        className="p-2 text-hyperliquid-400 hover:text-hyperliquid-300 hover:bg-hyperliquid-500/10 rounded transition-colors"
                        isLoading={actionLoading[`reward-edit-${reward.id}`]}
                        onClick={() => handleRewardAction('edit', reward.id)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </LoadingButton>
                      <LoadingButton
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        isLoading={actionLoading[`reward-delete-${reward.id}`]}
                        onClick={() => handleRewardAction('delete', reward.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* System Control Tab */}
        {activeTab === 'system' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="glass-card p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold hyperliquid-gradient-text mb-4 sm:mb-6">System Status & Controls</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Object.entries(systemControls).map(([system, data]) => (
                  <div key={system} className="feature-card p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="text-white font-semibold capitalize text-sm sm:text-base">{system}</h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                        data.status === 'active' ? 'text-hyperliquid-400 bg-hyperliquid-500/20 border-hyperliquid-500/30' :
                        data.status === 'paused' ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' :
                        'text-red-400 bg-red-500/20 border-red-500/30'
                      }`}>
                        {getStatusIcon(data.status)}
                        <span className="font-medium capitalize">{data.status}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-2 sm:mb-3">
                      Last updated: {data.lastUpdate}
                    </p>
                    
                    <div className="flex gap-2">
                      <LoadingButton
                        className={`flex-1 text-xs sm:text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                          data.status === 'active'
                            ? 'btn-secondary'
                            : 'btn-primary'
                        }`}
                        isLoading={actionLoading[`toggle-${system}`]}
                        onClick={() => toggleSystemStatus(system)}
                      >
                        {data.status === 'active' ? (
                          <>
                            <PauseIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Start
                          </>
                        )}
                      </LoadingButton>
                      <LoadingButton
                        className="px-2 sm:px-3 py-2 text-gray-400 hover:text-hyperliquid-400 hover:bg-hyperliquid-500/10 rounded-lg transition-colors"
                        isLoading={actionLoading[`refresh-${system}`]}
                        onClick={() => handleDataRefresh()}
                      >
                        <ArrowPathIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </LoadingButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Controls */}
            <div className="glass-card border-red-500/20 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-3 sm:mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Emergency Controls
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <LoadingButton
                  className="border border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400 text-sm sm:text-base px-4 py-2 rounded-lg font-medium transition-colors"
                  isLoading={actionLoading['emergency-pause-all']}
                  onClick={() => handleEmergencyAction('Emergency Pause All')}
                >
                  Emergency Pause All
                </LoadingButton>
                <LoadingButton
                  className="border border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 text-sm sm:text-base px-4 py-2 rounded-lg font-medium transition-colors"
                  isLoading={actionLoading['emergency-maintenance']}
                  onClick={() => handleEmergencyAction('Maintenance Mode')}
                >
                  Maintenance Mode
                </LoadingButton>
                <LoadingButton
                  className="border border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 text-sm sm:text-base px-4 py-2 rounded-lg font-medium transition-colors"
                  isLoading={actionLoading['emergency-refresh']}
                  onClick={() => handleEmergencyAction('Force Refresh')}
                >
                  Force Refresh
                </LoadingButton>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold hyperliquid-gradient-text">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white hover:bg-dark-700/50 p-1 rounded transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 p-3 bg-dark-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Address</span>
                  <span className="text-white font-mono text-xs sm:text-sm break-all">{selectedUser.address}</span>
                </div>
                <div className="flex justify-between p-3 bg-dark-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">NFTs Owned</span>
                  <span className="text-hyperliquid-400 font-semibold text-sm sm:text-base">{selectedUser.nfts}</span>
                </div>
                <div className="flex justify-between p-3 bg-dark-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Currently Staked</span>
                  <span className="text-hyperliquid-400 font-semibold text-sm sm:text-base">{selectedUser.staked}</span>
                </div>
                <div className="flex justify-between p-3 bg-dark-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Tier</span>
                  <span className={`text-sm sm:text-base px-2 py-1 rounded-full border font-medium ${
                    selectedUser.tier === 'Diamond' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                    selectedUser.tier === 'Platinum' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                    selectedUser.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-hyperliquid-500/20 text-hyperliquid-400 border-hyperliquid-500/30'
                  }`}>
                    {selectedUser.tier}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-dark-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className={`text-sm sm:text-base px-2 py-1 rounded-full border font-medium ${
                    selectedUser.status === 'active' ? 'bg-hyperliquid-500/20 text-hyperliquid-400 border-hyperliquid-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-dark-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Joined</span>
                  <span className="text-white text-sm sm:text-base">{selectedUser.joined}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <LoadingButton
                  className="btn-secondary flex-1 text-sm sm:text-base"
                  isLoading={actionLoading[`modal-edit-${selectedUser.id}`]}
                  onClick={() => handleUserAction('edit', selectedUser.id)}
                >
                  Edit User
                </LoadingButton>
                <LoadingButton
                  className={`flex-1 text-sm sm:text-base px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedUser.status === 'active'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25'
                      : 'bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-600 hover:from-hyperliquid-600 hover:to-hyperliquid-700 text-white shadow-lg shadow-hyperliquid-500/25'
                  }`}
                  isLoading={actionLoading[`modal-${selectedUser.status === 'active' ? 'ban' : 'unban'}-${selectedUser.id}`]}
                  onClick={() => handleUserAction(selectedUser.status === 'active' ? 'ban' : 'unban', selectedUser.id)}
                >
                  {selectedUser.status === 'active' ? 'Ban User' : 'Unban User'}
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