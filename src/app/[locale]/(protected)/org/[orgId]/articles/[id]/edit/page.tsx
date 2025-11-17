"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useRequiredOrganization } from "@/contexts/organization-context";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button-v2";
import { Badge } from "@/components/ui/badge-v2";
import { ArrowLeft, Calendar, Globe, Hash, FileText, TrendingUp } from "lucide-react";
import { useArticle } from "@/features/articles/hooks/useArticle";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { ROUTES } from "@/lib/routes";

type EditorPageProps = {
  params: Promise<{ orgId: string; id: string }>;
};

export default function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const orgId = useRequiredOrganization();
  const articleId = resolvedParams.id;
  const router = useRouter();
  const t = useTranslations("editor");
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;

  const { data: article, isLoading, isError } = useArticle(articleId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-brand border-t-transparent"></div>
          <p className="text-sm text-text-secondary">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-secondary">
        <p className="text-sm text-danger">{t("load_error")}</p>
        <Button
          onClick={() => router.push(ROUTES.DASHBOARD(orgId))}
          variant="secondary"
          size="sm"
        >
          {t("back_to_dashboard")}
        </Button>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "archived":
        return "default";
      default:
        return "warning";
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="border-b border-border-default bg-bg-primary">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 max-w-4xl py-16">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-8 text-text-primary">
          {article.title}
        </h1>

        {/* Metadata Table */}
        <div className="mb-16 rounded-lg border border-border-default bg-bg-primary overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-border-default">
              {/* Status */}
              <tr className="hover:bg-bg-hover transition-colors duration-normal">
                <td className="py-3 px-4 text-sm font-medium text-text-secondary w-1/4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  <Badge variant={getBadgeVariant(article.status)}>
                    {article.status}
                  </Badge>
                </td>
              </tr>

              {/* Slug */}
              <tr className="hover:bg-bg-hover transition-colors duration-normal">
                <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Slug</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-text-primary font-mono">
                  {article.slug}
                </td>
              </tr>

              {/* Keywords */}
              {article.keywords && article.keywords.length > 0 && (
                <tr className="hover:bg-bg-hover transition-colors duration-normal">
                  <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span>Keywords</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.map((keyword, index) => (
                        <Badge key={index} variant="default">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              )}

              {/* Description */}
              {article.description && (
                <tr className="hover:bg-bg-hover transition-colors duration-normal">
                  <td className="py-3 px-4 text-sm font-medium text-text-secondary align-top">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Description</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {article.description}
                  </td>
                </tr>
              )}

              {/* Tone */}
              {article.tone && (
                <tr className="hover:bg-bg-hover transition-colors duration-normal">
                  <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Tone</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary capitalize">
                    {article.tone}
                  </td>
                </tr>
              )}

              {/* Content Length */}
              {article.contentLength && (
                <tr className="hover:bg-bg-hover transition-colors duration-normal">
                  <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Length</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary capitalize">
                    {article.contentLength}
                  </td>
                </tr>
              )}

              {/* Reading Level */}
              {article.readingLevel && (
                <tr className="hover:bg-bg-hover transition-colors duration-normal">
                  <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Reading Level</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary capitalize">
                    {article.readingLevel}
                  </td>
                </tr>
              )}

              {/* Views */}
              <tr className="hover:bg-bg-hover transition-colors duration-normal">
                <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Views</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-text-primary">
                  {article.views.toLocaleString()}
                </td>
              </tr>

              {/* Created At */}
              <tr className="hover:bg-bg-hover transition-colors duration-normal">
                <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-text-primary">
                  {format(new Date(article.createdAt), "PPP", {
                    locale: dateLocale,
                  })}
                </td>
              </tr>

              {/* Updated At */}
              <tr className="hover:bg-bg-hover transition-colors duration-normal">
                <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Updated</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-text-primary">
                  {format(new Date(article.updatedAt), "PPP", {
                    locale: dateLocale,
                  })}
                </td>
              </tr>

              {/* Published At */}
              {article.publishedAt && (
                <tr className="hover:bg-bg-hover transition-colors duration-normal">
                  <td className="py-3 px-4 text-sm font-medium text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Published</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {format(new Date(article.publishedAt), "PPP", {
                      locale: dateLocale,
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Article Content - Markdown Rendering */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed text-text-primary">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeSanitize]}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
