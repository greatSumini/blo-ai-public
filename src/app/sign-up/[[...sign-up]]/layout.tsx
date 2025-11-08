import { ClerkProvider } from "@clerk/nextjs";

/**
 * Sign Up Layout
 *
 * Wraps the sign-up page with ClerkProvider.
 */
export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
