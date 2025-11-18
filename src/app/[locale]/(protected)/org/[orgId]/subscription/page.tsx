'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRequiredOrganization } from '@/contexts/organization-context';
import { useSubscription } from '@/features/subscription/hooks/use-subscription';
import { usePaymentMethods } from '@/features/subscription/hooks/use-payment-methods';
import { usePaymentHistory } from '@/features/subscription/hooks/use-payment-history';
import {
  SubscriptionOverview,
  PaymentMethodCard,
  PaymentHistoryTable,
  UpgradeModal,
  CancelSubscriptionDialog,
} from '@/features/subscription/components';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type SubscriptionPageProps = {
  params: Promise<{ orgId: string }>;
};

function SubscriptionContent() {
  const orgId = useRequiredOrganization();
  const searchParams = useSearchParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch subscription data
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    error: subscriptionError,
  } = useSubscription(orgId);

  // Fetch payment methods
  const {
    data: paymentMethods,
    isLoading: isPaymentMethodsLoading,
  } = usePaymentMethods(orgId);

  // Fetch payment history
  const {
    data: paymentHistory,
    isLoading: isPaymentHistoryLoading,
  } = usePaymentHistory(orgId);

  // Handle callback from Toss Payments billing success
  useEffect(() => {
    const billingKey = searchParams.get('billingKey');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (billingKey) {
      toast.success('빌링키가 성공적으로 등록되었습니다.');
      // Clear query params
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (error) {
      toast.error(message || '빌링키 등록에 실패했습니다.');
      // Clear query params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  // Loading state
  if (isSubscriptionLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (subscriptionError) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-destructive font-medium">
            구독 정보를 불러오는데 실패했습니다
          </p>
          <p className="text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!subscription) {
    return null;
  }

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-medium leading-tight">구독 관리</h1>
        <p className="mt-2 text-muted-foreground">
          요금제를 관리하고 결제 내역을 확인하세요.
        </p>
      </div>

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionOverview
          data={subscription}
          onUpgrade={handleUpgrade}
          onCancel={handleCancel}
        />

        {/* Payment Methods */}
        {isPaymentMethodsLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>결제 수단</CardTitle>
              <CardDescription>로딩 중...</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <PaymentMethodCard
            paymentMethods={paymentMethods?.paymentMethods || []}
          />
        )}
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-xl font-medium mb-4">결제 내역</h2>
        {isPaymentHistoryLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>결제 내역</CardTitle>
              <CardDescription>로딩 중...</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <PaymentHistoryTable payments={paymentHistory?.payments || []} />
        )}
      </div>

      {/* Modals */}
      <UpgradeModal
        organizationId={orgId}
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />

      <CancelSubscriptionDialog
        organizationId={orgId}
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        currentPeriodEnd={subscription.subscription.currentPeriodEnd}
      />
    </div>
  );
}

export default function SubscriptionPage({ params }: SubscriptionPageProps) {
  void params;

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      <div className="py-8 md:py-12">
        <Suspense
          fallback={
            <div
              className="flex items-center justify-center min-h-[400px]"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground text-sm">로딩 중...</p>
              </div>
            </div>
          }
        >
          <SubscriptionContent />
        </Suspense>
      </div>
    </div>
  );
}
