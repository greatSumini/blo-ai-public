import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "콘텐츠메이커",
  description: "AI 기반 콘텐츠 생성 SaaS",
};

/**
 * Root Layout
 *
 * This layout provides the base HTML structure and global styles.
 * It does NOT include ClerkProvider or authentication logic.
 *
 * Authentication is handled in the (protected) sub-layout to ensure:
 * - 404 pages and error routes work without Clerk context
 * - Static asset requests don't trigger Clerk middleware errors
 * - Clerk only runs on authenticated routes matched by middleware
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
