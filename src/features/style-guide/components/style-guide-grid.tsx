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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
