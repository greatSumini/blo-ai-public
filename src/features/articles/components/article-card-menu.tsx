"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

interface ArticleCardMenuProps {
  articleId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ArticleCardMenu({
  articleId,
  onEdit,
  onDelete,
}: ArticleCardMenuProps) {
  const t = useTranslations("articles");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label={t("menu.aria_label")}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          {t("menu.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          {t("menu.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
