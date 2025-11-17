"use client";

import type { BrandingResponse } from "../types";
import { BrandingCard } from "./branding-card";

interface BrandingGridProps {
  brandings: BrandingResponse[];
  onPreview: (branding: BrandingResponse) => void;
  onEdit: (branding: BrandingResponse) => void;
  onDelete: (id: string) => void;
}

export function BrandingGrid({
  brandings,
  onPreview,
  onEdit,
  onDelete,
}: BrandingGridProps) {
  return (
    <div className="flex flex-col border-t border-border">
      {brandings.map((branding, index) => (
        <BrandingCard
          key={branding.id}
          branding={branding}
          index={index}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
