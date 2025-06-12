import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { storeUrl, consumerKey, consumerSecret, endpoint, method, body } =
    req.body || {};

  if (!storeUrl || !consumerKey || !consumerSecret || !endpoint) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const url = `${String(storeUrl).replace(/\/$/, '')}/wp-json/wc/v3${endpoint}`;

  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    res
      .status(response.status)
      .setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
      .send(text);
  } catch (err: any) {
    console.error('WooCommerce proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed', detail: err.message });
  }
}
