"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  FileText,
  User,
  Tag,
  Palette,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useCurrentOrganization } from "@/contexts/organization-context";
import { ROUTES } from "@/lib/routes";
import { OrganizationSelector } from "./organization-selector";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { orgId } = useCurrentOrganization();

  if (!orgId) {
    return null;
  }

  const menuGroups: MenuGroup[] = [
    {
      // Dashboard group (no label)
      items: [
        {
          icon: LayoutDashboard,
          label: t("sidebar.dashboard"),
          href: ROUTES.DASHBOARD(orgId),
        },
      ],
    },
    {
      label: t("sidebar.group.content"),
      items: [
        {
          icon: PenTool,
          label: t("sidebar.new_article"),
          href: ROUTES.NEW_ARTICLE(orgId),
        },
        {
          icon: FileText,
          label: t("sidebar.articles"),
          href: ROUTES.ARTICLES(orgId),
        },
        {
          icon: Tag,
          label: t("sidebar.keywords"),
          href: ROUTES.KEYWORDS(orgId),
        },
      ],
    },
    {
      label: t("sidebar.group.branding"),
      items: [
        {
          icon: Palette,
          label: t("sidebar.branding"),
          href: ROUTES.BRANDING(orgId),
        },
      ],
    },
    {
      label: t("sidebar.group.settings"),
      items: [
        {
          icon: Users,
          label: t("sidebar.members"),
          href: ROUTES.ORG_MEMBERS(orgId),
        },
        {
          icon: User,
          label: t("sidebar.account"),
          href: ROUTES.ACCOUNT(orgId),
        },
      ],
    },
  ];

  return (
    <aside className="hidden w-64 border-r border-border-default bg-bg-primary md:block">
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="mb-2 flex items-center gap-2 px-2">
          <Image
            src="/images/icon.png"
            alt={t("common.brand_name")}
            width={32}
            height={32}
          />
          <h1 className="text-2xl font-bold text-text-primary">
            {t("common.brand_name")}
          </h1>
        </div>
        <OrganizationSelector />
        <nav className="flex flex-col gap-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-2">
              {group.label && (
                <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {group.label}
                </h2>
              )}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
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
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
