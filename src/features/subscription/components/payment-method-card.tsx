'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import type { PaymentMethod } from '../lib/dto';
import { formatCardNumber } from '../lib/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PaymentMethodCardProps {
  paymentMethods: PaymentMethod[];
}

/**
 * Payment method card showing registered cards
 */
export function PaymentMethodCard({
  paymentMethods,
}: PaymentMethodCardProps) {
  if (paymentMethods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>결제 수단</CardTitle>
          <CardDescription>등록된 결제 수단이 없습니다.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 수단</CardTitle>
        <CardDescription>등록된 결제 수단 목록</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {method.cardCompany || '카드사 정보 없음'}
                  </p>
                  {method.isPrimary && (
                    <Badge variant="default" className="text-xs">
                      주 결제수단
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCardNumber(method.cardNumber)}
                </p>
                {method.cardType && (
                  <p className="text-xs text-muted-foreground">
                    {method.cardType === 'credit' && '신용카드'}
                    {method.cardType === 'debit' && '체크카드'}
                    {method.cardType !== 'credit' &&
                      method.cardType !== 'debit' &&
                      method.cardType}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                등록일:{' '}
                {format(new Date(method.createdAt), 'yyyy.MM.dd', {
                  locale: ko,
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
