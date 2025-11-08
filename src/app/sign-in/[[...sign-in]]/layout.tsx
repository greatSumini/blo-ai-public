import { ClerkProvider } from "@clerk/nextjs";

/**
 * Sign In Layout
 *
 * Wraps the sign-in page with ClerkProvider.
 */
export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
