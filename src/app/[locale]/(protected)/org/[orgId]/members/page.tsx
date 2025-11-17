'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UserPlus, LogOut, MoreVertical, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge-v2';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useOrganization,
  useOrganizationMembers,
  useAddMember,
  useRemoveMember,
  useLeaveOrganization,
} from '@/features/organizations/hooks/use-organizations';
import type { OrganizationMember } from '@/features/organizations/lib/dto';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ orgId: string; locale: string }>;
}

export default function OrganizationMembersPage({ params }: PageProps) {
  const { orgId } = use(params);
  const router = useRouter();
  const t = useTranslations('organizations.members');

  // State
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [email, setEmail] = useState('');

  // Queries
  const { data: organization, isLoading: isLoadingOrg } = useOrganization(orgId);
  const { data: membersData, isLoading: isLoadingMembers } = useOrganizationMembers(orgId);

  // Mutations
  const addMemberMutation = useAddMember(orgId);
  const removeMemberMutation = useRemoveMember(orgId);
  const leaveOrganizationMutation = useLeaveOrganization();

  const members = membersData?.members || [];
  const role = organization?.role;
  const isOwner = role === 'owner';

  // Handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('toast.emailRequired'));
      return;
    }

    try {
      await addMemberMutation.mutateAsync({ email: email.trim() });
      toast.success(t('toast.addSuccess'));
      setEmail('');
      setAddMemberDialogOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('toast.addError');
      toast.error(errorMessage);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      await removeMemberMutation.mutateAsync(selectedMember.id);
      toast.success(t('toast.removeSuccess'));
      setRemoveMemberDialogOpen(false);
      setSelectedMember(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('toast.removeError');
      toast.error(errorMessage);
    }
  };

  const handleLeaveOrganization = async () => {
    try {
      await leaveOrganizationMutation.mutateAsync(orgId);
      toast.success(t('toast.leaveSuccess'));
      router.push('/org');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('toast.leaveError');
      toast.error(errorMessage);
    }
  };

  const openRemoveMemberDialog = (member: OrganizationMember) => {
    setSelectedMember(member);
    setRemoveMemberDialogOpen(true);
  };

  // Loading state
  if (isLoadingOrg || isLoadingMembers) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-10 w-64 bg-bg-secondary animate-pulse rounded-md" />
            <div className="mt-2 h-6 w-48 bg-bg-secondary animate-pulse rounded-md" />
          </div>
        </div>
        <Card>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-bg-secondary animate-pulse rounded-md" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (!organization) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-text-primary">{t('notFound')}</h1>
        </div>
      </div>
    );
  }

  // Empty state
  const isEmpty = members.length === 0;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-text-primary">
            {t('title')}
          </h1>
          <p className="mt-2 text-base text-text-secondary">{t('description')}</p>
        </div>
        <div>
          {isOwner ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setAddMemberDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('addButton')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setLeaveDialogOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('leaveButton')}
            </Button>
          )}
        </div>
      </div>

      {/* Members Table */}
      <Card>
        {isEmpty ? (
          <div className="p-12 text-center">
            <p className="text-text-secondary">{t('emptyState')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tableHeaders.name')}</TableHead>
                <TableHead>{t('tableHeaders.email')}</TableHead>
                <TableHead>{t('tableHeaders.role')}</TableHead>
                {isOwner && <TableHead className="w-16"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {member.profile.imageUrl && (
                        <img
                          src={member.profile.imageUrl}
                          alt={member.profile.fullName || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span className="font-medium text-text-primary">
                        {member.profile.fullName || t('unknownUser')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-text-secondary">{member.profile.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'owner' ? 'default' : 'info'}>
                      {member.role === 'owner' ? t('roleOwner') : t('roleMember')}
                    </Badge>
                  </TableCell>
                  {isOwner && (
                    <TableCell>
                      {member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openRemoveMemberDialog(member)}
                              className="text-danger"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              {t('removeAction')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addDialog.title')}</DialogTitle>
            <DialogDescription>{t('addDialog.description')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-text-primary">
                  {t('addDialog.emailLabel')} <span className="text-danger">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('addDialog.emailPlaceholder')}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setAddMemberDialogOpen(false);
                  setEmail('');
                }}
              >
                {t('addDialog.cancelButton')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={addMemberMutation.isPending}
              >
                {addMemberMutation.isPending ? t('addDialog.addingButton') : t('addDialog.addButton')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirm Dialog */}
      <AlertDialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('removeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('removeDialog.description', {
                name: selectedMember?.profile.fullName || selectedMember?.profile.email || t('unknownUser'),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('removeDialog.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removeMemberMutation.isPending}
              className="bg-danger hover:bg-danger/90"
            >
              {removeMemberMutation.isPending ? t('removeDialog.removingButton') : t('removeDialog.removeButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Organization Confirm Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('leaveDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('leaveDialog.description', { name: organization.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('leaveDialog.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveOrganization}
              disabled={leaveOrganizationMutation.isPending}
              className="bg-danger hover:bg-danger/90"
            >
              {leaveOrganizationMutation.isPending ? t('leaveDialog.leavingButton') : t('leaveDialog.leaveButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
