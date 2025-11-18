'use client';

import { useState } from 'react';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useCancelSubscription } from '../hooks/use-subscription-mutations';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/lib/remote/api-client';

interface CancelSubscriptionDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPeriodEnd?: string | null;
}

/**
 * Cancel subscription confirmation dialog
 */
export function CancelSubscriptionDialog({
  organizationId,
  open,
  onOpenChange,
  currentPeriodEnd,
}: CancelSubscriptionDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const cancelMutation = useCancelSubscription(organizationId);

  const handleCancel = async () => {
    setIsProcessing(true);

    try {
      await cancelMutation.mutateAsync();
      toast.success('구독이 취소되었습니다.');
      onOpenChange(false);
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '구독 취소 중 오류가 발생했습니다.'
      );
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            구독을 취소하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            <p>
              구독을 취소하시면 다음 결제일부터 자동 결제가 중단됩니다.
            </p>
            {currentPeriodEnd && (
              <p className="font-medium text-foreground">
                현재 결제 주기({new Date(currentPeriodEnd).toLocaleDateString('ko-KR')})까지는
                Pro 플랜을 계속 이용하실 수 있습니다.
              </p>
            )}
            <p className="text-destructive">
              취소 후에는 무료 플랜으로 자동 전환되며, 월 생성 횟수가
              제한됩니다.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            돌아가기
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isProcessing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '구독 취소'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
