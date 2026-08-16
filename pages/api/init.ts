import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
}
