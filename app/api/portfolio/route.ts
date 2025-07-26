import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.email) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: token.email }).lean();

    if (!user?.coins || user.coins.length === 0) {
      return Response.json({
        totalCurrentValue: 0,
        totalProfit: 0,
        percentageChange24h: 0,
      });
    }

    const coinSymbols = user.coins.map((c: any) => c.symbol.toLowerCase());

    const { data: marketData } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: coinSymbols.join(','),
          vs_currencies: 'usd',
          include_24hr_change: 'true',
        },
      }
    );

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalProfit = 0;

    for (const coin of user.coins) {
      const symbol = coin.symbol.toLowerCase();
      const live = marketData[symbol];
      if (!live) continue;

      const currentValue = live.usd * coin.quantity;
      const investedValue = coin.averagePrice * coin.quantity;
      const profit = currentValue - investedValue;

      totalCurrentValue += currentValue;
      totalInvested += investedValue;
      totalProfit += profit;
    }

    const percentageChange24h =
      totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;

    return Response.json({
      totalCurrentValue,
      totalProfit,
      percentageChange24h,
    });
  } catch (error) {
    console.error('[Portfolio Summary Error]', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  }
}