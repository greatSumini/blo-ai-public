"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PenTool, FileText, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "대시보드",
    href: "/dashboard",
  },
  {
    icon: PenTool,
    label: "새 글 작성",
    href: "/new-article",
  },
  {
    icon: FileText,
    label: "스타일 가이드",
    href: "/style-guide",
  },
  {
    icon: User,
    label: "계정 관리",
    href: "/account",
  },
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-primary">콘텐츠메이커</h1>
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
                  "w-full justify-start gap-3",
                  isActive && "bg-secondary",
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

export function Sidebar() {
  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-background md:block">
        <SidebarContent />
      </aside>
    </>
  );
}
