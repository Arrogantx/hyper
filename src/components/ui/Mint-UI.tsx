'use client';

import React, { FC } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Coins,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useHypercatzContract } from '@/hooks/useHypercatzContract';
import { HypercatzPhase } from '@/contracts/HypercatzNFT';

// Define a specific type for the props to ensure type safety
interface MintUIProps {
  contractInfo: ReturnType<typeof useHypercatzContract>['contractInfo'];
  userMintInfo: ReturnType<typeof useHypercatzContract>['userMintInfo'];
  balance: { formatted: string; symbol: string | undefined; } | undefined;
  handleMint: () => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
  address: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  hash: `0x${string}` | null | undefined;
}

export const MintUI: FC<MintUIProps> = ({
  contractInfo,
  userMintInfo,
  balance,
  handleMint,
  isConnecting,
  isConnected,
  address,
  isPending,
  isConfirming,
  hash,
}) => {
  const {
    getPhaseString,
    getMaxMintForCurrentPhase,
    getUserMintedInCurrentPhase,
    getRemainingMintsForUser,
    getPhaseAccessStatus
  } = useHypercatzContract();

  const maxMintForPhase = contractInfo ? Number(getMaxMintForCurrentPhase()) : 5;
  const remainingMintsForUser = isConnected ? Number(getRemainingMintsForUser()) : maxMintForPhase;

  const phaseAccessStatus = getPhaseAccessStatus();
  const currentPhase = contractInfo?.currentPhase ?? HypercatzPhase.CLOSED;
  const currentPhaseStr = getPhaseString(currentPhase);
  const totalMinted = Number(contractInfo?.totalMinted ?? 0);
  const maxSupply = Number(contractInfo?.maxSupply ?? 0);
  const mintProgress = maxSupply > 0 ? (totalMinted / maxSupply) * 100 : 0;
  const userMintedCount = getUserMintedInCurrentPhase();


  if (!isConnected) {
    return (
      <div className="feature-card text-center">
        <div className="w-20 h-20 bg-hyperliquid-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wallet className="h-10 w-10 text-hyperliquid-500" />
        </div>
        <h3 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h3>
        <p className="text-gray-300 mb-8 text-lg">
          Connect to start minting your Hypercatz NFT.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="feature-card p-8"
    >
      {/* Progress Bar */}
      <div className='mb-6'>
        <div className="flex justify-between items-center mb-2">
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
          <span>{totalMinted.toLocaleString()} / {maxSupply.toLocaleString()} Minted</span>
          <span>{maxSupply - totalMinted} Remaining</span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="stat-card-condensed">
          <div className="stat-value">{currentPhaseStr}</div>
          <div className="stat-label">Current Phase</div>
        </div>
        <div className="stat-card-condensed">
          <div className="stat-value">{userMintedCount.toString()} / {maxMintForPhase}</div>
          <div className="stat-label">Your Minted</div>
        </div>
        <div className="stat-card-condensed">
          <div className="stat-value">FREE</div>
          <div className="stat-label">Price</div>
        </div>
      </div>
      
       {/* Phase Access Status */}
       <div className={`glass-card p-4 mb-6 ${
            phaseAccessStatus.hasAccess
              ? 'border-green-500/20 bg-green-500/5'
              : phaseAccessStatus.isLoading
                ? 'border-yellow-500/20 bg-yellow-500/5'
                : 'border-red-500/20 bg-red-500/5'
          }`}>
            <div className="flex items-center gap-3">
              {phaseAccessStatus.isLoading ? (
                <Clock className="h-5 w-5 text-yellow-500 animate-spin" />
              ) : phaseAccessStatus.hasAccess ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <div className='flex-1'>
                <div className={`font-bold text-sm ${
                  phaseAccessStatus.isLoading
                    ? 'text-yellow-400'
                    : phaseAccessStatus.hasAccess
                      ? 'text-green-400'
                      : 'text-red-400'
                }`}>
                  {phaseAccessStatus.isLoading
                    ? 'Checking Phase Access...'
                    : phaseAccessStatus.hasAccess
                      ? 'Phase Access Granted'
                      : 'Phase Access Denied'
                  }
                </div>
                <div className="text-xs text-gray-300">
                  {phaseAccessStatus.message}
                </div>
              </div>
            </div>
          </div>


      {/* Mint Button */}
      <Button
        size="lg"
        onClick={handleMint}
        isLoading={isPending || isConfirming}
        disabled={isPending || isConfirming || remainingMintsForUser === 0 || !phaseAccessStatus.hasAccess || phaseAccessStatus.isLoading}
        className="w-full group text-lg py-4"
      >
        {isPending ? (
          <><LoadingSpinner size="sm" className="mr-3" />Confirming...</>
        ) : isConfirming ? (
          <><LoadingSpinner size="sm" className="mr-3" />Minting...</>
        ) : remainingMintsForUser === 0 ? (
          <><AlertCircle className="h-6 w-6 mr-3" />Mint Limit Reached</>
        ) : !phaseAccessStatus.hasAccess ? (
            <><AlertCircle className="h-6 w-6 mr-3" />{`Access Denied`}</>
        ) : (
          <><Zap className="h-6 w-6 mr-3 group-hover:animate-pulse" />Mint 1 NFT</>
        )}
      </Button>

      {/* Transaction Hash */}
      {hash && (
        <div className="mt-4 glass-card p-3 border-hyperliquid-500/20">
          <div className="text-sm text-gray-400 mb-1">Tx Hash:</div>
          <div className="font-mono text-xs text-hyperliquid-400 break-all">{hash}</div>
        </div>
      )}

      {/* Wallet Info */}
      <div className="text-center mt-6 border-t border-dark-700 pt-4">
        <div className="text-sm text-gray-400">
          Connected as: <span className="font-mono text-white">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        <div className="text-sm text-gray-400">
            Balance: <span className="font-bold text-white">{balance?.formatted.slice(0, 8)} {balance?.symbol}</span>
        </div>
      </div>
    </motion.div>
  );
};