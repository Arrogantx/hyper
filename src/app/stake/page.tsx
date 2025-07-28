'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { StakingPoolSkeleton } from '@/components/ui/LoadingStates';
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import {
  validateStakingOperation,
  formatStakingError
} from '@/utils/stakingErrors';
import { Wallet, AlertCircle } from 'lucide-react';
import { useHypercatzStaking } from '@/hooks/useHypercatzStaking';
import { StakeUI } from '@/components/ui/Stake-UI';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function StakePage() {
  const { isConnected } = useAccount();
  const {
    contractsDeployed,
    userNFTs,
    selectedNFTs,
    setSelectedNFTs,
    stakeNFTs,
    unstakeNFTs,
    claimRewards,
    getClaimableAmount,
    hash,
    isPending,
    isConfirming,
    isLoading,
    isApprovalPending,
    isApprovalConfirming,
  } = useHypercatzStaking();

  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const errorToast = useErrorToast();

  const handleStake = async () => {
    const validationError = validateStakingOperation('stake', { isConnected, contractsDeployed, selectedNFTs, poolActive: true });
    if (validationError) {
        errorToast(formatStakingError(validationError).title, formatStakingError(validationError).message);
        return;
    }
    await stakeNFTs(selectedNFTs);
  };

  const handleUnstake = async () => {
    const validationError = validateStakingOperation('unstake', { isConnected, contractsDeployed, selectedNFTs, isLocked: false });
    if (validationError) {
        errorToast(formatStakingError(validationError).title, formatStakingError(validationError).message);
        return;
    }
    await unstakeNFTs(selectedNFTs);
  };

  const handleClaimRewards = async () => {
    const validationError = validateStakingOperation('claim', { isConnected, contractsDeployed, hasRewards: getClaimableAmount() > 0 });
    if (validationError) {
        errorToast(formatStakingError(validationError).title, formatStakingError(validationError).message);
        return;
    }
    await claimRewards();
  };

  if (isLoading) return <StakingPoolSkeleton />;

  if (!isConnected) return (
      <div className="flex-center min-h-screen">
          <Wallet className="w-12 h-12 text-hyperliquid-500 mb-4" />
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <p>Connect your wallet to manage staking.</p>
      </div>
  );

  if (!contractsDeployed) return (
      <div className="flex-center min-h-screen">
          <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold">Coming Soon</h2>
          <p>Staking contracts are not yet deployed.</p>
      </div>
  );

  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 hyperliquid-gradient-text">HYPERCATZ STAKING</h1>
            <p className="text-xl text-gray-300">Stake your NFTs to earn $HYPE and unlock exclusive utilities.</p>
          </div>

          <StakeUI 
              userNFTs={userNFTs}
              selectedNFTs={selectedNFTs}
              setSelectedNFTs={setSelectedNFTs}
              handleStake={handleStake}
              handleUnstake={handleUnstake}
              handleClaimRewards={handleClaimRewards}
              isStaking={isStaking}
              isClaiming={isClaiming}
              isPending={isPending}
          />

          {(isPending || isConfirming || isApprovalPending || isApprovalConfirming) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <div className="glass-card p-6">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <h3 className="text-lg font-bold">Processing Transaction</h3>
                <p className="text-gray-400">Please wait, your transaction is being confirmed on the blockchain.</p>
                {hash && <a href={`https://hyperscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-hyperliquid-400 hover:text-hyperliquid-300 mt-2">View on Explorer</a>}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}