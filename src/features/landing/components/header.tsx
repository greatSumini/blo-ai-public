"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("landing.header");
  const brandName = useTranslations("common");
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-slow border-b ${
        isScrolled
          ? "bg-bg-primary/95 backdrop-blur-md border-border-default/80"
          : "bg-bg-primary/70 backdrop-blur-sm border-border-default/40"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-fast"
          >
            <Image
              src="/images/icon.svg"
              alt={`${brandName("brand_name")} Logo`}
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg md:text-xl font-medium text-text-primary">{brandName("brand_name")}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="#features"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-normal"
            >
              {t("nav.features")}
            </Link>
            <Link
              href="#how-it-works"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-normal"
            >
              {t("nav.how_it_works")}
            </Link>
            <Link
              href="#faq"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-normal"
            >
              {t("nav.faq")}
            </Link>
            <Link
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-normal"
            >
              {t("nav.pricing")}
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all duration-normal"
              asChild
            >
              <Link href="/login">{t("cta.login")}</Link>
            </Button>
            <Button
              size="sm"
              className="bg-accent-brand text-white hover:opacity-90 rounded-lg transition-all duration-fast"
              asChild
            >
              <Link href="/signup">{t("cta.get_started")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={toggleMenu}
            className="md:hidden"
            variant="ghost"
            aria-label={t("aria.toggle_menu")}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </IconButton>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border-default/60 py-6 animate-in slide-in-from-top-2 duration-300">
            <nav className="flex flex-col gap-2">
              <Link
                href="#features"
                className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-normal"
                onClick={toggleMenu}
              >
                {t("nav.features")}
              </Link>
              <Link
                href="#how-it-works"
                className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-normal"
                onClick={toggleMenu}
              >
                {t("nav.how_it_works")}
              </Link>
              <Link
                href="#faq"
                className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-normal"
                onClick={toggleMenu}
              >
                {t("nav.faq")}
              </Link>
              <Link
                href="#pricing"
                className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-normal"
                onClick={toggleMenu}
              >
                {t("nav.pricing")}
              </Link>
              <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-border-default/60">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all duration-normal"
                  asChild
                >
                  <Link href="/login" onClick={toggleMenu}>{t("cta.login")}</Link>
                </Button>
                <Button
                  size="sm"
                  className="w-full justify-center bg-accent-brand text-white hover:opacity-90 rounded-lg transition-all duration-fast"
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
