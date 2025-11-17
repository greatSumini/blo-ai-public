import type { BrandingResponse } from "../types";

/**
 * 브랜드명으로 스타일 가이드 필터링
 */
export function filterBrandingsBySearch(
  guides: BrandingResponse[],
  searchQuery: string
): BrandingResponse[] {
  if (!searchQuery.trim()) return guides;

  const query = searchQuery.toLowerCase();
  return guides.filter((guide) =>
    guide.brandName.toLowerCase().includes(query)
  );
}
