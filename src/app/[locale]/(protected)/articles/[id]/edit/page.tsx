"use client";

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Edit, Eye, Download, Copy, Check, X } from 'lucide-react';
import { useArticle } from '@/features/articles/hooks/useArticle';
import { useAutoSave } from '@/features/articles/hooks/useAutoSave';
import { EditorHeader } from '@/features/articles/components/editor-header';
import { TitleInlineInput } from '@/features/articles/components/title-inline-input';
import { SeoCollapsiblePanel } from '@/features/articles/components/seo-collapsible-panel';
import { TableOfContents } from '@/features/articles/components/table-of-contents';
import { MarkdownPreview } from '@/features/articles/components/markdown-preview';
import {
  extractHeadings,
  downloadMarkdown,
  copyToClipboard,
} from '@/features/articles/lib/markdown-utils';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('editor');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: article, isLoading, isError } = useArticle(articleId);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setSlug(article.slug || '');
      setContent(article.content || '');
      setDescription(article.description || '');
      setKeywords(Array.isArray(article.keywords) ? article.keywords.join(', ') : '');
    }
  }, [article]);

  const autoSave = useAutoSave(articleId, {
    title,
    slug,
    content,
    description,
    keywords: keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0),
  });

  const headings = extractHeadings(content);

  const handleDownloadMarkdown = () => {
    downloadMarkdown(title || 'article', content);
    toast({
      title: t('download_success_title'),
      description: t('download_success_desc'),
    });
  };

  const handleCopyMarkdown = async () => {
    try {
      await copyToClipboard(content);
      setCopySuccess(true);
      toast({
        title: t('copy_success_title'),
        description: t('copy_success_desc'),
      });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast({
        title: t('copy_error_title'),
        description: t('copy_error_desc'),
        variant: 'destructive',
      });
    }
  };

  const handleTitleEnterPress = () => {
    const editorElement = document.querySelector('.w-md-editor');
    editorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{t('load_error')}</p>
        <Button onClick={() => router.push('/dashboard')}>
          {t('back_to_dashboard')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1600px] px-4 py-8">
        <EditorHeader
          onBack={() => router.back()}
          autoSaveStatus={autoSave}
          showPreview={showPreview}
          onPreviewToggle={() => setShowPreview(!showPreview)}
        />

        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:gap-6">
          {/* TOC - 항상 노출 */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-8">
              <TableOfContents headings={headings} />
            </div>
          </div>

          {/* Editor Pane */}
          <Card className="flex-1 space-y-6 p-6">
            <TitleInlineInput
              value={title}
              onChange={setTitle}
              onEnterPress={handleTitleEnterPress}
              disabled={autoSave.isSaving}
            />

            <SeoCollapsiblePanel
              slug={slug}
              description={description}
              keywords={keywords}
              onSlugChange={setSlug}
              onDescriptionChange={setDescription}
              onKeywordsChange={setKeywords}
              disabled={autoSave.isSaving}
            />

            <div>
              <Label htmlFor="content">{t('field_content')}</Label>
              <div
                data-color-mode={mounted ? resolvedTheme : 'light'}
                className="mt-2"
              >
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  height="calc(100vh - 500px)"
                  preview="edit"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMarkdown}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('download')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  className="flex-1"
                >
                  {copySuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('copy')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview Panel - 조건부 렌더링 */}
          {showPreview && (
            <Card className="w-[40%] overflow-auto border">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
                <h3 className="text-lg font-semibold">{t('preview_title')}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <h2 className="mb-4 text-2xl font-bold">
                  {title || t('untitled')}
                </h2>
                {description && (
                  <p className="mb-6 text-muted-foreground">{description}</p>
                )}
                {content ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <p className="text-muted-foreground">{t('no_content')}</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Mobile Layout - Tabs */}
        <div className="lg:hidden">
          <Tabs defaultValue="edit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">
                <Edit className="mr-2 h-4 w-4" />
                {t('edit_tab')}
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                {t('preview_tab')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-4">
              <Card className="space-y-6 p-4">
                <TitleInlineInput
                  value={title}
                  onChange={setTitle}
                  onEnterPress={handleTitleEnterPress}
                  disabled={autoSave.isSaving}
                />

                <SeoCollapsiblePanel
                  slug={slug}
                  description={description}
                  keywords={keywords}
                  onSlugChange={setSlug}
                  onDescriptionChange={setDescription}
                  onKeywordsChange={setKeywords}
                  disabled={autoSave.isSaving}
                />

                <div>
                  <Label htmlFor="content-mobile">{t('field_content_mobile')}</Label>
                  <div
                    data-color-mode={mounted ? resolvedTheme : 'light'}
                    className="mt-2"
                  >
                    <MDEditor
                      value={content}
                      onChange={(val) => setContent(val || '')}
                      height={400}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadMarkdown}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      {t('download')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyMarkdown}
                      className="flex-1"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="mr-2 h-3 w-3" />
                          {t('copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-3 w-3" />
                          {t('copy')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card className="p-4">
                <h2 className="mb-4 text-2xl font-bold">
                  {title || t('untitled')}
                </h2>
                {description && (
                  <p className="mb-6 text-muted-foreground">{description}</p>
                )}
                {content ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <p className="text-muted-foreground">{t('no_content')}</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

