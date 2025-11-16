"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("landing.footer");
  const brandName = useTranslations("common");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-bg-secondary/20 border-t border-border-default/40">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {/* Brand Section - Claude.ai style */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-lg md:text-xl font-medium text-text-primary hover:opacity-80 transition-opacity duration-fast inline-block"
            >
              {brandName("brand_name")}
            </Link>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-xs">
              {t("brand.description")}
            </p>
          </div>

          {/* Product Links - Claude.ai style */}
          <div className="space-y-4">
            <h3 className="text-xs md:text-sm font-medium text-text-primary">{t("product.title")}</h3>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="#features"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("product.features")}
              </Link>
              <Link
                href="#how-it-works"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("product.how_it_works")}
              </Link>
              <Link
                href="#faq"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("product.faq")}
              </Link>
              <Link
                href="#pricing"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("product.pricing")}
              </Link>
            </nav>
          </div>

          {/* Company Links - Claude.ai style */}
          <div className="space-y-4">
            <h3 className="text-xs md:text-sm font-medium text-text-primary">{t("company.title")}</h3>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/about"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("company.about")}
              </Link>
              <Link
                href="/blog"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("company.blog")}
              </Link>
              <Link
                href="/contact"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("company.contact")}
              </Link>
            </nav>
          </div>

          {/* Legal & Social - Claude.ai style */}
          <div className="space-y-4">
            <h3 className="text-xs md:text-sm font-medium text-text-primary">{t("legal.title")}</h3>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/privacy"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("legal.privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("legal.terms")}
              </Link>
            </nav>

            {/* Social Links - Claude.ai subtle style */}
            <div className="pt-2">
              <h4 className="text-xs md:text-sm font-medium text-text-primary mb-3">{t("social.title")}</h4>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-normal"
                  aria-label={t("social.github_label")}
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-normal"
                  aria-label={t("social.twitter_label")}
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="mailto:contact@seo24.blog"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-normal"
                  aria-label={t("social.email_label")}
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Claude.ai subtle divider */}
        <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-border-default/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <p className="text-xs text-text-tertiary text-center md:text-left">
              {t("bottom.copyright")}
            </p>
            <div className="flex items-center gap-4 md:gap-6">
              <Link
                href="/sitemap"
                className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-normal"
              >
                {t("bottom.sitemap")}
              </Link>
              <Link
                href="/accessibility"
                className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-normal"
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
