"use client";

import type { StyleGuideResponse } from "../types";
import { StyleGuideCard } from "./style-guide-card";

interface StyleGuideGridProps {
  guides: StyleGuideResponse[];
  onPreview: (guide: StyleGuideResponse) => void;
  onEdit: (guide: StyleGuideResponse) => void;
  onDelete: (id: string) => void;
}

export function StyleGuideGrid({
  guides,
  onPreview,
  onEdit,
  onDelete,
}: StyleGuideGridProps) {
  return (
    <div className="flex flex-col border-t border-border">
      {guides.map((guide, index) => (
        <StyleGuideCard
          key={guide.id}
          guide={guide}
          index={index}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
