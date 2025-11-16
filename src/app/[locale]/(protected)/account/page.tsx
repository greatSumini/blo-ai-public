"use client";

import { AccountPage as AccountPageComponent } from "@/features/account/components/account-page";

type AccountPageProps = {
  params: Promise<Record<string, never>>;
};

export default function AccountPage({ params }: AccountPageProps) {
  void params;

  return <AccountPageComponent />;
}
