'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { PageLoadingSkeleton } from '@/components/ui/LoadingStates';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { ProvenanceDisplay } from '@/components/ui/ProvenanceDisplay';
import { useSoundEngine } from '@/utils/sound';
import { useHypercatzContract } from '@/hooks/useHypercatzContract';
import { MintUI } from '@/components/ui/Mint-UI';

const MintPage: React.FC = () => {
  const { address, isConnected, isConnecting } = useAccount();
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
    getRemainingMintsForUser,
    canUserMintInCurrentPhase,
    mint,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: contractError,
    isLoading: isContractLoading,
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

  const handleMint = async () => {
    if (!canUserMintInCurrentPhase()) {
        errorToast('Access Denied', 'You do not have access to mint in the current phase.');
        return;
    }
    const remainingMints = getRemainingMintsForUser();
    if (BigInt(mintAmount) > remainingMints) {
        errorToast('Mint Limit Exceeded', `You can only mint ${remainingMints.toString()} more NFTs.`);
        return;
    }
    playClick();
    await mint(mintAmount);
  };

  if (!mounted) {
    return <PageLoadingSkeleton />;
  }

  if (isContractLoading) {
    return <PageLoadingSkeleton />;
  }
  if (error) {
    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center">
        <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-hyperliquid-500/30 mb-6">
            <div className="w-2 h-2 bg-hyperliquid-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-hyperliquid-400">Exclusive NFT Collection</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 hyperliquid-gradient-text">
            MINT HYPERCATZ
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Mint your unique Hypercatz NFT to unlock exclusive utility in the Hyperliquid ecosystem.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <div className="relative aspect-square bg-gradient-to-br from-hyperliquid-500/10 to-accent-blue/10 rounded-2xl overflow-hidden group max-w-md mx-auto">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/images/pre-reveal.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 border-2 border-hyperliquid-500/30 rounded-2xl group-hover:border-hyperliquid-500/50 transition-colors" />
            </div>
          </motion.div>

          <MintUI
            contractInfo={contractInfo}
            userMintInfo={userMintInfo}
            balance={balance}
            mintAmount={mintAmount}
            setMintAmount={setMintAmount}
            handleMint={handleMint}
            isConnecting={isConnecting}
            isConnected={isConnected}
            address={address}
            isPending={isPending}
            isConfirming={isConfirming}
            hash={hash}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <ProvenanceDisplay />
        </motion.div>
      </div>
    </div>
  );
};

export default MintPage;