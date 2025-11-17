'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Settings,
  Search,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const brandName = useTranslations('common');

  // Extract locale from pathname (e.g., /ko/dashboard -> ko)
  const locale = pathname.split('/')[1] || 'ko';

  const navItems: NavItem[] = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/articles`, label: t('articles'), icon: FileText },
    { href: `/${locale}/branding`, label: t('branding'), icon: BookOpen },
    { href: `/${locale}/keywords`, label: t('keywords'), icon: Search },
    { href: `/${locale}/account`, label: t('account'), icon: Settings },
  ];

  return (
    <nav className="flex h-screen w-64 flex-col border-r border-border-default bg-bg-primary">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link
          href={`/${locale}/dashboard`}
          className="text-xl font-semibold text-text-primary transition-colors hover:text-accent-brand"
        >
          {brandName('brand_name')}
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-normal',
                isActive
                  ? 'bg-bg-tertiary text-text-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2',
                'motion-reduce:transition-none'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Section */}
      <div className="border-t border-border-default p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-bg-hover">
          <User className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <span className="text-text-primary">Profile</span>
        </button>
      </div>
    </nav>
  );
}
