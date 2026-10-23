import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

// Create a Django-compatible PBKDF2 password hash
function makeDjangoPassword(rawPassword: string): string {
  const iterations = 870000;
  const salt = crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').substring(0, 12);
  const derived = crypto.pbkdf2Sync(rawPassword, salt, iterations, 32, 'sha256');
  return `pbkdf2_sha256$${iterations}$${salt}$${derived.toString('base64')}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, first_name = '', last_name = '', phone = '', password, password_confirm } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ detail: 'Email, username and password are required.' }, { status: 400 });
    }
    if (password !== password_confirm) {
      return NextResponse.json({ password: ['Passwords do not match.'] }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ password: ['Password must be at least 8 characters.'] }, { status: 400 });
    }

    const db = getPool();

    // Check existing
    const existing = await db.query(
      'SELECT id FROM accounts_user WHERE LOWER(email)=$1 OR LOWER(username)=$2 LIMIT 1',
      [email.toLowerCase(), username.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ email: ['A user with this email or username already exists.'] }, { status: 400 });
    }

    const hashedPassword = makeDjangoPassword(password);

    const { rows } = await db.query(
      `INSERT INTO accounts_user
         (email, username, first_name, last_name, phone, password, role, is_active, is_staff, is_superuser,
          is_email_verified, date_joined, last_login)
       VALUES ($1,$2,$3,$4,$5,$6,'CUSTOMER',true,false,false,false,NOW(),NOW())
       RETURNING id, email, username, first_name, last_name, role, phone, date_joined as created_at`,
      [email.trim(), username.trim(), first_name.trim(), last_name.trim(), phone.trim(), hashedPassword]
    );

    const user = rows[0];
    const userPayload = {
      ...user,
      is_store_admin: false,
      is_staff_member: false,
      is_email_verified: false,
    };

    const access = jwt.sign(
      { user_id: user.id, email: user.email, role: 'CUSTOMER' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    const refresh = jwt.sign(
      { user_id: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ access, refresh, user: userPayload }, { status: 201 });
  } catch (err: any) {
    console.error('[register] Error:', err?.message || err);
    return NextResponse.json({ detail: 'Registration failed. Please try again.' }, { status: 503 });
  }
}
