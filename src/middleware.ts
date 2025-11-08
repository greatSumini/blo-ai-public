import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
 * - Uses sessionClaims.metadata.onboardingCompleted (boolean)
 * - No database calls (metadata-based for performance)
 * - Set during onboarding completion via updateUserMetadata()
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

  // STAGE 1: Onboarding Route Guard
  if (isOnboardingRoute(req)) {
    // Require authentication for onboarding page
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Reverse redirect: If onboarding already completed, redirect to dashboard
    const onboardingCompleted = sessionClaims?.metadata?.onboardingCompleted === true;
    if (onboardingCompleted) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  // STAGE 2: Protected Routes Guard
  if (isProtectedRoute(req)) {
    // STAGE 2a: Require authentication
    if (!userId) {
      await auth.protect(); // Redirects to sign-in
      return;
    }

    // STAGE 2b: Require completed onboarding
    const onboardingCompleted = sessionClaims?.metadata?.onboardingCompleted === true;

    if (!onboardingCompleted) {
      const onboardingUrl = new URL("/auth/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // STAGE 3: Public routes pass through
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
