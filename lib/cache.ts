let cache: {
  data: any;
  timestamp: number;
} | null = null;

export async function getCachedAssets(fetchFn: () => Promise<any>, ttl: number = 30000) {
  const now = Date.now();

  if (cache && now - cache.timestamp < ttl) {
    return cache.data;
  }

  const freshData = await fetchFn();
  cache = {
    data: freshData,
    timestamp: now,
  };

  return freshData;
}