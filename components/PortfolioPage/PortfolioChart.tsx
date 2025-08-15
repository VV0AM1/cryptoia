"use client";
import { useTransactions } from "@/hooks/useTransactions";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function PortfolioChart({ initial }: { initial?: any[] }) {
  const { transactions, loading } = useTransactions();
  const rows = loading && initial?.length ? initial : transactions;

  const chartData = useMemo(() => {
    const sorted = [...rows].sort(
      (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const labels: string[] = [];
    const data: number[] = [];
    let cumulativeTotal = 0;
    sorted.forEach((tx: any) => {
      const dateObj = new Date(tx.timestamp);
      if (isNaN(dateObj.getTime())) return;
      const formatted = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      cumulativeTotal += tx.type === "sell" ? -tx.total : tx.total;
      labels.push(formatted);
      data.push(Number(cumulativeTotal.toFixed(2)));
    });
    return {
      labels,
      datasets: [{ label: "Portfolio Value", data, fill: false, borderColor: "rgb(34, 197, 94)", tension: 0.3 }],
    };
  }, [rows]);

  return (
    <div className="bg-zinc-800 p-6 rounded-xl text-white w-full">
      <h2 className="text-lg font-semibold mb-2">Portfolio Chart</h2>
      <div className="h-64 w-full">
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } },
          scales: { x: { ticks: { color: "#a1a1aa" } }, y: { ticks: { color: "#a1a1aa" } } } }} />
      </div>
    </div>
  );
}