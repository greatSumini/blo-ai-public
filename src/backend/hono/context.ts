import type { Context } from 'hono';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClerkClient } from '@clerk/backend';

export type AppLogger = Pick<Console, 'info' | 'error' | 'warn' | 'debug'>;

export type AppConfig = {
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
  google: {
    generativeAiApiKey: string;
  };
  dataForSEO: {
    login: string;
    password: string;
  };
  clerk: {
    secretKey: string;
    publishableKey: string;
  };
};

export type AppVariables = {
  supabase: SupabaseClient;
  logger: AppLogger;
  config: AppConfig;
  clerk: ClerkClient;
};

export type AppEnv = {
  Variables: AppVariables;
};

export type AppContext = Context<AppEnv>;

export const contextKeys = {
  supabase: 'supabase',
  logger: 'logger',
  config: 'config',
  clerk: 'clerk',
} as const satisfies Record<keyof AppVariables, keyof AppVariables>;

export const getSupabase = (c: AppContext) =>
  c.get(contextKeys.supabase) as SupabaseClient;

export const getLogger = (c: AppContext) =>
  c.get(contextKeys.logger) as AppLogger;

export const getConfig = (c: AppContext) =>
  c.get(contextKeys.config) as AppConfig;

export const getClerk = (c: AppContext) =>
  c.get(contextKeys.clerk) as ClerkClient;
