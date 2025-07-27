'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { StakingPoolSkeleton } from '@/components/ui/LoadingStates';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { HypePriceCard } from '@/components/ui/HypePrice';
import { useHypercatzStaking } from '@/hooks/useHypercatzStaking';
import { 
  parseStakingError, 
  validateStakingOperation, 
  formatStakingError 
} from '@/utils/stakingErrors';
import {
  TrendingUp,
  Zap,
  Coins,
  Clock,
  Star,
  Target,
  Award,
  Wallet,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';

export default function StakePage() {
  const { isConnected } = useAccount();
  const {
    contractsDeployed,
    userStakingData,
    userNFTs,
    selectedNFTs,
    setSelectedNFTs,
    nftBalance,
    hyperPointsBalance,
    stakeNFTs,
    unstakeNFTs,
    claimRewards,
    canStake,
    canUnstake,
    canClaim,
    getEstimatedDailyRewards,
    getTotalStaked,
    getClaimableAmount,
    getTotalEarnedAmount,
    getTotalClaimedAmount,
    getAPY,
    rewardRatePerNFT,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading,
    // Approval related
    isApprovedForAll,
    isApprovalLoading,
    approveAll,
    approvalHash,
    isApprovalPending,
    isApprovalConfirming,
    isApprovalConfirmed,
    approvalError,
  } = useHypercatzStaking();

  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [lastProcessedHash, setLastProcessedHash] = useState<string | null>(null);
  const [lastProcessedApprovalHash, setLastProcessedApprovalHash] = useState<string | null>(null);
  
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const handleStake = async () => {
    // Validate operation prerequisites
    const validationError = validateStakingOperation('stake', {
      isConnected,
      contractsDeployed,
      selectedNFTs,
      poolActive: true,
    });

    if (validationError) {
      const { title, message } = formatStakingError(validationError);
      errorToast(title, message);
      return;
    }

    setIsStaking(true);
    
    try {
      await stakeNFTs(selectedNFTs);
      // Transaction state is handled by the hook
    } catch (error: any) {
      console.error('Staking failed:', error);
      const stakingError = parseStakingError(error);
      const { title, message } = formatStakingError(stakingError);
      errorToast(title, message);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    // Validate operation prerequisites
    const validationError = validateStakingOperation('unstake', {
      isConnected,
      contractsDeployed,
      selectedNFTs,
      isLocked: false, // No lock period in this contract
    });

    if (validationError) {
      const { title, message } = formatStakingError(validationError);
      errorToast(title, message);
      return;
    }

    setIsStaking(true);
    
    try {
      await unstakeNFTs(selectedNFTs);
      // Transaction state is handled by the hook
    } catch (error: any) {
      console.error('Unstaking failed:', error);
      const stakingError = parseStakingError(error);
      const { title, message } = formatStakingError(stakingError);
      errorToast(title, message);
    } finally {
      setIsStaking(false);
    }
  };

  const handleApproveNFTs = async () => {
    if (!isConnected) {
      errorToast('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    if (!contractsDeployed) {
      errorToast('Contract Not Available', 'Staking contract is not deployed');
      return;
    }

    setIsApproving(true);
    
    try {
      await approveAll();
      // Transaction state is handled by the hook
    } catch (error: any) {
      console.error('Approval failed:', error);
      errorToast('Approval Failed', error.message || 'Failed to approve NFTs for staking');
    } finally {
      setIsApproving(false);
    }
  };

  const handleClaimRewards = async () => {
    // Validate operation prerequisites
    const validationError = validateStakingOperation('claim', {
      isConnected,
      contractsDeployed,
      hasRewards: getClaimableAmount() > 0,
    });

    if (validationError) {
      const { title, message } = formatStakingError(validationError);
      errorToast(title, message);
      return;
    }
    
    setIsClaiming(true);
    
    try {
      await claimRewards();
      // Transaction state is handled by the hook
    } catch (error: any) {
      console.error('Claim failed:', error);
      const stakingError = parseStakingError(error);
      const { title, message } = formatStakingError(stakingError);
      errorToast(title, message);
    } finally {
      setIsClaiming(false);
    }
  };

  // Handle transaction success - prevent duplicate notifications
  useEffect(() => {
    if (isConfirmed && hash && hash !== lastProcessedHash) {
      setLastProcessedHash(hash);
      
      if (isStaking) {
        successToast('Transaction Successful!', `NFTs ${selectedNFTs.length > 1 ? 'were' : 'was'} successfully processed`);
        setSelectedNFTs([]);
        setIsStaking(false);
      } else if (isClaiming) {
        successToast('Rewards Claimed!', 'Your rewards have been successfully claimed');
        setIsClaiming(false);
      }
    }
  }, [isConfirmed, hash, lastProcessedHash, isStaking, isClaiming, selectedNFTs.length, successToast]);

  // Handle approval transaction success
  useEffect(() => {
    if (isApprovalConfirmed && approvalHash && approvalHash !== lastProcessedApprovalHash) {
      setLastProcessedApprovalHash(approvalHash);
      successToast('Approval Successful!', 'Your NFTs are now approved for staking');
      setIsApproving(false);
    }
  }, [isApprovalConfirmed, approvalHash, lastProcessedApprovalHash, successToast]);

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <StakingPoolSkeleton />;
  }

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-hyperliquid-500/20 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-hyperliquid-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to start staking your Hypercatz NFTs and earn $HYPE rewards.
          </p>
        </div>
      </div>
    );
  }

  // Show contract not deployed message
  if (!contractsDeployed) {
    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-yellow/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-accent-yellow" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Staking Coming Soon</h2>
          <p className="text-gray-400 mb-6">
            Staking contracts are not yet deployed. Check back soon to start earning rewards with your Hypercatz NFTs!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-hyperliquid-500/30 mb-8">
              <div className="w-2 h-2 bg-hyperliquid-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-hyperliquid-400">Earn Passive Rewards</span>
            </div>
            
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6 hyperliquid-gradient-text"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              HYPERCATZ STAKING
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Stake your Hypercatz NFTs to earn $HYPE tokens and unlock exclusive utilities in our ecosystem
            </motion.p>
          </div>

          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <div className="stat-card group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-hyperliquid-500 group-hover:text-hyperliquid-400 transition-colors" />
              </div>
              <div className="stat-value">{getTotalStaked()}</div>
              <div className="stat-label">NFTs Staked</div>
            </div>

            <div className="stat-card group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-3">
                <Coins className="w-6 h-6 text-hyperliquid-500 group-hover:text-hyperliquid-400 transition-colors" />
              </div>
              <div className="stat-value">{getTotalEarnedAmount().toFixed(2)}</div>
              <div className="stat-label">Total Earned</div>
            </div>

            <div className="stat-card group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-hyperliquid-500 group-hover:text-hyperliquid-400 transition-colors" />
              </div>
              <div className="stat-value">{getClaimableAmount().toFixed(2)}</div>
              <div className="stat-label">Claimable Rewards</div>
            </div>

            <div className="stat-card group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-hyperliquid-500 group-hover:text-hyperliquid-400 transition-colors" />
              </div>
              <div className="stat-value">{getEstimatedDailyRewards().toFixed(2)}</div>
              <div className="stat-label">Daily Rewards</div>
            </div>
          </motion.div>

          {/* User Wallet Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <div className="feature-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-hyperliquid-500" />
                Available NFTs
              </h3>
              <div className="text-2xl font-bold text-hyperliquid-400 mb-2">{userNFTs.length}</div>
              <div className="text-sm text-gray-400">Ready to stake</div>
            </div>

            <div className="feature-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-hyperliquid-500" />
                HyperPoints Balance
              </h3>
              <div className="text-2xl font-bold text-accent-yellow mb-2">{hyperPointsBalance.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Current balance</div>
            </div>

            <div className="feature-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-hyperliquid-500" />
                Reward Rate
              </h3>
              <div className="text-2xl font-bold text-accent-green mb-2">{rewardRatePerNFT.toFixed(4)}</div>
              <div className="text-sm text-gray-400">HP per NFT per day</div>
            </div>
          </motion.div>

          {/* HYPE Token Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-16"
          >
            <HypePriceCard className="max-w-md mx-auto" />
          </motion.div>

          {/* Claim Rewards Button */}
          {getClaimableAmount() > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-center mb-16"
            >
              <Button
                onClick={handleClaimRewards}
                disabled={isClaiming || isPending || !canClaim()}
                className="px-8 py-4 text-lg"
                variant="primary"
              >
                {isClaiming || isPending ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Claiming...</span>
                  </div>
                ) : (
                  <>
                    <Award className="h-5 w-5 mr-2" />
                    Claim {getClaimableAmount().toFixed(2)} HP
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* NFT Approval Section */}
          {userNFTs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mb-16"
            >
              <div className="feature-card">
                <h3 className="text-2xl font-bold text-hyperliquid-400 mb-6">NFT Approval Status</h3>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isApprovedForAll ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-lg font-medium text-white">
                      {isApprovedForAll ? 'NFTs Approved for Staking' : 'NFTs Need Approval'}
                    </span>
                  </div>
                  
                  {!isApprovedForAll && (
                    <Button
                      onClick={handleApproveNFTs}
                      disabled={isApproving || isApprovalPending || isApprovalConfirming}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      {isApproving || isApprovalPending || isApprovalConfirming ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>
                            {isApprovalPending ? 'Approving...' : isApprovalConfirming ? 'Confirming...' : 'Processing...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4" />
                          Approve NFTs for Staking
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="text-sm text-gray-400">
                  {isApprovedForAll ? (
                    <p>✅ Your NFTs are approved and ready for staking. You can now stake your selected NFTs below.</p>
                  ) : (
                    <p>⚠️ Before you can stake your NFTs, you need to approve them for the staking contract. This is a one-time transaction that allows the staking contract to manage your NFTs.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Staking Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            {/* Stake Section */}
            <div className="feature-card">
              <h3 className="text-2xl font-bold text-hyperliquid-400 mb-6">Stake NFTs</h3>
              
              {userNFTs.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-300 mb-3">
                      Select NFTs to stake ({userNFTs.length} available)
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                      {userNFTs.map((nftId) => (
                        <button
                          key={nftId}
                          onClick={() => {
                            if (selectedNFTs.includes(nftId)) {
                              setSelectedNFTs(selectedNFTs.filter(id => id !== nftId));
                            } else {
                              setSelectedNFTs([...selectedNFTs, nftId]);
                            }
                          }}
                          className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                            selectedNFTs.includes(nftId)
                              ? 'bg-hyperliquid-500 text-white scale-95'
                              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                          }`}
                        >
                          #{nftId}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setSelectedNFTs(userNFTs)}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Select All
                    </Button>
                    <Button
                      onClick={() => setSelectedNFTs([])}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Minus className="w-4 h-4" />
                      Clear
                    </Button>
                  </div>

                  <Button
                    onClick={handleStake}
                    disabled={isStaking || isPending || selectedNFTs.length === 0 || !canStake() || !isApprovedForAll}
                    className="w-full"
                    variant="primary"
                  >
                    {isStaking || isPending ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Staking...</span>
                      </div>
                    ) : !isApprovedForAll ? (
                      'Approve NFTs First'
                    ) : (
                      `Stake ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? 's' : ''}`
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No NFTs available to stake</p>
                </div>
              )}
            </div>

            {/* Unstake Section */}
            <div className="feature-card">
              <h3 className="text-2xl font-bold text-hyperliquid-400 mb-6">Unstake NFTs</h3>
              
              {getTotalStaked() > 0 ? (
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-300 mb-3">
                      Your staked NFTs ({getTotalStaked()} staked)
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                      {userStakingData.stakedTokenIds.map((tokenId) => {
                        const nftId = Number(tokenId);
                        return (
                          <button
                            key={nftId}
                            onClick={() => {
                              if (selectedNFTs.includes(nftId)) {
                                setSelectedNFTs(selectedNFTs.filter(id => id !== nftId));
                              } else {
                                setSelectedNFTs([...selectedNFTs, nftId]);
                              }
                            }}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                              selectedNFTs.includes(nftId)
                                ? 'bg-red-500 text-white scale-95'
                                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                            }`}
                          >
                            #{nftId}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setSelectedNFTs(userStakingData.stakedTokenIds.map(id => Number(id)))}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Select All
                    </Button>
                    <Button
                      onClick={() => setSelectedNFTs([])}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Minus className="w-4 h-4" />
                      Clear
                    </Button>
                  </div>

                  <Button
                    onClick={handleUnstake}
                    disabled={isStaking || isPending || selectedNFTs.length === 0 || !canUnstake()}
                    className="w-full"
                    variant="secondary"
                  >
                    {isStaking || isPending ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Unstaking...</span>
                      </div>
                    ) : (
                      `Unstake ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? 's' : ''}`
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No NFTs currently staked</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Staking Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="feature-card mb-16"
          >
            <h3 className="text-2xl font-bold text-hyperliquid-400 mb-6">Staking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-hyperliquid-400 mb-2">
                  {rewardRatePerNFT.toFixed(4)}
                </div>
                <div className="text-sm text-gray-400">HP per NFT per day</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-yellow mb-2">
                  No Lock Period
                </div>
                <div className="text-sm text-gray-400">Unstake anytime</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green mb-2">
                  {getAPY().toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Estimated APY</div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="feature-card"
          >
            <h3 className="text-2xl font-bold text-hyperliquid-400 mb-8">Staking Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-hyperliquid-500" />
                  Earn HyperPoints Tokens
                </h4>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Passive income from staked NFTs
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    No lock period - unstake anytime
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Claim rewards whenever you want
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    No impermanent loss risk
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-hyperliquid-500" />
                  Exclusive Utilities
                </h4>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Access to premium games
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Discounted marketplace fees
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Priority in new drops
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-hyperliquid-500 rounded-full mt-2 flex-shrink-0" />
                    Governance voting rights
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Transaction Status */}
          {(isPending || isConfirming || isApprovalPending || isApprovalConfirming) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <div className="glass-card p-6 border-hyperliquid-500/30">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {(isPending || isApprovalPending) ? 'Confirming Transaction...' : 'Processing...'}
                </h3>
                <p className="text-gray-400">
                  {(isPending || isApprovalPending)
                    ? 'Please confirm the transaction in your wallet'
                    : (isApprovalConfirming
                      ? 'Your approval transaction is being processed on the blockchain'
                      : 'Your transaction is being processed on the blockchain'
                    )
                  }
                </p>
                {(hash || approvalHash) && (
                  <div className="mt-4">
                    <a
                      href={`https://hyperscan.com/tx/${hash || approvalHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hyperliquid-400 hover:text-hyperliquid-300 text-sm"
                    >
                      View on Explorer →
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}