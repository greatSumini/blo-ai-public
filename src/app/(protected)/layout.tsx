import { type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";

type ProtectedLayoutProps = {
  children: ReactNode;
};

/**
 * Protected Layout
 *
 * This layout wraps all authenticated routes with ClerkProvider and user context.
 *
 * Authentication and onboarding guards are handled by middleware.ts
 * This layout provides:
 * - ClerkProvider for authentication context
 * - CurrentUserProvider for user data
 * - UI structure for authenticated, onboarded users
 *
 * Middleware ensures:
 * - User is authenticated
 * - User has completed onboarding
 * - Unauthenticated users are redirected to /sign-in
 * - Users without onboarding are redirected to /auth/onboarding
 *
 * By placing ClerkProvider here instead of root layout:
 * - 404 pages and error routes work without Clerk context
 * - Static asset requests don't trigger Clerk middleware errors
 * - Clerk only runs on routes matched by clerkMiddleware()
 */
export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const currentUser = await loadCurrentUser();

  return (
    <ClerkProvider>
      <CurrentUserProvider initialState={currentUser}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-background p-8">
              {children}
            </main>
          </div>
        </div>
      </CurrentUserProvider>
    </ClerkProvider>
  );
}
