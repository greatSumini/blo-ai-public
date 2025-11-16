"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("landing.footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#F5F7FA] border-t border-[#E1E5EA]">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-xl font-bold text-[#111827] hover:text-[#3BA2F8] transition-colors inline-block"
            >
              SEO24
            </Link>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {t("brand.description")}
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">{t("product.title")}</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="#features"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("product.features")}
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("product.how_it_works")}
              </Link>
              <Link
                href="#use-cases"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("product.use_cases")}
              </Link>
              <Link
                href="#pricing"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("product.pricing")}
              </Link>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">{t("company.title")}</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/about"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("company.about")}
              </Link>
              <Link
                href="/blog"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("company.blog")}
              </Link>
              <Link
                href="/contact"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("company.contact")}
              </Link>
            </nav>
          </div>

          {/* Legal & Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">{t("legal.title")}</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/privacy"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("legal.privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("legal.terms")}
              </Link>
            </nav>

            {/* Social Links */}
            <div className="pt-2">
              <h4 className="text-sm font-semibold text-[#111827] mb-3">{t("social.title")}</h4>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="mailto:contact@seo24.blog"
                  className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  aria-label={t("social.email_label")}
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-[#E1E5EA]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <p className="text-xs md:text-sm text-[#6B7280] text-center md:text-left">
              {t("bottom.copyright", { year: currentYear })}
            </p>
            <div className="flex items-center gap-4 md:gap-6">
              <Link
                href="/sitemap"
                className="text-xs md:text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("bottom.sitemap")}
              </Link>
              <Link
                href="/accessibility"
                className="text-xs md:text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {t("bottom.accessibility")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
