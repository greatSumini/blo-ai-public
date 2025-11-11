import type { z } from 'zod';

// Minimal Clerk webhook payload types we care about
export type ClerkEmail = { id: string; email_address: string };

export type ClerkUserPayload = {
  id?: string;
  email_addresses?: ClerkEmail[];
  primary_email_address_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
};

export type ClerkWebhook = {
  type: string; // e.g. 'user.created' | 'user.deleted'
  data?: ClerkUserPayload;
};

export type ExtractedClerkUser = {
  clerkUserId: string;
  email: string | null;
  fullName: string | null;
  imageUrl: string | null;
};

// 순수 함수: Clerk Webhook payload에서 필요한 사용자 필드만 추출
export const extractClerkUser = (payload: ClerkWebhook): ExtractedClerkUser | null => {
  const d = payload.data ?? {};
  const id: string | undefined = d.id;
  if (!id) return null;

  const emailAddresses: ClerkEmail[] = (d.email_addresses ?? []) as ClerkEmail[];
  const primaryEmailId: string | undefined = d.primary_email_address_id;
  const primaryEmail =
    emailAddresses.find((e) => e.id === primaryEmailId)?.email_address ??
    emailAddresses[0]?.email_address ??
    null;

  const fullName: string | null =
    d.first_name || d.last_name
      ? `${d.first_name || ''} ${d.last_name || ''}`.trim()
      : d.username || null;

  const imageUrl: string | null = d.image_url ?? null;

  return { clerkUserId: id, email: primaryEmail, fullName, imageUrl } as const;
};

