import { ClerkProvider } from "@clerk/nextjs";

/**
 * Auth Layout
 *
 * Wraps all auth-related pages with ClerkProvider.
 * Includes: /auth/onboarding, /auth/after, etc.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
