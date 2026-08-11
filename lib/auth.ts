import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { queryOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const COOKIE_NAME = 'infoboard_token';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  display_name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// export async function setAuthCookie(token: string): Promise<void> {
//   const cookieStore = await cookies();
//   cookieStore.set(COOKIE_NAME, token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'development',
//     sameSite: 'lax',
//     maxAge: MAX_AGE,
//     path: '/',
//   });
// }

// ----- kode hasil gemini ----
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    // UBAH BARIS INI: Harus bernilai TRUE saat di server asli (production) demi keamanan HTTPS
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}


export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await queryOne<{ id: string; email: string; display_name: string }>(
    'SELECT id, email, display_name FROM users WHERE id = $1',
    [payload.sub]
  );

  return user;
}

export async function getTokenFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

// export async function getAuthUserFromRequest(request: Request): Promise<AuthUser | null> {
//   const token = await getTokenFromRequest(request);
//   if (!token) return null;

//   const payload = verifyToken(token);
//   if (!payload) return null;

//   const user = await queryOne<{ id: string; email: string; display_name: string }>(
//     'SELECT id, email, display_name FROM users WHERE id = $1',
//     [payload.sub]
//   );

//   return user;
// }


// ----- kode hasil gemini ----

export async function getAuthUserFromRequest(request: Request): Promise<AuthUser | null> {
  // 1. Ambil token dari Cookie terlebih dahulu
  const cookieStore = await cookies();
  let token = cookieStore.get(COOKIE_NAME)?.value;

  // 2. Cadangan: Jika cookie kosong, baru ambil dari Header Authorization
  if (!token) {
    token = await getTokenFromRequest(request);
  }

  // Jika di kedua tempat tetap tidak ada token, batalkan akses
  if (!token) return null;

  // 3. Verifikasi token yang ditemukan
  const payload = verifyToken(token);
  if (!payload) return null;

  // 4. Ambil data user dari database PostgreSQL
  const user = await queryOne<{ id: string; email: string; display_name: string }>(
    'SELECT id, email, display_name FROM users WHERE id = $1',
    [payload.sub]
  );

  return user;
}

