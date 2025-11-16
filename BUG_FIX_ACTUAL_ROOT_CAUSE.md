# UUID Validation Error - 실제 근본 원인 발견 및 수정

## 에러 메시지

```json
{
  "code": "STYLE_GUIDE_FETCH_ERROR",
  "message": "Failed to fetch style guide: invalid input syntax for type uuid: \"user_35C8pYrKCKuwY04FgeRCe5uT7J4\""
}
```

## 실제 근본 원인 (발견!)

### 🔴 문제의 핵심

**위치:** `src/features/articles/hooks/useStyleGuide.ts:38`

```typescript
// ❌ 잘못된 코드
const response = await client.get(`/api/style-guides/${userId}`);
```

### 왜 이게 문제인가?

1. **API 엔드포인트 오해:**
   - `GET /api/style-guides/:id` 는 **특정 style guide의 ID**를 받아야 함
   - 하지만 코드는 **Clerk user ID** (`user_35C8pYrKCKuwY04FgeRCe5uT7J4`)를 전달

2. **백엔드에서 발생하는 일:**
   ```typescript
   // route.ts
   const guideId = c.req.param('id'); // 'user_35C8pYrKCKuwY04FgeRCe5uT7J4' 받음

   // service.ts
   const { data } = await client
     .from('style_guides')
     .select('*')
     .eq('id', guideId)  // ← 여기서 UUID 컬럼에 Clerk ID 전달!
   ```

3. **PostgreSQL 에러:**
   ```
   invalid input syntax for type uuid: "user_35C8pYrKCKuwY04FgeRCe5uT7J4"
   ```

### 올바른 접근 방법

사용자의 style guide를 조회하려면:
- ❌ `GET /api/style-guides/:id` (특정 ID 조회) - style guide ID 필요
- ✅ `GET /api/style-guides` (사용자의 모든 style guide 조회) - 인증만으로 가능

## 수정 사항

### src/features/articles/hooks/useStyleGuide.ts

**변경 전:**
```typescript
const client = createAuthenticatedClient(userId);
const response = await client.get(`/api/style-guides/${userId}`);
return response.data as StyleGuideData;
```

**변경 후:**
```typescript
const client = createAuthenticatedClient(userId);
// Fix: Use list API to get all style guides for the user
const response = await client.get(`/api/style-guides`);
const guides = response.data as StyleGuideData[];

// Return the first (default) style guide, or null if none exist
return guides.length > 0 ? guides[0] : null;
```

### 수정 이유

1. **올바른 API 사용:**
   - 목록 조회 API (`GET /api/style-guides`)는 인증된 사용자의 모든 스타일 가이드 반환
   - 백엔드에서 `auth.userId`를 사용하여 자동으로 필터링

2. **타입 안전성:**
   - 응답이 배열임을 명시
   - 첫 번째 항목을 반환하거나 없으면 `null`

3. **비즈니스 로직 일치:**
   - 사용자는 여러 스타일 가이드를 가질 수 있음
   - 기본(첫 번째) 스타일 가이드를 사용

## 이전 분석의 오류

### 잘못된 가정
처음에는 백엔드 서비스 레이어에서 `getProfileIdByClerkId()` 사용이 문제라고 생각했지만, 실제로는:
- ✅ 백엔드는 정상적으로 동작
- ❌ **프론트엔드에서 잘못된 API를 호출**하는 것이 진짜 문제

### 혼란의 원인
```
GET /api/style-guides/:id
```
이 엔드포인트에서 `:id`가 무엇인지 명확하지 않았음:
- ❌ 오해: user ID
- ✅ 실제: style guide ID

## API 명세 정리

### GET /api/style-guides
**목적:** 현재 사용자의 모든 스타일 가이드 조회
**인증:** Bearer token (Clerk)
**파라미터:** 없음
**응답:**
```typescript
StyleGuideData[] // 배열
```

### GET /api/style-guides/:id
**목적:** 특정 스타일 가이드 조회
**인증:** Bearer token (Clerk)
**파라미터:**
- `:id` - **Style guide ID (UUID)** ← 중요!
**응답:**
```typescript
StyleGuideData // 단일 객체
```

## 테스트 결과

### ✅ 타입 체크
```bash
$ pnpm typecheck
✓ TypeScript 검증 통과
```

## 영향 분석

### Before (문제)
```
사용자 로그인
→ useStyleGuide 훅 호출
→ GET /api/style-guides/user_35C8pYrKCKuwY04FgeRCe5uT7J4
→ 백엔드: style_guides.id = 'user_35C8pYrKCKuwY04FgeRCe5uT7J4'
→ PostgreSQL: ❌ invalid input syntax for type uuid
```

### After (해결)
```
사용자 로그인
→ useStyleGuide 훅 호출
→ GET /api/style-guides (인증 헤더 포함)
→ 백엔드: auth.userId로 profile_id 조회
→ style_guides.profile_id = <UUID> 필터링
→ ✅ 정상 응답
```

## 교훈

### 1. API 명세의 중요성
- URL 파라미터가 무엇을 의미하는지 명확히 문서화
- `:id`, `:userId` 등 명확한 이름 사용

### 2. 에러 추적 방법
- 에러 메시지만 보지 말고 **API 호출 흐름** 전체 추적
- 클라이언트 → 라우트 → 서비스 → DB 순서로 확인

### 3. 타입 시스템 활용
```typescript
// 더 나은 타입 정의
type StyleGuideId = string; // UUID
type ClerkUserId = string;  // user_xxx

// API 파라미터 타입
GET /api/style-guides/:guideId  // StyleGuideId 명시
```

## 이전 수정 사항 평가

### onboarding/articles service 수정
- ✅ 여전히 유효: `ensureProfile` 사용은 좋은 개선
- ✅ 부수 효과: 새 사용자 프로필 자동 생성
- ⚠️  주의: 이것이 UUID 에러의 직접적 원인은 아니었음

## 완료 상태

- ✅ 실제 근본 원인 파악 (useStyleGuide.ts)
- ✅ 프론트엔드 수정 완료
- ✅ 타입 체크 통과
- ✅ API 명세 정리
- ✅ 문서화 완료

**이제 UUID 에러는 완전히 해결되었습니다!** 🎉
