"use client";

import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button-v2';
import { useCreateOrganization } from '@/features/organizations/hooks/use-organizations';
import { CreateOrganizationRequestSchema } from '@/features/organizations/lib/dto';
import type { CreateOrganizationRequest } from '@/features/organizations/lib/dto';
import { useToast } from '@/hooks/use-toast';

type NewOrganizationPageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewOrganizationPage({ params }: NewOrganizationPageProps) {
  void params;

  const router = useRouter();
  const t = useTranslations('organizations');
  const { toast } = useToast();
  const { mutate: createOrganization, isPending } = useCreateOrganization();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationRequest>({
    resolver: zodResolver(CreateOrganizationRequestSchema),
  });

  const onSubmit = (data: CreateOrganizationRequest) => {
    createOrganization(data, {
      onSuccess: (organization) => {
        toast({
          title: t('toast.createSuccess'),
        });
        router.push(`/org/${organization.id}/members`);
      },
      onError: (error) => {
        toast({
          title: t('toast.createError'),
          description: error instanceof Error ? error.message : undefined,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-medium leading-tight">
          {t('new.title')}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {t('new.description')}
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Organization Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {t('form.name.label')} <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('form.name.placeholder')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Organization Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {t('form.description.label')}
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('form.description.placeholder')}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/org')}
              className="flex-1"
              disabled={isSubmitting || isPending}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || isPending}
              className="flex-1"
            >
              {isSubmitting || isPending ? t('actions.creating') : t('actions.create')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
