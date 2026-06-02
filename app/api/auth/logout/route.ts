import { NextResponse } from 'next/server';
import { buildClearCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', buildClearCookie());
  return response;
}
