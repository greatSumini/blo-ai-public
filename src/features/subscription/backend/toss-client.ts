import axios, { type AxiosInstance } from 'axios';

const TOSS_BASE_URL = 'https://api.tosspayments.com/v1';

/**
 * 토스페이먼츠 자동결제 승인 요청 파라미터
 */
export type ApproveBillingPaymentParams = {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
};

/**
 * 토스페이먼츠 자동결제 승인 응답
 */
export type ApproveBillingPaymentResponse = {
  mId: string;
  transactionKey: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  requestedAt: string;
  approvedAt: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  cultureExpense: boolean;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  method: string;
  version: string;
  card?: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    receiptUrl: string;
    company: string;
  };
};

/**
 * 토스페이먼츠 빌링키 삭제 요청 파라미터
 */
export type DeleteBillingKeyParams = {
  billingKey: string;
  customerKey: string;
};

/**
 * 토스페이먼츠 빌링키 발급 요청 파라미터
 */
export type IssueBillingKeyParams = {
  authKey: string;
  customerKey: string;
};

/**
 * 토스페이먼츠 빌링키 발급 응답
 */
export type IssueBillingKeyResponse = {
  mId: string;
  customerKey: string;
  authenticatedAt: string;
  method: string;
  billingKey: string;
  card: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    cardType: string;
    ownerType: string;
    company: string;
  };
};

/**
 * 토스페이먼츠 API 클라이언트
 */
export class TossPaymentsClient {
  private client: AxiosInstance;

  constructor(secretKey: string) {
    const encoded = Buffer.from(`${secretKey}:`).toString('base64');

    this.client = axios.create({
      baseURL: TOSS_BASE_URL,
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30초
    });
  }

  /**
   * 자동결제 승인 (빌링키 기반)
   * @see https://docs.tosspayments.com/reference#%EB%B9%8C%EB%A7%81%ED%82%A4-%EA%B2%B0%EC%A0%9C-%EC%8A%B9%EC%9D%B8
   */
  async approveBillingPayment(
    params: ApproveBillingPaymentParams,
  ): Promise<ApproveBillingPaymentResponse> {
    const response = await this.client.post<ApproveBillingPaymentResponse>(
      `/billing/${params.billingKey}`,
      {
        customerKey: params.customerKey,
        amount: params.amount,
        orderId: params.orderId,
        orderName: params.orderName,
      },
    );

    return response.data;
  }

  /**
   * 빌링키 삭제
   * @see https://docs.tosspayments.com/reference#%EB%B9%8C%EB%A7%81%ED%82%A4-%EC%82%AD%EC%A0%9C
   */
  async deleteBillingKey(params: DeleteBillingKeyParams): Promise<void> {
    await this.client.delete(
      `/billing/authorizations/${params.billingKey}`,
      {
        data: { customerKey: params.customerKey },
      },
    );
  }

  /**
   * 빌링키 발급 (authKey로부터 billingKey 생성)
   * @see https://docs.tosspayments.com/reference#%EB%B9%8C%EB%A7%81%ED%82%A4-%EB%B0%9C%EA%B8%89
   */
  async issueBillingKey(
    params: IssueBillingKeyParams,
  ): Promise<IssueBillingKeyResponse> {
    const response = await this.client.post<IssueBillingKeyResponse>(
      '/billing/authorizations/issue',
      {
        authKey: params.authKey,
        customerKey: params.customerKey,
      },
    );

    return response.data;
  }
}

/**
 * 토스페이먼츠 클라이언트 생성 팩토리
 * @throws {Error} TOSS_SECRET_KEY 환경변수가 없을 때
 */
export function createTossClient(secretKey?: string): TossPaymentsClient {
  const key = secretKey || process.env.TOSS_SECRET_KEY;
  if (!key) {
    throw new Error('TOSS_SECRET_KEY is not defined');
  }
  return new TossPaymentsClient(key);
}
