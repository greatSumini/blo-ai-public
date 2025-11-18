'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, TrendingUp } from 'lucide-react';
import type { SubscriptionWithQuota } from '../lib/dto';
import { getPlanByTier, formatPrice } from '../lib/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SubscriptionOverviewProps {
  data: SubscriptionWithQuota;
  onUpgrade?: () => void;
  onCancel?: () => void;
}

/**
 * Subscription overview card showing plan, quota, and billing info
 */
export function SubscriptionOverview({
  data,
  onUpgrade,
  onCancel,
}: SubscriptionOverviewProps) {
  const { subscription, quota } = data;
  const plan = getPlanByTier(subscription.plan);
  const isPro = subscription.plan === 'pro';
  const isActive = subscription.status === 'active';

  // Calculate usage percentage
  const usagePercentage = (quota.generationCount / quota.monthlyLimit) * 100;

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {isPro && <Crown className="h-5 w-5 text-yellow-500" />}
              {plan.name}
            </CardTitle>
            <CardDescription>
              {isPro
                ? `월 ${formatPrice(plan.price)}`
                : '무료 플랜'}
            </CardDescription>
          </div>
          <Badge variant={isActive ? 'default' : 'outline'}>
            {subscription.status === 'active' && '활성'}
            {subscription.status === 'canceled' && '취소됨'}
            {subscription.status === 'expired' && '만료됨'}
            {subscription.status === 'pending' && '대기 중'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">이번 달 생성 횟수</span>
            <span className="font-medium">
              {quota.generationCount} / {quota.monthlyLimit}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {quota.remainingCount}회 남음
          </p>
        </div>

        {/* Billing Period */}
        {isPro && subscription.currentPeriodStart && (
          <div className="space-y-2 rounded-lg border border-border bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">결제 주기</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>시작일: {formatDate(subscription.currentPeriodStart)}</p>
              <p>종료일: {formatDate(subscription.currentPeriodEnd)}</p>
              {subscription.nextBillingDate && (
                <p className="flex items-center gap-1 font-medium text-foreground">
                  <TrendingUp className="h-3 w-3" />
                  다음 결제: {formatDate(subscription.nextBillingDate)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Canceled Info */}
        {subscription.status === 'canceled' && subscription.canceledAt && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              취소됨: {formatDate(subscription.canceledAt)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {subscription.currentPeriodEnd &&
                `${formatDate(subscription.currentPeriodEnd)}까지 이용 가능합니다.`}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isPro && onUpgrade && (
            <Button onClick={onUpgrade} className="flex-1">
              <Crown className="mr-2 h-4 w-4" />
              Pro로 업그레이드
            </Button>
          )}
          {isPro && isActive && onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              구독 취소
            </Button>
          )}
        </div>

        {/* Plan Features */}
        <div className="space-y-2 border-t border-border pt-4">
          <h4 className="text-sm font-medium">플랜 혜택</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-xs">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
