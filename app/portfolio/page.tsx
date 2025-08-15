import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import PortfolioPage from "@/components/PortfolioPage";

export const revalidate = 0; 

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email })
    .select("coins transactions totalInvested totalCurrentValue totalProfit")
    .lean();

  const summary = {
    totalCurrentValue: Number(user?.totalCurrentValue ?? 0),
    totalProfit: Number(user?.totalProfit ?? 0),
    percentageChange24h: 0, 
  };

  const coins = (user?.coins ?? []).map((c: any) => ({
    symbol: c.symbol,
    name: c.name,
    image: c.image,
    currentPrice: Number(c.currentPrice ?? 0),
    priceChangePercentage24h: Number(c.priceChangePercentage24h ?? 0),
    totalInvested: Number(c.totalInvested ?? 0),
    averagePrice: Number(c.averagePrice ?? 0),
    quantity: Number(c.quantity ?? 0),
  }));

  const transactions = (user?.transactions ?? [])
    .slice(-25)
    .reverse()
    .map((t: any) => ({
      _id: String(t._id ?? ""),
      type: t.type,
      symbol: t.symbol,
      price: Number(t.price ?? 0),
      quantity: Number(t.quantity ?? 0),
      total: Number(t.total ?? 0),
      timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : null,
    }));

  return (
    <div className="w-full min-h-screen bg-zinc-900">
        <PortfolioPage
        initialSummary={summary}
        initialCoins={coins}
        initialTransactions={transactions}
        />
    </div>
  );
}