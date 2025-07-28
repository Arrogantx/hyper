// CoinGecko API utilities for HYPE token price data
const COINGECKO_API_KEY = 'CG-k2FbjH5giWo47GR4m9BcYJE3';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const HYPE_TOKEN_ID = 'hyperliquid';

export interface HypePriceData {
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

/**
 * Fetch HYPE token price data from CoinGecko API
 */
export const fetchHypePrice = async (): Promise<HypePriceData> => {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${HYPE_TOKEN_ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      {
        headers: {
          'accept': 'application/json',
          'x-cg-demo-api-key': COINGECKO_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.market_data) {
      throw new Error('Invalid response: missing market data');
    }

    const marketData = data.market_data;

    return {
      current_price: marketData.current_price?.usd || 0,
      market_cap: marketData.market_cap?.usd || 0,
      total_volume: marketData.total_volume?.usd || 0,
      price_change_24h: marketData.price_change_24h || 0,
      price_change_percentage_24h: marketData.price_change_percentage_24h || 0,
      market_cap_change_24h: marketData.market_cap_change_24h || 0,
      market_cap_change_percentage_24h: marketData.market_cap_change_percentage_24h || 0,
      circulating_supply: marketData.circulating_supply || 0,
      total_supply: marketData.total_supply || 0,
      max_supply: marketData.max_supply || null,
      ath: marketData.ath?.usd || 0,
      ath_change_percentage: marketData.ath_change_percentage?.usd || 0,
      ath_date: marketData.ath_date?.usd || '',
      atl: marketData.atl?.usd || 0,
      atl_change_percentage: marketData.atl_change_percentage?.usd || 0,
      atl_date: marketData.atl_date?.usd || '',
      last_updated: data.last_updated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching HYPE price:', error);
    throw error;
  }
};

/**
 * Format price with appropriate decimal places
 */
export const formatPrice = (price: number, decimals: number = 2): string => {
  if (price === 0) return '$0.00';
  
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(decimals)}`;
  }
};

/**
 * Format large numbers (market cap, volume) with appropriate suffixes
 */
export const formatLargeNumber = (num: number): string => {
  if (num === 0) return '$0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  } else if (absNum >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (absNum >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (absNum >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
};

/**
 * Format percentage change with appropriate styling
 */
export const formatPercentageChange = (change: number): {
  formatted: string;
  isPositive: boolean;
  color: string;
} => {
  const isPositive = change >= 0;
  const formatted = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
  const color = isPositive ? 'text-green-400' : 'text-red-400';
  
  return {
    formatted,
    isPositive,
    color,
  };
};

/**
 * Get price trend indicator
 */
export const getPriceTrend = (change24h: number): 'up' | 'down' | 'neutral' => {
  if (change24h > 0.1) return 'up';
  if (change24h < -0.1) return 'down';
  return 'neutral';
};

/**
 * Format market cap with appropriate suffix
 */
export const formatMarketCap = (marketCap: number): string => {
  return formatLargeNumber(marketCap);
};

/**
 * Format volume with appropriate suffix
 */
export const formatVolume = (volume: number): string => {
  return formatLargeNumber(volume);
};