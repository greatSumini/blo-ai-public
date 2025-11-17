"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className = "", showText = true }: LogoProps) {
  const t = useTranslations("common");
  const brandName = t("brand_name");

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/icon.svg"
        alt={`${brandName} Logo`}
        width={32}
        height={32}
        className="h-8 w-8"
      />
      {showText && (
        <span className="text-xl font-bold text-gray-900">{brandName}</span>
      )}
    </Link>
  );
}
