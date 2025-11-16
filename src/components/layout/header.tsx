"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Menu, LayoutDashboard, PenTool, FileText, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Sidebar content for mobile sheet
function MobileSidebarContent() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const t = useTranslations();

  const menuItems = [
    { icon: LayoutDashboard, label: t("sidebar.dashboard"), href: "/dashboard" },
    { icon: PenTool, label: t("sidebar.new_article"), href: "/new-article" },
    { icon: FileText, label: t("sidebar.articles"), href: "/articles" },
    { icon: Tag, label: t("sidebar.keywords"), href: "/keywords" },
    { icon: FileText, label: t("sidebar.style_guide"), href: "/style-guide" },
    { icon: User, label: t("sidebar.account"), href: "/account" },
  ];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="mb-4 flex items-center gap-2 px-2">
        <Image
          src="/images/icon.svg"
          alt={t("common.brand_name")}
          width={32}
          height={32}
        />
        <h1 className="text-2xl font-bold text-text-primary">{t("common.brand_name")}</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
                  isActive && "bg-bg-secondary text-text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Header() {
  const t = useTranslations();
  return (
    <header className="flex h-16 items-center justify-between border-b border-border-default bg-bg-primary px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <LanguageSwitcher />
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
                userButtonTrigger: "focus:shadow-none focus-visible:ring-2 focus-visible:ring-accent-brand",
              },
            }}
            afterSignOutUrl="/sign-in"
          />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="default"
              className="h-10 bg-accent-brand hover:bg-accent-brand/90 px-4 md:px-6 font-semibold focus-visible:ring-accent-brand"
            >
              {t("common.login")}
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
