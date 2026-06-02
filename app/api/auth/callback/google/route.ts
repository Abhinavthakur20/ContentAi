import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signJWT, buildAuthCookie } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

/**
 * GET /api/auth/callback/google
 * Handles the OAuth callback from Google:
 * 1. Exchange auth code for access token
 * 2. Fetch user profile
 * 3. Create JWT and set cookie
 * 4. Redirect to /generator
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(`${appUrl}/login?error=oauth_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials not configured');
    return NextResponse.redirect(`${appUrl}/login?error=config`);
  }

  const redirectUri = `${appUrl}/api/auth/callback/google`;

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('Token exchange failed:', text);
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange`);
    }

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    // 2. Fetch user profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      console.error('Failed to fetch user info');
      return NextResponse.redirect(`${appUrl}/login?error=user_info`);
    }

    const googleUser = (await userRes.json()) as GoogleUserInfo;

    const user: AuthUser = {
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    };

    // 3. Create JWT
    const token = await signJWT(user);

    // 4. Set cookie and redirect
    const response = NextResponse.redirect(`${appUrl}/generator`);
    response.headers.set('Set-Cookie', buildAuthCookie(token));

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=unknown`);
  }
}
