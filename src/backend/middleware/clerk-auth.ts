import { clerkMiddleware } from '@hono/clerk-auth';
import { createMiddleware } from 'hono/factory';
import {
  contextKeys,
  type AppEnv,
} from '@/backend/hono/context';

/**
 * Clerk Authentication Middleware
 *
 * Uses @hono/clerk-auth to verify Clerk sessions and inject Clerk client into context.
 * This middleware should be applied globally or to protected routes.
 *
 * Usage in app.ts:
 * ```typescript
 * app.use('*', withClerkAuth());
 * ```
 *
 * Then access auth info and Clerk client in routes:
 * ```typescript
 * import { getAuth } from '@hono/clerk-auth';
 *
 * const auth = getAuth(c);
 * if (!auth?.userId) {
 *   return c.json({ error: 'Unauthorized' }, 401);
 * }
 *
 * const clerkClient = getClerk(c);
 * const user = await clerkClient.users.getUser(auth.userId);
 * ```
 */
export const withClerkAuth = () => {
  return createMiddleware<AppEnv>(async (c, next) => {
    const config = c.get(contextKeys.config);

    // Apply Clerk middleware with environment variables
    const clerkMW = clerkMiddleware({
      secretKey: config.clerk.secretKey,
      publishableKey: config.clerk.publishableKey,
    });

    // Execute Clerk middleware
    await clerkMW(c, next);

    // Clerk client is automatically injected into c.var.clerk by @hono/clerk-auth
    // We copy it to our standardized context key for consistency
    const clerkClient = c.get('clerk');
    if (clerkClient) {
      c.set(contextKeys.clerk, clerkClient);
    }
  });
};
