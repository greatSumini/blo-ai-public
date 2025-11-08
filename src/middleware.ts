import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/backend/supabase/client";

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
 * - Uses sessionClaims.publicMetadata.onboardingCompleted (boolean)
 * - No database calls (metadata-based for performance)
 * - Set during onboarding completion via updateUser()
 */

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/new-article(.*)",
  "/style-guide(.*)",
  "/account(.*)",
  "/editor(.*)",
  "/settings(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/auth/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const reqUrl = new URL(req.url);

  console.log("[MIDDLEWARE] ===== REQUEST START =====");
  console.log("[MIDDLEWARE] URL:", reqUrl.pathname + reqUrl.search);
  console.log("[MIDDLEWARE] userId:", userId);
  console.log("[MIDDLEWARE] sessionClaims.publicMetadata:", sessionClaims?.publicMetadata);

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
    const metadata = sessionClaims?.publicMetadata as { onboardingCompleted?: boolean } | undefined;
    const onboardingCompleted = metadata?.onboardingCompleted === true;

    console.log("[MIDDLEWARE] onboardingCompleted:", onboardingCompleted);

    if (onboardingCompleted) {
      console.log("[MIDDLEWARE] User already completed onboarding, redirecting to /dashboard");
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

    let onboardingCompleted = false;

    try {
      // Create Supabase service client to query database
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.warn("[MIDDLEWARE] Missing Supabase credentials, falling back to Clerk metadata");
        const metadata = sessionClaims?.publicMetadata as { onboardingCompleted?: boolean } | undefined;
        onboardingCompleted = metadata?.onboardingCompleted === true;
      } else {
        const supabase = createServiceClient({
          url: supabaseUrl,
          serviceRoleKey: supabaseServiceRoleKey,
        });

        // Query style_guides table to check if user has completed onboarding
        const { data, error } = await supabase
          .from("style_guides")
          .select("onboarding_completed")
          .eq("clerk_user_id", userId)
          .single();

        if (error) {
          console.warn("[MIDDLEWARE] Failed to query style_guides:", error);
          // Fall back to Clerk metadata if DB query fails
          const metadata = sessionClaims?.publicMetadata as { onboardingCompleted?: boolean } | undefined;
          onboardingCompleted = metadata?.onboardingCompleted === true;
        } else if (data) {
          onboardingCompleted = data.onboarding_completed === true;
          console.log("[MIDDLEWARE] DB check: onboarding_completed =", onboardingCompleted);
        }
      }
    } catch (error) {
      console.error("[MIDDLEWARE] Error checking onboarding status:", error);
      // Fall back to Clerk metadata if any error occurs
      const metadata = sessionClaims?.publicMetadata as { onboardingCompleted?: boolean } | undefined;
      onboardingCompleted = metadata?.onboardingCompleted === true;
    }

    const justCompletedOnboarding = new URL(req.url).searchParams.get("onboarding_completed") === "true";

    console.log("[MIDDLEWARE] onboardingCompleted (from DB):", onboardingCompleted);
    console.log("[MIDDLEWARE] justCompletedOnboarding (query param):", justCompletedOnboarding);

    if (!onboardingCompleted && !justCompletedOnboarding) {
      console.log("[MIDDLEWARE] User not onboarded and no bypass param, redirecting to /auth/onboarding");
      const onboardingUrl = new URL("/auth/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    if (justCompletedOnboarding) {
      console.log("[MIDDLEWARE] Bypass active: allowing access despite onboardingCompleted=false");
    }

    console.log("[MIDDLEWARE] Allowing access to protected route");
  }

  // STAGE 3: Public routes pass through
  console.log("[MIDDLEWARE] STAGE 3: Public route, passing through");
  console.log("[MIDDLEWARE] ===== REQUEST END =====");
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
