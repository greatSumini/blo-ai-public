"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const t = useTranslations("styleGuide.search");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
      <Input
        placeholder={t("placeholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 border-[#E1E5EA]"
        aria-label={t("ariaLabel")}
      />
    </div>
  );
}
