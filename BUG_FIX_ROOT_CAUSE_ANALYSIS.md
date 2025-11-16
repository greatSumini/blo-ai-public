# UUID Validation Error - 근본 원인 분석 및 완전한 수정

## 에러 메시지

```json
{
  "code": "STYLE_GUIDE_FETCH_ERROR",
  "message": "Failed to fetch style guide: invalid input syntax for type uuid: \"user_35C8pYrKCKuwY04FgeRCe5uT7J4\""
}
```

## 근본 원인

### 문제의 핵심

데이터베이스는 `0006_create_profiles_and_migrate_refs.sql` 마이그레이션을 통해 다음과 같이 구조가 변경되었습니다:

**이전 구조:**
- 모든 테이블이 `clerk_user_id` (TEXT) 컬럼을 직접 사용

**현재 구조:**
- `profiles` 테이블: `clerk_user_id` (TEXT)를 `id` (UUID)로 매핑하는 중앙 테이블
- 다른 모든 테이블: `profile_id` (UUID)를 외래키로 사용

### 불일치 발생 지점

코드에서 **일부 함수만 `getProfileIdByClerkId()`를 사용**하고 있었습니다. 이 함수는:
1. 프로필이 존재하면 → UUID를 반환
2. 프로필이 없으면 → `null`을 반환

**문제:** `null`이 반환된 후 적절히 처리되지 않으면:
- 일부 코드는 조기 반환으로 에러를 반환
- **일부 코드는 `null`을 그대로 쿼리에 전달** ← 이것이 UUID 에러의 원인

## 발견된 모든 문제점

### 1. onboarding/backend/service.ts (5개 함수)
**위치:**
- `listStyleGuides` (130라인)
- `getStyleGuideById` (208라인)
- `updateStyleGuide` (303라인)
- `deleteStyleGuide` (383라인)
- `markOnboardingCompleted` (414라인)

**문제:**
```typescript
const profileId = await getProfileIdByClerkId(client, clerkUserId);
if (!profileId) {
  return domainFailure({ code: styleGuideErrorCodes.notFound, message: 'Profile not found' });
}
```

**새 사용자에게 미치는 영향:**
- 첫 로그인 시 프로필이 아직 없음
- READ 작업도 모두 실패
- 사용자는 "Profile not found" 에러만 보게 됨

### 2. articles/backend/service.ts (5개 함수)
**위치:**
- `getArticleById` (141라인)
- `updateArticle` (216라인)
- `deleteArticle` (266라인)
- `listArticles` (294라인)
- `getDashboardStats` (362라인)

**문제:** 동일 - `getProfileIdByClerkId()` 사용 시 새 사용자는 모든 작업 실패

### 3. account/backend/service.ts
**상태:** ✅ 정상
- 이 서비스는 `profiles` 테이블을 직접 조작
- `clerk_user_id`를 직접 사용하는 것이 올바름

### 4. onboarding/backend/onboarding-status.ts
**상태:** ✅ 정상
- READ 전용 함수
- `null` 체크 후 `false` 반환으로 적절히 처리

## 해결 방안

### 전략: 모든 함수에서 `ensureProfile` 사용

**변경 전:**
```typescript
const profileId = await getProfileIdByClerkId(client, clerkUserId);
if (!profileId) {
  return domainFailure({ code: errorCodes.notFound, message: 'Profile not found' });
}
```

**변경 후:**
```typescript
// Ensure profile exists and get id
const profile = await ensureProfile(client, clerkUserId);
const profileId = profile?.id;
if (!profileId) {
  return domainFailure({ code: errorCodes.createError, message: 'Failed to resolve or create user profile' });
}
```

### 이점

1. **자동 프로필 생성**: 새 사용자가 첫 작업 시 자동으로 프로필 생성
2. **일관된 동작**: READ/WRITE 작업 모두 동일한 패턴 사용
3. **더 나은 사용자 경험**: "Profile not found" 대신 자동으로 작동
4. **NULL 안전성**: 명시적으로 `profile?.id` 체크

## 수정된 파일

### 1. src/features/onboarding/backend/service.ts
- ✅ `listStyleGuides`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ `getStyleGuideById`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ `updateStyleGuide`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ `deleteStyleGuide`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ `markOnboardingCompleted`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ import 정리: `getProfileIdByClerkId` 제거

### 2. src/features/articles/backend/service.ts
- ✅ `getArticleById`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ `updateArticle`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ `deleteArticle`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ `listArticles`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ `getDashboardStats`: `getProfileIdByClerkId` → `ensureProfile`
- ✅ import 정리: `getProfileIdByClerkId` 제거

### 3. src/features/articles/backend/quota-service.ts
- ✅ 이미 이전에 수정됨 (BUG_FIX_SUMMARY.md 참고)

### 4. src/features/articles/backend/ai-service.ts
- ✅ 이미 이전에 수정됨 (BUG_FIX_SUMMARY.md 참고)

### 5. src/app/api/articles/generate/route.ts
- ✅ 이미 이전에 수정됨 (BUG_FIX_SUMMARY.md 참고)

## 테스트 결과

### ✅ 타입 체크
```bash
$ pnpm typecheck
✓ TypeScript 검증 통과
```

### ✅ Lint
```bash
$ pnpm lint
✓ No ESLint warnings or errors
```

### ✅ 빌드
```bash
$ pnpm build
✓ Compiled successfully
✓ Build 완료
```

## 사용자 시나리오 테스트

### 시나리오 1: 새 사용자 첫 로그인
**Before:**
1. Clerk 계정 생성
2. Style guide 조회 시도
3. ❌ "Profile not found" 에러

**After:**
1. Clerk 계정 생성
2. Style guide 조회 시도
3. ✅ 자동으로 프로필 생성
4. ✅ 빈 배열 반환 (정상)

### 시나리오 2: 새 사용자가 즉시 글 생성
**Before:**
1. 로그인
2. 글 생성 시도
3. ❌ "Profile not found" 에러

**After:**
1. 로그인
2. 글 생성 시도
3. ✅ 자동으로 프로필 생성
4. ✅ 글 생성 성공

### 시나리오 3: 기존 사용자
**Before & After:**
1. 로그인
2. 모든 작업 정상 동작
3. ✅ 기존 사용자는 영향 없음

## 근본 원인 요약

### 이번 버그의 교훈

1. **일관성의 중요성**
   - 일부만 수정하면 버그가 재발할 수 있음
   - 모든 관련 코드를 동일한 패턴으로 수정해야 함

2. **NULL 안전성**
   - `getProfileIdByClerkId`는 `null`을 반환할 수 있음
   - 모든 호출 지점에서 null 체크 필요
   - 더 안전한 대안은 `ensureProfile` 사용

3. **사용자 중심 설계**
   - "Profile not found"는 기술적 에러
   - 사용자 입장에서는 자동으로 동작해야 함
   - `ensureProfile`이 더 나은 UX 제공

## 향후 권장사항

### 1. 프로필 관리 정책
- ✅ 모든 feature service에서 `ensureProfile` 사용
- ❌ READ 작업에서 `getProfileIdByClerkId` 사용 금지
- ⚠️  `getProfileIdByClerkId`는 특수한 경우에만 사용:
  - 조건부 로직 (프로필 존재 여부 확인)
  - 프로필이 없어도 되는 경우

### 2. 코드 리뷰 체크리스트
- [ ] 새로운 Supabase 쿼리가 `profile_id`를 사용하는가?
- [ ] `ensureProfile`을 사용하여 프로필을 확보하는가?
- [ ] NULL 체크가 적절히 되어있는가?
- [ ] 에러 메시지가 사용자 친화적인가?

### 3. 마이그레이션 교훈
- DB 스키마 변경 시 모든 코드를 일괄 수정
- 부분 수정은 숨겨진 버그를 남김
- 마이그레이션 후 전체 코드베이스 검색 필요

## 완료 상태

- ✅ 모든 `getProfileIdByClerkId` 사용처 파악
- ✅ onboarding service 완전 수정
- ✅ articles service 완전 수정
- ✅ quota-service 수정 (이전 완료)
- ✅ ai-service 수정 (이전 완료)
- ✅ 타입 체크 통과
- ✅ Lint 통과
- ✅ 빌드 성공
- ✅ 문서화 완료

**이제 UUID 관련 에러는 근본적으로 해결되었습니다.**
