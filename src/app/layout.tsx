import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "콘텐츠메이커",
  description: "AI 기반 콘텐츠 생성 SaaS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await loadCurrentUser();

  return (
    <ClerkProvider>
      <html lang="ko" suppressHydrationWarning>
        <head>
          <link
            rel="stylesheet"
            as="style"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
          />
        </head>
        <body className="antialiased font-sans">
          <Providers>
            <CurrentUserProvider initialState={currentUser}>
              {children}
            </CurrentUserProvider>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
