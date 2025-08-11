'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function PortfolioChart() {
  const { transactions, loading } = useTransactions();

  const chartData = useMemo(() => {
    const sorted = [...transactions].sort(
      (a: any, b: any) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const labels: string[] = [];
    const data: number[] = [];

    let cumulativeTotal = 0;

    sorted.forEach((tx: any) => {
      const dateObj = new Date(tx.timestamp);
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid timestamp:', tx.timestamp);
        return;
      }

      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      cumulativeTotal += tx.type === 'sell' ? -tx.total : tx.total;

      labels.push(formattedDate);
      data.push(Number(cumulativeTotal.toFixed(2)));
    });

    return {
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data,
          fill: false,
          borderColor: 'rgb(34, 197, 94)',
          tension: 0.3,
        },
      ],
    };
  }, [transactions]);

  if (loading) {
    return (
      <div className="bg-zinc-800 p-6 rounded-xl text-white">
        <h2 className="text-lg font-semibold mb-2">Portfolio Chart</h2>
        <div className="h-64 bg-zinc-700 rounded-lg flex items-center justify-center">
          <span className="text-zinc-400">Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 p-6 rounded-xl text-white w-full">
      <h2 className="text-lg font-semibold mb-2">Portfolio Chart</h2>
      <div className="h-64 w-full">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: { ticks: { color: '#a1a1aa' } },
              y: { ticks: { color: '#a1a1aa' } },
            },
          }}
        />
      </div>
    </div>
  );
}