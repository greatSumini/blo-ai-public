"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

type Article = {
  id: string;
  title: string;
  status: "완료" | "작성중";
  createdAt: string;
};

const dummyArticles: Article[] = [
  {
    id: "1",
    title: "Next.js 15의 새로운 기능 살펴보기",
    status: "완료",
    createdAt: "2025-11-05",
  },
  {
    id: "2",
    title: "AI를 활용한 콘텐츠 마케팅 전략",
    status: "완료",
    createdAt: "2025-11-03",
  },
  {
    id: "3",
    title: "인디해커를 위한 SEO 최적화 가이드",
    status: "완료",
    createdAt: "2025-11-01",
  },
  {
    id: "4",
    title: "SaaS 제품의 성장 해킹 전략",
    status: "작성중",
    createdAt: "2025-10-28",
  },
];

export function RecentArticlesList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 작성한 글</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상태</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <Badge
                    variant={
                      article.status === "완료" ? "default" : "secondary"
                    }
                  >
                    {article.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
