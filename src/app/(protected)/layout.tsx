import { type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

type ProtectedLayoutProps = {
  children: ReactNode;
};

/**
 * Protected Layout
 *
 * Authentication and onboarding guards are handled by middleware.ts
 * This layout simply provides the UI structure for authenticated, onboarded users.
 *
 * Middleware ensures:
 * - User is authenticated
 * - User has completed onboarding
 * - Unauthenticated users are redirected to /sign-in
 * - Users without onboarding are redirected to /auth/onboarding
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
