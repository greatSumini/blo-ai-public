# 구독결제 기능 구현 계획서

## 목차
1. [개요](#1-개요)
2. [데이터베이스 스키마 검토](#2-데이터베이스-스키마-검토)
3. [백엔드 모듈 설계](#3-백엔드-모듈-설계)
4. [프론트엔드 모듈 설계](#4-프론트엔드-모듈-설계)
5. [페이지별 구현 계획](#5-페이지별-구현-계획)
6. [토스페이먼츠 연동 세부 사항](#6-토스페이먼츠-연동-세부-사항)
7. [Supabase Cron 설정](#7-supabase-cron-설정)
8. [구현 순서](#8-구현-순서)

---

## 1. 개요

### 1.1 목표
토스페이먼츠를 활용한 구독결제 기능 구현으로 무료/Pro 요금제 관리 체계 구축

### 1.2 주요 기능
- **구독 관리 페이지**: 요금제, 결제수단, 결제내역 관리
- **랜딩페이지 요금제 섹션**: 정책에 맞게 수정
- **사이드바**: 구독 상태 표시 및 메뉴 추가
- **글 작성 페이지**: 잔여 횟수 체크 및 제한
- **조직 관리 페이지**: 무료 유저 초대 버튼 비활성화
- **자동 정기결제**: Supabase cron 기반 매일 02:00 실행

### 1.3 요금제 정책
| 항목 | Free | Pro |
|------|------|-----|
| 가격 | 무료 | 29,900원/월 (VAT 포함) |
| 생성 횟수 | 최초 3회 | 월 20회 |
| AI 모델 | gemini-2.5-flash | gemini-2.5-pro |
| 구성원 초대 | 불가 | 가능 |
| 취소 정책 | - | 다음 결제일까지 유지 |

---

## 2. 데이터베이스 스키마 검토

### 2.1 기존 스키마 (0013_create_subscription_tables.sql)

이미 완료된 마이그레이션:
- ✅ `subscriptions` 테이블 생성
- ✅ `payment_methods` 테이블 생성
- ✅ `payments` 테이블 생성
- ✅ `generation_quota` 테이블에 `monthly_limit`, `remaining_count` 추가
- ✅ 기존 조직에 free 구독 자동 생성

### 2.2 스키마 검증 사항

**확인 필요**:
1. `generation_quota.tier` 타입이 `subscription_plan`과 동기화되는지
2. 구독 생성 시 `generation_quota` 레코드도 자동 생성되는지
3. 취소된 구독의 `next_billing_date` 처리 로직

**추가 마이그레이션 불필요**: 현재 스키마가 모든 요구사항을 충족함

---

## 3. 백엔드 모듈 설계

### 3.1 Feature 구조

```
src/features/subscription/
├── backend/
│   ├── route.ts           # Hono 라우터
│   ├── service.ts         # Supabase 비즈니스 로직
│   ├── schema.ts          # Zod 스키마
│   ├── error.ts           # 에러 코드
│   └── toss-client.ts     # 토스페이먼츠 API 클라이언트
├── components/
│   ├── subscription-overview.tsx    # 요금제 현황
│   ├── payment-method-card.tsx      # 결제수단 카드
│   ├── payment-history-table.tsx    # 결제내역 테이블
│   ├── upgrade-modal.tsx            # 업그레이드 모달 (토스 SDK 포함)
│   ├── cancel-subscription-dialog.tsx # 취소 확인 다이얼로그
│   └── subscription-status-badge.tsx  # 사이드바용 상태 배지
├── hooks/
│   ├── use-subscription.ts          # 구독 조회
│   ├── use-payment-methods.ts       # 결제수단 조회
│   ├── use-payment-history.ts       # 결제내역 조회
│   └── use-subscription-mutations.ts # 구독 변경 (업그레이드/취소/재활성화)
└── lib/
    ├── dto.ts             # backend/schema 재노출
    └── constants.ts       # 요금제 정보 상수
```

### 3.2 API 엔드포인트 설계

#### 구독 관련
```typescript
// GET /api/subscriptions/current
// 현재 조직의 구독 정보 조회 (요금제, 상태, 잔여 횟수 포함)
GetCurrentSubscriptionResponseSchema = {
  subscription: {
    id, organizationId, plan, status,
    customerKey, billingKey,
    currentPeriodStart, currentPeriodEnd,
    nextBillingDate, canceledAt
  },
  quota: {
    monthlyLimit, remainingCount, generationCount
  }
}

// POST /api/subscriptions/upgrade
// Pro 요금제로 업그레이드 (빌링키 등록 필요)
UpgradeSubscriptionRequestSchema = {
  billingKey: string,       // 토스 SDK에서 발급받은 billingKey
  cardCompany?: string,
  cardNumber?: string,      // 마스킹된 카드번호
  cardType?: string,
  ownerType?: string
}
UpgradeSubscriptionResponseSchema = {
  subscription: {...},
  payment: {               // 첫 결제 정보
    id, paymentKey, orderId, amount, status, approvedAt
  }
}

// POST /api/subscriptions/cancel
// 구독 취소 (빌링키 삭제, 다음 결제일까지 유지)
CancelSubscriptionResponseSchema = {
  subscription: {
    status: 'canceled',
    canceledAt: Date
  }
}

// POST /api/subscriptions/reactivate
// 취소 상태 철회 (다음 결제일 이전에만 가능)
ReactivateSubscriptionResponseSchema = {
  subscription: {
    status: 'active',
    canceledAt: null
  }
}

// DELETE /api/subscriptions/billing-key
// 빌링키 삭제 (즉시 구독 해지, Free로 전환)
DeleteBillingKeyResponseSchema = {
  subscription: {
    plan: 'free',
    status: 'active',
    billingKey: null,
    nextBillingDate: null
  }
}
```

#### 결제수단 관련
```typescript
// GET /api/subscriptions/payment-methods
// 등록된 결제수단 목록
GetPaymentMethodsResponseSchema = {
  paymentMethods: [
    { id, billingKey, cardCompany, cardNumber, cardType, isPrimary, createdAt }
  ]
}

// GET /api/subscriptions/payments
// 결제 내역 조회
GetPaymentsResponseSchema = {
  payments: [
    { id, paymentKey, orderId, orderName, amount, status, method,
      cardCompany, cardNumber, approvedAt, failedAt, failureMessage }
  ]
}
```

#### Cron 트리거
```typescript
// POST /api/cron/billing
// Supabase cron에서 호출 (비밀 토큰 검증)
// Header: x-cron-secret: process.env.CRON_SECRET_TOKEN
BillingCronResponseSchema = {
  processed: number,      // 처리된 구독 수
  succeeded: number,      // 성공한 결제 수
  failed: number,         // 실패한 결제 수
  errors: [
    { subscriptionId, organizationId, error }
  ]
}
```

### 3.3 Service Layer 설계

#### service.ts 주요 함수

```typescript
// ===== 구독 조회 =====
export async function getCurrentSubscription(
  supabase: SupabaseClient,
  organizationId: string
): Promise<DomainResult<SubscriptionWithQuota, DomainError>>

// ===== 구독 변경 =====
export async function upgradeSubscription(
  supabase: SupabaseClient,
  organizationId: string,
  data: UpgradeSubscriptionRequest
): Promise<DomainResult<SubscriptionUpgradeResult, DomainError>>
// 1. subscriptions 테이블 업데이트 (plan=pro, billingKey, nextBillingDate)
// 2. payment_methods 테이블에 카드 정보 저장
// 3. 토스페이먼츠 자동결제 승인 API 호출
// 4. payments 테이블에 결제 기록 저장
// 5. generation_quota 업데이트 (tier=pro, monthlyLimit=20, remainingCount=20)

export async function cancelSubscription(
  supabase: SupabaseClient,
  organizationId: string
): Promise<DomainResult<Subscription, DomainError>>
// 1. subscriptions 업데이트 (status=canceled, canceledAt=now)
// 2. 토스페이먼츠 빌링키 삭제 API 호출 (BILLING_DELETED 웹훅 처리)

export async function reactivateSubscription(
  supabase: SupabaseClient,
  organizationId: string
): Promise<DomainResult<Subscription, DomainError>>
// 1. 다음 결제일 이전인지 확인
// 2. subscriptions 업데이트 (status=active, canceledAt=null)

export async function deleteBillingKey(
  supabase: SupabaseClient,
  organizationId: string
): Promise<DomainResult<Subscription, DomainError>>
// 1. 토스페이먼츠 빌링키 삭제 API 호출
// 2. subscriptions 업데이트 (plan=free, billingKey=null, nextBillingDate=null)
// 3. payment_methods 삭제
// 4. generation_quota 업데이트 (tier=free, monthlyLimit=3, remainingCount=3)

// ===== 결제수단/내역 조회 =====
export async function getPaymentMethods(
  supabase: SupabaseClient,
  organizationId: string
): Promise<DomainResult<PaymentMethod[], DomainError>>

export async function getPaymentHistory(
  supabase: SupabaseClient,
  organizationId: string,
  limit?: number
): Promise<DomainResult<Payment[], DomainError>>

// ===== Cron 정기결제 =====
export async function processBillingCron(
  supabase: SupabaseClient
): Promise<DomainResult<BillingCronResult, DomainError>>
// 1. 오늘이 nextBillingDate인 active 구독 조회
// 2. 각 구독별로:
//    a. 토스페이먼츠 자동결제 승인 API 호출
//    b. 성공 시: payments 저장, generation_quota 리셋, nextBillingDate += 1month
//    c. 실패 시: subscriptions.status=expired, billingKey=null

// ===== 잔여 횟수 차감 =====
export async function decrementGenerationQuota(
  supabase: SupabaseClient,
  organizationId: string
): Promise<DomainResult<GenerationQuota, DomainError>>
// 1. generation_quota 조회
// 2. remainingCount > 0 확인
// 3. generationCount++, remainingCount-- 업데이트
```

### 3.4 Zod 스키마 (schema.ts)

```typescript
// ===== Request Schemas =====
export const UpgradeSubscriptionRequestSchema = z.object({
  billingKey: z.string().min(1),
  cardCompany: z.string().optional(),
  cardNumber: z.string().optional(),
  cardType: z.string().optional(),
  ownerType: z.string().optional(),
});

// ===== Response Schemas =====
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  plan: z.enum(['free', 'pro']),
  status: z.enum(['active', 'canceled', 'expired', 'pending']),
  customerKey: z.string().nullable(),
  billingKey: z.string().nullable(),
  currentPeriodStart: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
  nextBillingDate: z.string().nullable(),
  canceledAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GenerationQuotaSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  tier: z.enum(['free', 'pro']),
  monthlyLimit: z.number().int(),
  generationCount: z.number().int(),
  remainingCount: z.number().int(),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
});

export const SubscriptionWithQuotaSchema = z.object({
  subscription: SubscriptionSchema,
  quota: GenerationQuotaSchema,
});

export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  billingKey: z.string(),
  cardCompany: z.string().nullable(),
  cardNumber: z.string().nullable(),
  cardType: z.string().nullable(),
  ownerType: z.string().nullable(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
});

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  paymentKey: z.string().nullable(),
  orderId: z.string(),
  orderName: z.string(),
  amount: z.number().int(),
  status: z.enum(['pending', 'done', 'failed', 'canceled']),
  method: z.string().nullable(),
  cardCompany: z.string().nullable(),
  cardNumber: z.string().nullable(),
  approvedAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  failureCode: z.string().nullable(),
  failureMessage: z.string().nullable(),
  createdAt: z.string(),
});
```

### 3.5 에러 코드 (error.ts)

```typescript
export const subscriptionErrorCodes = {
  // 일반 에러
  validationError: 'VALIDATION_ERROR',
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',

  // 구독 에러
  subscriptionNotFound: 'SUBSCRIPTION_NOT_FOUND',
  alreadyProSubscriber: 'ALREADY_PRO_SUBSCRIBER',
  alreadyCanceled: 'ALREADY_CANCELED',
  cannotReactivate: 'CANNOT_REACTIVATE',
  noBillingKey: 'NO_BILLING_KEY',

  // 할당량 에러
  quotaExceeded: 'QUOTA_EXCEEDED',
  quotaNotFound: 'QUOTA_NOT_FOUND',

  // 결제 에러
  paymentFailed: 'PAYMENT_FAILED',
  billingKeyIssueFailed: 'BILLING_KEY_ISSUE_FAILED',
  billingKeyDeleteFailed: 'BILLING_KEY_DELETE_FAILED',

  // 데이터베이스 에러
  databaseError: 'DATABASE_ERROR',
} as const;
```

### 3.6 토스페이먼츠 클라이언트 (toss-client.ts)

```typescript
import axios from 'axios';

const TOSS_BASE_URL = 'https://api.tosspayments.com/v1';

export class TossPaymentsClient {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private getHeaders() {
    const encoded = Buffer.from(`${this.secretKey}:`).toString('base64');
    return {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 자동결제 승인 (빌링키 기반)
   */
  async approveBillingPayment(params: {
    billingKey: string;
    customerKey: string;
    amount: number;
    orderId: string;
    orderName: string;
  }) {
    const response = await axios.post(
      `${TOSS_BASE_URL}/billing/${params.billingKey}`,
      {
        customerKey: params.customerKey,
        amount: params.amount,
        orderId: params.orderId,
        orderName: params.orderName,
      },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * 빌링키 삭제
   */
  async deleteBillingKey(params: {
    billingKey: string;
    customerKey: string;
  }) {
    const response = await axios.delete(
      `${TOSS_BASE_URL}/billing/authorizations/${params.billingKey}`,
      {
        headers: this.getHeaders(),
        data: { customerKey: params.customerKey },
      }
    );
    return response.data;
  }
}

export function createTossClient() {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY is not defined');
  }
  return new TossPaymentsClient(secretKey);
}
```

---

## 4. 프론트엔드 모듈 설계

### 4.1 컴포넌트 구조

#### subscription-overview.tsx
```typescript
"use client";

interface SubscriptionOverviewProps {
  subscription: Subscription;
  quota: GenerationQuota;
}

export function SubscriptionOverview({ subscription, quota }: SubscriptionOverviewProps) {
  // 현재 요금제 정보 표시 (Free/Pro)
  // 상태 배지 (active, canceled, expired)
  // 잔여 생성 횟수 프로그레스 바
  // 다음 결제일 (Pro만)
  // 액션 버튼:
  //   - Free: "Pro로 업그레이드" 버튼
  //   - Pro(active): "구독 취소" 버튼
  //   - Pro(canceled): "취소 철회" 버튼, "즉시 해지" 버튼

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      {/* UI 구현 */}
    </div>
  );
}
```

#### payment-method-card.tsx
```typescript
"use client";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod | null;
  onDelete?: () => void;
}

export function PaymentMethodCard({ paymentMethod, onDelete }: PaymentMethodCardProps) {
  // 카드 정보 표시 (카드사, 마스킹된 번호, 카드 타입)
  // 없으면 "등록된 결제수단 없음" 메시지
  // 삭제 버튼 (확인 다이얼로그)

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      {/* UI 구현 */}
    </div>
  );
}
```

#### payment-history-table.tsx
```typescript
"use client";

interface PaymentHistoryTableProps {
  payments: Payment[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  // 결제 내역 테이블 (날짜, 금액, 상태, 실패 사유)
  // Shadcn Table 컴포넌트 사용
  // 최근순 정렬

  return (
    <Table>
      {/* UI 구현 */}
    </Table>
  );
}
```

#### upgrade-modal.tsx
```typescript
"use client";

import { loadTossPayments } from '@tosspayments/payment-sdk';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerKey: string;
  organizationId: string;
}

export function UpgradeModal({ open, onOpenChange, customerKey, organizationId }: UpgradeModalProps) {
  // 1. 요금제 정보 안내 (월 29,900원, 20회 생성)
  // 2. "카드 등록하기" 버튼 클릭
  // 3. 토스 SDK 초기화 및 카드 등록 UI 표시
  // 4. 빌링키 발급 후 서버 API 호출 (POST /api/subscriptions/upgrade)
  // 5. 성공 시 모달 닫고 refetch

  const handleRegisterCard = async () => {
    const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);

    const billingKeyResult = await tossPayments.requestBillingAuth('카드', {
      customerKey,
      successUrl: `${window.location.origin}/api/subscription/billing-success`,
      failUrl: `${window.location.origin}/subscription?error=billing-failed`,
    });

    // 성공 시 서버에 빌링키 전달
    // await upgradeSubscriptionMutation.mutateAsync({ billingKey: ... });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* UI 구현 */}
    </Dialog>
  );
}
```

#### cancel-subscription-dialog.tsx
```typescript
"use client";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  nextBillingDate: string;
}

export function CancelSubscriptionDialog({ open, onOpenChange, onConfirm, nextBillingDate }: CancelSubscriptionDialogProps) {
  // 취소 확인 안내
  // "다음 결제일({nextBillingDate})까지 이용 가능합니다"
  // "취소" / "확인" 버튼

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* UI 구현 */}
    </AlertDialog>
  );
}
```

#### subscription-status-badge.tsx (사이드바용)
```typescript
"use client";

interface SubscriptionStatusBadgeProps {
  plan: 'free' | 'pro';
  remainingCount: number;
  monthlyLimit: number;
  nextBillingDate?: string | null;
}

export function SubscriptionStatusBadge({ plan, remainingCount, monthlyLimit, nextBillingDate }: SubscriptionStatusBadgeProps) {
  // 요금제 이름 (Free/Pro)
  // 잔여 횟수 (n/m회)
  // 다음 결제일 (Pro만)
  // 미니멀한 디자인, 컴팩트한 레이아웃

  return (
    <div className="rounded-lg border border-border bg-secondary p-3 text-xs">
      {/* UI 구현 */}
    </div>
  );
}
```

### 4.2 React Query 훅 설계

#### use-subscription.ts
```typescript
"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  current: (orgId: string) => [...subscriptionKeys.all, 'current', orgId] as const,
  paymentMethods: (orgId: string) => [...subscriptionKeys.all, 'payment-methods', orgId] as const,
  payments: (orgId: string) => [...subscriptionKeys.all, 'payments', orgId] as const,
};

export function useSubscription(organizationId: string) {
  return useQuery({
    queryKey: subscriptionKeys.current(organizationId),
    queryFn: async () => {
      const response = await apiClient.get(`/api/subscriptions/current?orgId=${organizationId}`);
      return response.data;
    },
    enabled: !!organizationId,
  });
}
```

#### use-payment-methods.ts
```typescript
"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';

export function usePaymentMethods(organizationId: string) {
  return useQuery({
    queryKey: subscriptionKeys.paymentMethods(organizationId),
    queryFn: async () => {
      const response = await apiClient.get(`/api/subscriptions/payment-methods?orgId=${organizationId}`);
      return response.data;
    },
    enabled: !!organizationId,
  });
}
```

#### use-payment-history.ts
```typescript
"use client";

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';

export function usePaymentHistory(organizationId: string) {
  return useQuery({
    queryKey: subscriptionKeys.payments(organizationId),
    queryFn: async () => {
      const response = await apiClient.get(`/api/subscriptions/payments?orgId=${organizationId}`);
      return response.data;
    },
    enabled: !!organizationId,
  });
}
```

#### use-subscription-mutations.ts
```typescript
"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { subscriptionKeys } from './use-subscription';

export function useUpgradeSubscription(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpgradeSubscriptionRequest) => {
      const response = await apiClient.post('/api/subscriptions/upgrade', { ...data, organizationId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current(organizationId) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethods(organizationId) });
    },
  });
}

export function useCancelSubscription(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/subscriptions/cancel', { organizationId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current(organizationId) });
    },
  });
}

export function useReactivateSubscription(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/subscriptions/reactivate', { organizationId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current(organizationId) });
    },
  });
}

export function useDeleteBillingKey(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/api/subscriptions/billing-key?orgId=${organizationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current(organizationId) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethods(organizationId) });
    },
  });
}
```

### 4.3 상태 관리

**Zustand 사용 불필요**: React Query의 서버 상태 관리만으로 충분

---

## 5. 페이지별 구현 계획

### 5.1 구독 관리 페이지

**경로**: `/src/app/[locale]/(protected)/[orgId]/subscription/page.tsx`

**레이아웃**:
```
┌─────────────────────────────────────────┐
│ 구독 관리                                │
├─────────────────────────────────────────┤
│                                         │
│  [SubscriptionOverview]                 │
│  - 현재 요금제 정보                      │
│  - 상태 배지                             │
│  - 잔여 횟수 프로그레스 바               │
│  - 다음 결제일                           │
│  - 액션 버튼 (업그레이드/취소/재활성화)  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [PaymentMethodCard]                    │
│  - 등록된 결제수단 정보                  │
│  - 삭제 버튼                             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [PaymentHistoryTable]                  │
│  - 결제 내역 테이블                      │
│                                         │
└─────────────────────────────────────────┘
```

**구현**:
```typescript
"use client";

import { useCurrentOrganization } from '@/contexts/organization-context';
import { useSubscription } from '@/features/subscription/hooks/use-subscription';
import { usePaymentMethods } from '@/features/subscription/hooks/use-payment-methods';
import { usePaymentHistory } from '@/features/subscription/hooks/use-payment-history';
import { SubscriptionOverview } from '@/features/subscription/components/subscription-overview';
import { PaymentMethodCard } from '@/features/subscription/components/payment-method-card';
import { PaymentHistoryTable } from '@/features/subscription/components/payment-history-table';

export default function SubscriptionPage() {
  const { orgId } = useCurrentOrganization();
  const { data: subscriptionData, isLoading: subLoading } = useSubscription(orgId!);
  const { data: paymentMethodsData, isLoading: pmLoading } = usePaymentMethods(orgId!);
  const { data: paymentsData, isLoading: phLoading } = usePaymentHistory(orgId!);

  if (subLoading || pmLoading || phLoading) {
    return <div>로딩 중...</div>;
  }

  const subscription = subscriptionData?.subscription;
  const quota = subscriptionData?.quota;
  const paymentMethods = paymentMethodsData?.paymentMethods || [];
  const payments = paymentsData?.payments || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-medium text-text-primary">구독 관리</h1>

      <SubscriptionOverview subscription={subscription} quota={quota} />

      <PaymentMethodCard
        paymentMethod={paymentMethods[0] || null}
        onDelete={() => {/* 삭제 핸들러 */}}
      />

      <div>
        <h2 className="text-xl font-medium text-text-primary mb-4">결제 내역</h2>
        <PaymentHistoryTable payments={payments} />
      </div>
    </div>
  );
}
```

### 5.2 랜딩페이지 요금제 섹션 수정

**파일**: `/src/features/landing/components/pricing-section.tsx`

**변경 사항**:
- Free 플랜: "최초 3회 생성 가능" 강조
- Pro 플랜: "월 20회 생성", "29,900원/월" 명시
- Features 수정:
  - Free: gemini-2.5-flash, 3회 생성, 구성원 초대 불가
  - Pro: gemini-2.5-pro, 월 20회 생성, 무제한 구성원 초대

**i18n 키 추가** (messages/ko.json, messages/en.json):
```json
{
  "landing": {
    "pricing": {
      "free": {
        "name": "Free",
        "description": "개인 사용자를 위한 무료 플랜",
        "price": "무료",
        "period": "",
        "cta": "무료로 시작하기",
        "features": {
          "articles": "최초 3회 글 생성 (gemini-2.5-flash)",
          "keywords": "키워드 추출 및 관리",
          "brandings": "브랜딩 관리",
          "invite": "구성원 초대 불가"
        }
      },
      "pro": {
        "name": "Pro",
        "description": "팀을 위한 프리미엄 플랜",
        "price": "29,900원",
        "period": "/월",
        "cta": "Pro로 시작하기",
        "badge": "추천",
        "roi": "하루 1,000원으로 고품질 콘텐츠 20개",
        "features": {
          "articles": "월 20회 글 생성 (gemini-2.5-pro)",
          "keywords": "키워드 추출 및 관리",
          "brandings": "브랜딩 관리",
          "invite": "무제한 구성원 초대",
          "priority_support": "우선 지원"
        }
      }
    }
  }
}
```

### 5.3 사이드바 수정

**파일**: `/src/components/layout/sidebar.tsx`

**변경 사항**:

1. **메뉴 추가**: "구독 관리" 메뉴 항목 추가

```typescript
// menuGroups에 추가
{
  label: t("sidebar.group.subscription"),
  items: [
    {
      icon: CreditCard, // lucide-react에서 import
      label: t("sidebar.subscription"),
      href: ROUTES.SUBSCRIPTION(orgId),
    },
  ],
}
```

2. **하단 구독 상태 표시**:

```typescript
// sidebar.tsx 하단에 추가
import { useSubscription } from '@/features/subscription/hooks/use-subscription';
import { SubscriptionStatusBadge } from '@/features/subscription/components/subscription-status-badge';

export function Sidebar() {
  // ... 기존 코드
  const { data: subscriptionData } = useSubscription(orgId!);

  return (
    <aside className="hidden w-64 border-r border-border-default bg-bg-primary md:block">
      <div className="flex h-full flex-col gap-4 p-4">
        {/* 기존 메뉴 */}

        {/* 하단에 구독 상태 추가 */}
        <div className="mt-auto">
          {subscriptionData && (
            <SubscriptionStatusBadge
              plan={subscriptionData.subscription.plan}
              remainingCount={subscriptionData.quota.remainingCount}
              monthlyLimit={subscriptionData.quota.monthlyLimit}
              nextBillingDate={subscriptionData.subscription.nextBillingDate}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
```

3. **i18n 키 추가**:
```json
{
  "sidebar": {
    "group": {
      "subscription": "구독"
    },
    "subscription": "구독 관리"
  }
}
```

### 5.4 글 작성 페이지 수정

**파일**: `/src/app/[locale]/(protected)/[orgId]/articles/new/page.tsx`

**변경 사항**:

1. **상단에 잔여 횟수 표시**:
```typescript
"use client";

import { useSubscription } from '@/features/subscription/hooks/use-subscription';

export default function NewArticlePage() {
  const { orgId } = useCurrentOrganization();
  const { data: subscriptionData } = useSubscription(orgId!);

  const quota = subscriptionData?.quota;
  const remainingCount = quota?.remainingCount ?? 0;
  const monthlyLimit = quota?.monthlyLimit ?? 3;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 잔여 횟수 배너 */}
      {remainingCount === 0 ? (
        <div className="rounded-lg border border-error bg-error/5 p-4">
          <p className="text-sm text-error">
            생성 가능 횟수를 모두 사용했습니다.
            <Link href={ROUTES.SUBSCRIPTION(orgId)} className="underline ml-1">
              구독 관리 페이지
            </Link>
            에서 Pro 요금제로 업그레이드하세요.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-secondary p-4">
          <p className="text-sm text-muted-foreground">
            이번 달 남은 생성 횟수: <span className="font-medium text-foreground">{remainingCount}/{monthlyLimit}회</span>
          </p>
        </div>
      )}

      {/* 기존 폼 */}
      {remainingCount > 0 ? (
        <ArticleGenerationForm />
      ) : (
        <div className="text-center text-muted-foreground">
          생성 가능 횟수를 모두 사용했습니다.
        </div>
      )}
    </div>
  );
}
```

2. **서버 측 검증** (articles/backend/route.ts):
```typescript
app.post('/api/articles/generate', async (c) => {
  // ... 기존 인증 로직

  // 1. 잔여 횟수 확인
  const quotaResult = await checkGenerationQuota(supabase, organizationId);
  if (!quotaResult.ok) {
    return c.json(
      failure(403, articleErrorCodes.quotaExceeded, '생성 가능 횟수를 초과했습니다.'),
      403
    );
  }

  // 2. 잔여 횟수 차감
  const decrementResult = await decrementGenerationQuota(supabase, organizationId);
  if (!decrementResult.ok) {
    return c.json(
      failure(500, articleErrorCodes.quotaUpdateFailed, '할당량 업데이트에 실패했습니다.'),
      500
    );
  }

  // 3. 구독 플랜에 따라 AI 모델 선택
  const { plan } = await getCurrentSubscription(supabase, organizationId);
  const aiModel = plan === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  // 4. 글 생성 로직 (기존)
  // ...
});
```

### 5.5 조직 관리 페이지 수정

**파일**: `/src/app/[locale]/(protected)/[orgId]/members/page.tsx`

**변경 사항**:

**초대 버튼 조건부 비활성화**:
```typescript
"use client";

import { useSubscription } from '@/features/subscription/hooks/use-subscription';
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MembersPage() {
  const { orgId } = useCurrentOrganization();
  const { data: subscriptionData } = useSubscription(orgId!);

  const isFree = subscriptionData?.subscription.plan === 'free';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium text-text-primary">구성원 관리</h1>

        {isFree ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled className="gap-2">
                  <AlertCircle className="w-4 h-4" />
                  구성원 초대
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>구성원 초대는 Pro 요금제에서만 가능합니다.</p>
                <Link href={ROUTES.SUBSCRIPTION(orgId)} className="text-accent-brand underline">
                  Pro로 업그레이드
                </Link>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button onClick={() => setInviteModalOpen(true)}>
            구성원 초대
          </Button>
        )}
      </div>

      {/* 기존 구성원 목록 */}
    </div>
  );
}
```

---

## 6. 토스페이먼츠 연동 세부 사항

### 6.1 SDK 초기화 (업그레이드 모달)

**설치**:
```bash
pnpm add @tosspayments/payment-sdk
```

**환경변수 추가** (.env.local):
```
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_XXX
TOSS_SECRET_KEY=test_sk_XXX
```

**사용 예시** (upgrade-modal.tsx):
```typescript
import { loadTossPayments } from '@tosspayments/payment-sdk';

const handleRegisterCard = async () => {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
  const tossPayments = await loadTossPayments(clientKey);

  // 빌링키 발급 요청
  const billingKeyResult = await tossPayments.requestBillingAuth('카드', {
    customerKey: subscription.customerKey,
    successUrl: `${window.location.origin}/api/subscription/billing-success`,
    failUrl: `${window.location.origin}/subscription?error=billing-failed`,
  });

  // 성공 시 successUrl로 리디렉션되며 query에 billingKey, authKey 포함
  // /api/subscription/billing-success에서 처리
};
```

### 6.2 빌링키 발급 콜백 처리

**파일**: `/src/app/api/subscription/billing-success/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createHonoApp } from '@/backend/hono/app';

export const runtime = 'nodejs';

// GET /api/subscription/billing-success?authKey=xxx&customerKey=yyy
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authKey = searchParams.get('authKey');
  const customerKey = searchParams.get('customerKey');

  if (!authKey || !customerKey) {
    return NextResponse.redirect(new URL('/subscription?error=invalid-params', request.url));
  }

  try {
    // 토스페이먼츠 빌링키 발급 API 호출
    const tossClient = createTossClient();
    const billingKeyData = await tossClient.issueBillingKey({ authKey, customerKey });

    // 발급된 빌링키를 쿼리로 포함하여 프론트엔드로 리디렉션
    const redirectUrl = new URL('/subscription', request.url);
    redirectUrl.searchParams.set('billingKey', billingKeyData.billingKey);
    redirectUrl.searchParams.set('cardCompany', billingKeyData.card.company);
    redirectUrl.searchParams.set('cardNumber', billingKeyData.card.number);
    redirectUrl.searchParams.set('cardType', billingKeyData.card.cardType);
    redirectUrl.searchParams.set('ownerType', billingKeyData.card.ownerType);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Billing key issue failed:', error);
    return NextResponse.redirect(new URL('/subscription?error=billing-key-issue-failed', request.url));
  }
}
```

**프론트엔드 처리** (subscription/page.tsx):
```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const billingKey = urlParams.get('billingKey');

  if (billingKey) {
    // 업그레이드 API 호출
    upgradeSubscriptionMutation.mutate({
      billingKey,
      cardCompany: urlParams.get('cardCompany') || undefined,
      cardNumber: urlParams.get('cardNumber') || undefined,
      cardType: urlParams.get('cardType') || undefined,
      ownerType: urlParams.get('ownerType') || undefined,
    });

    // URL에서 파라미터 제거
    window.history.replaceState({}, '', '/subscription');
  }
}, []);
```

### 6.3 자동결제 승인 API

**호출 위치**:
- `upgradeSubscription` 서비스 함수 (첫 결제)
- `processBillingCron` 서비스 함수 (정기결제)

**구현**:
```typescript
// service.ts
const tossClient = createTossClient();

const orderId = `order_${organizationId}_${Date.now()}`;
const orderName = 'IndieBlog Pro 월간 구독';
const amount = 29900;

const paymentResult = await tossClient.approveBillingPayment({
  billingKey: subscription.billingKey,
  customerKey: subscription.customerKey,
  amount,
  orderId,
  orderName,
});

// payments 테이블에 저장
await supabase.from('payments').insert({
  organization_id: organizationId,
  subscription_id: subscription.id,
  payment_key: paymentResult.paymentKey,
  order_id: orderId,
  order_name: orderName,
  amount,
  status: 'done',
  method: paymentResult.method,
  card_company: paymentResult.card?.company,
  card_number: paymentResult.card?.number,
  approved_at: paymentResult.approvedAt,
});
```

### 6.4 빌링키 삭제 API

**호출 위치**:
- `cancelSubscription` 서비스 함수 (구독 취소)
- `deleteBillingKey` 서비스 함수 (즉시 해지)

**구현**:
```typescript
// service.ts
const tossClient = createTossClient();

await tossClient.deleteBillingKey({
  billingKey: subscription.billingKey,
  customerKey: subscription.customerKey,
});

// subscriptions 테이블 업데이트
await supabase.from('subscriptions').update({
  billing_key: null,
  status: 'canceled', // 또는 'expired'
  canceled_at: new Date().toISOString(),
}).eq('id', subscription.id);

// payment_methods 삭제
await supabase.from('payment_methods').delete().eq('subscription_id', subscription.id);
```

### 6.5 웹훅 처리 (BILLING_DELETED)

**파일**: `/src/app/api/webhooks/toss/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/backend/supabase/server-client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 웹훅 검증 (토스페이먼츠 가이드 참고)
    // ...

    if (body.eventType === 'BILLING_DELETED') {
      const { billingKey } = body.data;

      const supabase = createSupabaseServerClient();

      // 해당 빌링키의 구독 찾기
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('billing_key', billingKey)
        .single();

      if (subscription) {
        // 구독 상태 업데이트
        await supabase.from('subscriptions').update({
          billing_key: null,
          status: 'expired',
          canceled_at: new Date().toISOString(),
        }).eq('id', subscription.id);

        // payment_methods 삭제
        await supabase.from('payment_methods').delete().eq('subscription_id', subscription.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

---

## 7. Supabase Cron 설정

### 7.1 Cron 함수 정의 (Supabase Dashboard)

**SQL 함수 생성** (Supabase SQL Editor에서 실행):

```sql
-- 정기결제 트리거 함수
CREATE OR REPLACE FUNCTION trigger_billing_cron()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Next.js API 호출
  PERFORM
    net.http_post(
      url := 'https://yourdomain.com/api/cron/billing',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', current_setting('app.cron_secret_token')
      ),
      body := '{}'::jsonb
    );
END;
$$;

-- Cron 스케줄 등록 (매일 02:00 KST = 17:00 UTC)
SELECT cron.schedule(
  'billing-cron',
  '0 17 * * *',
  $$SELECT trigger_billing_cron();$$
);
```

**환경변수 설정** (Supabase Dashboard → Settings → Vault):
```
app.cron_secret_token = "your-random-secret-token-here"
```

### 7.2 Next.js API 엔드포인트

**파일**: `/src/app/api/cron/billing/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/backend/supabase/server-client';
import { processBillingCron } from '@/features/subscription/backend/service';
import { getLogger } from '@/backend/hono/context';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5분 타임아웃

export async function POST(request: NextRequest) {
  // 1. 비밀 토큰 검증
  const cronSecret = request.headers.get('x-cron-secret');
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logger = getLogger();
  logger.info('Billing cron triggered');

  try {
    const supabase = createSupabaseServerClient();
    const result = await processBillingCron(supabase);

    if (!result.ok) {
      logger.error('Billing cron failed', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    logger.info('Billing cron completed', result.data);
    return NextResponse.json(result.data);
  } catch (error) {
    logger.error('Billing cron error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 7.3 processBillingCron 서비스 구현

**파일**: `/src/features/subscription/backend/service.ts`

```typescript
export async function processBillingCron(
  supabase: SupabaseClient
): Promise<DomainResult<BillingCronResult, DomainError>> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 1. 오늘이 결제일인 active 구독 조회
  const { data: subscriptions, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .eq('plan', 'pro')
    .eq('next_billing_date', today)
    .not('billing_key', 'is', null);

  if (fetchError) {
    return domainFailure({
      code: subscriptionErrorCodes.databaseError,
      message: 'Failed to fetch subscriptions for billing',
      details: { error: fetchError.message },
    });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return domainSuccess({
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    });
  }

  const tossClient = createTossClient();
  let succeeded = 0;
  let failed = 0;
  const errors: any[] = [];

  // 2. 각 구독별로 결제 시도
  for (const sub of subscriptions) {
    try {
      const orderId = `order_${sub.organization_id}_${Date.now()}`;
      const orderName = 'IndieBlog Pro 월간 구독';
      const amount = 29900;

      // 토스 자동결제 승인
      const paymentResult = await tossClient.approveBillingPayment({
        billingKey: sub.billing_key,
        customerKey: sub.customer_key,
        amount,
        orderId,
        orderName,
      });

      // 결제 성공 시
      // a. payments 테이블에 저장
      await supabase.from('payments').insert({
        organization_id: sub.organization_id,
        subscription_id: sub.id,
        payment_key: paymentResult.paymentKey,
        order_id: orderId,
        order_name: orderName,
        amount,
        status: 'done',
        method: paymentResult.method,
        card_company: paymentResult.card?.company,
        card_number: paymentResult.card?.number,
        approved_at: paymentResult.approvedAt,
      });

      // b. generation_quota 리셋
      await supabase.from('generation_quota').update({
        generation_count: 0,
        remaining_count: 20,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq('organization_id', sub.organization_id);

      // c. subscriptions.next_billing_date += 1달
      const nextBillingDate = new Date(sub.next_billing_date);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await supabase.from('subscriptions').update({
        current_period_start: new Date().toISOString(),
        current_period_end: nextBillingDate.toISOString(),
        next_billing_date: nextBillingDate.toISOString().split('T')[0],
      }).eq('id', sub.id);

      succeeded++;
    } catch (error: any) {
      // 결제 실패 시
      // a. payments 테이블에 실패 기록
      await supabase.from('payments').insert({
        organization_id: sub.organization_id,
        subscription_id: sub.id,
        order_id: `order_${sub.organization_id}_${Date.now()}`,
        order_name: 'IndieBlog Pro 월간 구독',
        amount: 29900,
        status: 'failed',
        failed_at: new Date().toISOString(),
        failure_code: error.code || 'UNKNOWN',
        failure_message: error.message || 'Payment failed',
      });

      // b. subscriptions.status=expired, billingKey=null
      await supabase.from('subscriptions').update({
        status: 'expired',
        billing_key: null,
        next_billing_date: null,
      }).eq('id', sub.id);

      // c. generation_quota를 free로 전환
      await supabase.from('generation_quota').update({
        tier: 'free',
        monthly_limit: 3,
        remaining_count: 0, // 이미 사용한 횟수는 유지
      }).eq('organization_id', sub.organization_id);

      failed++;
      errors.push({
        subscriptionId: sub.id,
        organizationId: sub.organization_id,
        error: error.message,
      });
    }
  }

  return domainSuccess({
    processed: subscriptions.length,
    succeeded,
    failed,
    errors,
  });
}
```

---

## 8. 구현 순서

### Phase 1: 백엔드 기반 구축
1. **토스페이먼츠 클라이언트 구현** (`toss-client.ts`)
2. **Zod 스키마 정의** (`schema.ts`)
3. **에러 코드 정의** (`error.ts`)
4. **서비스 레이어 구현** (`service.ts`)
   - getCurrentSubscription
   - upgradeSubscription
   - cancelSubscription
   - reactivateSubscription
   - deleteBillingKey
   - getPaymentMethods
   - getPaymentHistory
   - decrementGenerationQuota
   - processBillingCron
5. **Hono 라우터 등록** (`route.ts`)
6. **Hono 앱에 라우터 등록** (`app.ts`)

### Phase 2: 프론트엔드 훅 및 컴포넌트
1. **React Query 훅 구현**
   - use-subscription.ts
   - use-payment-methods.ts
   - use-payment-history.ts
   - use-subscription-mutations.ts
2. **기본 컴포넌트 구현**
   - subscription-status-badge.tsx (사이드바용)
   - payment-method-card.tsx
   - payment-history-table.tsx
3. **업그레이드 모달 구현** (토스 SDK 연동)
   - upgrade-modal.tsx
   - billing-success API 라우트

### Phase 3: 페이지 구현
1. **구독 관리 페이지** (`/subscription/page.tsx`)
   - SubscriptionOverview 컴포넌트
   - PaymentMethodCard 통합
   - PaymentHistoryTable 통합
2. **랜딩페이지 수정** (`pricing-section.tsx`)
   - i18n 키 추가
   - Free/Pro 플랜 정보 업데이트
3. **사이드바 수정** (`sidebar.tsx`)
   - 구독 관리 메뉴 추가
   - SubscriptionStatusBadge 통합

### Phase 4: 기존 페이지 수정
1. **글 작성 페이지** (`articles/new/page.tsx`)
   - 잔여 횟수 표시
   - 할당량 초과 시 UI 처리
2. **글 생성 API** (`articles/backend/route.ts`)
   - 잔여 횟수 체크
   - 할당량 차감
   - AI 모델 선택 (plan 기반)
3. **조직 관리 페이지** (`members/page.tsx`)
   - 초대 버튼 조건부 비활성화

### Phase 5: Cron 설정
1. **Supabase Cron 함수 생성** (SQL Editor)
2. **Next.js Cron API 엔드포인트** (`/api/cron/billing/route.ts`)
3. **환경변수 설정** (CRON_SECRET_TOKEN)

### Phase 6: 테스트 및 검증
1. **백엔드 API 테스트**
   - Postman/Thunder Client로 각 엔드포인트 테스트
2. **프론트엔드 플로우 테스트**
   - 업그레이드 플로우 (토스 SDK 테스트 모드)
   - 취소/재활성화 플로우
   - 결제 내역 조회
3. **Cron 테스트**
   - 수동으로 API 호출하여 정기결제 로직 검증
4. **통합 테스트**
   - Free → Pro 업그레이드
   - 글 생성 횟수 차감
   - 정기결제 시뮬레이션

---

## 9. 주의사항 및 체크리스트

### 9.1 보안
- [ ] 토스페이먼츠 시크릿 키는 서버 사이드에서만 사용
- [ ] Cron API는 비밀 토큰으로 보호
- [ ] 빌링키는 암호화 저장 (현재는 평문, 추후 개선 필요)
- [ ] 사용자 인증 확인 (Clerk userId)

### 9.2 데이터 무결성
- [ ] 구독 생성 시 generation_quota 자동 생성
- [ ] 구독 삭제 시 관련 레코드 cascade 삭제
- [ ] 결제 실패 시 롤백 로직
- [ ] 동시성 제어 (잔여 횟수 차감)

### 9.3 사용자 경험
- [ ] 로딩 상태 표시 (Skeleton UI)
- [ ] 에러 메시지 명확하게 표시
- [ ] 성공/실패 토스트 알림
- [ ] 반응형 디자인 (모바일 대응)

### 9.4 i18n
- [ ] 모든 텍스트 i18n 키로 관리
- [ ] 한국어/영어 번역 추가

### 9.5 성능
- [ ] React Query 캐싱 활용
- [ ] 불필요한 리렌더링 방지
- [ ] Cron 타임아웃 설정 (maxDuration)

---

## 10. 환경변수 목록

**.env.local**:
```bash
# 기존 변수
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 토스페이먼츠
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_XXX
TOSS_SECRET_KEY=test_sk_XXX

# Cron 보안 토큰
CRON_SECRET_TOKEN=your-random-secret-token-here
```

**Supabase Vault** (설정 필요):
```
app.cron_secret_token = "your-random-secret-token-here"
```

---

## 11. 참고 자료

- [토스페이먼츠 자동결제 가이드](https://docs.tosspayments.com/guides/billing)
- [토스페이먼츠 빌링키 발급](https://docs.tosspayments.com/reference#%EB%B9%8C%EB%A7%81%ED%82%A4-%EB%B0%9C%EA%B8%89)
- [Supabase Cron 설정](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Shadcn UI 컴포넌트](https://ui.shadcn.com)

---

**작성일**: 2025-11-18
**버전**: 1.0.0
**작성자**: Claude Code Agent
