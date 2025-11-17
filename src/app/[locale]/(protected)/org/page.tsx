'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button-v2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { OrganizationCard } from '@/features/organizations/components/organization-card';
import {
  useOrganizations,
  useDeleteOrganization,
  useLeaveOrganization,
} from '@/features/organizations/hooks/use-organizations';
import { extractApiErrorMessage } from '@/lib/remote/api-client';

type OrganizationsPageProps = {
  params: Promise<Record<string, never>>;
};

export default function OrganizationsPage({ params }: OrganizationsPageProps) {
  void params;
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // API calls
  const { data, isLoading, error } = useOrganizations();
  const deleteMutation = useDeleteOrganization();
  const leaveMutation = useLeaveOrganization();

  // Handlers
  const handleDelete = (id: string) => {
    setSelectedOrgId(id);
    setDeleteDialogOpen(true);
  };

  const handleLeave = (id: string) => {
    setSelectedOrgId(id);
    setLeaveDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedOrgId) return;

    deleteMutation.mutate(selectedOrgId, {
      onSuccess: () => {
        toast.success(t('delete.success.title'), {
          description: t('delete.success.description'),
        });
        setDeleteDialogOpen(false);
        setSelectedOrgId(null);
      },
      onError: (error) => {
        const message = extractApiErrorMessage(error, t('delete.error.description'));
        toast.error(t('delete.error.title'), {
          description: message,
        });
      },
    });
  };

  const confirmLeave = () => {
    if (!selectedOrgId) return;

    leaveMutation.mutate(selectedOrgId, {
      onSuccess: () => {
        toast.success(t('leave.success.title'), {
          description: t('leave.success.description'),
        });
        setLeaveDialogOpen(false);
        setSelectedOrgId(null);
      },
      onError: (error) => {
        const message = extractApiErrorMessage(error, t('leave.error.description'));
        toast.error(t('leave.error.title'), {
          description: message,
        });
      },
    });
  };

  const handleCreateNew = () => {
    router.push(`/${locale}/org/new`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Page Header Skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-10 w-48" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-12 w-32" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6">
              <Skeleton className="mb-4 h-6 w-20" />
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="mb-3 h-10 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-danger-bg p-4">
            <svg
              className="h-8 w-8 text-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-medium text-foreground">
              {t('error.title')}
            </h2>
            <p className="mb-6 text-muted-foreground">
              {t('error.description')}
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              {tCommon('retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const organizations = data?.organizations || [];
  const isEmpty = organizations.length === 0;

  // Empty state
  if (isEmpty) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium leading-tight text-text-primary md:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              {t('description')}
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-bg-tertiary p-4">
            <svg
              className="h-12 w-12 text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-medium text-foreground">
              {t('empty.title')}
            </h2>
            <p className="mb-6 text-muted-foreground">
              {t('empty.description')}
            </p>
            <Button variant="primary" size="lg" onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              {t('empty.create_first')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium leading-tight text-text-primary md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-base leading-relaxed text-text-secondary">
            {t('description')}
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t('add_new')}
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <OrganizationCard
            key={org.id}
            organization={org}
            onDelete={handleDelete}
            onLeave={handleLeave}
          />
        ))}
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.title')}</DialogTitle>
            <DialogDescription>{t('delete.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {t('delete.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('delete.deleting')}
                </>
              ) : (
                t('delete.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Confirm Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('leave.title')}</DialogTitle>
            <DialogDescription>{t('leave.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setLeaveDialogOpen(false)}
              disabled={leaveMutation.isPending}
            >
              {t('leave.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={confirmLeave}
              disabled={leaveMutation.isPending}
            >
              {leaveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('leave.leaving')}
                </>
              ) : (
                t('leave.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
