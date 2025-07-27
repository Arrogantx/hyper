'use client';

import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI } from '@/contracts/HypercatzNFT';
import { HYPERCATZ_STAKING_ADDRESS } from '@/contracts/hypercatzStaking';

export interface UseNFTApprovalReturn {
  // Approval status
  isApprovedForAll: boolean;
  isApprovalLoading: boolean;
  
  // Individual token approvals
  getTokenApproval: (tokenId: number) => Promise<string | null>;
  
  // Approval functions
  approveAll: () => void;
  approveToken: (tokenId: number) => void;
  
  // Transaction states
  approvalHash: string | undefined;
  isApprovalPending: boolean;
  isApprovalConfirming: boolean;
  isApprovalConfirmed: boolean;
  approvalError: Error | null;
}

export function useNFTApproval(): UseNFTApprovalReturn {
  const { address } = useAccount();
  const { writeContract, data: approvalHash, isPending: isApprovalPending, error: approvalError } = useWriteContract();
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  // Check if user has approved all NFTs for the staking contract
  const { data: isApprovedForAll, isLoading: isApprovalLoading } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'isApprovedForAll',
    args: address ? [address, HYPERCATZ_STAKING_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Function to check individual token approval
  const getTokenApproval = useCallback(async (tokenId: number): Promise<string | null> => {
    if (!address) return null;
    
    try {
      const { readContract } = await import('@wagmi/core');
      const { config } = await import('@/lib/wagmi');
      
      const approved = await readContract(config, {
        address: HYPERCATZ_NFT_ADDRESS,
        abi: HYPERCATZ_NFT_ABI,
        functionName: 'getApproved',
        args: [BigInt(tokenId)],
      });
      
      return approved as string;
    } catch (error) {
      console.error(`Error checking approval for token ${tokenId}:`, error);
      return null;
    }
  }, [address]);

  // Approve all NFTs for the staking contract
  const approveAll = useCallback(() => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    console.log('Approving all NFTs for staking contract...');
    
    writeContract({
      address: HYPERCATZ_NFT_ADDRESS,
      abi: HYPERCATZ_NFT_ABI,
      functionName: 'setApprovalForAll',
      args: [HYPERCATZ_STAKING_ADDRESS, true],
    });
  }, [address, writeContract]);

  // Approve individual token for the staking contract
  const approveToken = useCallback((tokenId: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    console.log(`Approving token #${tokenId} for staking contract...`);
    
    writeContract({
      address: HYPERCATZ_NFT_ADDRESS,
      abi: HYPERCATZ_NFT_ABI,
      functionName: 'approve',
      args: [HYPERCATZ_STAKING_ADDRESS, BigInt(tokenId)],
    });
  }, [address, writeContract]);

  return {
    // Approval status
    isApprovedForAll: !!isApprovedForAll,
    isApprovalLoading,
    
    // Individual token approvals
    getTokenApproval,
    
    // Approval functions
    approveAll,
    approveToken,
    
    // Transaction states
    approvalHash,
    isApprovalPending,
    isApprovalConfirming,
    isApprovalConfirmed,
    approvalError,
  };
}