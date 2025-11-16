# Articles 페이지 i18n 검증 보고서

## 요약
**종합 평가: ❌ 수정 필요**

- 하드코딩된 텍스트: **4개** 발견
- 누락된 번역 키: **35개**
- 번역 품질 점수: **55/100**
- 긴급 수정 필요

---

## 1. 하드코딩된 텍스트 발견

### 발견 항목

#### 항목 1: article-preview.tsx - 미리보기 제목
- **파일**: `src/features/articles/components/article-preview.tsx:28`
- **코드**:
  ```typescript
  <h3 className="flex items-center gap-2 text-lg font-semibold">
    <FileText className="h-5 w-5" style={{ color: "#3BA2F8" }} />
    미리보기
  </h3>
  ```
- **문제**: 한글 하드코딩 텍스트
- **수정안**:
  ```typescript
  const t = useTranslations("articles");
  <h3 className="flex items-center gap-2 text-lg font-semibold">
    <FileText className="h-5 w-5" style={{ color: "#3BA2F8" }} />
    {t("preview.title")}
  </h3>
  ```

#### 항목 2: article-preview.tsx - 빈 상태 메시지
- **파일**: `src/features/articles/components/article-preview.tsx:41-43`
- **코드**:
  ```typescript
  <p className="text-sm">
    글을 작성하면
    <br />
    미리보기가 표시됩니다
  </p>
  ```
- **문제**: 한글 하드코딩 텍스트
- **수정안**:
  ```typescript
  const t = useTranslations("articles");
  <p className="text-sm">
    {t("preview.emptyMessage")}
  </p>
  ```

#### 항목 3: article-preview.tsx - 키워드 라벨
- **파일**: `src/features/articles/components/article-preview.tsx:104-105`
- **코드**:
  ```typescript
  <h4 className="mb-2 text-xs font-semibold uppercase" style={{ color: "#6B7280" }}>
    키워드
  </h4>
  ```
- **문제**: 한글 하드코딩 텍스트
- **수정안**:
  ```typescript
  {t("preview.keywordsLabel")}
  ```

#### 항목 4: article-preview.tsx - 본문 라벨
- **파일**: `src/features/articles/components/article-preview.tsx:143-146`
- **코드**:
  ```typescript
  <h4 className="mb-3 text-xs font-semibold uppercase" style={{ color: "#6B7280" }}>
    본문
  </h4>
  ```
- **문제**: 한글 하드코딩 텍스트
- **수정안**:
  ```typescript
  {t("preview.contentLabel")}
  ```

---

## 2. 누락된 번역 키

### article-form.tsx에서 필요한 키

#### Form Field Labels & Descriptions
```
articles.articleForm:
  - titleDescription (필드 설명)
  - slugDescription (필드 설명)
  - keywordsDescription (필드 설명)
  - descriptionDescription (필드 설명)
  - contentDescription (필드 설명)
  - styleGuideDescription (필드 설명)
  - toneLabel
  - toneDescription
  - tonePlaceholder
  - toneProfessional
  - toneFriendly
  - toneInspirational
  - toneEducational
  - contentLengthLabel
  - contentLengthPlaceholder
  - contentLengthShort
  - contentLengthMedium
  - contentLengthLong
  - readingLevelLabel
  - readingLevelPlaceholder
  - readingLevelBeginner
  - readingLevelIntermediate
  - readingLevelAdvanced
```

### generation-progress.tsx에서 필요한 키

```
articles.generationProgress:
  - ariaLabel
  - cancelConfirm (확인 메시지)
  - errorQuotaTitle
  - errorQuotaMessage
  - errorAITitle
  - errorAIMessage
  - errorGenericTitle
  - progress
  - progressPercent (동적 텍스트)
  - timeRemaining
  - motivationalMessage
  - cancel
```

### seo-panel.tsx에서 필요한 키

```
articles.seoPanel:
  - titleLengthMessage (동적 - {count})
  - titleLengthEmpty
  - metaTitleMessage (동적 - {count})
  - metaTitleEmpty
  - metaDescriptionMessage (동적 - {count})
  - metaDescriptionEmpty
  - slugValid
  - slugInvalid
  - slugEmpty
  - keywordsMessage (동적 - {count})
  - keywordsEmpty
  - keywordsLabel
  - contentLengthMessage (동적 - {count})
  - contentLengthEmpty
  - contentLengthLabel
  - itemsPassed (동적 - {passed}/{total})
  - scoreLabel (동적 - {score})
  - tipsTitle
  - tip1
  - tip2
  - tip3
  - tip4
```

### article-preview.tsx에서 필요한 키

```
articles.preview:
  - title
  - emptyMessage
  - keywordsLabel
  - contentLabel
```

---

## 3. 번역 키 누락/불일치 분석

### en.json에 누락된 키
- `articles.articleForm.titleDescription`
- `articles.articleForm.slugDescription`
- `articles.articleForm.keywordsDescription`
- `articles.articleForm.descriptionDescription`
- `articles.articleForm.contentDescription`
- `articles.articleForm.styleGuideDescription`
- `articles.articleForm.toneLabel`
- `articles.articleForm.toneDescription`
- `articles.articleForm.tonePlaceholder`
- `articles.articleForm.toneProfessional`
- `articles.articleForm.toneFriendly`
- `articles.articleForm.toneInspirational`
- `articles.articleForm.toneEducational`
- `articles.articleForm.contentLengthLabel`
- `articles.articleForm.contentLengthPlaceholder`
- `articles.articleForm.contentLengthShort`
- `articles.articleForm.contentLengthMedium`
- `articles.articleForm.contentLengthLong`
- `articles.articleForm.readingLevelLabel`
- `articles.articleForm.readingLevelPlaceholder`
- `articles.articleForm.readingLevelBeginner`
- `articles.articleForm.readingLevelIntermediate`
- `articles.articleForm.readingLevelAdvanced`

### ko.json에 누락된 키
모두 동일

---

## 4. 품질 분석

### 접근성 텍스트
- `article-card-menu.tsx:33` - aria-label 올바르게 번역됨 ✓
- `generation-progress.tsx:168` - aria-label 누락 ❌
- `generation-progress.tsx:210` - aria-label 누락 (동적 텍스트) ❌

### 동적 텍스트 처리

#### auto-save-indicator.tsx:39
```typescript
t("autoSave.saved", {
  time: formatDistanceToNow(new Date(lastSavedAt), {
    addSuffix: true,
    locale: ko,
  })
})
```
**평가**: ✓ 올바름

#### seo-panel.tsx의 동적 텍스트들
많은 동적 키들이 template string으로 처리되어야 하나 번역 키 자체가 누락됨

---

## 5. 번역 품질 평가

### 현재 번역 상태
- ✓ 기존 번역들은 자연스러움
- ✓ 용어 일관성 유지
- ❌ 많은 필드 설명 텍스트 누락
- ❌ 폼 유효성 메시지 누락

### 개선 필요 사항
1. 모든 폼 필드에 라벨 및 설명 텍스트 추가
2. SEO 패널의 상세 메시지 추가
3. 생성 진행 상황 메시지 추가
4. 접근성 텍스트 완성

---

## 6. 수정 체크리스트

### 긴급 (하드코딩 제거)
- [ ] `article-preview.tsx:28` - "미리보기" → `t("preview.title")`
- [ ] `article-preview.tsx:41-43` - "글을 작성하면 미리보기가 표시됩니다" → `t("preview.emptyMessage")`
- [ ] `article-preview.tsx:104-105` - "키워드" → `t("preview.keywordsLabel")`
- [ ] `article-preview.tsx:143-146` - "본문" → `t("preview.contentLabel")`

### 높음 (번역 키 추가)
- [ ] en.json: articleForm 필드 설명 추가 (23개)
- [ ] ko.json: articleForm 필드 설명 추가 (23개)
- [ ] en.json: generationProgress 키 추가 (10개)
- [ ] ko.json: generationProgress 키 추가 (10개)
- [ ] en.json: seoPanel 키 추가 (17개)
- [ ] ko.json: seoPanel 키 추가 (17개)
- [ ] en.json: preview 키 추가 (4개)
- [ ] ko.json: preview 키 추가 (4개)

### 중간 (접근성)
- [ ] `generation-progress.tsx:168` aria-label 추가
- [ ] `generation-progress.tsx:210` aria-label 추가

---

## 7. 최종 번역 파일 추가 항목

### en.json 추가 항목

```json
{
  "articles": {
    "articleForm": {
      "subtitle": "Edit your article details and content",
      "titleDescription": "The main heading of your article",
      "slugDescription": "URL-friendly identifier (auto-generated from title)",
      "keywordsDescription": "Add relevant keywords for SEO",
      "descriptionDescription": "Brief summary of the article content",
      "contentDescription": "Full article content in Markdown format",
      "styleGuideDescription": "Apply a style guide to maintain consistency",
      "toneLabel": "Tone",
      "toneDescription": "Choose the writing tone for your content",
      "tonePlaceholder": "Select tone",
      "toneProfessional": "Professional",
      "toneFriendly": "Friendly",
      "toneInspirational": "Inspirational",
      "toneEducational": "Educational",
      "contentLengthLabel": "Content Length",
      "contentLengthPlaceholder": "Select content length",
      "contentLengthShort": "Short (300-500 words)",
      "contentLengthMedium": "Medium (500-1000 words)",
      "contentLengthLong": "Long (1000+ words)",
      "readingLevelLabel": "Reading Level",
      "readingLevelPlaceholder": "Select reading level",
      "readingLevelBeginner": "Beginner",
      "readingLevelIntermediate": "Intermediate",
      "readingLevelAdvanced": "Advanced"
    },
    "generationProgress": {
      "ariaLabel": "Article generation in progress",
      "cancelConfirm": "Are you sure you want to cancel article generation?",
      "errorQuotaTitle": "Generation Quota Exceeded",
      "errorQuotaMessage": "You've reached your monthly generation limit. Please upgrade your plan.",
      "errorAITitle": "AI Generation Failed",
      "errorAIMessage": "An error occurred during AI generation. Please try again.",
      "errorGenericTitle": "Generation Error",
      "progress": "Progress",
      "progressPercent": "Progress {percent}%",
      "timeRemaining": "Time remaining:",
      "motivationalMessage": "Great things take a moment... Your article is being crafted with AI intelligence!",
      "cancel": "Cancel"
    },
    "seoPanel": {
      "titleLengthMessage": "Title length: {count} characters",
      "titleLengthEmpty": "Add a title for SEO analysis",
      "metaTitleMessage": "Meta title: {count} characters",
      "metaTitleEmpty": "Add a meta title (optimal: 50-60 characters)",
      "metaDescriptionMessage": "Meta description: {count} characters",
      "metaDescriptionEmpty": "Add a meta description (optimal: 120-160 characters)",
      "slugValid": "Slug format is valid",
      "slugInvalid": "Invalid slug format. Use lowercase letters, numbers and hyphens.",
      "slugEmpty": "Add a URL slug",
      "keywordsMessage": "Keywords: {count} added",
      "keywordsEmpty": "Add keywords (optimal: 3-10)",
      "keywordsLabel": "Keywords",
      "contentLengthMessage": "Content: {count} characters",
      "contentLengthEmpty": "Add content for analysis (minimum: 300 characters)",
      "contentLengthLabel": "Content Length",
      "itemsPassed": "{passed} of {total} checks passed",
      "scoreLabel": "SEO Score {score}",
      "tipsTitle": "SEO Tips",
      "tip1": "Keep your title between 30-60 characters",
      "tip2": "Meta description should be 120-160 characters",
      "tip3": "Include 3-10 relevant keywords",
      "tip4": "Ensure content is at least 300 characters long"
    },
    "preview": {
      "title": "Preview",
      "emptyMessage": "Start writing to see preview here",
      "keywordsLabel": "Keywords",
      "contentLabel": "Content"
    }
  }
}
```

### ko.json 추가 항목

```json
{
  "articles": {
    "articleForm": {
      "subtitle": "글의 제목, 내용, 메타데이터를 수정합니다",
      "titleDescription": "글의 주요 제목입니다",
      "slugDescription": "URL에 사용할 수 있는 식별자 (제목에서 자동 생성)",
      "keywordsDescription": "SEO를 위한 관련 키워드를 추가하세요",
      "descriptionDescription": "글의 내용을 간단히 요약합니다",
      "contentDescription": "마크다운 형식의 완전한 글 내용",
      "styleGuideDescription": "스타일 가이드를 적용하여 일관성 유지",
      "toneLabel": "톤",
      "toneDescription": "콘텐츠 작성의 톤을 선택하세요",
      "tonePlaceholder": "톤을 선택하세요",
      "toneProfessional": "전문적",
      "toneFriendly": "친근한",
      "toneInspirational": "영감을 주는",
      "toneEducational": "교육적",
      "contentLengthLabel": "콘텐츠 길이",
      "contentLengthPlaceholder": "콘텐츠 길이를 선택하세요",
      "contentLengthShort": "짧게 (300-500자)",
      "contentLengthMedium": "보통 (500-1000자)",
      "contentLengthLong": "길게 (1000자 이상)",
      "readingLevelLabel": "읽기 수준",
      "readingLevelPlaceholder": "읽기 수준을 선택하세요",
      "readingLevelBeginner": "초급",
      "readingLevelIntermediate": "중급",
      "readingLevelAdvanced": "고급"
    },
    "generationProgress": {
      "ariaLabel": "글 생성 진행 중",
      "cancelConfirm": "정말 글 생성을 취소하시겠습니까?",
      "errorQuotaTitle": "생성 횟수 제한 초과",
      "errorQuotaMessage": "월간 생성 한도에 도달했습니다. 플랜을 업그레이드하세요.",
      "errorAITitle": "AI 생성 실패",
      "errorAIMessage": "AI 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
      "errorGenericTitle": "생성 오류",
      "progress": "진행도",
      "progressPercent": "진행도 {percent}%",
      "timeRemaining": "남은 시간:",
      "motivationalMessage": "좋은 결과는 시간이 걸립니다... AI가 당신의 글을 작성하고 있습니다!",
      "cancel": "취소"
    },
    "seoPanel": {
      "titleLengthMessage": "제목 길이: {count}자",
      "titleLengthEmpty": "SEO 분석을 위해 제목을 추가하세요",
      "metaTitleMessage": "메타 제목: {count}자",
      "metaTitleEmpty": "메타 제목 추가 (최적: 50-60자)",
      "metaDescriptionMessage": "메타 설명: {count}자",
      "metaDescriptionEmpty": "메타 설명 추가 (최적: 120-160자)",
      "slugValid": "슬러그 형식이 올바릅니다",
      "slugInvalid": "잘못된 슬러그 형식입니다. 소문자, 숫자, 하이픈을 사용하세요.",
      "slugEmpty": "URL 슬러그를 추가하세요",
      "keywordsMessage": "키워드: {count}개 추가됨",
      "keywordsEmpty": "키워드 추가 (최적: 3-10개)",
      "keywordsLabel": "키워드",
      "contentLengthMessage": "콘텐츠: {count}자",
      "contentLengthEmpty": "분석을 위해 콘텐츠 추가 (최소: 300자)",
      "contentLengthLabel": "콘텐츠 길이",
      "itemsPassed": "{total}개 중 {passed}개 검사 통과",
      "scoreLabel": "SEO 점수 {score}",
      "tipsTitle": "SEO 팁",
      "tip1": "제목은 30-60자 사이로 유지하세요",
      "tip2": "메타 설명은 120-160자여야 합니다",
      "tip3": "3-10개의 관련 키워드를 포함하세요",
      "tip4": "콘텐츠는 최소 300자 이상이어야 합니다"
    },
    "preview": {
      "title": "미리보기",
      "emptyMessage": "글을 작성하면 미리보기가 표시됩니다",
      "keywordsLabel": "키워드",
      "contentLabel": "본문"
    }
  }
}
```

---

## 8. 구현 우선순위

1. **즉시 (P0)**: 하드코딩 텍스트 4개 제거
2. **높음 (P1)**: 번역 키 35개 추가 및 컴포넌트 업데이트
3. **중간 (P2)**: 접근성 텍스트 개선
4. **낮음 (P3)**: 추가 번역 품질 검토

---

## 9. 예상 작업량

- 번역 파일 수정: ~30분
- 컴포넌트 업데이트: ~1시간
- 테스트: ~30분
- **총 예상 시간**: ~2시간

