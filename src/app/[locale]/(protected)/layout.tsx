import { type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";
import { OrganizationProvider } from "@/contexts/organization-context";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const currentUser = await loadCurrentUser();

  return (
    <ClerkProvider>
      <CurrentUserProvider initialState={currentUser}>
        <OrganizationProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-bg-secondary p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </OrganizationProvider>
      </CurrentUserProvider>
    </ClerkProvider>
  );
}
