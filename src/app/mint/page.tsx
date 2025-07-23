'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Coins,
  Clock,
  Users,
  Zap,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  Sparkles,
  TrendingUp,
  Shield,
  Star
} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageLoadingSkeleton, LoadingOverlay } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useToast, useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { ProvenanceDisplay } from '@/components/ui/ProvenanceDisplay';
import { useSoundEngine } from '@/utils/sound';
import { useHypercatzContract } from '@/hooks/useHypercatzContract';
import { HypercatzPhase } from '@/contracts/HypercatzNFT';

const MintPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { playClick, playMint, playError } = useSoundEngine();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [mintAmount, setMintAmount] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the contract hook
  const {
    contractInfo,
    userMintInfo,
    getPhaseString,
    getMaxMintForCurrentPhase,
    getUserMintedInCurrentPhase,
    canUserMintInCurrentPhase,
    getRemainingMintsForUser,
    mint,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: contractError,
    isLoading: isContractLoading,
    isUserDataLoading,
  } = useHypercatzContract();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle successful mint
  useEffect(() => {
    if (isConfirmed && hash) {
      playMint();
      successToast(
        'Mint Successful!',
        `Successfully minted ${mintAmount} Hypercatz NFT${mintAmount > 1 ? 's' : ''}`
      );
      setMintAmount(1);
    }
  }, [isConfirmed, hash, mintAmount, playMint, successToast]);

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      playError();
      const errorMessage = contractError.message || 'Transaction failed';
      errorToast('Mint Failed', errorMessage);
    }
  }, [contractError, playError, errorToast]);

  const handleMintAmountChange = (delta: number) => {
    playClick();
    const maxMint = contractInfo ? Number(getMaxMintForCurrentPhase()) : 5;
    const newAmount = Math.max(1, Math.min(maxMint, mintAmount + delta));
    setMintAmount(newAmount);
  };

  const handleMint = async () => {
    if (!isConnected) {
      playError();
      errorToast('Wallet Not Connected', 'Please connect your wallet to mint');
      return;
    }

    if (!contractInfo || !userMintInfo) {
      playError();
      errorToast('Contract Error', 'Unable to load contract data');
      return;
    }

    // Check if user can mint in current phase
    if (!canUserMintInCurrentPhase()) {
      playError();
      const currentPhaseStr = getPhaseString(contractInfo.currentPhase);
      const userPhaseStr = getPhaseString(userMintInfo.phaseAccess);
      errorToast('Access Denied', `Current phase is ${currentPhaseStr}, but you only have access to ${userPhaseStr}`);
      return;
    }

    // Check mint limits
    const remainingMints = getRemainingMintsForUser();
    if (BigInt(mintAmount) > remainingMints) {
      playError();
      errorToast('Mint Limit Exceeded', `You can only mint ${remainingMints.toString()} more NFT${remainingMints === BigInt(1) ? '' : 's'} in this phase`);
      return;
    }

    // Check if supply is available
    if (contractInfo.totalMinted + BigInt(mintAmount) > contractInfo.maxSupply) {
      playError();
      errorToast('Supply Exceeded', 'Not enough NFTs remaining in collection');
      return;
    }

    playClick();

    try {
      await mint(mintAmount);
    } catch (error: any) {
      playError();
      console.error('Mint failed:', error);
      const errorMessage = error?.message || 'Transaction failed';
      errorToast('Mint Failed', errorMessage);
    }
  };

  // Loading states
  if (!mounted || isContractLoading) {
    return <PageLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center">
        <ErrorDisplay
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Contract data with fallbacks
  const totalSupply = contractInfo ? Number(contractInfo.totalSupply) : 0;
  const maxSupply = contractInfo ? Number(contractInfo.maxSupply) : 10000;
  const totalMinted = contractInfo ? Number(contractInfo.totalMinted) : 0;
  const currentPhase = contractInfo ? contractInfo.currentPhase : HypercatzPhase.PUBLIC;
  const currentPhaseStr = contractInfo ? getPhaseString(currentPhase) : 'PUBLIC';
  const userMinted = userMintInfo ? Number(getUserMintedInCurrentPhase()) : 0;
  const maxMintForPhase = contractInfo ? Number(getMaxMintForCurrentPhase()) : 5;
  const remainingMints = isConnected ? Number(getRemainingMintsForUser()) : 0;
  const mintProgress = maxSupply > 0 ? (totalMinted / maxSupply) * 100 : 0;

  // Mock price for display (since contract is free mint)
  const displayPrice = '0.00';
  const totalCost = (parseFloat(displayPrice) * mintAmount).toFixed(3);

  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-hyperliquid-500/30 mb-8">
            <div className="w-2 h-2 bg-hyperliquid-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-hyperliquid-400">Exclusive NFT Collection</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 hyperliquid-gradient-text">
            MINT HYPERCATZ
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Mint your unique Hypercatz NFT and unlock exclusive utility features in the most advanced NFT ecosystem on Hyperliquid
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - NFT Preview & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* NFT Preview */}
            <div className="feature-card">
              <h3 className="text-2xl font-bold mb-6 text-center text-white">Collection Preview</h3>
              
              <div className="relative aspect-square bg-gradient-to-br from-hyperliquid-500/10 to-accent-blue/10 rounded-2xl overflow-hidden mb-6 group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl opacity-80">🐱</div>
                </div>
                <div className="absolute top-4 right-4 glass-card px-3 py-1 border-hyperliquid-500/30">
                  <span className="text-sm font-bold text-hyperliquid-400">LEGENDARY</span>
                </div>
                
                {/* Animated border */}
                <div className="absolute inset-0 border-2 border-hyperliquid-500/30 rounded-2xl group-hover:border-hyperliquid-500/50 transition-colors" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-hyperliquid-500/5 to-accent-blue/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Sample Attributes */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { trait: 'Background', value: 'Cyber City', rarity: 'Rare' },
                  { trait: 'Body', value: 'Neon Fur', rarity: 'Epic' },
                  { trait: 'Eyes', value: 'Laser Blue', rarity: 'Common' },
                  { trait: 'Accessory', value: 'VR Headset', rarity: 'Legendary' },
                ].map((attr) => (
                  <div key={attr.trait} className="glass-card p-4 border-dark-700/50">
                    <div className="text-sm text-gray-400 mb-1">{attr.trait}</div>
                    <div className="font-bold text-hyperliquid-400 mb-1">{attr.value}</div>
                    <div className="text-xs text-accent-blue">{attr.rarity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collection Stats */}
            <div className="feature-card">
              <h3 className="text-xl font-bold mb-6 text-white">Collection Statistics</h3>
              
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-300 font-medium">Minting Progress</span>
                    <span className="font-bold text-hyperliquid-400">{mintProgress.toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full bg-dark-800 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${mintProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>{totalMinted.toLocaleString()} Minted</span>
                    <span>{(maxSupply - totalMinted).toLocaleString()} Remaining</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card">
                    <div className="flex items-center justify-center mb-2">
                      <Coins className="w-5 h-5 text-hyperliquid-500" />
                    </div>
                    <div className="stat-value">{totalMinted.toLocaleString()}</div>
                    <div className="stat-label">Total Minted</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-hyperliquid-500" />
                    </div>
                    <div className="stat-value">{maxSupply.toLocaleString()}</div>
                    <div className="stat-label">Max Supply</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-5 h-5 text-hyperliquid-500" />
                    </div>
                    <div className="stat-value">{currentPhaseStr}</div>
                    <div className="stat-label">Current Phase</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-hyperliquid-500" />
                    </div>
                    <div className="stat-value">{maxMintForPhase}</div>
                    <div className="stat-label">Max Per Wallet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provenance Verification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ProvenanceDisplay />
            </motion.div>
          </motion.div>

          {/* Right Side - Mint Interface */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Mint Phase Info */}
            <div className="feature-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Current Phase</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-hyperliquid-500 rounded-full animate-pulse" />
                  <span className="text-hyperliquid-400 font-bold">LIVE</span>
                </div>
              </div>
              
              <div className="glass-card p-6 border-hyperliquid-500/20 glow-green mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-6 w-6 text-hyperliquid-500" />
                  <span className="font-bold text-xl text-white">{currentPhaseStr} Mint Active</span>
                </div>
                <div className="text-gray-300">
                  {currentPhase === HypercatzPhase.PUBLIC && 'Open to everyone • Maximum 5 NFTs per wallet • No whitelist required'}
                  {currentPhase === HypercatzPhase.WHITELIST && 'Whitelist holders only • Limited mint per wallet'}
                  {currentPhase === HypercatzPhase.GUARANTEED && 'Guaranteed mint for eligible wallets'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-1">Mint Price</div>
                  <div className="font-bold text-xl text-hyperliquid-400">FREE</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-1">Your Minted</div>
                  <div className="font-bold text-xl text-white">{userMinted} / {maxMintForPhase}</div>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            {!isConnected ? (
              <div className="feature-card text-center">
                <div className="w-20 h-20 bg-hyperliquid-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Wallet className="h-10 w-10 text-hyperliquid-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h3>
                <p className="text-gray-300 mb-8 text-lg">
                  Connect your wallet to start minting exclusive Hypercatz NFTs
                </p>
                <ConnectButton />
              </div>
            ) : (
              <>
                {/* Wallet Info */}
                <div className="feature-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Wallet Connected</h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-hyperliquid-500" />
                      <span className="text-hyperliquid-400 font-medium">Ready</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Address</span>
                      <span className="font-mono text-white">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Balance</span>
                      <span className="font-bold text-hyperliquid-400">{balance?.formatted.slice(0, 8)} {balance?.symbol}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Remaining Mints</span>
                      <span className="font-bold text-hyperliquid-400">{remainingMints}</span>
                    </div>
                  </div>
                </div>

                {/* Mint Controls */}
                <LoadingOverlay isLoading={isPending || isConfirming} message={isPending ? "Confirming transaction..." : "Processing mint transaction..."}>
                  <div className="feature-card">
                    <h3 className="text-2xl font-bold mb-8 text-white">Mint Your Hypercatz</h3>
                    
                    {/* Amount Selector */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-300 mb-4">
                        Select Quantity (Max: {Math.min(maxMintForPhase, remainingMints)})
                      </label>
                      <div className="flex items-center justify-center gap-6">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleMintAmountChange(-1)}
                          disabled={mintAmount <= 1 || isPending || isConfirming}
                          className="w-14 h-14 p-0"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        
                        <div className="text-4xl font-bold w-20 text-center text-hyperliquid-400">
                          {mintAmount}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleMintAmountChange(1)}
                          disabled={mintAmount >= Math.min(maxMintForPhase, remainingMints) || isPending || isConfirming}
                          className="w-14 h-14 p-0"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="glass-card p-6 border-dark-700/50 mb-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Quantity</span>
                          <span className="font-medium text-white">{mintAmount} NFT{mintAmount > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Price per NFT</span>
                          <span className="font-medium text-white">FREE</span>
                        </div>
                        <div className="border-t border-dark-700 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg text-white">Total Cost</span>
                            <span className="font-bold text-2xl text-hyperliquid-400">FREE</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mint Button */}
                    <Button
                      size="lg"
                      onClick={handleMint}
                      isLoading={isPending || isConfirming}
                      disabled={isPending || isConfirming || remainingMints === 0 || !canUserMintInCurrentPhase()}
                      className="w-full group text-lg py-4"
                    >
                      {isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-3" />
                          Confirming Transaction...
                        </>
                      ) : isConfirming ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-3" />
                          Minting NFT{mintAmount > 1 ? 's' : ''}...
                        </>
                      ) : remainingMints === 0 ? (
                        <>
                          <AlertCircle className="h-6 w-6 mr-3" />
                          Mint Limit Reached
                        </>
                      ) : !canUserMintInCurrentPhase() ? (
                        <>
                          <Clock className="h-6 w-6 mr-3" />
                          No Access to Current Phase
                        </>
                      ) : (
                        <>
                          <Zap className="h-6 w-6 mr-3 group-hover:animate-pulse" />
                          Mint {mintAmount} Hypercatz NFT{mintAmount > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>

                    {/* Transaction Hash */}
                    {hash && (
                      <div className="mt-4 glass-card p-4 border-hyperliquid-500/20">
                        <div className="text-sm text-gray-400 mb-1">Transaction Hash:</div>
                        <div className="font-mono text-xs text-hyperliquid-400 break-all">{hash}</div>
                      </div>
                    )}

                    {/* Important Notice */}
                    <div className="mt-6 glass-card p-4 border-accent-orange/20">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-accent-orange mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-accent-orange mb-2">Security Notice:</p>
                          <p className="text-gray-300 leading-relaxed">
                            Ensure you have sufficient HYPE tokens for gas fees. All transactions are final and irreversible. 
                            Only mint from the official Hypercatz website.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </LoadingOverlay>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MintPage;