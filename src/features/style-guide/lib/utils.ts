import type { StyleGuideResponse } from "../types";

/**
 * 브랜드명으로 스타일 가이드 필터링
 */
export function filterStyleGuidesBySearch(
  guides: StyleGuideResponse[],
  searchQuery: string
): StyleGuideResponse[] {
  if (!searchQuery.trim()) return guides;

  const query = searchQuery.toLowerCase();
  return guides.filter((guide) =>
    guide.brandName.toLowerCase().includes(query)
  );
}
