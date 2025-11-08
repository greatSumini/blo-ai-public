import Link from "next/link";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3BA2F8] to-[#2680D0]">
        <span className="text-lg font-bold text-white">S</span>
      </div>
      {showText && (
        <span className="text-xl font-bold text-gray-900">Searchify</span>
      )}
    </Link>
  );
}
