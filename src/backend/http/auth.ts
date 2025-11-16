import type { Context } from 'hono';
import { getAuth } from '@hono/clerk-auth';
import { failure } from './response';

/**
 * Helper function to require authentication in a route handler
 * Returns the authenticated user ID or responds with 401 if not authenticated
 *
 * Usage:
 * ```typescript
 * app.get('/protected', async (c) => {
 *   const userId = requireAuth(c);
 *   if (!userId) return; // Response already sent
 *
 *   // Use userId...
 * });
 * ```
 */
export const requireAuth = (c: Context): string | null => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    c.json(
      failure(401, 'UNAUTHORIZED', 'Authentication required. Please sign in.'),
      401
    );
    return null;
  }

  return auth.userId;
};
