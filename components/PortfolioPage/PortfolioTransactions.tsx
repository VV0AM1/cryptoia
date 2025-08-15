"use client";
import { useTransactions } from "@/hooks/useTransactions";

export default function PortfolioTransactions({
  initial,
}: { initial?: any[] }) {
  const { transactions, loading } = useTransactions();
  const rows = loading && initial?.length ? initial : transactions;

  return (
    <div className="bg-zinc-800 p-6 rounded-xl text-white">
      <h2 className="text-lg font-semibold mb-4">Transactions</h2>
      {loading && !initial ? (
        <div className="text-zinc-400">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="text-zinc-400">No transactions yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="text-left px-2 py-2">Date</th>
              <th className="text-left px-2">Type</th>
              <th className="text-left px-2">Symbol</th>
              <th className="text-right px-2">Quantity</th>
              <th className="text-right px-2">Price</th>
              <th className="text-right px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx: any) => (
              <tr key={tx._id} className="border-t border-zinc-700">
                <td className="px-2 py-2">
                  {tx.timestamp
                    ? new Date(tx.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : "N/A"}
                </td>
                <td className="px-2">{tx.type?.toUpperCase?.() ?? tx.type}</td>
                <td className="px-2">{tx.symbol}</td>
                <td className="text-right px-2">{tx.quantity}</td>
                <td className="text-right px-2">${Number(tx.price).toFixed(4)}</td>
                <td className="text-right px-2">${Number(tx.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}