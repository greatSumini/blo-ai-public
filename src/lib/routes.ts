/**
 * 애플리케이션 라우트 상수
 *
 * 타입 안전한 경로 관리를 위한 상수 정의
 * 모든 protected 라우트는 조직 컨텍스트 내에서 작동합니다.
 */

export const ROUTES = {
  // 조직 관리
  ORG: "/org",
  ORG_NEW: "/org/new",
  ORG_MEMBERS: (orgId: string) => `/org/${orgId}/members`,

  // 브랜딩 (조직별)
  BRANDINGS: (orgId: string) => `/org/${orgId}/brandings`,
  BRANDINGS_NEW: (orgId: string) => `/org/${orgId}/brandings/new`,
  BRANDINGS_EDIT: (orgId: string, id: string) => `/org/${orgId}/brandings/${id}/edit`,

  // 대시보드 (조직별)
  DASHBOARD: (orgId: string) => `/org/${orgId}/dashboard`,

  // 글 작성 (조직별)
  NEW_ARTICLE: (orgId: string) => `/org/${orgId}/new-article`,
  ARTICLES: (orgId: string) => `/org/${orgId}/articles`,
  ARTICLES_EDIT: (orgId: string, id: string) => `/org/${orgId}/articles/${id}/edit`,

  // 키워드 (조직별)
  KEYWORDS: (orgId: string) => `/org/${orgId}/keywords`,

  // 계정 (조직별)
  ACCOUNT: (orgId: string) => `/org/${orgId}/account`,

  // 구독 (조직별)
  SUBSCRIPTION: (orgId: string) => `/org/${orgId}/subscription`,

  // Branding (레거시 - 마이그레이션 필요)
  BRANDING: (orgId: string) => `/org/${orgId}/branding`,
} as const;

export type RouteKey = keyof typeof ROUTES;
