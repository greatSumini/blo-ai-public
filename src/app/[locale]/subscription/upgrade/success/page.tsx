'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export default function UpgradeSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    const authKey = searchParams.get('authKey');
    const customerKey = searchParams.get('customerKey');
    const organizationId = searchParams.get('orgId');

    setOrgId(organizationId);

    if (!authKey || !customerKey || !organizationId) {
      setStatus('error');
      setErrorMessage('필수 파라미터가 누락되었습니다.');
      return;
    }

    // 빌링키 발급 API 호출
    fetch('/api/subscription/issue-billing-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authKey,
        customerKey,
        organizationId,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '구독 업그레이드에 실패했습니다.');
        }
        setStatus('success');
      })
      .catch((error) => {
        console.error('Error upgrading subscription:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        );
      });
  }, [searchParams]);

  const handleGoToSubscription = () => {
    if (orgId) {
      router.push(ROUTES.SUBSCRIPTION(orgId));
    }
  };

  if (status === 'processing') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h1 className="text-2xl font-semibold">구독 업그레이드 처리 중...</h1>
          <p className="text-muted-foreground">
            잠시만 기다려주세요. 결제 정보를 확인하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <XCircle className="h-16 w-16 mx-auto text-red-500" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">업그레이드 실패</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <Button onClick={handleGoToSubscription} variant="outline">
            구독 관리로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">업그레이드 완료!</h1>
          <p className="text-muted-foreground">
            Pro 플랜으로 성공적으로 업그레이드되었습니다.
            <br />
            이제 더 많은 기능을 이용하실 수 있습니다.
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={handleGoToSubscription} className="w-full">
            구독 관리 확인하기
          </Button>
          <Button
            onClick={() => router.push(ROUTES.DASHBOARD(orgId!))}
            variant="outline"
            className="w-full"
          >
            대시보드로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}
