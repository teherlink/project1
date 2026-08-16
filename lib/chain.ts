import { config } from './config';

export async function getChainBalance(address: string) {
  const rpcUrl = config.alchemyPolygonAmoyUrl;
  if (!rpcUrl) {
    throw new Error('ALCHEMY_POLYGON_AMOY_URL is not configured');
  }

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBalance',
      params: [address, 'latest'],
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to fetch chain balance');
  }

  return BigInt(data.result);
}

export function formatEther(balance: bigint) {
  const unit = 10n ** 18n;
  const whole = balance / unit;
  const remainder = balance % unit;
  const remainderString = remainder.toString().padStart(18, '0').slice(0, 6);
  const formatted = remainderString === '000000'
    ? whole.toString()
    : `${whole.toString()}.${remainderString}`;
  return formatted;
}
