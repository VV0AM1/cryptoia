'use client';

import { useEffect, useState, useCallback } from 'react';

export function usePortfolioSummary() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalCurrentValue: number;
    totalProfit: number;
    percentageChange24h: number;
  }>({
    totalCurrentValue: 0,
    totalProfit: 0,
    percentageChange24h: 0,
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio/summary', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Portfolio fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(); 
  }, [refetch]);

  return { summary, loading, refetch };
}