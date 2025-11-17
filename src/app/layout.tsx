import "./globals.css";
import Providers from "./providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Noto_Serif_KR } from "next/font/google";

const notoSerifKR = Noto_Serif_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

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
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`antialiased ${notoSerifKR.className}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
