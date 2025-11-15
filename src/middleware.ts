import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/backend/supabase/client";
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { getOnboardingCompletedFromDb } from "@/features/onboarding/backend/onboarding-status";

/**
 * Authentication and Onboarding Guard Middleware
 *
 * This middleware implements a three-stage routing guard system:
 *
 * STAGE 1: Onboarding Route Guard
 * - Route: /auth/onboarding
 * - Requires: User authentication
 * - Redirect: Unauthenticated users → /sign-in
 * - Reverse: Completed onboarding → /dashboard (prevents re-access)
 *
 * STAGE 2: Protected Routes Guard
 * - Routes: /dashboard, /new-article, /style-guide, /account, /editor, /settings
 * - Requires: User authentication + completed onboarding
 * - Redirect: Unauthenticated users → /sign-in (via auth.protect())
 * - Redirect: Authenticated users without onboarding → /auth/onboarding
 *
 * STAGE 3: Public Routes
 * - All other routes pass through without checks
 * - Includes: /sign-in, /sign-up, /auth/after, static assets
 *
 * ONBOARDING STATUS CHECK:
 * - Supabase style_guides.onboarding_completed 플래그만을 단일 소스로 사용
 * - Supabase 조회가 실패하거나 설정이 없으면 "온보딩 미완료(false)" 로 간주
 */

const resolveOnboardingCompleted = async (userId: string): Promise<boolean> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error(
      "[MIDDLEWARE] Missing Supabase credentials for onboarding check"
    );
    return false;
  }

  try {
    const supabase = createServiceClient({
      url: supabaseUrl,
      serviceRoleKey: supabaseServiceRoleKey,
    });

    const completed = await getOnboardingCompletedFromDb(supabase, userId);
    console.log("[MIDDLEWARE] DB check: onboarding_completed =", completed);
    return completed;
  } catch (error) {
    console.error("[MIDDLEWARE] Error checking onboarding status:", error);
    return false;
  }
};

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/new-article(.*)",
  "/style-guide(.*)",
  "/articles(.*)",
  "/account(.*)",
  "/editor(.*)",
  "/settings(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/auth/onboarding(.*)"]);

// i18n middleware: detect locale and rewrite behind the scenes
const handleI18nRouting = createMiddleware(routing);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const reqUrl = new URL(req.url);

  console.log("[MIDDLEWARE] ===== REQUEST START =====");
  console.log("[MIDDLEWARE] URL:", reqUrl.pathname + reqUrl.search);
  console.log("[MIDDLEWARE] userId:", userId);
  console.log(
    "[MIDDLEWARE] sessionClaims.publicMetadata:",
    sessionClaims?.publicMetadata
  );

  // STAGE 1: Onboarding Route Guard
  if (isOnboardingRoute(req)) {
    console.log("[MIDDLEWARE] STAGE 1: Onboarding Route Guard");

    // Require authentication for onboarding page
    if (!userId) {
      console.log("[MIDDLEWARE] No userId, redirecting to /sign-in");
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Reverse redirect: If onboarding already completed, redirect to dashboard
    const onboardingCompleted = await resolveOnboardingCompleted(userId);

    console.log("[MIDDLEWARE] onboardingCompleted:", onboardingCompleted);

    if (onboardingCompleted) {
      console.log(
        "[MIDDLEWARE] User already completed onboarding, redirecting to /dashboard"
      );
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    console.log("[MIDDLEWARE] Allowing access to onboarding route");
    return NextResponse.next();
  }

  // STAGE 2: Protected Routes Guard
  if (isProtectedRoute(req)) {
    console.log("[MIDDLEWARE] STAGE 2: Protected Routes Guard");

    // STAGE 2a: Require authentication
    if (!userId) {
      console.log("[MIDDLEWARE] No userId, calling auth.protect()");
      await auth.protect(); // Redirects to sign-in
      return;
    }

    // STAGE 2b: Require completed onboarding
    // Check from database instead of Clerk metadata to avoid session cache delays
    console.log("[MIDDLEWARE] STAGE 2b: Onboarding Check (from Supabase)");

    const onboardingCompleted = await resolveOnboardingCompleted(userId);

    const justCompletedOnboarding =
      new URL(req.url).searchParams.get("onboarding_completed") === "true";

    console.log(
      "[MIDDLEWARE] onboardingCompleted (resolved):",
      onboardingCompleted
    );
    console.log(
      "[MIDDLEWARE] justCompletedOnboarding (query param):",
      justCompletedOnboarding
    );

    if (!onboardingCompleted && !justCompletedOnboarding) {
      console.log(
        "[MIDDLEWARE] User not onboarded and no bypass param, redirecting to /auth/onboarding"
      );
      const onboardingUrl = new URL("/auth/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    if (justCompletedOnboarding) {
      console.log(
        "[MIDDLEWARE] Bypass active: allowing access despite onboardingCompleted=false"
      );
    }

    console.log("[MIDDLEWARE] Allowing access to protected route");
  }

  // STAGE 3: Public routes pass through
  console.log("[MIDDLEWARE] STAGE 3: Public route, passing through");
  console.log("[MIDDLEWARE] ===== REQUEST END =====");
});

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const skipI18n = path.startsWith("/api") || path.startsWith("/_next");

  let i18nRes: NextResponse | null = null;
  if (!skipI18n) {
    // 1) Run i18n first (may set rewrite and cookies)
    i18nRes = handleI18nRouting(req);
    // If i18n decided to redirect, honor it immediately
    const i18nLocation = i18nRes.headers.get("location");
    if (i18nLocation) return i18nRes;
  }

  // 2) Run Clerk auth handler
  const clerkRes = await clerkHandler(req);

  if (i18nRes) {
    // 3) Merge i18n headers (rewrite + set-cookie) into Clerk response
    const rewrite = i18nRes.headers.get("x-middleware-rewrite");
    if (rewrite) {
      clerkRes.headers.set("x-middleware-rewrite", rewrite);
    }
    try {
      const cookies = i18nRes.cookies.getAll?.() ?? [];
      for (const c of cookies) {
        clerkRes.cookies.set({ name: c.name, value: c.value, ...c });
      }
    } catch {
      // noop: cookies merging best-effort only
    }
  }

  return clerkRes;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
