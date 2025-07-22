'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  CogIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { LoadingOverlay, LoadingButton } from '@/components/ui/LoadingStates';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useToast, useSuccessToast, useErrorToast } from '@/components/ui/Toast';

interface Token {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  price: number;
  change24h: number;
  address: string;
  decimals: number;
}

interface SwapRoute {
  id: string;
  path: string[];
  gasEstimate: number;
  priceImpact: number;
  minimumReceived: number;
  exchangeRate: number;
}

const tokens: Token[] = [
  {
    id: 'hype',
    symbol: 'HYPE',
    name: 'Hypercatz Token',
    icon: '🔥',
    balance: 1250.75,
    price: 0.85,
    change24h: 12.5,
    address: '0x1234...5678',
    decimals: 18
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '⟠',
    balance: 2.45,
    price: 2340.50,
    change24h: -2.1,
    address: '0x0000...0000',
    decimals: 18
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    balance: 5420.00,
    price: 1.00,
    change24h: 0.1,
    address: '0xA0b8...6E2F',
    decimals: 6
  },
  {
    id: 'wbtc',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    icon: '₿',
    balance: 0.125,
    price: 43250.00,
    change24h: 3.8,
    address: '0x2260...FAC5',
    decimals: 8
  },
  {
    id: 'link',
    symbol: 'LINK',
    name: 'Chainlink',
    icon: '🔗',
    balance: 89.5,
    price: 14.75,
    change24h: -1.2,
    address: '0x514...910',
    decimals: 18
  }
];

const swapRoutes: SwapRoute[] = [
  {
    id: 'direct',
    path: ['HYPE', 'ETH'],
    gasEstimate: 0.0025,
    priceImpact: 0.12,
    minimumReceived: 0.00036,
    exchangeRate: 0.000363
  },
  {
    id: 'via-usdc',
    path: ['HYPE', 'USDC', 'ETH'],
    gasEstimate: 0.0045,
    priceImpact: 0.08,
    minimumReceived: 0.00035,
    exchangeRate: 0.000361
  }
];

export default function SwapPage() {
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute>(swapRoutes[0]);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  // Simulate loading token data
  useEffect(() => {
    const loadTokenData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load token data. Please try again.');
        setIsLoading(false);
      }
    };

    loadTokenData();
  }, []);

  // Simulate route calculation when tokens or amounts change
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const calculateRoutes = async () => {
        try {
          setIsLoadingRoutes(true);
          // Simulate route calculation
          await new Promise(resolve => setTimeout(resolve, 800));
          setIsLoadingRoutes(false);
        } catch (err) {
          setIsLoadingRoutes(false);
        }
      };
      calculateRoutes();
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    try {
      setIsSwapping(true);
      setError(null);
      
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      showSuccess(`Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!`);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
    } catch (err) {
      showError('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const retryLoadData = () => {
    setError(null);
    setIsLoading(true);
    // Simulate retry
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
    if (value && !isNaN(Number(value))) {
      const calculatedTo = (Number(value) * selectedRoute.exchangeRate).toFixed(6);
      setToAmount(calculatedTo);
    } else {
      setToAmount('');
    }
  };

  const handleMaxClick = () => {
    const maxAmount = fromToken.balance.toString();
    handleFromAmountChange(maxAmount);
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 0.1) return 'text-green-400';
    if (impact < 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const TokenSelector = ({ 
    token, 
    isOpen, 
    onToggle, 
    onSelect, 
    excludeToken 
  }: {
    token: Token;
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (token: Token) => void;
    excludeToken?: Token;
  }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 sm:space-x-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl p-2 sm:p-3 transition-all duration-200 border border-gray-600/30 hover:border-cyan-500/30 min-w-0"
      >
        <span className="text-xl sm:text-2xl">{token.icon}</span>
        <div className="text-left min-w-0 flex-1">
          <div className="font-semibold text-white text-sm sm:text-base truncate">{token.symbol}</div>
          <div className="text-xs text-gray-400 truncate hidden sm:block">{token.name}</div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl border border-cyan-500/20 shadow-xl z-50 max-h-60 sm:max-h-80 overflow-y-auto"
        >
          {tokens
            .filter(t => t.id !== excludeToken?.id)
            .map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelect(t);
                  onToggle();
                }}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{t.icon}</span>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-semibold text-white text-sm sm:text-base truncate">{t.symbol}</div>
                    <div className="text-xs text-gray-400 truncate">{t.name}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-medium text-sm sm:text-base">{t.balance.toFixed(4)}</div>
                  <div className={`text-xs ${getChangeColor(t.change24h)}`}>
                    {t.change24h > 0 ? '+' : ''}{t.change24h.toFixed(1)}%
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <ErrorDisplay error={error} onRetry={retryLoadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20">
      <LoadingOverlay isLoading={isLoading}>
        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-4">
              Hypercatz Swap
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2">
              Trade tokens instantly with the best rates and lowest fees in the Hypercatz ecosystem
            </p>
          </motion.div>

        <div className="max-w-lg mx-auto">
          {/* Swap Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-4 sm:p-6 mb-4 sm:mb-6"
          >
            {/* Settings Button */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Swap Tokens</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              >
                <CogIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                  <span className="text-gray-300 text-sm sm:text-base">Slippage Tolerance</span>
                  <div className="flex space-x-2">
                    {[0.1, 0.5, 1.0].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          slippage === value
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </div>
              </motion.div>
            )}

            {/* From Token */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">From</label>
                <span className="text-xs text-gray-400">
                  Balance: {fromToken.balance.toFixed(4)} {fromToken.symbol}
                </span>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-3 sm:p-4 border border-gray-600/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-xl sm:text-2xl font-semibold text-white placeholder-gray-500 outline-none flex-1 sm:mr-4"
                  />
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <button
                      onClick={handleMaxClick}
                      className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-md hover:bg-cyan-500/30 transition-colors"
                    >
                      MAX
                    </button>
                    <TokenSelector
                      token={fromToken}
                      isOpen={showFromTokens}
                      onToggle={() => setShowFromTokens(!showFromTokens)}
                      onSelect={setFromToken}
                      excludeToken={toToken}
                    />
                  </div>
                </div>
                {fromAmount && (
                  <div className="text-sm text-gray-400 mt-2">
                    ≈ ${(Number(fromAmount) * fromToken.price).toFixed(2)} USD
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={handleSwapTokens}
                className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all duration-200 border border-gray-600/30 hover:border-cyan-500/30"
              >
                <ArrowsUpDownIcon className="w-6 h-6 text-cyan-400" />
              </button>
            </div>

            {/* To Token */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">To</label>
                <span className="text-xs text-gray-400">
                  Balance: {toToken.balance.toFixed(4)} {toToken.symbol}
                </span>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-3 sm:p-4 border border-gray-600/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="bg-transparent text-xl sm:text-2xl font-semibold text-white placeholder-gray-500 outline-none flex-1 sm:mr-4"
                  />
                  <div className="flex justify-end">
                    <TokenSelector
                      token={toToken}
                      isOpen={showToTokens}
                      onToggle={() => setShowToTokens(!showToTokens)}
                      onSelect={setToToken}
                      excludeToken={fromToken}
                    />
                  </div>
                </div>
                {toAmount && (
                  <div className="text-sm text-gray-400 mt-2">
                    ≈ ${(Number(toAmount) * toToken.price).toFixed(2)} USD
                  </div>
                )}
              </div>
            </div>

            {/* Swap Details */}
            {fromAmount && toAmount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
              >
                {isLoadingRoutes ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-gray-400 text-sm">Calculating best route...</span>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400">Exchange Rate</span>
                      <span className="text-white text-right">
                        1 {fromToken.symbol} = {selectedRoute.exchangeRate.toFixed(6)} {toToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price Impact</span>
                      <span className={getPriceImpactColor(selectedRoute.priceImpact)}>
                        {selectedRoute.priceImpact.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400">Minimum Received</span>
                      <span className="text-white text-right">
                        {selectedRoute.minimumReceived.toFixed(6)} {toToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network Fee</span>
                      <span className="text-white">
                        ~{selectedRoute.gasEstimate.toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400">Route</span>
                      <span className="text-cyan-400 text-right">
                        {selectedRoute.path.join(' → ')}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Swap Button */}
            <LoadingButton
              onClick={handleSwap}
              isLoading={isSwapping}
              disabled={!fromAmount || !toAmount || Number(fromAmount) > fromToken.balance}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-sm sm:text-base py-3 sm:py-4"
            >
              {!fromAmount || !toAmount ? (
                'Enter Amount'
              ) : Number(fromAmount) > fromToken.balance ? (
                'Insufficient Balance'
              ) : (
                <span className="truncate">Swap {fromToken.symbol} for {toToken.symbol}</span>
              )}
            </LoadingButton>

            {/* Warnings */}
            {selectedRoute.priceImpact > 0.5 && (
              <div className="mt-3 sm:mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">High Price Impact</span>
                </div>
                <p className="text-yellow-300 text-xs sm:text-sm mt-1">
                  This swap has a price impact of {selectedRoute.priceImpact.toFixed(2)}%. Consider breaking it into smaller trades.
                </p>
              </div>
            )}
          </motion.div>

          {/* Route Comparison */}
          {swapRoutes.length > 1 && fromAmount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-4 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Available Routes</h3>
              <div className="space-y-2 sm:space-y-3">
                {swapRoutes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`w-full p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                      selectedRoute.id === route.id
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-gray-600/30 bg-gray-700/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="text-left">
                        <div className="text-white font-medium text-sm sm:text-base">
                          {route.path.join(' → ')}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          Gas: ~{route.gasEstimate.toFixed(4)} ETH
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-white font-medium text-sm sm:text-base">
                          {(Number(fromAmount) * route.exchangeRate).toFixed(6)} {toToken.symbol}
                        </div>
                        <div className={`text-xs sm:text-sm ${getPriceImpactColor(route.priceImpact)}`}>
                          {route.priceImpact.toFixed(2)}% impact
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Info Cards */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <FireIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-white">Best Rates</h3>
            </div>
            <p className="text-gray-300 text-sm sm:text-base">
              Our smart routing algorithm finds the best exchange rates across multiple DEXs to maximize your returns.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-white">Secure Trading</h3>
            </div>
            <p className="text-gray-300 text-sm sm:text-base">
              All swaps are executed through audited smart contracts with built-in slippage protection and MEV resistance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 sm:p-6 sm:col-span-2 md:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <InformationCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-white">Low Fees</h3>
            </div>
            <p className="text-gray-300 text-sm sm:text-base">
              Enjoy competitive trading fees with additional discounts for HYPE token holders and staked NFT owners.
            </p>
          </motion.div>
        </div>
        </div>
      </LoadingOverlay>
    </div>
  );
}