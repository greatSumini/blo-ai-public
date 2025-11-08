/**
 * Onboarding Layout
 *
 * Authentication and reverse redirect guards are handled by middleware.ts
 * This layout simply provides the structure for the onboarding flow.
 *
 * Middleware ensures:
 * - Unauthenticated users are redirected to /sign-in
 * - Users who completed onboarding are redirected to /dashboard
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
