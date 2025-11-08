"use client";

type AccountPageProps = {
  params: Promise<Record<string, never>>;
};

export default function AccountPage({ params }: AccountPageProps) {
  void params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">계정 관리</h1>
      <p className="text-muted-foreground">
        이 페이지는 추후 구현될 예정입니다.
      </p>
    </div>
  );
}
