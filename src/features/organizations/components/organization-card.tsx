'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { MoreVertical, Trash, LogOut, Users } from 'lucide-react';
import { Card } from '@/components/ui/card-v2';
import { Badge } from '@/components/ui/badge-v2';
import { Button } from '@/components/ui/button-v2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { OrganizationWithRole } from '../lib/dto';

interface OrganizationCardProps {
  organization: OrganizationWithRole;
  onDelete: (id: string) => void;
  onLeave: (id: string) => void;
}

export function OrganizationCard({
  organization,
  onDelete,
  onLeave,
}: OrganizationCardProps) {
  const t = useTranslations('organizations');
  const locale = useLocale();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isOwner = organization.role === 'owner';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
    onDelete(organization.id);
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
    onLeave(organization.id);
  };

  return (
    <Card hover>
      {/* Row 1: Badge (owner/member) + DropdownMenu */}
      <div className="mb-4 flex items-start justify-between">
        <Badge variant={isOwner ? 'default' : 'info'}>
          {isOwner ? t('role.owner') : t('role.member')}
        </Badge>

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="조직 메뉴 열기"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner ? (
              <DropdownMenuItem onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                {t('menu.delete')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleLeave}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('menu.leave')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Row 2: Title (클릭 시 /org/[orgId]/members로 이동) */}
      <Link href={`/${locale}/org/${organization.id}/members`}>
        <h3 className="mb-2 line-clamp-2 text-lg font-medium leading-tight text-foreground transition-colors hover:text-accent-brand">
          {organization.name}
        </h3>
      </Link>

      {/* Row 3: Description */}
      {organization.description && (
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {organization.description}
        </p>
      )}

      {/* Row 4: Member count */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <Users className="h-3 w-3" />
        <span>{t('member_count', { count: organization.memberCount })}</span>
      </div>
    </Card>
  );
}
