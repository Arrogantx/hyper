'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchHypePrice, HypePriceData } from '@/utils/priceApi';

interface UseHypePriceReturn {
  data: HypePriceData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export const useHypePrice = (refreshInterval: number = 30000): UseHypePriceReturn => {
  const [data, setData] = useState<HypePriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const priceData = await fetchHypePrice();
      setData(priceData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch HYPE price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for automatic refresh
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch
  };
};