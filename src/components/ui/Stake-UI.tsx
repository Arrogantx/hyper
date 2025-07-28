'use client';

import React, { FC } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  Star,
  Award,
  Target,
  TrendingUp,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { NFTImage } from '@/components/ui/NFTImage';
import { useHypercatzStaking } from '@/hooks/useHypercatzStaking';

// Define a specific type for the props to ensure type safety
interface StakeUIProps {
  userNFTs: number[];
  selectedNFTs: number[];
  setSelectedNFTs: React.Dispatch<React.SetStateAction<number[]>>;
  handleStake: () => Promise<void>;
  handleUnstake: () => Promise<void>;
  handleClaimRewards: () => Promise<void>;
  isStaking: boolean;
  isClaiming: boolean;
  isPending: boolean;
}

export const StakeUI: FC<StakeUIProps> = ({
  userNFTs,
  selectedNFTs,
  setSelectedNFTs,
  handleStake,
  handleUnstake,
  handleClaimRewards,
  isStaking,
  isClaiming,
  isPending,
}) => {
  const {
      userStakingData,
      getEstimatedDailyRewards,
      getTotalStaked,
      getClaimableAmount,
      canStake,
      canUnstake,
      canClaim,
  } = useHypercatzStaking();

  const totalStaked = getTotalStaked();
  const claimableAmount = getClaimableAmount();

  const handleSelectStakable = (nftId: number) => {
    if (selectedNFTs.includes(nftId)) {
        setSelectedNFTs(selectedNFTs.filter(id => id !== nftId));
    } else {
        setSelectedNFTs([...selectedNFTs, nftId]);
    }
  };

  const handleSelectStaked = (tokenId: bigint) => {
    const nftId = Number(tokenId);
    handleSelectStakable(nftId);
  }

  return (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="feature-card p-8 space-y-8"
    >
        {/* Staking Dashboard */}
        <div>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Staking Dashboard</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="stat-card-condensed">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-hyperliquid-500" />
                    <div className="stat-value">{totalStaked}</div>
                    <div className="stat-label">NFTs Staked</div>
                </div>
                <div className="stat-card-condensed">
                    <Target className="w-6 h-6 mx-auto mb-2 text-hyperliquid-500" />
                    <div className="stat-value">{claimableAmount.toFixed(2)}</div>
                    <div className="stat-label">Claimable</div>
                </div>
                <div className="stat-card-condensed">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-hyperliquid-500" />
                    <div className="stat-value">{getEstimatedDailyRewards().toFixed(2)}</div>
                    <div className="stat-label">Daily Rewards</div>
                </div>
                <div className="stat-card-condensed">
                    <Award className="w-6 h-6 mx-auto mb-2 text-hyperliquid-500" />
                    <div className="stat-value">{(claimableAmount * 0.1).toFixed(2)}</div>
                    <div className="stat-label"> My Points</div>
                </div>
            </div>
        </div>

        {/* Rewards Pod */}
        <div className="glass-card p-6 text-center">
            <h4 className="text-xl font-bold text-accent-yellow mb-3">Rewards Pod</h4>
            <p className="text-3xl font-bold text-white mb-4">{claimableAmount.toFixed(4)} HP</p>
            <Button
                onClick={handleClaimRewards}
                disabled={isClaiming || isPending || !canClaim()}
                variant="primary"
                size="lg"
            >
                {isClaiming || isPending ? <LoadingSpinner /> : 'Claim Rewards'}
            </Button>
        </div>

        {/* Action Panels */}
        <div className="grid md:grid-cols-2 gap-8">
            {/* Stake Panel */}
            <div className="space-y-4">
                <h4 className="text-xl font-bold text-center text-white">Your Wallet</h4>
                <div className="nft-gallery">
                    {userNFTs.length > 0 ? userNFTs.map(nftId => (
                        <NFTImage
                            key={nftId}
                            tokenId={nftId}
                            size="md"
                            variant="stake"
                            selected={selectedNFTs.includes(nftId)}
                            onClick={() => handleSelectStakable(nftId)}
                        />
                    )) : <p className="text-gray-400 text-center col-span-full">No NFTs to stake.</p>}
                </div>
                <Button
                    onClick={handleStake}
                    disabled={isStaking || isPending || selectedNFTs.length === 0 || !canStake()}
                    className="w-full"
                >
                    {`Stake ${selectedNFTs.length} Selected`}
                </Button>
            </div>

            {/* Unstake Panel */}
            <div className="space-y-4">
                <h4 className="text-xl font-bold text-center text-white">Staked NFTs</h4>
                <div className="nft-gallery">
                    {totalStaked > 0 ? userStakingData.stakedTokenIds.map(tokenId => (
                        <NFTImage
                            key={Number(tokenId)}
                            tokenId={Number(tokenId)}
                            size="md"
                            variant="unstake"
                            selected={selectedNFTs.includes(Number(tokenId))}
                            onClick={() => handleSelectStaked(tokenId)}
                        />
                    )) : <p className="text-gray-400 text-center col-span-full">No NFTs staked.</p>}
                </div>
                <Button
                    onClick={handleUnstake}
                    disabled={isStaking || isPending || selectedNFTs.length === 0 || !canUnstake()}
                    className="w-full"
                    variant="secondary"
                >
                    {`Unstake ${selectedNFTs.length} Selected`}
                </Button>
            </div>
        </div>
    </motion.div>
  );
};