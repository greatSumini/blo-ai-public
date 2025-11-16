"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("landing.header");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-[#E1E5EA] shadow-sm"
          : "bg-white/80 backdrop-blur-md border-[#E1E5EA]"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/icon.svg"
              alt="SEO24 Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-[#111827]">SEO24</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              {t("nav.features")}
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              {t("nav.how_it_works")}
            </Link>
            <Link
              href="#use-cases"
              className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              {t("nav.use_cases")}
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              {t("nav.pricing")}
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#6B7280] hover:text-[#111827]"
              asChild
            >
              <Link href="/login">{t("cta.login")}</Link>
            </Button>
            <Button
              size="sm"
              className="bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white rounded-lg"
              asChild
            >
              <Link href="/signup">{t("cta.get_started")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-[#6B7280] hover:text-[#111827] transition-colors"
            aria-label={t("aria.toggle_menu")}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#E1E5EA] py-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors py-2"
                onClick={toggleMenu}
              >
                {t("nav.features")}
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors py-2"
                onClick={toggleMenu}
              >
                {t("nav.how_it_works")}
              </Link>
              <Link
                href="#use-cases"
                className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors py-2"
                onClick={toggleMenu}
              >
                {t("nav.use_cases")}
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors py-2"
                onClick={toggleMenu}
              >
                {t("nav.pricing")}
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-[#E1E5EA]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[#6B7280] hover:text-[#111827]"
                  asChild
                >
                  <Link href="/login" onClick={toggleMenu}>{t("cta.login")}</Link>
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-[#3BA2F8] hover:bg-[#3BA2F8]/90 text-white rounded-lg"
                  asChild
                >
                  <Link href="/signup" onClick={toggleMenu}>{t("cta.get_started")}</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
