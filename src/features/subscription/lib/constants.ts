/**
 * Subscription plan constants and configurations
 */

export const FREE_PLAN = {
  name: 'Free Plan',
  tier: 'free' as const,
  price: 0,
  monthlyLimit: 10,
  features: [
    'Up to 10 article generations per month',
    'Basic writing templates',
    'Community support',
    'Standard processing speed',
  ],
} as const;

export const PRO_PLAN = {
  name: 'Pro Plan',
  tier: 'pro' as const,
  price: 9900, // 9,900원
  monthlyLimit: 100,
  features: [
    'Up to 100 article generations per month',
    'All premium templates',
    'Priority email support',
    'Faster processing speed',
    'Advanced AI models',
    'Custom branding options',
  ],
} as const;

export const PLANS = [FREE_PLAN, PRO_PLAN] as const;

/**
 * Get plan details by tier
 */
export function getPlanByTier(tier: 'free' | 'pro') {
  return tier === 'pro' ? PRO_PLAN : FREE_PLAN;
}

/**
 * Format price to Korean Won currency
 */
export function formatPrice(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * Format card number for display (masking)
 */
export function formatCardNumber(cardNumber: string | null): string {
  if (!cardNumber) return 'N/A';
  // 카드번호가 이미 마스킹된 경우 (예: **** **** **** 1234)
  if (cardNumber.includes('*')) return cardNumber;
  // 마스킹되지 않은 경우 뒤 4자리만 표시
  return `**** **** **** ${cardNumber.slice(-4)}`;
}
