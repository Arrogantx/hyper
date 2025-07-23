import { parseUnits, formatUnits, Address } from 'viem';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useReadContract } from 'wagmi';
import soundEngine from '@/utils/sound';

// HyperEVM Chain ID
export const HYPEREVM_CHAIN_ID = 999;

// Token definitions for HyperEVM
export const TOKENS = {
  HYPE: new Token(
    HYPEREVM_CHAIN_ID,
    '0x0000000000000000000000000000000000000000', // Native token address
    18,
    'HYPE',
    'Hyperliquid'
  ),
  USDC: new Token(
    HYPEREVM_CHAIN_ID,
    '0xA0b86a33E6441E6C673C5323C774C8e4b8b8e8e8', // Example USDC address
    6,
    'USDC',
    'USD Coin'
  ),
  WETH: new Token(
    HYPEREVM_CHAIN_ID,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Example WETH address
    18,
    'WETH',
    'Wrapped Ether'
  ),
  WBTC: new Token(
    HYPEREVM_CHAIN_ID,
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Example WBTC address
    8,
    'WBTC',
    'Wrapped Bitcoin'
  ),
  LINK: new Token(
    HYPEREVM_CHAIN_ID,
    '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Example LINK address
    18,
    'LINK',
    'Chainlink'
  )
};

export interface SwapToken {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  address: Address;
  decimals: number;
  token: Token;
}

export const SWAP_TOKENS: SwapToken[] = [
  {
    id: 'hype',
    symbol: 'HYPE',
    name: 'Hyperliquid',
    icon: '🔥',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    token: TOKENS.HYPE
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    address: '0xA0b86a33E6441E6C673C5323C774C8e4b8b8e8e8',
    decimals: 6,
    token: TOKENS.USDC
  },
  {
    id: 'weth',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    icon: '⟠',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    token: TOKENS.WETH
  },
  {
    id: 'wbtc',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    icon: '₿',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    token: TOKENS.WBTC
  },
  {
    id: 'link',
    symbol: 'LINK',
    name: 'Chainlink',
    icon: '🔗',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    decimals: 18,
    token: TOKENS.LINK
  }
];

// ERC20 ABI for token operations
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

// Simple DEX Router ABI (simplified for demo)
export const DEX_ROUTER_ABI = [
  {
    name: 'swapExactTokensForTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'swapExactETHForTokens',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'swapExactTokensForETH',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'getAmountsOut',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  }
] as const;

// Example DEX Router address (would be the actual HyperEVM DEX router)
export const DEX_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as Address;

export interface SwapRoute {
  id: string;
  path: Address[];
  pathSymbols: string[];
  gasEstimate: bigint;
  priceImpact: number;
  minimumReceived: bigint;
  exchangeRate: number;
  amountOut: bigint;
}

export interface SwapQuote {
  routes: SwapRoute[];
  bestRoute: SwapRoute;
  isLoading: boolean;
  error: string | null;
  timestamp?: number;
}

export interface SwapError {
  code: string;
  message: string;
  details?: any;
}

export const SWAP_ERROR_CODES = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE: 'INSUFFICIENT_ALLOWANCE',
  SLIPPAGE_TOO_HIGH: 'SLIPPAGE_TOO_HIGH',
  PRICE_IMPACT_TOO_HIGH: 'PRICE_IMPACT_TOO_HIGH',
  NETWORK_ERROR: 'NETWORK_ERROR',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
} as const;

// Calculate swap quote with improved error handling and validation
export const calculateSwapQuote = async (
  fromToken: SwapToken,
  toToken: SwapToken,
  amountIn: string,
  publicClient: any
): Promise<SwapQuote> => {
  try {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      return {
        routes: [],
        bestRoute: {} as SwapRoute,
        isLoading: false,
        error: null,
        timestamp: Date.now()
      };
    }

    // Validate input amount
    const amountFloat = parseFloat(amountIn);
    if (amountFloat <= 0 || isNaN(amountFloat)) {
      throw new Error('Invalid amount');
    }

    const amountInWei = parseUnits(amountIn, fromToken.decimals);
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enhanced mock implementation with better price calculations
    let mockExchangeRate: number;
    let priceImpact: number;
    
    // More realistic price calculations based on token pairs
    if (fromToken.symbol === 'HYPE' && toToken.symbol === 'USDC') {
      mockExchangeRate = 0.000363; // HYPE to USDC
      priceImpact = Math.min(0.05 + (amountFloat / 10000) * 0.1, 2.0);
    } else if (fromToken.symbol === 'USDC' && toToken.symbol === 'HYPE') {
      mockExchangeRate = 2750; // USDC to HYPE
      priceImpact = Math.min(0.03 + (amountFloat / 1000) * 0.05, 1.5);
    } else if (fromToken.symbol === 'WETH') {
      mockExchangeRate = toToken.symbol === 'USDC' ? 3200 : 8800000;
      priceImpact = Math.min(0.08 + (amountFloat / 5) * 0.1, 3.0);
    } else {
      mockExchangeRate = 1.0;
      priceImpact = Math.min(0.15 + (amountFloat / 100) * 0.2, 5.0);
    }

    // Calculate output amount with slippage consideration
    const baseAmountOut = amountFloat * mockExchangeRate;
    const amountOut = parseUnits(baseAmountOut.toFixed(toToken.decimals), toToken.decimals);
    
    // Calculate gas estimates based on route complexity
    const baseGas = parseUnits('0.002', 18);
    const gasMultiplier = fromToken.address === '0x0000000000000000000000000000000000000000' ||
                         toToken.address === '0x0000000000000000000000000000000000000000' ? 1.2 : 1.5;
    
    const directRoute: SwapRoute = {
      id: 'direct',
      path: [fromToken.address, toToken.address],
      pathSymbols: [fromToken.symbol, toToken.symbol],
      gasEstimate: BigInt(Math.floor(Number(baseGas) * gasMultiplier)),
      priceImpact,
      minimumReceived: amountOut * BigInt(995) / BigInt(1000), // 0.5% slippage
      exchangeRate: mockExchangeRate,
      amountOut
    };

    const routes = [directRoute];

    // Add multi-hop routes for better pricing (if applicable)
    if (fromToken.symbol !== 'USDC' && toToken.symbol !== 'USDC' &&
        fromToken.symbol !== toToken.symbol) {
      const viaUSDCRate = mockExchangeRate * 0.998; // Slightly worse rate for multi-hop
      const viaUSDCAmountOut = parseUnits((amountFloat * viaUSDCRate).toFixed(toToken.decimals), toToken.decimals);
      
      const usdcRoute: SwapRoute = {
        id: 'via-usdc',
        path: [fromToken.address, TOKENS.USDC.address as Address, toToken.address],
        pathSymbols: [fromToken.symbol, 'USDC', toToken.symbol],
        gasEstimate: BigInt(Math.floor(Number(baseGas) * 1.8)), // Higher gas for multi-hop
        priceImpact: priceImpact * 0.8, // Better price impact for multi-hop
        minimumReceived: viaUSDCAmountOut * BigInt(992) / BigInt(1000), // 0.8% slippage
        exchangeRate: viaUSDCRate,
        amountOut: viaUSDCAmountOut
      };
      
      routes.push(usdcRoute);
    }

    // Sort routes by best output amount
    routes.sort((a, b) => Number(b.amountOut - a.amountOut));

    return {
      routes,
      bestRoute: routes[0],
      isLoading: false,
      error: null,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Swap quote calculation error:', error);
    return {
      routes: [],
      bestRoute: {} as SwapRoute,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to calculate swap quote',
      timestamp: Date.now()
    };
  }
};

// Check if quote is expired (5 minutes)
export const isQuoteExpired = (quote: SwapQuote): boolean => {
  if (!quote.timestamp) return false;
  return Date.now() - quote.timestamp > 5 * 60 * 1000;
};

// Hook for token balance
export const useTokenBalance = (token: SwapToken, address?: Address) => {
  const isNative = token.address === '0x0000000000000000000000000000000000000000';
  
  const nativeBalance = useBalance({
    address,
    query: { enabled: isNative && !!address }
  });

  const tokenBalance = useBalance({
    address,
    token: isNative ? undefined : token.address,
    query: { enabled: !isNative && !!address }
  });

  return isNative ? nativeBalance : tokenBalance;
};

// Hook for checking token allowance
export const useTokenAllowance = (tokenAddress: Address, owner?: Address, spender?: Address) => {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!(tokenAddress && owner && spender && tokenAddress !== '0x0000000000000000000000000000000000000000'),
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });
};

// Hook for token approval with enhanced error handling
export const useTokenApproval = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const approve = async (tokenAddress: Address, spenderAddress: Address, amount: bigint) => {
    try {
      // Play sound effect
      soundEngine.playClick();
      
      return await writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, amount]
      });
    } catch (err) {
      console.error('Approval error:', err);
      soundEngine.playError();
      throw err;
    }
  };

  return {
    approve,
    hash,
    isPending,
    error
  };
};

// Hook for executing swaps with enhanced error handling and validation
export const useSwap = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const executeSwap = async (
    route: SwapRoute,
    fromToken: SwapToken,
    toToken: SwapToken,
    amountIn: bigint,
    userAddress: Address,
    slippagePercent: number = 0.5,
    quote?: SwapQuote
  ) => {
    try {
      // Validate quote expiration
      if (quote && isQuoteExpired(quote)) {
        throw new Error('Quote has expired. Please refresh and try again.');
      }

      // Validate slippage
      if (slippagePercent < 0.1 || slippagePercent > 50) {
        throw new Error('Invalid slippage tolerance');
      }

      // Validate price impact
      if (route.priceImpact > 15) {
        throw new Error('Price impact too high. Consider reducing trade size.');
      }

      // Play sound effect
      soundEngine.playClick();

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 minutes
      const amountOutMin = route.amountOut * BigInt(Math.floor((100 - slippagePercent) * 100)) / BigInt(10000);

      let result;

      // Handle native token swaps
      if (fromToken.address === '0x0000000000000000000000000000000000000000') {
        // Swapping from native token (HYPE)
        result = await writeContract({
          address: DEX_ROUTER_ADDRESS,
          abi: DEX_ROUTER_ABI,
          functionName: 'swapExactETHForTokens',
          args: [amountOutMin, route.path, userAddress, deadline],
          value: amountIn
        });
      } else if (toToken.address === '0x0000000000000000000000000000000000000000') {
        // Swapping to native token (HYPE)
        result = await writeContract({
          address: DEX_ROUTER_ADDRESS,
          abi: DEX_ROUTER_ABI,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, amountOutMin, route.path, userAddress, deadline]
        });
      } else {
        // Token to token swap
        result = await writeContract({
          address: DEX_ROUTER_ADDRESS,
          abi: DEX_ROUTER_ABI,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, amountOutMin, route.path, userAddress, deadline]
        });
      }

      return result;
    } catch (err) {
      console.error('Swap execution error:', err);
      soundEngine.playError();
      throw err;
    }
  };

  return {
    executeSwap,
    hash,
    isPending,
    error
  };
};

// Utility function to validate swap parameters
export const validateSwapParams = (
  fromToken: SwapToken,
  toToken: SwapToken,
  amount: string,
  balance?: bigint
): SwapError | null => {
  if (!amount || parseFloat(amount) <= 0) {
    return {
      code: SWAP_ERROR_CODES.INSUFFICIENT_BALANCE,
      message: 'Please enter a valid amount'
    };
  }

  if (balance) {
    const amountWei = parseUnits(amount, fromToken.decimals);
    if (amountWei > balance) {
      return {
        code: SWAP_ERROR_CODES.INSUFFICIENT_BALANCE,
        message: `Insufficient ${fromToken.symbol} balance`
      };
    }
  }

  if (fromToken.id === toToken.id) {
    return {
      code: SWAP_ERROR_CODES.NETWORK_ERROR,
      message: 'Cannot swap token to itself'
    };
  }

  return null;
};

// Format swap error for display
export const formatSwapError = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error?.message) {
    // Handle common error patterns
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('user rejected')) {
      return 'Transaction was rejected';
    }
    if (error.message.includes('slippage')) {
      return 'Transaction failed due to slippage. Try increasing slippage tolerance.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
};