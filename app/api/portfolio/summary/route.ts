import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import axios from 'axios';
import rawSymbolMap from '@/data/symbolMap.json';


export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.email) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: token.email }).lean();

    if (!user?.coins?.length) {
      return Response.json({
        totalCurrentValue: 0,
        totalProfit: 0,
        percentageChange24h: 0,
      });
    }

    const ids = user.coins
      .map((coin) => coin.coinId)
      .filter(Boolean);

    if (!ids.length) {
      return Response.json({
        totalCurrentValue: 0,
        totalProfit: 0,
        percentageChange24h: 0,
      });
    }

    const { data: priceData } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: ids.join(','),
          vs_currencies: 'usd',
          include_24hr_change: 'true',
        },
      }
    );

    let totalInvested = 0;
    let totalCurrentValue = 0;

    user.coins.forEach((coin) => {
      const current = priceData[coin.coinId];
      if (!current) return;

      const currentPrice = current.usd;
      const investedValue = coin.averagePrice * coin.quantity;
      const currentValue = currentPrice * coin.quantity;

      totalInvested += investedValue;
      totalCurrentValue += currentValue;
    });

    const totalProfit = totalCurrentValue - totalInvested;
    const percentageChange24h =
      totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;

    return Response.json({
      totalCurrentValue: +totalCurrentValue.toFixed(2),
      totalProfit: +totalProfit.toFixed(2),
      percentageChange24h: +percentageChange24h.toFixed(2),
    });
  } catch (error) {
    console.error('[Portfolio Summary Error]', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  }
}
