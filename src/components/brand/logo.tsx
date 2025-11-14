"use client";

import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/icon.svg"
        alt="SEO24 Logo"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      {showText && (
        <span className="text-xl font-bold text-gray-900">SEO24</span>
      )}
    </Link>
  );
}
