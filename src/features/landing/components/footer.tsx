"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
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
              Searchify
            </Link>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              인디해커와 솔로 창업자를 위한 AI 블로그 작성 도구. 5분 안에 SEO 최적화된 블로그 글을 완성하세요.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">제품</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="#features"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                주요 기능
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                사용 방법
              </Link>
              <Link
                href="#use-cases"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                활용 사례
              </Link>
              <Link
                href="#pricing"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                가격
              </Link>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">회사</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/about"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                회사 소개
              </Link>
              <Link
                href="/blog"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                블로그
              </Link>
              <Link
                href="/contact"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                문의하기
              </Link>
            </nav>
          </div>

          {/* Legal & Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">법적 고지</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/privacy"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                이용약관
              </Link>
            </nav>

            {/* Social Links */}
            <div className="pt-2">
              <h4 className="text-sm font-semibold text-[#111827] mb-3">소셜</h4>
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
                  href="mailto:contact@searchify.blog"
                  className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  aria-label="이메일"
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
              © {currentYear} Searchify. All rights reserved.
            </p>
            <div className="flex items-center gap-4 md:gap-6">
              <Link
                href="/sitemap"
                className="text-xs md:text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                사이트맵
              </Link>
              <Link
                href="/accessibility"
                className="text-xs md:text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                접근성
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
