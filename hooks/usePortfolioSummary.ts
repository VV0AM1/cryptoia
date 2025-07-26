'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/portfolio/summary');
        if (!res.ok) throw new Error('Failed to fetch portfolio');
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error('Portfolio fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  return { summary, loading };
}