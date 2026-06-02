import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export interface AuthUser {
  email: string;
  name: string;
  picture: string;
}

const COOKIE_NAME = 'contentai_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

/** Create a signed JWT containing user info. */
export async function signJWT(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

/** Verify a JWT and return the user payload, or null if invalid. */
export async function verifyJWT(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture as string,
    };
  } catch {
    return null;
  }
}

/** Build a Set-Cookie header value for the auth token. */
export function buildAuthCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

/** Build a Set-Cookie header value that clears the auth token. */
export function buildClearCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/** Extract the user from the auth cookie on a NextRequest (middleware / API route). */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

/** Extract the user from cookies in a Server Component. */
export async function getUserFromCookies(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}
