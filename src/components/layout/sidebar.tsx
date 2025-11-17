"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, PenTool, FileText, User, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const menuItems = [
    { icon: LayoutDashboard, label: t("sidebar.dashboard"), href: "/dashboard" },
    { icon: PenTool, label: t("sidebar.new_article"), href: "/new-article" },
    { icon: FileText, label: t("sidebar.articles"), href: "/articles" },
    { icon: Tag, label: t("sidebar.keywords"), href: "/keywords" },
    { icon: FileText, label: t("sidebar.branding"), href: "/branding" },
    { icon: User, label: t("sidebar.account"), href: "/account" },
  ];

  return (
    <aside className="hidden w-64 border-r border-border-default bg-bg-primary md:block">
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
    </aside>
  );
}
