"use client";

import { useRequiredOrganization } from "@/contexts/organization-context";
import { AccountPage as AccountPageComponent } from "@/features/account/components/account-page";

type AccountPageProps = {
  params: Promise<{ orgId: string }>;
};

export default function AccountPage({ params }: AccountPageProps) {
  void params;
  const orgId = useRequiredOrganization();

  return <AccountPageComponent />;
}
