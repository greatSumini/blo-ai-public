"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganizations } from "@/features/organizations/hooks/use-organizations";
import { useCurrentOrganization } from "@/contexts/organization-context";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function OrganizationSelector() {
  const router = useRouter();
  const { orgId } = useCurrentOrganization();
  const { data, isLoading } = useOrganizations();

  const currentOrg = data?.organizations.find((org) => org.id === orgId);
  const organizations = data?.organizations ?? [];

  const handleOrganizationChange = (selectedOrgId: string) => {
    if (selectedOrgId !== orgId) {
      router.push(ROUTES.DASHBOARD(selectedOrgId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-bg-secondary animate-pulse">
        <div className="h-5 w-32 bg-bg-tertiary rounded" />
      </div>
    );
  }

  if (!currentOrg || organizations.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between gap-2 px-2 py-2 h-auto text-text-primary hover:bg-bg-secondary hover:text-text-primary"
        >
          <span className="truncate font-medium">{currentOrg.name}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-text-tertiary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {organizations.map((org) => {
          const isSelected = org.id === orgId;
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleOrganizationChange(org.id)}
              className={cn(
                "flex items-center justify-between gap-2 cursor-pointer",
                isSelected && "bg-bg-secondary"
              )}
            >
              <span className="truncate">{org.name}</span>
              {isSelected && (
                <Check className="h-4 w-4 shrink-0 text-text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/org/new")}
          className="flex items-center gap-2 cursor-pointer text-[#C46849] hover:text-[#b05a3e] hover:bg-[#C46849]/10"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>추가하기</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
