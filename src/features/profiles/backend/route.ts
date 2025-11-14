import type { Hono } from 'hono';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { failure } from '@/backend/http/response';
import { respondWithDomain } from '@/backend/http/mapper';
import { upsertProfile, deleteProfileByClerkId } from './service';
import { extractClerkUser, type ClerkWebhook } from './utils';

export const registerProfilesRoutes = (app: Hono<AppEnv>) => {
  // POST /api/webhooks/clerk
  app.post('/api/webhooks/clerk', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Optional Svix signature verification (if secret exists)
    try {
      const secret = process.env.CLERK_WEBHOOK_SECRET;
      if (secret) {
        const { Webhook } = await import('svix');
        const headers = c.req.header();
        const svixId = headers['svix-id'];
        const svixTimestamp = headers['svix-timestamp'];
        const svixSignature = headers['svix-signature'];

        if (!svixId || !svixTimestamp || !svixSignature) {
          return c.json(failure(400, 'invalid_signature', 'Missing Svix headers'), 400);
        }

        const payload = await c.req.text();
        const wh = new Webhook(secret);
        try {
          wh.verify(payload, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
          } as any);
          // Re-parse verified JSON
          const event = JSON.parse(payload) as ClerkWebhook;
          const type = event.type;

          if (type === 'user.created') {
            const user = extractClerkUser(event);
            if (!user) return c.json(failure(400, 'invalid_payload', 'Missing user id'), 400);
            const result = await upsertProfile(supabase, user);
            if (!result.ok) return respondWithDomain(c, result);
            logger.info('[Webhook] user.created processed', { clerkUserId: user.clerkUserId });
            return c.json({ ok: true }, 200);
          }

          if (type === 'user.deleted') {
            const id: string | undefined = (event as any).data?.id;
            if (!id) return c.json(failure(400, 'invalid_payload', 'Missing user id'), 400);
            const result = await deleteProfileByClerkId(supabase, id);
            if (!result.ok) return respondWithDomain(c, result);
            logger.info('[Webhook] user.deleted processed', { clerkUserId: id });
            return c.json({ ok: true }, 200);
          }

          logger.info('[Webhook] Unhandled event', { type });
          return c.json({ ok: true }, 200);
        } catch (err) {
          logger.warn('[Webhook] signature verification failed', err as any);
          return c.json(failure(400, 'invalid_signature', 'Verification failed'), 400);
        }
      }
    } catch (e) {
      // If verification setup fails, continue without verification (best-effort)
      getLogger(c).warn('[Webhook] Svix verification not performed', e as any);
    }

    // Fallback: process without verification (for local/dev)
    const body = await c.req.json<ClerkWebhook>();
    const type = body.type;
    if (type === 'user.created') {
      const user = extractClerkUser(body);
      if (!user) return c.json(failure(400, 'invalid_payload', 'Missing user id'), 400);
      const result = await upsertProfile(supabase, user);
      if (!result.ok) return respondWithDomain(c, result);
      logger.info('[Webhook] user.created processed (no verify)', { clerkUserId: user.clerkUserId });
      return c.json({ ok: true }, 200);
    }
    if (type === 'user.deleted') {
      const id: string | undefined = (body as any).data?.id;
      if (!id) return c.json(failure(400, 'invalid_payload', 'Missing user id'), 400);
      const result = await deleteProfileByClerkId(supabase, id);
      if (!result.ok) return respondWithDomain(c, result);
      logger.info('[Webhook] user.deleted processed (no verify)', { clerkUserId: id });
      return c.json({ ok: true }, 200);
    }

    logger.info('[Webhook] Unhandled event (no verify)', { type });
    return c.json({ ok: true }, 200);
  });
};
