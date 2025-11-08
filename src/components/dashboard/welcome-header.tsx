"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type WelcomeHeaderProps = {
  userName?: string;
};

export function WelcomeHeader({ userName = "Sam" }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          안녕하세요, {userName}님!
        </h1>
        <p className="mt-1 text-muted-foreground">
          오늘도 멋진 콘텐츠를 만들어 보세요.
        </p>
      </div>
      <Button size="lg" className="sm:ml-auto">
        새 글 작성
        <Plus className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
