'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Payment } from '../lib/dto';
import { formatPrice } from '../lib/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PaymentHistoryTableProps {
  payments: Payment[];
}

/**
 * Payment history table showing transaction history
 */
export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
          <CardDescription>결제 내역이 없습니다.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'done':
        return (
          <Badge variant="default" className="bg-green-500">
            완료
          </Badge>
        );
      case 'pending':
        return <Badge variant="outline">대기 중</Badge>;
      case 'failed':
        return (
          <Badge variant="destructive">실패</Badge>
        );
      case 'canceled':
        return <Badge variant="outline">취소됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 내역</CardTitle>
        <CardDescription>
          최근 결제 내역 ({payments.length}건)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead>결제수단</TableHead>
              <TableHead className="text-right">금액</TableHead>
              <TableHead className="text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="text-sm">
                  {payment.approvedAt
                    ? format(new Date(payment.approvedAt), 'yyyy.MM.dd HH:mm', {
                        locale: ko,
                      })
                    : format(new Date(payment.createdAt), 'yyyy.MM.dd HH:mm', {
                        locale: ko,
                      })}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{payment.orderName}</p>
                    <p className="text-xs text-muted-foreground">
                      주문번호: {payment.orderId}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {payment.cardCompany && payment.cardNumber ? (
                    <div className="text-sm">
                      <p>{payment.cardCompany}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.cardNumber}
                      </p>
                    </div>
                  ) : payment.method ? (
                    <p className="text-sm">{payment.method}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">-</p>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(payment.amount)}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(payment.status)}
                  {payment.status === 'failed' && payment.failureMessage && (
                    <p className="mt-1 text-xs text-destructive">
                      {payment.failureMessage}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
