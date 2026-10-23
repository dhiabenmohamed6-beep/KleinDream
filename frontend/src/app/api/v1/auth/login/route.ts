import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHmac, pbkdf2Sync } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_Tj3yVxn2gEko@ep-twilight-grass-b4cebi66-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const JWT_SECRET = process.env.JWT_SECRET ||
  'kleindream-luxury-atelier-secret-key-2026-prod';

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

/**
 * Verify a Django-stored PBKDF2 password hash.
 * Format: pbkdf2_sha256$<iterations>$<salt>$<b64hash>
 */
function verifyDjangoPassword(rawPassword: string, storedHash: string): boolean {
  try {
    if (storedHash.startsWith('pbkdf2_sha256$')) {
      // Split on '$' but only the first 3 delimiters to handle any edge cases
      const firstDollar = storedHash.indexOf('$');
      const rest = storedHash.slice(firstDollar + 1); // "iterations$salt$hash"
      const secondDollar = rest.indexOf('$');
      const thirdPart = rest.slice(secondDollar + 1); // "salt$hash"
      const thirdDollar = thirdPart.indexOf('$');

      const iterations = parseInt(rest.slice(0, secondDollar), 10);
      const salt = thirdPart.slice(0, thirdDollar);
      const storedB64 = thirdPart.slice(thirdDollar + 1);

      if (isNaN(iterations) || !salt || !storedB64) return false;

      // Django uses PBKDF2-HMAC-SHA256 with dklen=32
      const derived = pbkdf2Sync(rawPassword, salt, iterations, 32, 'sha256');
      const computedB64 = derived.toString('base64');

      // Constant-time comparison
      if (computedB64.length !== storedB64.length) return false;
      let diff = 0;
      for (let i = 0; i < computedB64.length; i++) {
        diff |= computedB64.charCodeAt(i) ^ storedB64.charCodeAt(i);
      }
      return diff === 0;
    }

    if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$') || storedHash.startsWith('$2y$')) {
      return bcrypt.compareSync(rawPassword, storedHash);
    }

    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = ((body.email || body.username || '') as string).trim().toLowerCase();
    const password = ((body.password || '') as string);

    if (!identifier || !password) {
      return NextResponse.json({ detail: 'Email and password are required.' }, { status: 400 });
    }

    const db = getPool();

    const { rows } = await db.query(
      `SELECT id, email, username, first_name, last_name, password,
              role, phone, is_active, is_staff, is_superuser,
              date_joined as created_at
       FROM accounts_user
       WHERE LOWER(email) = $1 OR LOWER(username) = $1
       LIMIT 1`,
      [identifier]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ detail: 'Invalid email or password.' }, { status: 401 });
    }

    const passwordValid = verifyDjangoPassword(password, user.password as string);

    if (!passwordValid) {
      return NextResponse.json({ detail: 'Invalid email or password.' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json(
        { detail: 'This account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      phone: user.phone || '',
      is_store_admin: user.role === 'ADMIN' || user.is_superuser,
      is_staff_member: user.is_staff || user.role === 'STAFF',
      is_email_verified: true,
      created_at: user.created_at,
    };

    const access = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const refresh = jwt.sign(
      { user_id: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ access, refresh, user: userPayload });
  } catch (err: any) {
    console.error('[login] Error:', err?.message || err);
    return NextResponse.json(
      { detail: 'Login service error. Please try again.' },
      { status: 503 }
    );
  }
}
