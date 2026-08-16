import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { initDb, query } from './db';
import { config } from './config';

const secretKey: string = config.jwtSecret;

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function createVerificationToken() {
  return uuidv4();
}

export function createJwt(payload: object) {
  return jwt.sign(payload, secretKey, { expiresIn: '7d' });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, secretKey);
}

type WalletAssignment = {
  id: number;
  address: string;
};

export async function assignWalletToUser(userId: number) {
  const res = await query(
    `WITH selected AS (
       SELECT id FROM wallet_pool WHERE status = 'available' LIMIT 1 FOR UPDATE SKIP LOCKED
     )
     UPDATE wallet_pool
     SET status = 'assigned',
         assigned_to_user_id = $1,
         assigned_at = now(),
         updated_at = now()
     FROM selected
     WHERE wallet_pool.id = selected.id
     RETURNING wallet_pool.id, wallet_pool.address`,
    [userId]
  );
  return res.rows[0] as WalletAssignment | undefined;
}

type NewUser = {
  id: number;
  email: string;
  username: string;
  email_verified: boolean;
  wallet_address: string;
  wallet_id: number;
  verification_token: string;
};

export async function createUser(email: string, username: string, password: string, fullName = '', referralCode?: string): Promise<NewUser> {
  await initDb();
  const passwordHash = hashPassword(password);
  const verificationToken = createVerificationToken();

  let referredByUserId: number | null = null;
  if (referralCode) {
    const referrerResult = await query(`SELECT id FROM users WHERE referral_code = $1`, [referralCode]);
    if (referrerResult.rows.length) {
      referredByUserId = referrerResult.rows[0].id;
    }
  }

  const generatedReferralCode = `REF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const res = await query(
    `INSERT INTO users (email, username, full_name, password_hash, verification_token, referral_code, referred_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, username, email_verified`,
    [email, username, fullName, passwordHash, verificationToken, generatedReferralCode, referredByUserId]
  );

  const user = res.rows[0] as { id: number; email: string; username: string; email_verified: boolean } | undefined;
  if (!user) {
    throw new Error('Failed to create user');
  }

  const wallet = await assignWalletToUser(user.id);
  if (!wallet) {
    throw new Error('No wallet addresses available');
  }

  await query(
    `UPDATE users SET assigned_wallet_address = $1, assigned_wallet_id = $2, wallet_address = $1 WHERE id = $3`,
    [wallet.address, wallet.id, user.id]
  );

  const walletRes = await query(
    `INSERT INTO wallets (user_id, currency, balance, locked_balance)
     VALUES ($1, 'USDT', 0, 0)
     RETURNING id`,
    [user.id]
  );
  const walletId = walletRes.rows[0]?.id;

  return { ...user, wallet_address: wallet.address, verification_token: verificationToken, wallet_id: walletId };
}
