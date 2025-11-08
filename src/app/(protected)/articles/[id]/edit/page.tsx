'use client';

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, Edit, List, X, Download, Copy, Check } from 'lucide-react';
import { useArticle } from '@/features/articles/hooks/useArticle';
import { useAutoSave } from '@/features/articles/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/features/articles/components/auto-save-indicator';
import { MarkdownPreview } from '@/features/articles/components/markdown-preview';
import { TableOfContents } from '@/features/articles/components/table-of-contents';
import { extractHeadings, downloadMarkdown, copyToClipboard } from '@/features/articles/lib/markdown-utils';

// 동적 임포트 (SSR 방지)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();

  const { data: article, isLoading, isError } = useArticle(articleId);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [showToc, setShowToc] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setSlug(article.slug || '');
      setContent(article.content || '');
      setDescription(article.description || '');
      // keywords는 배열이므로 쉼표로 구분된 문자열로 변환
      setKeywords(Array.isArray(article.keywords) ? article.keywords.join(', ') : '');
    }
  }, [article]);

  // 자동 저장 - keywords를 배열로 변환
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

  // 헤딩 추출
  const headings = extractHeadings(content);

  const handleDownloadMarkdown = () => {
    downloadMarkdown(title || 'article', content);
    toast({
      title: '다운로드 완료',
      description: '마크다운 파일이 다운로드되었습니다.',
    });
  };

  const handleCopyMarkdown = async () => {
    try {
      await copyToClipboard(content);
      setCopySuccess(true);
      toast({
        title: '복사 완료',
        description: '마크다운이 클립보드에 복사되었습니다.',
      });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast({
        title: '복사 실패',
        description: '마크다운을 복사하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">글을 불러오는 데 실패했습니다.</p>
        <Button onClick={() => router.push('/dashboard')}>
          대시보드로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FCFCFD' }}>
      <div className="container mx-auto max-w-[1600px] px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로
            </Button>
            <div>
              <h1 className="text-2xl font-bold">글 편집</h1>
              <AutoSaveIndicator {...autoSave} />
            </div>
          </div>
          <Button
            onClick={() => setShowToc(!showToc)}
            variant="outline"
            className="hidden lg:flex"
          >
            {showToc ? (
              <>
                <X className="mr-2 h-4 w-4" />
                목차 숨기기
              </>
            ) : (
              <>
                <List className="mr-2 h-4 w-4" />
                목차 보기
              </>
            )}
          </Button>
        </div>

        {/* Desktop: 2컬럼 + 옵션 사이드바 */}
        <div className="hidden lg:flex lg:gap-6">
          {/* 목차 사이드바 */}
          {showToc && (
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-8">
                <TableOfContents headings={headings} />
              </div>
            </div>
          )}

          {/* 에디터 */}
          <Card className="flex-1 p-6 space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="글 제목을 입력하세요"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">슬러그 (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-slug"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="keywords">키워드 (쉼표로 구분)</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="키워드1, 키워드2, 키워드3"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">요약</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="글 요약을 입력하세요"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="content">본문 (마크다운)</Label>
              <div data-color-mode="light" className="mt-1">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  height={500}
                  preview="edit"
                />
              </div>
              {/* 내보내기 버튼 */}
              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMarkdown}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  다운로드
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
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      복사
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* 미리보기 */}
          <Card
            className="flex-1 p-6 overflow-auto"
            style={{ maxHeight: '800px' }}
          >
            <h2 className="text-xl font-bold mb-4">{title || '제목 없음'}</h2>
            {description && (
              <p className="text-muted-foreground mb-6">{description}</p>
            )}
            <MarkdownPreview content={content} />
          </Card>
        </div>

        {/* Tablet/Mobile: 탭 */}
        <div className="lg:hidden">
          <Tabs defaultValue="edit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">
                <Edit className="mr-2 h-4 w-4" />
                편집
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                미리보기
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-4">
              <Card className="p-4 space-y-4">
                <div>
                  <Label htmlFor="title-mobile">제목</Label>
                  <Input
                    id="title-mobile"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="글 제목을 입력하세요"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="slug-mobile">슬러그</Label>
                  <Input
                    id="slug-mobile"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="url-friendly-slug"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="keywords-mobile">키워드</Label>
                  <Input
                    id="keywords-mobile"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="키워드1, 키워드2"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description-mobile">요약</Label>
                  <Input
                    id="description-mobile"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="글 요약"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="content-mobile">본문</Label>
                  <div data-color-mode="light" className="mt-1">
                    <MDEditor
                      value={content}
                      onChange={(val) => setContent(val || '')}
                      height={400}
                    />
                  </div>
                  {/* 내보내기 버튼 */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadMarkdown}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      다운로드
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
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-3 w-3" />
                          복사
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">{title || '제목 없음'}</h2>
                {description && (
                  <p className="text-muted-foreground mb-6">{description}</p>
                )}
                <MarkdownPreview content={content} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
