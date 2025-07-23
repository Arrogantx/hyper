import { Address } from 'viem';
import { SwapToken } from './swap';

export interface SwapTransaction {
  id: string;
  hash: string;
  timestamp: number;
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: string;
  toAmount: string;
  status: 'pending' | 'success' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
  priceImpact?: number;
  route?: string[];
  userAddress: Address;
}

export interface TransactionHistoryState {
  transactions: SwapTransaction[];
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'hypercatz_swap_history';
const MAX_TRANSACTIONS = 50; // Keep only the last 50 transactions

// Load transaction history from localStorage
export const loadTransactionHistory = (userAddress?: Address): SwapTransaction[] => {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const allTransactions: SwapTransaction[] = JSON.parse(stored);
    
    // Filter by user address if provided
    if (userAddress) {
      return allTransactions
        .filter(tx => tx.userAddress.toLowerCase() === userAddress.toLowerCase())
        .sort((a, b) => b.timestamp - a.timestamp);
    }
    
    return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error loading transaction history:', error);
    return [];
  }
};

// Save transaction to localStorage
export const saveTransaction = (transaction: SwapTransaction): void => {
  try {
    if (typeof window === 'undefined') return;
    
    const existing = loadTransactionHistory();
    const updated = [transaction, ...existing.filter(tx => tx.id !== transaction.id)];
    
    // Keep only the most recent transactions
    const trimmed = updated.slice(0, MAX_TRANSACTIONS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

// Update transaction status
export const updateTransactionStatus = (
  transactionId: string,
  status: SwapTransaction['status'],
  additionalData?: Partial<SwapTransaction>
): void => {
  try {
    if (typeof window === 'undefined') return;
    
    const existing = loadTransactionHistory();
    const updated = existing.map(tx => 
      tx.id === transactionId 
        ? { ...tx, status, ...additionalData }
        : tx
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating transaction status:', error);
  }
};

// Generate transaction ID
export const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Format transaction for display
export const formatTransactionTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

// Get transaction status color
export const getTransactionStatusColor = (status: SwapTransaction['status']): string => {
  switch (status) {
    case 'success':
      return 'text-green-400';
    case 'failed':
      return 'text-red-400';
    case 'pending':
      return 'text-yellow-400';
    default:
      return 'text-dark-400';
  }
};

// Get transaction status icon
export const getTransactionStatusIcon = (status: SwapTransaction['status']): string => {
  switch (status) {
    case 'success':
      return '✅';
    case 'failed':
      return '❌';
    case 'pending':
      return '⏳';
    default:
      return '❓';
  }
};

// Clear transaction history
export const clearTransactionHistory = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing transaction history:', error);
  }
};

// Get recent transactions (last 5)
export const getRecentTransactions = (userAddress?: Address): SwapTransaction[] => {
  return loadTransactionHistory(userAddress).slice(0, 5);
};