'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export default function UpgradeFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orgId = searchParams.get('orgId');
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  const handleRetry = () => {
    if (orgId) {
      router.push(ROUTES.SUBSCRIPTION(orgId));
    }
  };

  const handleGoToDashboard = () => {
    if (orgId) {
      router.push(ROUTES.DASHBOARD(orgId));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <XCircle className="h-16 w-16 mx-auto text-red-500" />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">업그레이드 실패</h1>
          <p className="text-muted-foreground">
            {errorMessage || '결제 인증 중 오류가 발생했습니다.'}
          </p>
        </div>

        {errorCode && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-left">
                <p className="font-medium text-orange-900 dark:text-orange-100">
                  오류 코드: {errorCode}
                </p>
                <p className="text-orange-700 dark:text-orange-200 mt-1">
                  문제가 지속되면 고객 지원팀에 문의해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full">
            다시 시도하기
          </Button>
          <Button
            onClick={handleGoToDashboard}
            variant="outline"
            className="w-full"
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
