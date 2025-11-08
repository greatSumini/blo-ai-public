import { ClerkProvider } from "@clerk/nextjs";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";

/**
 * Public Layout
 *
 * This layout wraps public pages (like homepage) with optional authentication.
 * Unlike protected routes, these pages can be accessed without authentication,
 * but still provide user context if the user is logged in.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load current user (will return unauthenticated if not logged in)
  const currentUser = await loadCurrentUser();

  return (
    <ClerkProvider>
      <CurrentUserProvider initialState={currentUser}>
        {children}
      </CurrentUserProvider>
    </ClerkProvider>
  );
}
