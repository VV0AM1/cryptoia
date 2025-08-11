export async function getMarketStatsFromCache() {
  const res = await fetch('/marketStats.json');
  if (!res.ok) throw new Error('Failed to load cached stats');
  return res.json();
}