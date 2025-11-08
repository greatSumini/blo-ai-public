"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AfterAuthPage() {
  const router = useRouter();

  useEffect(() => {
    // 온보딩 완료 여부를 확인하고, 미완료 시 온보딩으로 리디렉트
    // 현재는 임시로 대시보드로 리디렉트
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">리디렉트 중...</p>
    </div>
  );
}
