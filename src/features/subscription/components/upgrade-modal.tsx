'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check, Loader2 } from 'lucide-react';
import { PRO_PLAN, formatPrice } from '../lib/constants';
import { useUpgradeSubscription } from '../hooks/use-subscription-mutations';
import { toast } from 'sonner';

interface UpgradeModalProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Toss Payments SDK 타입 정의
interface TossPaymentsSDK {
  requestBillingAuth: (
    method: string,
    options: {
      customerKey: string;
      successUrl: string;
      failUrl: string;
    }
  ) => Promise<void>;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsSDK;
  }
}

/**
 * Upgrade to Pro plan modal with Toss Payments integration
 */
export function UpgradeModal({
  organizationId,
  open,
  onOpenChange,
}: UpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tossPayments, setTossPayments] = useState<TossPaymentsSDK | null>(
    null
  );
  const upgradeMutation = useUpgradeSubscription(organizationId);

  // Load Toss Payments SDK
  useEffect(() => {
    if (!open) return;

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      console.error('NEXT_PUBLIC_TOSS_CLIENT_KEY is not defined');
      return;
    }

    // Check if SDK is already loaded
    if (window.TossPayments) {
      setTossPayments(window.TossPayments(clientKey));
      return;
    }

    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    script.onload = () => {
      if (window.TossPayments) {
        setTossPayments(window.TossPayments(clientKey));
      }
    };
    script.onerror = () => {
      toast.error('결제 모듈 로딩에 실패했습니다.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [open]);

  const handleUpgrade = async () => {
    if (!tossPayments) {
      toast.error('결제 시스템이 준비되지 않았습니다.');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate customer key (organization ID)
      const customerKey = organizationId;

      // Request billing auth from Toss Payments
      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/subscription/upgrade/success?orgId=${organizationId}`,
        failUrl: `${window.location.origin}/subscription/upgrade/fail?orgId=${organizationId}`,
      });

      // SDK will redirect to successUrl or failUrl
      // Backend will handle the callback and process the upgrade
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('업그레이드 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            Pro 플랜으로 업그레이드
          </DialogTitle>
          <DialogDescription>
            더 많은 생성 횟수와 프리미엄 기능을 이용하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price */}
          <div className="rounded-lg border border-border bg-secondary/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">월 정기 결제</p>
            <p className="mt-2 text-4xl font-bold">
              {formatPrice(PRO_PLAN.price)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">/ 월</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="font-medium">포함된 혜택</p>
            <ul className="space-y-2">
              {PRO_PLAN.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notice */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              안내: 업그레이드 시 즉시 Pro 플랜이 적용되며, 첫 결제가
              진행됩니다. 다음 결제일부터 매월 자동 결제됩니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            취소
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isProcessing || !tossPayments}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                업그레이드
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
