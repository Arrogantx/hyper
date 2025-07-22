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
  Sparkles
} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageLoadingSkeleton, LoadingOverlay } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useToast, useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { useSoundEngine } from '@/utils/sound';
import { MINT_CONFIG } from '@/lib/constants';

const MintPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { playClick, playMint, playError } = useSoundEngine();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [mintAmount, setMintAmount] = useState(1);
  const [currentPhase, setCurrentPhase] = useState('PUBLIC');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Mock data - replace with real contract calls
  const [mintData, setMintData] = useState({
    totalSupply: 3247,
    maxSupply: MINT_CONFIG.MAX_SUPPLY,
    userMinted: 0,
    mintPrice: '0.02',
    isWhitelisted: false,
    phaseActive: true,
  });

  useEffect(() => {
    setMounted(true);
    
    // Simulate loading mint data
    const loadMintData = async () => {
      setIsLoadingData(true);
      setError(null);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, this would fetch from contract
        setMintData({
          totalSupply: 3247,
          maxSupply: MINT_CONFIG.MAX_SUPPLY,
          userMinted: 0,
          mintPrice: '0.02',
          isWhitelisted: false,
          phaseActive: true,
        });
      } catch (err) {
        setError('Failed to load mint data. Please try again.');
        errorToast('Loading Error', 'Failed to load mint data');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadMintData();
  }, [errorToast]);

  const handleMintAmountChange = (delta: number) => {
    playClick();
    const newAmount = Math.max(1, Math.min(5, mintAmount + delta));
    setMintAmount(newAmount);
  };

  const handleMint = async () => {
    if (!isConnected) {
      playError();
      errorToast('Wallet Not Connected', 'Please connect your wallet to mint');
      return;
    }

    // Check if user has enough balance
    const totalCostNum = parseFloat(totalCost);
    const userBalance = balance ? parseFloat(balance.formatted) : 0;
    
    if (userBalance < totalCostNum) {
      playError();
      errorToast('Insufficient Balance', `You need ${totalCost} HYPE to mint ${mintAmount} NFT${mintAmount > 1 ? 's' : ''}`);
      return;
    }

    // Check mint limits
    if (mintData.userMinted + mintAmount > 5) {
      playError();
      errorToast('Mint Limit Exceeded', 'You can only mint 5 NFTs per wallet');
      return;
    }

    setIsMinting(true);
    playClick();

    try {
      // Simulate blockchain transaction
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure (10% chance)
          if (Math.random() < 0.1) {
            reject(new Error('Transaction failed'));
          } else {
            resolve(true);
          }
        }, 3000);
      });
      
      playMint();
      
      // Update mint data
      setMintData(prev => ({
        ...prev,
        totalSupply: prev.totalSupply + mintAmount,
        userMinted: prev.userMinted + mintAmount,
      }));
      
      // Show success toast
      successToast(
        'Mint Successful!',
        `Successfully minted ${mintAmount} Hypercatz NFT${mintAmount > 1 ? 's' : ''}`
      );
      
      // Reset mint amount
      setMintAmount(1);
      
    } catch (error: any) {
      playError();
      console.error('Mint failed:', error);
      
      const errorMessage = error?.message || 'Transaction failed';
      errorToast('Mint Failed', errorMessage);
      
    } finally {
      setIsMinting(false);
    }
  };

  const mintProgress = (mintData.totalSupply / mintData.maxSupply) * 100;
  const totalCost = (parseFloat(mintData.mintPrice) * mintAmount).toFixed(3);

  if (!mounted || isLoadingData) {
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

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-cyber font-bold mb-6 cyber-text">
            MINT HYPERCATZ
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Mint your unique Hypercatz NFT and join the ultimate utility ecosystem on HyperEVM
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - NFT Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* NFT Carousel */}
            <div className="cyber-card p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Preview Collection</h3>
              
              <div className="relative aspect-square bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 rounded-lg overflow-hidden mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">🐱</div>
                </div>
                <div className="absolute top-4 right-4 bg-neon-purple/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-sm font-bold text-neon-purple">RARE</span>
                </div>
                
                {/* Animated border */}
                <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-green p-[2px] rounded-lg">
                  <div className="h-full w-full bg-dark-surface rounded-lg" />
                </div>
              </div>

              {/* Sample Attributes */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { trait: 'Background', value: 'Cyber City' },
                  { trait: 'Body', value: 'Neon Fur' },
                  { trait: 'Eyes', value: 'Laser Blue' },
                  { trait: 'Accessory', value: 'VR Headset' },
                ].map((attr) => (
                  <div key={attr.trait} className="bg-dark-surface rounded-lg p-3">
                    <div className="text-sm text-gray-400">{attr.trait}</div>
                    <div className="font-bold text-neon-cyan">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collection Stats */}
            <div className="cyber-card p-6">
              <h3 className="text-xl font-bold mb-4">Collection Stats</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Supply</span>
                  <span className="font-bold">{mintData.totalSupply.toLocaleString()} / {mintData.maxSupply.toLocaleString()}</span>
                </div>
                
                <div className="w-full bg-dark-border rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${mintProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{mintProgress.toFixed(1)}% Minted</span>
                  <span>{(mintData.maxSupply - mintData.totalSupply).toLocaleString()} Remaining</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Mint Interface */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Mint Phase Info */}
            <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Current Phase</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  <span className="text-neon-green font-bold">LIVE</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5 text-neon-purple" />
                  <span className="font-bold text-lg">Public Mint</span>
                </div>
                <div className="text-sm text-gray-300">
                  Open to everyone • Max 5 per wallet
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Price</div>
                  <div className="font-bold text-neon-cyan">{mintData.mintPrice} HYPE</div>
                </div>
                <div>
                  <div className="text-gray-400">You Minted</div>
                  <div className="font-bold">{mintData.userMinted} / 5</div>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            {!isConnected ? (
              <div className="cyber-card p-8 text-center">
                <Wallet className="h-16 w-16 text-neon-cyan mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Connect Your Wallet</h3>
                <p className="text-gray-300 mb-6">
                  Connect your wallet to start minting Hypercatz NFTs
                </p>
                <ConnectButton />
              </div>
            ) : (
              <>
                {/* Wallet Info */}
                <div className="cyber-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Wallet Connected</h3>
                    <CheckCircle className="h-5 w-5 text-neon-green" />
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Address</span>
                      <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Balance</span>
                      <span className="font-bold">{balance?.formatted.slice(0, 6)} {balance?.symbol}</span>
                    </div>
                  </div>
                </div>

                {/* Mint Controls */}
                <LoadingOverlay isLoading={isMinting} message="Processing mint transaction...">
                  <div className="cyber-card p-8">
                    <h3 className="text-xl font-bold mb-6">Mint Your Hypercatz</h3>
                    
                    {/* Amount Selector */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Quantity
                      </label>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMintAmountChange(-1)}
                          disabled={mintAmount <= 1 || isMinting}
                          className="w-12 h-12 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <div className="text-3xl font-bold w-16 text-center">
                          {mintAmount}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMintAmountChange(1)}
                          disabled={mintAmount >= 5 || isMinting}
                          className="w-12 h-12 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="bg-dark-surface rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span>Quantity</span>
                        <span>{mintAmount}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Price per NFT</span>
                        <span>{mintData.mintPrice} HYPE</span>
                      </div>
                      <div className="border-t border-dark-border pt-2 mt-2">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total Cost</span>
                          <span className="text-neon-cyan">{totalCost} HYPE</span>
                        </div>
                      </div>
                    </div>

                    {/* Mint Button */}
                    <Button
                      size="lg"
                      onClick={handleMint}
                      isLoading={isMinting}
                      disabled={!mintData.phaseActive || isMinting}
                      className="w-full group"
                    >
                      {isMinting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                          Mint {mintAmount} Hypercatz
                        </>
                      )}
                    </Button>

                    {/* Disclaimer */}
                    <div className="mt-4 p-4 bg-neon-orange/10 border border-neon-orange/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-neon-orange mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-300">
                          <p className="font-medium text-neon-orange mb-1">Important:</p>
                          <p>Make sure you have enough HYPE tokens for gas fees. Transactions are irreversible.</p>
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