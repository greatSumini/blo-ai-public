import { z } from 'zod';
import type { AppConfig } from '@/backend/hono/context';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  DATAFORSEO_LOGIN: z.string().min(1),
  DATAFORSEO_PASSWORD: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NAVER_CLIENT_ID: z.string().min(1),
  NAVER_CLIENT_SECRET: z.string().min(1),
  BRAVE_API_KEY: z.string().min(1),
  TOSS_SECRET_KEY: z.string().optional(),
  TOSS_CLIENT_KEY: z.string().optional(),
  CRON_SECRET_TOKEN: z.string().optional(),
});

let cachedConfig: AppConfig | null = null;

export const getAppConfig = (): AppConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const parsed = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN,
    DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
    NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
    BRAVE_API_KEY: process.env.BRAVE_API_KEY,
    TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
    TOSS_CLIENT_KEY: process.env.TOSS_CLIENT_KEY,
    CRON_SECRET_TOKEN: process.env.CRON_SECRET_TOKEN,
  });

  if (!parsed.success) {
    const messages = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid backend configuration: ${messages}`);
  }

  cachedConfig = {
    supabase: {
      url: parsed.data.SUPABASE_URL,
      serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    },
    google: {
      generativeAiApiKey: parsed.data.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    dataForSEO: {
      login: parsed.data.DATAFORSEO_LOGIN,
      password: parsed.data.DATAFORSEO_PASSWORD,
    },
    clerk: {
      secretKey: parsed.data.CLERK_SECRET_KEY,
      publishableKey: parsed.data.CLERK_PUBLISHABLE_KEY,
    },
    naver: {
      clientId: parsed.data.NAVER_CLIENT_ID,
      clientSecret: parsed.data.NAVER_CLIENT_SECRET,
    },
    brave: {
      apiKey: parsed.data.BRAVE_API_KEY,
    },
    toss: parsed.data.TOSS_SECRET_KEY
      ? {
          secretKey: parsed.data.TOSS_SECRET_KEY,
          clientKey: parsed.data.TOSS_CLIENT_KEY,
        }
      : undefined,
    cron: parsed.data.CRON_SECRET_TOKEN
      ? {
          secretToken: parsed.data.CRON_SECRET_TOKEN,
        }
      : undefined,
  } satisfies AppConfig;

  return cachedConfig;
};
