'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatUnits, parseUnits, Address } from 'viem';
import { useAccount, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  CogIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { LoadingOverlay, LoadingButton } from '@/components/ui/LoadingStates';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useToast, useSuccessToast, useErrorToast } from '@/components/ui/Toast';
import { HypePriceCard } from '@/components/ui/HypePrice';
import {
  SWAP_TOKENS,
  SwapToken,
  SwapRoute,
  SwapQuote,
  calculateSwapQuote,
  useTokenBalance,
  useTokenApproval,
  useTokenAllowance,
  useSwap,
  DEX_ROUTER_ADDRESS,
  validateSwapParams,
  formatSwapError,
  isQuoteExpired,
  SWAP_ERROR_CODES
} from '@/lib/swap';
import {
  SwapTransaction,
  saveTransaction,
  updateTransactionStatus,
  generateTransactionId
} from '@/lib/transactionHistory';
import { RecentSwaps } from '@/components/ui/TransactionHistory';
import soundEngine from '@/utils/sound';

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [fromToken, setFromToken] = useState<SwapToken>(SWAP_TOKENS[0]);
  const [toToken, setToToken] = useState<SwapToken>(SWAP_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [swapQuote, setSwapQuote] = useState<SwapQuote>({ routes: [], bestRoute: {} as SwapRoute, isLoading: false, error: null });
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [lastQuoteRefresh, setLastQuoteRefresh] = useState<number>(0);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [swapProgress, setSwapProgress] = useState<'idle' | 'validating' | 'submitting' | 'confirming' | 'success'>('idle');
  
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  // Wagmi hooks
  const fromBalance = useTokenBalance(fromToken, address);
  const toBalance = useTokenBalance(toToken, address);
  const allowance = useTokenAllowance(fromToken.address, address, DEX_ROUTER_ADDRESS);
  const { approve, isPending: isApproving, hash: approvalHash } = useTokenApproval();
  const { executeSwap, isPending: isSwapping, hash: swapHash } = useSwap();
  
  const approvalReceipt = useWaitForTransactionReceipt({ hash: approvalHash });
  const swapReceipt = useWaitForTransactionReceipt({ hash: swapHash });

  // Load initial data
  useEffect(() => {
    const loadTokenData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load token data. Please try again.');
        setIsLoading(false);
      }
    };

    loadTokenData();
  }, []);

  // Calculate swap quote when tokens or amounts change
  useEffect(() => {
    if (fromAmount && fromToken && toToken && publicClient) {
      const getQuote = async () => {
        setSwapQuote(prev => ({ ...prev, isLoading: true }));
        const quote = await calculateSwapQuote(fromToken, toToken, fromAmount, publicClient);
        setSwapQuote(quote);
        
        if (quote.bestRoute?.amountOut) {
          setToAmount(formatUnits(quote.bestRoute.amountOut, toToken.decimals));
        }
      };
      getQuote();
    } else {
      setToAmount('');
      setSwapQuote({ routes: [], bestRoute: {} as SwapRoute, isLoading: false, error: null });
    }
  }, [fromAmount, fromToken, toToken, publicClient]);

  // Check if approval is needed based on actual allowance
  useEffect(() => {
    if (fromToken.address !== '0x0000000000000000000000000000000000000000' && fromAmount && allowance.data) {
      const amountWei = parseUnits(fromAmount, fromToken.decimals);
      const currentAllowance = allowance.data as bigint;
      setNeedsApproval(currentAllowance < amountWei);
    } else {
      setNeedsApproval(false);
    }
  }, [fromToken, fromAmount, allowance.data]);

  // Handle approval success
  useEffect(() => {
    if (approvalReceipt.isSuccess) {
      showSuccess('Token approval successful!');
      setNeedsApproval(false);
    }
  }, [approvalReceipt.isSuccess, showSuccess]);

  // Handle swap success
  useEffect(() => {
    if (swapReceipt.isSuccess && currentTransactionId) {
      soundEngine.playSuccess();
      showSuccess(`Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!`);
      
      // Update transaction status
      updateTransactionStatus(currentTransactionId, 'success');
      setCurrentTransactionId(null);
      setSwapProgress('success');
      
      // Clear amounts after showing success state
      setTimeout(() => {
        setSwapProgress('idle');
        setFromAmount('');
        setToAmount('');
      }, 2000);
    }
  }, [swapReceipt.isSuccess, showSuccess, fromAmount, fromToken.symbol, toAmount, toToken.symbol, currentTransactionId]);

  // Handle approval success
  useEffect(() => {
    if (approvalReceipt.isSuccess) {
      soundEngine.playSuccess();
      showSuccess('Token approval successful!');
      // Refetch allowance
      allowance.refetch();
    }
  }, [approvalReceipt.isSuccess, showSuccess, allowance]);

  // Handle swap error
  useEffect(() => {
    if (swapReceipt.isError && currentTransactionId) {
      soundEngine.playError();
      showError('Swap transaction failed. Please try again.');
      
      // Update transaction status
      updateTransactionStatus(currentTransactionId, 'failed');
      setCurrentTransactionId(null);
      setSwapProgress('idle');
    }
  }, [swapReceipt.isError, showError, currentTransactionId]);

  // Handle approval error
  useEffect(() => {
    if (approvalReceipt.isError) {
      soundEngine.playError();
      showError('Token approval failed. Please try again.');
      setSwapProgress('idle');
    }
  }, [approvalReceipt.isError, showError]);

  // Auto-refresh quotes when needed
  useEffect(() => {
    if (lastQuoteRefresh > 0 && fromAmount && fromToken && toToken && publicClient) {
      const getQuote = async () => {
        setSwapQuote(prev => ({ ...prev, isLoading: true }));
        const quote = await calculateSwapQuote(fromToken, toToken, fromAmount, publicClient);
        setSwapQuote(quote);
        
        if (quote.bestRoute?.amountOut) {
          setToAmount(formatUnits(quote.bestRoute.amountOut, toToken.decimals));
        }
      };
      getQuote();
    }
  }, [lastQuoteRefresh, fromAmount, fromToken, toToken, publicClient]);

  // Update transaction hash when swap hash is available
  useEffect(() => {
    if (swapHash && currentTransactionId) {
      updateTransactionStatus(currentTransactionId, 'pending', { hash: swapHash });
    }
  }, [swapHash, currentTransactionId]);

  const handleApprove = async () => {
    if (!address || !fromAmount) return;
    
    try {
      soundEngine.playClick();
      const amountInWei = parseUnits(fromAmount, fromToken.decimals);
      // Approve max amount to avoid repeated approvals
      const maxAmount = parseUnits('1000000000', fromToken.decimals);
      await approve(fromToken.address, DEX_ROUTER_ADDRESS, maxAmount);
    } catch (err) {
      const errorMessage = formatSwapError(err);
      showError(errorMessage);
      soundEngine.playError();
    }
  };

  const handleSwap = async () => {
    if (!address || !fromAmount || !swapQuote.bestRoute) return;
    
    try {
      setSwapProgress('validating');
      
      // Validate swap parameters
      const validationError = validateSwapParams(
        fromToken,
        toToken,
        fromAmount,
        fromBalance.data?.value
      );
      
      if (validationError) {
        showError(validationError.message);
        soundEngine.playError();
        setSwapProgress('idle');
        return;
      }

      // Check if quote is expired
      if (isQuoteExpired(swapQuote)) {
        showError('Quote has expired. Refreshing...');
        setLastQuoteRefresh(Date.now());
        setSwapProgress('idle');
        return;
      }

      // Validate slippage settings
      if (slippage < 0.05) {
        showError('Slippage tolerance too low. Transaction will likely fail.');
        soundEngine.playError();
        setSwapProgress('idle');
        return;
      }

      if (slippage > 50) {
        showError('Slippage tolerance too high. Maximum allowed is 50%.');
        soundEngine.playError();
        setSwapProgress('idle');
        return;
      }

      // Warn about high slippage
      if (slippage >= 15 && !confirm(`Warning: You have set a very high slippage tolerance of ${slippage}%. This may result in significant losses. Do you want to continue?`)) {
        setSwapProgress('idle');
        return;
      }

      setSwapProgress('submitting');
      soundEngine.playClick();
      const amountInWei = parseUnits(fromAmount, fromToken.decimals);
      
      // Create transaction record
      const transactionId = generateTransactionId();
      const transaction: SwapTransaction = {
        id: transactionId,
        hash: '', // Will be updated when we get the hash
        timestamp: Date.now(),
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        status: 'pending',
        priceImpact: swapQuote.bestRoute.priceImpact,
        route: swapQuote.bestRoute.pathSymbols,
        userAddress: address
      };
      
      // Save transaction
      saveTransaction(transaction);
      setCurrentTransactionId(transactionId);
      
      await executeSwap(swapQuote.bestRoute, fromToken, toToken, amountInWei, address, slippage, swapQuote);
      setSwapProgress('confirming');
    } catch (err) {
      const errorMessage = formatSwapError(err);
      showError(errorMessage);
      soundEngine.playError();
      setSwapProgress('idle');
      
      // Update transaction status to failed if we have a transaction ID
      if (currentTransactionId) {
        updateTransactionStatus(currentTransactionId, 'failed');
        setCurrentTransactionId(null);
      }
    }
  };

  const retryLoadData = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
  };

  const handleMaxClick = () => {
    if (fromBalance.data) {
      const maxAmount = formatUnits(fromBalance.data.value, fromBalance.data.decimals);
      handleFromAmountChange(maxAmount);
    }
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 0.1) return 'text-green-400';
    if (impact < 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const TokenSelector = ({
    token,
    isOpen,
    onToggle,
    onSelect,
    excludeToken
  }: {
    token: SwapToken;
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (token: SwapToken) => void;
    excludeToken?: SwapToken;
  }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 sm:space-x-3 bg-dark-700/50 hover:bg-dark-600/50 rounded-xl p-2 sm:p-3 transition-all duration-200 border border-dark-600/30 hover:border-hyperliquid-500/30 min-w-0 w-full sm:w-auto"
      >
        <img
          src={token.icon}
          alt={token.symbol}
          className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 rounded-full"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="text-xl sm:text-2xl flex-shrink-0 hidden">
          {token.symbol === 'HYPE' ? '🔥' :
           token.symbol === 'USDC' ? '💵' :
           token.symbol === 'WETH' ? '⟠' :
           token.symbol === 'WBTC' ? '₿' :
           token.symbol === 'LINK' ? '🔗' : '🪙'}
        </span>
        <div className="text-left min-w-0 flex-1">
          <div className="font-semibold text-white text-sm sm:text-base truncate">{token.symbol}</div>
          <div className="text-xs text-dark-400 truncate hidden sm:block">{token.name}</div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-dark-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-dark-800 rounded-xl border border-hyperliquid-500/20 shadow-xl z-50 max-h-60 sm:max-h-80 overflow-y-auto"
        >
          {SWAP_TOKENS
            .filter(t => t.id !== excludeToken?.id)
            .map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelect(t);
                  onToggle();
                  soundEngine.playClick();
                }}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-dark-700/50 active:bg-dark-600/50 transition-colors first:rounded-t-xl last:rounded-b-xl touch-manipulation"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <img
                    src={t.icon}
                    alt={t.symbol}
                    className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 rounded-full"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="text-xl sm:text-2xl flex-shrink-0 hidden">
                    {t.symbol === 'HYPE' ? '🔥' :
                     t.symbol === 'USDC' ? '💵' :
                     t.symbol === 'WETH' ? '⟠' :
                     t.symbol === 'WBTC' ? '₿' :
                     t.symbol === 'LINK' ? '🔗' : '🪙'}
                  </span>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-semibold text-white text-sm sm:text-base truncate">{t.symbol}</div>
                    <div className="text-xs text-dark-400 truncate">{t.name}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-white font-medium text-xs sm:text-sm">
                    {t.symbol === fromToken.symbol && fromBalance.data
                      ? parseFloat(formatUnits(fromBalance.data.value, fromBalance.data.decimals)).toFixed(2)
                      : t.symbol === toToken.symbol && toBalance.data
                      ? parseFloat(formatUnits(toBalance.data.value, toBalance.data.decimals)).toFixed(2)
                      : '0.00'
                    }
                  </div>
                </div>
              </button>
            ))}
        </motion.div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-16 sm:pt-20">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <ErrorDisplay error={error} onRetry={retryLoadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pt-16 sm:pt-20">
      <LoadingOverlay isLoading={isLoading}>
        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="px-3 py-1 bg-hyperliquid-500/10 border border-hyperliquid-500/20 rounded-full">
                <span className="text-hyperliquid-400 text-sm font-medium">DEX Aggregator</span>
              </div>
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <span className="text-blue-400 text-sm font-medium">Best Rates</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold hyperliquid-gradient-text mb-2 sm:mb-4">
              Hypercatz Swap
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-dark-300 max-w-3xl mx-auto px-2">
              Trade tokens instantly with the best rates and lowest fees in the Hypercatz ecosystem
            </p>
          </motion.div>

          {/* HYPE Token Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <HypePriceCard className="max-w-md mx-auto" />
          </motion.div>

        <div className="max-w-lg mx-auto">
          {/* Swap Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 sm:p-6 mb-4 sm:mb-6"
          >
            {/* Settings Button */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Swap Tokens</h2>
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  soundEngine.playClick();
                }}
                className="p-2 rounded-lg bg-dark-700/50 hover:bg-dark-600/50 active:bg-dark-600/70 transition-colors touch-manipulation"
              >
                <CogIcon className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-dark-700/30 rounded-xl border border-dark-600/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                  <span className="text-dark-300 text-sm sm:text-base">Slippage Tolerance</span>
                  <div className="flex space-x-2">
                    {[0.1, 0.5, 1.0].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setSlippage(value);
                          soundEngine.playClick();
                        }}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors touch-manipulation ${
                          slippage === value
                            ? 'bg-hyperliquid-500 text-white'
                            : 'bg-dark-600 text-dark-300 hover:bg-dark-500 active:bg-dark-400'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={![0.1, 0.5, 1.0].includes(slippage) ? slippage : ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 50) {
                            setSlippage(value);
                          }
                        }}
                        placeholder="Custom"
                        className="w-16 px-2 py-2 bg-dark-600 text-white text-sm rounded-lg border border-dark-500 focus:border-hyperliquid-500 outline-none"
                        min="0"
                        max="50"
                        step="0.1"
                      />
                      <span className="text-dark-400 text-sm ml-1">%</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-dark-400">
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </div>
                
                {/* Slippage Warnings */}
                {slippage < 0.1 && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-400">
                      <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold text-xs">Very Low Slippage</span>
                    </div>
                    <p className="text-red-300 text-xs mt-1">
                      Transaction may fail due to price movements. Consider increasing slippage tolerance.
                    </p>
                  </div>
                )}
                
                {slippage > 5 && (
                  <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold text-xs">High Slippage Warning</span>
                    </div>
                    <p className="text-yellow-300 text-xs mt-1">
                      High slippage tolerance may result in unfavorable trades. You may receive significantly less tokens.
                    </p>
                  </div>
                )}
                
                {slippage >= 10 && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-400">
                      <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold text-xs">Extreme Slippage Risk</span>
                    </div>
                    <p className="text-red-300 text-xs mt-1">
                      Extremely high slippage! You may lose a significant portion of your trade value. Consider reducing slippage or trade size.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* From Token */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-dark-400">From</label>
                <span className="text-xs text-dark-400">
                  Balance: {fromBalance.data
                    ? parseFloat(formatUnits(fromBalance.data.value, fromBalance.data.decimals)).toFixed(4)
                    : '0.0000'
                  } {fromToken.symbol}
                </span>
              </div>
              <div className="bg-dark-700/30 rounded-xl p-3 sm:p-4 border border-dark-600/30">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      placeholder="0.0"
                      className="bg-transparent text-xl sm:text-2xl font-semibold text-white placeholder-dark-500 outline-none flex-1 mr-2 min-w-0"
                    />
                    <button
                      onClick={handleMaxClick}
                      className="px-2 py-1 bg-hyperliquid-500/20 text-hyperliquid-400 text-xs rounded-md hover:bg-hyperliquid-500/30 active:bg-hyperliquid-500/40 transition-colors touch-manipulation flex-shrink-0"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <TokenSelector
                      token={fromToken}
                      isOpen={showFromTokens}
                      onToggle={() => {
                        setShowFromTokens(!showFromTokens);
                        setShowToTokens(false); // Close other selector
                      }}
                      onSelect={setFromToken}
                      excludeToken={toToken}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={() => {
                  handleSwapTokens();
                  soundEngine.playClick();
                }}
                className="p-3 bg-dark-700/50 hover:bg-dark-600/50 active:bg-dark-600/70 rounded-xl transition-all duration-200 border border-dark-600/30 hover:border-hyperliquid-500/30 touch-manipulation"
              >
                <ArrowsUpDownIcon className="w-6 h-6 text-hyperliquid-400" />
              </button>
            </div>

            {/* To Token */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-dark-400">To</label>
                <span className="text-xs text-dark-400">
                  Balance: {toBalance.data
                    ? parseFloat(formatUnits(toBalance.data.value, toBalance.data.decimals)).toFixed(4)
                    : '0.0000'
                  } {toToken.symbol}
                </span>
              </div>
              <div className="bg-dark-700/30 rounded-xl p-3 sm:p-4 border border-dark-600/30">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={toAmount}
                      readOnly
                      placeholder="0.0"
                      className="bg-transparent text-xl sm:text-2xl font-semibold text-white placeholder-dark-500 outline-none flex-1 min-w-0"
                    />
                  </div>
                  <div className="flex justify-end">
                    <TokenSelector
                      token={toToken}
                      isOpen={showToTokens}
                      onToggle={() => {
                        setShowToTokens(!showToTokens);
                        setShowFromTokens(false); // Close other selector
                      }}
                      onSelect={setToToken}
                      excludeToken={fromToken}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Details */}
            {fromAmount && toAmount && swapQuote.bestRoute && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-dark-700/30 rounded-xl border border-dark-600/30"
              >
                {swapQuote.isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-6"
                  >
                    <div className="relative">
                      <LoadingSpinner size="sm" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-transparent border-t-hyperliquid-500/30 rounded-full"
                      />
                    </div>
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3 text-dark-400 text-sm font-medium"
                    >
                      Calculating best route...
                    </motion.span>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-1 text-xs text-dark-500"
                    >
                      Comparing {SWAP_TOKENS.length - 1} routes for optimal pricing
                    </motion.div>
                    
                    {/* Animated dots */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex space-x-1 mt-2"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-1 h-1 bg-hyperliquid-400 rounded-full"
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-dark-400">Exchange Rate</span>
                      <span className="text-white text-right">
                        1 {fromToken.symbol} = {swapQuote.bestRoute.exchangeRate?.toFixed(6) || '0'} {toToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Price Impact</span>
                      <span className={getPriceImpactColor(swapQuote.bestRoute.priceImpact || 0)}>
                        {(swapQuote.bestRoute.priceImpact || 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-dark-400">Minimum Received</span>
                      <span className="text-white text-right">
                        {swapQuote.bestRoute.minimumReceived
                          ? formatUnits(swapQuote.bestRoute.minimumReceived, toToken.decimals)
                          : '0'
                        } {toToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Network Fee</span>
                      <span className="text-white">
                        ~{swapQuote.bestRoute.gasEstimate
                          ? formatUnits(swapQuote.bestRoute.gasEstimate, 18)
                          : '0'
                        } ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-dark-400">Route</span>
                      <span className="text-hyperliquid-400 text-right">
                        {swapQuote.bestRoute.path?.join(' → ') || 'Direct'}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Progress Indicator */}
            {swapProgress !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-hyperliquid-500/10 border border-hyperliquid-500/30 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  {swapProgress === 'success' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </motion.div>
                  ) : (
                    <LoadingSpinner size="sm" />
                  )}
                  <div className="flex-1">
                    <div className="text-hyperliquid-400 font-medium text-sm">
                      {swapProgress === 'validating' && 'Step 1/3: Validating Parameters'}
                      {swapProgress === 'submitting' && 'Step 2/3: Submitting Transaction'}
                      {swapProgress === 'confirming' && 'Step 3/3: Confirming on Blockchain'}
                      {swapProgress === 'success' && '✅ Swap Completed Successfully!'}
                    </div>
                    <div className="text-xs text-dark-400 mt-1">
                      {swapProgress === 'validating' && 'Checking balances, slippage, and quote validity...'}
                      {swapProgress === 'submitting' && 'Please confirm the transaction in your wallet...'}
                      {swapProgress === 'confirming' && 'Waiting for blockchain confirmation...'}
                      {swapProgress === 'success' && 'Your tokens have been successfully swapped!'}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 bg-dark-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: swapProgress === 'validating' ? '33%' :
                             swapProgress === 'submitting' ? '66%' :
                             swapProgress === 'confirming' ? '100%' :
                             swapProgress === 'success' ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.3 }}
                    className={`h-full rounded-full ${
                      swapProgress === 'success'
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : 'bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-400'
                    }`}
                  />
                </div>
              </motion.div>
            )}

            {/* Swap/Approve Button */}
            {!isConnected ? (
              <div className="w-full py-4 rounded-xl font-semibold text-lg bg-dark-700 text-dark-400 text-center">
                Connect Wallet to Swap
              </div>
            ) : needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000' ? (
              <LoadingButton
                onClick={handleApprove}
                isLoading={isApproving}
                disabled={!fromAmount}
                className="w-full bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-600 hover:from-hyperliquid-400 hover:to-hyperliquid-500 disabled:from-dark-600 disabled:to-dark-600 disabled:cursor-not-allowed text-sm sm:text-base py-3 sm:py-4"
              >
                {isApproving ? 'Approving...' : `Approve ${fromToken.symbol}`}
              </LoadingButton>
            ) : (
              <LoadingButton
                onClick={handleSwap}
                isLoading={swapProgress !== 'idle'}
                disabled={!fromAmount || !toAmount || swapQuote.isLoading ||
                  (fromBalance.data && parseFloat(fromAmount) > parseFloat(formatUnits(fromBalance.data.value, fromBalance.data.decimals))) ||
                  swapProgress !== 'idle'}
                className="w-full bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-600 hover:from-hyperliquid-400 hover:to-hyperliquid-500 disabled:from-dark-600 disabled:to-dark-600 disabled:cursor-not-allowed text-sm sm:text-base py-3 sm:py-4"
              >
                {!fromAmount || !toAmount ? (
                  'Enter Amount'
                ) : swapQuote.isLoading ? (
                  'Loading...'
                ) : fromBalance.data && parseFloat(fromAmount) > parseFloat(formatUnits(fromBalance.data.value, fromBalance.data.decimals)) ? (
                  'Insufficient Balance'
                ) : swapProgress === 'validating' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Validating swap parameters...</span>
                  </div>
                ) : swapProgress === 'submitting' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Submitting transaction...</span>
                  </div>
                ) : swapProgress === 'confirming' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Confirming on blockchain...</span>
                  </div>
                ) : swapProgress === 'success' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span>Swap Successful!</span>
                  </div>
                ) : (
                  <span className="truncate">Swap {fromToken.symbol} for {toToken.symbol}</span>
                )}
              </LoadingButton>
            )}

            {/* Warnings */}
            {swapQuote.bestRoute?.priceImpact && swapQuote.bestRoute.priceImpact > 0.5 && (
              <div className="mt-3 sm:mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">High Price Impact</span>
                </div>
                <p className="text-yellow-300 text-xs sm:text-sm mt-1">
                  This swap has a price impact of {swapQuote.bestRoute.priceImpact.toFixed(2)}%. Consider breaking it into smaller trades.
                </p>
              </div>
            )}
          </motion.div>

          {/* Route Comparison */}
          {swapQuote.routes.length > 1 && fromAmount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Available Routes</h3>
              <div className="space-y-2 sm:space-y-3">
                {swapQuote.routes.map((route, index) => (
                  <div
                    key={index}
                    className={`w-full p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                      swapQuote.bestRoute === route
                        ? 'border-hyperliquid-500/50 bg-hyperliquid-500/10'
                        : 'border-dark-600/30 bg-dark-700/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="text-left">
                        <div className="text-white font-medium text-sm sm:text-base">
                          {route.path?.join(' → ') || 'Direct'}
                        </div>
                        <div className="text-xs sm:text-sm text-dark-400">
                          Gas: ~{route.gasEstimate ? formatUnits(route.gasEstimate, 18) : '0'} ETH
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-white font-medium text-sm sm:text-base">
                          {route.amountOut ? formatUnits(route.amountOut, toToken.decimals) : '0'} {toToken.symbol}
                        </div>
                        <div className={`text-xs sm:text-sm ${getPriceImpactColor(route.priceImpact || 0)}`}>
                          {(route.priceImpact || 0).toFixed(2)}% impact
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent Swaps */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 sm:mt-8"
          >
            <RecentSwaps userAddress={address} />
          </motion.div>
        )}

        {/* Info Cards */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="feature-card p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <FireIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-white">Best Rates</h3>
            </div>
            <p className="text-dark-300 text-sm sm:text-base">
              Our smart routing algorithm finds the best exchange rates across multiple DEXs to maximize your returns.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="feature-card p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-white">Secure Trading</h3>
            </div>
            <p className="text-dark-300 text-sm sm:text-base">
              All swaps are executed through audited smart contracts with built-in slippage protection and MEV resistance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="feature-card p-4 sm:p-6 sm:col-span-2 md:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <InformationCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-white">Low Fees</h3>
            </div>
            <p className="text-dark-300 text-sm sm:text-base">
              Enjoy competitive trading fees with additional discounts for HYPE token holders and staked NFT owners.
            </p>
          </motion.div>
        </div>
        </div>
      </LoadingOverlay>
    </div>
  );
}