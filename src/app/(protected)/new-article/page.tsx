"use client";

type NewArticlePageProps = {
  params: Promise<Record<string, never>>;
};

export default function NewArticlePage({ params }: NewArticlePageProps) {
  void params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">새 글 작성</h1>
      <p className="text-muted-foreground">
        이 페이지는 추후 구현될 예정입니다.
      </p>
    </div>
  );
}
