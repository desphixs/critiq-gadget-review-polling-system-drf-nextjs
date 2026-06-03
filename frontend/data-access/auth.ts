import { cookies } from 'next/headers';
import { cache } from 'react';
import { env } from '@/app/env';

/**
 * VERIFY SESSION STATE (Data Access Layer - DAL)
 * 
 * Analogy:
 * Think of this file like a secure intercom phone inside our bank database vault.
 * Whenever different rooms (Server Components like Header or Dashboard pages) want to know
 * if a visitor has a valid membership entry pass, they pick up the intercom phone.
 * Using React's 'cache' acts like a memory logbook: if three rooms call the bouncer at the
 * exact same millisecond, the bouncer only reads the pass once and tells all three rooms
 * the exact same answer, saving massive network roundtrips!
 */
export const verifySession = cache(async () => {
  // 1. Await and retrieve the server-side cookie manager.
  const cookieStore = await cookies();
  
  // 2. Fetch the access token cookie value.
  const token = cookieStore.get('access_token')?.value;
  
  // 3. If there is no token present, the session is unauthenticated.
  if (!token) {
    return null;
  }
  
  try {
    // 4. Fetch the real user details from our secure Django backend.
    // We pass the access token inside standard SimpleJWT Bearer headers.
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/userauths/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // Disable aggressive caching to guarantee we retrieve the latest profile updates.
      cache: 'no-store',
    });

    // 5. Evaluate if the token has expired or is invalid on the backend.
    if (!response.ok) {
      return null;
    }

    // 6. Parse the profile payload asynchronously.
    const data = await response.json();

    return { 
      authenticated: true, 
      user: { 
        email: data.email, 
        name: data.full_name || 'Anonymous User',
        avatar: data.avatar || null
      } 
    };
  } catch (error) {
    // If any decryption, API verify, or network error occurs, invalidate the session.
    return null;
  }
});

