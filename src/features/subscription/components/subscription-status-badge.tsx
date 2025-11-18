'use client';

import { Badge } from '@/components/ui/badge';
import type { SubscriptionPlan } from '../lib/dto';
import { Crown } from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  plan: SubscriptionPlan;
  className?: string;
}

/**
 * Subscription status badge for sidebar
 * Shows FREE or PRO plan with appropriate styling
 */
export function SubscriptionStatusBadge({
  plan,
  className,
}: SubscriptionStatusBadgeProps) {
  const isPro = plan === 'pro';

  if (isPro) {
    return (
      <Badge
        variant="default"
        className={className}
      >
        <Crown className="mr-1 h-3 w-3" />
        PRO
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      FREE
    </Badge>
  );
}
