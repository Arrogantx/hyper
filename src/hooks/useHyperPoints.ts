'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, formatUnits, parseUnits } from 'viem';
import { HYPER_POINTS_ABI } from '@/contracts/abis';
import { getCurrentNetworkAddresses } from '@/contracts/addresses';

export interface HyperPointsData {
  balance: bigint;
  totalSupply: bigint;
  decimals: number;
  name: string;
  symbol: string;
  formattedBalance: string;
  formattedTotalSupply: string;
}

export interface UseHyperPointsReturn {
  data: HyperPointsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  transfer: (to: Address, amount: string) => Promise<void>;
  approve: (spender: Address, amount: string) => Promise<void>;
  burn: (amount: string) => Promise<void>;
  isTransferPending: boolean;
  isApprovePending: boolean;
  isBurnPending: boolean;
  transferHash: string | undefined;
  approveHash: string | undefined;
  burnHash: string | undefined;
}

export function useHyperPoints(): UseHyperPointsReturn {
  const { address } = useAccount();
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  
  const hyperPointsAddress = getCurrentNetworkAddresses().HYPER_POINTS;

  // Read contract data
  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useReadContract({
    address: hyperPointsAddress,
    abi: HYPER_POINTS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const { data: totalSupply, isLoading: totalSupplyLoading, refetch: refetchTotalSupply } = useReadContract({
    address: hyperPointsAddress,
    abi: HYPER_POINTS_ABI,
    functionName: 'totalSupply',
  });

  const { data: decimals, refetch: refetchDecimals } = useReadContract({
    address: hyperPointsAddress,
    abi: HYPER_POINTS_ABI,
    functionName: 'decimals',
  });

  const { data: name, refetch: refetchName } = useReadContract({
    address: hyperPointsAddress,
    abi: HYPER_POINTS_ABI,
    functionName: 'name',
  });

  const { data: symbol, refetch: refetchSymbol } = useReadContract({
    address: hyperPointsAddress,
    abi: HYPER_POINTS_ABI,
    functionName: 'symbol',
  });

  // Write contract functions
  const { writeContract: writeTransfer, data: transferHash, isPending: isTransferPending } = useWriteContract();
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { writeContract: writeBurn, data: burnHash, isPending: isBurnPending } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isTransferConfirming } = useWaitForTransactionReceipt({
    hash: transferHash,
  });

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isBurnConfirming } = useWaitForTransactionReceipt({
    hash: burnHash,
  });

  // Refetch all data
  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
    refetchBalance();
    refetchTotalSupply();
    refetchDecimals();
    refetchName();
    refetchSymbol();
  };

  // Auto-refetch after successful transactions
  useEffect(() => {
    if (transferHash && !isTransferConfirming) {
      setTimeout(refetch, 2000);
    }
  }, [transferHash, isTransferConfirming]);

  useEffect(() => {
    if (approveHash && !isApproveConfirming) {
      setTimeout(refetch, 2000);
    }
  }, [approveHash, isApproveConfirming]);

  useEffect(() => {
    if (burnHash && !isBurnConfirming) {
      setTimeout(refetch, 2000);
    }
  }, [burnHash, isBurnConfirming]);

  // Contract interaction functions
  const transfer = async (to: Address, amount: string) => {
    if (!decimals) throw new Error('Decimals not loaded');
    
    const parsedAmount = parseUnits(amount, decimals);
    
    writeTransfer({
      address: hyperPointsAddress,
      abi: HYPER_POINTS_ABI,
      functionName: 'transfer',
      args: [to, parsedAmount],
    });
  };

  const approve = async (spender: Address, amount: string) => {
    if (!decimals) throw new Error('Decimals not loaded');
    
    const parsedAmount = parseUnits(amount, decimals);
    
    writeApprove({
      address: hyperPointsAddress,
      abi: HYPER_POINTS_ABI,
      functionName: 'approve',
      args: [spender, parsedAmount],
    });
  };

  const burn = async (amount: string) => {
    if (!decimals) throw new Error('Decimals not loaded');
    
    const parsedAmount = parseUnits(amount, decimals);
    
    writeBurn({
      address: hyperPointsAddress,
      abi: HYPER_POINTS_ABI,
      functionName: 'burn',
      args: [parsedAmount],
    });
  };

  // Prepare return data
  const data: HyperPointsData | null = 
    balance !== undefined && 
    totalSupply !== undefined && 
    decimals !== undefined && 
    name && 
    symbol
      ? {
          balance: balance as bigint,
          totalSupply: totalSupply as bigint,
          decimals: decimals as number,
          name: name as string,
          symbol: symbol as string,
          formattedBalance: formatUnits(balance as bigint, decimals as number),
          formattedTotalSupply: formatUnits(totalSupply as bigint, decimals as number),
        }
      : null;

  const isLoading = balanceLoading || totalSupplyLoading;
  const error = balanceError as Error | null;

  return {
    data,
    isLoading,
    error,
    refetch,
    transfer,
    approve,
    burn,
    isTransferPending: isTransferPending || isTransferConfirming,
    isApprovePending: isApprovePending || isApproveConfirming,
    isBurnPending: isBurnPending || isBurnConfirming,
    transferHash,
    approveHash,
    burnHash,
  };
}

// Helper hook for checking allowance
export function useHyperPointsAllowance(owner?: Address, spender?: Address) {
  const hyperPointsAddress = getCurrentNetworkAddresses().HYPER_POINTS;

  const { data: allowance, isLoading, error, refetch } = useReadContract({
    address: hyperPointsAddress,
    abi: HYPER_POINTS_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!(owner && spender),
    },
  });

  return {
    allowance: allowance as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Helper hook for formatted balance display
export function useFormattedHyperPointsBalance(address?: Address) {
  const { data, isLoading, error } = useHyperPoints();
  
  if (!address || !data) {
    return {
      formattedBalance: '0',
      balance: BigInt(0),
      isLoading,
      error,
    };
  }

  return {
    formattedBalance: data.formattedBalance,
    balance: data.balance,
    isLoading,
    error,
  };
}