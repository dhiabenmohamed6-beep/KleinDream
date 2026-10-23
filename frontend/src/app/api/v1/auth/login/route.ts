import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_Tj3yVxn2gEko@ep-twilight-grass-b4cebi66-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const JWT_SECRET = process.env.JWT_SECRET || process.env.DJANGO_SECRET_KEY ||
  'kleindream-luxury-atelier-secret-key-2026-prod';

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.email || body.username || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const db = getPool();

    // Fetch user by email or username (case-insensitive)
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
      return NextResponse.json(
        { detail: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Django uses PBKDF2 passwords: "pbkdf2_sha256$iterations$salt$hash"
    // bcryptjs won't work for Django PBKDF2 — use a direct comparison approach
    let passwordValid = false;

    const storedHash = user.password as string;

    if (storedHash.startsWith('pbkdf2_sha256$')) {
      // Verify Django PBKDF2 password
      const parts = storedHash.split('$');
      if (parts.length >= 4) {
        const iterations = parseInt(parts[1], 10);
        const salt = parts[2];
        const hash = parts[3];

        const crypto = await import('crypto');
        const derivedKey = crypto.pbkdf2Sync(
          password,
          salt,
          iterations,
          32,  // Django uses 32 bytes = 256 bits
          'sha256'
        );
        const expectedHash = derivedKey.toString('base64');
        passwordValid = expectedHash === hash;
      }
    } else if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$')) {
      // bcrypt hash
      passwordValid = await bcrypt.compare(password, storedHash);
    }

    if (!passwordValid) {
      return NextResponse.json(
        { detail: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { detail: 'This account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Build user payload
    const userPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone || '',
      is_store_admin: user.role === 'ADMIN' || user.is_superuser,
      is_staff_member: user.is_staff || user.role === 'STAFF',
      is_email_verified: true,
      created_at: user.created_at,
    };

    // Sign JWT tokens
    const access = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
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
      { detail: 'Login service temporarily unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
