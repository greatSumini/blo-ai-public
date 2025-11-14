import { ClerkProvider } from "@clerk/nextjs";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await loadCurrentUser();

  return (
    <ClerkProvider>
      <CurrentUserProvider initialState={currentUser}>
        {children}
      </CurrentUserProvider>
    </ClerkProvider>
  );
}
