"use client";

type StyleGuidePageProps = {
  params: Promise<Record<string, never>>;
};

export default function StyleGuidePage({ params }: StyleGuidePageProps) {
  void params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">스타일 가이드</h1>
      <p className="text-muted-foreground">
        이 페이지는 추후 구현될 예정입니다.
      </p>
    </div>
  );
}
