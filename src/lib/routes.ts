/**
 * 애플리케이션 라우트 상수
 *
 * 타입 안전한 경로 관리를 위한 상수 정의
 */

export const ROUTES = {
  // 스타일 가이드
  STYLE_GUIDES: "/style-guides",
  STYLE_GUIDES_NEW: "/style-guides/new",
  STYLE_GUIDES_EDIT: (id: string) => `/style-guides/${id}/edit`,

  // 대시보드
  DASHBOARD: "/dashboard",

  // 글 작성
  NEW_ARTICLE: "/new-article",
  ARTICLES: "/articles",
  ARTICLES_EDIT: (id: string) => `/articles/${id}/edit`,

  // 키워드
  KEYWORDS: "/keywords",

  // 계정
  ACCOUNT: "/account",
} as const;

export type RouteKey = keyof typeof ROUTES;
