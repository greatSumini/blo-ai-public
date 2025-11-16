# i18n 품질 검증 보고서 - Keywords 페이지

## 종합 평가
**❌ 수정 필요**

i18n 대응에 심각한 누락이 있습니다. 특히 `SuggestionsDialog` 컴포넌트에서 사용하는 다수의 번역 키가 JSON 파일에 존재하지 않습니다.

---

## 1. 하드코딩된 텍스트 발견

### 0개 - 하드코딩 텍스트 없음 ✅

모든 컴포넌트가 `useTranslations()` 훅을 올바르게 사용하고 있으며, 하드코딩된 텍스트가 없습니다.

**확인된 항목:**
- `KeywordCreateDialog.tsx`: 모든 텍스트가 `t()` 함수로 감싸짐
- `KeywordTable.tsx`: 모든 UI 텍스트가 번역 처리됨
- `SuggestionsDialog.tsx`: 모든 UI 텍스트가 번역 처리됨
- `SearchSection.tsx`: 모든 텍스트가 번역 처리됨
- `DeleteDialog.tsx`: 모든 텍스트가 번역 처리됨
- `EmptyState.tsx`: 모든 상태 메시지가 번역 처리됨
- `Pagination.tsx`: 모든 버튼/텍스트가 번역 처리됨
- `KeywordPicker.tsx`: 모든 텍스트가 번역 처리됨
- `src/app/[locale]/(protected)/keywords/page.tsx`: 모든 텍스트가 번역 처리됨

---

## 2. 번역 키 누락

### 총 28개 누락된 키 발견

#### A. SuggestionsDialog 에러 처리 (5개)
```json
// en.json에서 완전히 누락됨
// ko.json에서 완전히 누락됨

// 필요한 키:
"suggestions": {
  "errors": {
    "invalidCredentials": "Invalid DataForSEO credentials",  // en
    "rateLimit": "Rate limit exceeded. Please try again later",  // en
    "timeout": "Request timeout. Please try again",  // en
    "apiError": "An error occurred while fetching suggestions",  // en
    "fallback": "An unexpected error occurred"  // en
  }
}
```

**코드 위치:**
- `SuggestionsDialog.tsx:62-65` - SUGGESTIONS_ERROR_MESSAGES 객체 정의
- `SuggestionsDialog.tsx:90` - 폴백 에러 메시지

**한국어 번역:**
```json
"errors": {
  "invalidCredentials": "유효하지 않은 DataForSEO 자격증명",
  "rateLimit": "요청 제한 초과. 잠시 후 다시 시도하세요",
  "timeout": "요청 시간 초과. 다시 시도하세요",
  "apiError": "키워드 추천을 가져오는 중 오류가 발생했습니다",
  "fallback": "예기치 않은 오류가 발생했습니다"
}
```

#### B. SuggestionsDialog 검증 메시지 (3개)
```typescript
// 코드에서 사용 (SuggestionsDialog.tsx:97-101):
.min(1, t("suggestions.validation.keywordRequired"))
.max(100, t("suggestions.validation.keywordMaxLength"))
.max(1000, t("suggestions.validation.contextMaxLength"))

// en.json에서 누락됨
// ko.json에서 누락됨
```

**필요한 키:**
```json
"suggestions": {
  "validation": {
    "keywordRequired": "Please enter a keyword",
    "keywordMaxLength": "Keyword must not exceed 100 characters",
    "contextMaxLength": "Context must not exceed 1000 characters"
  }
}
```

**한국어 번역:**
```json
"validation": {
  "keywordRequired": "키워드를 입력해주세요",
  "keywordMaxLength": "키워드는 100자 이내여야 합니다",
  "contextMaxLength": "컨텍스트는 1000자 이내여야 합니다"
}
```

#### C. SuggestionsDialog UI 텍스트 (10개)
```typescript
// 코드에서 사용:
t("suggestions.trigger")           // Line 214
t("suggestions.stepInput")          // Line 242
t("suggestions.stepResults")        // Line 257
t("suggestions.keywordHelp")        // Line 274
t("suggestions.contextHelp")        // Line 295
t("suggestions.loadingTitle")       // Line 332
t("suggestions.loadingDescription") // Line 334
t("suggestions.listTitle")          // Line 344 (with { count } parameter)
t("suggestions.selectedCount")      // Line 347 (with { count } parameter)
t("suggestions.emptyResults")       // Line 382
t("suggestions.notFetchedYet")      // Line 388
```

**필요한 키 (en.json):**
```json
"suggestions": {
  "trigger": "Get Suggestions",  // 이미 있지만 구조 확인
  "stepInput": "Input Keyword",
  "stepResults": "Results",
  "keywordHelp": "Enter the main keyword you want suggestions for",
  "contextHelp": "Add additional context to get more relevant suggestions",
  "loadingTitle": "Fetching suggestions...",
  "loadingDescription": "This may take a moment",
  "listTitle": "Suggested Keywords ({count})",
  "selectedCount": "Selected: {count}",
  "emptyResults": "No suggestions found. Try different keywords.",
  "notFetchedYet": "Enter a keyword and click \"Get Suggestions\" to start"
}
```

**한국어 번역:**
```json
"suggestions": {
  "trigger": "추천받기",
  "stepInput": "키워드 입력",
  "stepResults": "결과",
  "keywordHelp": "추천받고 싶은 주 키워드를 입력하세요",
  "contextHelp": "추가 정보를 입력하면 더 정확한 추천을 받을 수 있습니다",
  "loadingTitle": "추천을 가져오는 중...",
  "loadingDescription": "잠시만 기다려주세요",
  "listTitle": "추천 키워드 ({count}개)",
  "selectedCount": "선택됨: {count}개",
  "emptyResults": "추천 결과가 없습니다. 다른 키워드로 시도해보세요.",
  "notFetchedYet": "키워드를 입력하고 \"추천받기\"를 클릭하여 시작하세요"
}
```

#### D. SuggestionsDialog Toast 메시지 (7개)
```typescript
// 코드에서 사용 (SuggestionsDialog.tsx:135-143):
t("suggestions.toast.fetchSuccessTitle")
t("suggestions.toast.fetchSuccessDescription", { count })
t("suggestions.toast.fetchErrorTitle")
t("suggestions.toast.noSelectionTitle")
t("suggestions.toast.noSelectionDescription")
t("suggestions.toast.addSuccessTitle")
t("suggestions.toast.addSuccessDescription", { created, skipped })
t("suggestions.toast.addErrorTitle")
```

**필요한 키 (en.json):**
```json
"suggestions": {
  "toast": {
    "fetchSuccessTitle": "Suggestions Retrieved",
    "fetchSuccessDescription": "Found {count} keyword suggestions",
    "fetchErrorTitle": "Suggestion Failed",
    "noSelectionTitle": "No Keywords Selected",
    "noSelectionDescription": "Please select at least one keyword to add",
    "addSuccessTitle": "Keywords Added",
    "addSuccessDescription": "Added {created} keywords ({skipped} already exist)",
    "addErrorTitle": "Add Failed"
  }
}
```

**한국어 번역:**
```json
"suggestions": {
  "toast": {
    "fetchSuccessTitle": "추천 완료",
    "fetchSuccessDescription": "{count}개의 키워드 추천을 받았습니다",
    "fetchErrorTitle": "추천 실패",
    "noSelectionTitle": "선택된 키워드 없음",
    "noSelectionDescription": "추가할 키워드를 최소 1개 이상 선택해주세요",
    "addSuccessTitle": "키워드 추가 완료",
    "addSuccessDescription": "{created}개의 키워드가 추가되었습니다 ({skipped}개는 이미 존재)",
    "addErrorTitle": "추가 실패"
  }
}
```

#### E. KeywordPicker 누락 (2개)
```typescript
// 코드에서 사용 (KeywordPicker.tsx:104, 110):
t("picker.searchInputPlaceholder")
t("picker.searching")
```

**필요한 키 (en.json):**
```json
"picker": {
  "searchInputPlaceholder": "Search keywords...",
  "searching": "Searching..."
}
```

**한국어 번역:**
```json
"picker": {
  "searchInputPlaceholder": "키워드 검색...",
  "searching": "검색 중..."
}
```

---

## 3. 번역 키 구조 불일치

### KeywordCreateDialog - Toast 메시지 구조 문제

**en.json의 구조:**
```json
"create": {
  "toast": {
    "success": {
      "title": "Keyword Added",
      "desc": "The keyword \"{phrase}\" has been added."
    },
    "error": {
      "title": "Add Failed",
      "desc": "An error occurred while adding the keyword.",
      "fallback": "An unexpected error occurred."
    }
  }
}
```

**코드에서의 사용 (KeywordCreateDialog.tsx:61-73):**
```typescript
toast({
  title: t("create.toast.successTitle"),           // 찾을 수 없음 ❌
  description: t("create.toast.successDescription", { phrase: values.phrase }),
});

toast({
  title: t("create.toast.errorTitle"),             // 찾을 수 없음 ❌
  description: errorMessage,
});
```

**ko.json의 구조 (코드와 일치):**
```json
"create": {
  "toast": {
    "successTitle": "키워드 추가 완료",
    "successDescription": "\"{phrase}\"가 추가되었습니다.",
    "errorTitle": "키워드 추가 실패",
    "errorFallback": "키워드를 추가할 수 없습니다. 잠시 후 다시 시도해주세요."
  }
}
```

**해결 방법:**
en.json의 구조를 ko.json 구조와 일치하도록 변경해야 합니다.

```json
"create": {
  "toast": {
    "successTitle": "Keyword Added",
    "successDescription": "The keyword \"{phrase}\" has been added.",
    "errorTitle": "Add Failed",
    "errorFallback": "An unexpected error occurred."
  }
}
```

---

## 4. 접근성 텍스트 검증

### 모든 aria-label 올바르게 처리됨 ✅

#### KeywordTable.tsx
```typescript
// Line 183: aria-label 올바르게 사용됨
aria-label={t("table.copyAria", { phrase: keyword.phrase })}

// Line 192: aria-label 올바르게 사용됨
aria-label={t("table.deleteAria", { phrase: keyword.phrase })}
```

✅ 모든 aria-label이 번역되어 있습니다.

---

## 5. 동적 텍스트 처리

### 변수 삽입 올바르게 처리됨 ✅

**확인된 동적 텍스트:**

1. **KeywordTable.tsx**
   ```typescript
   t("table.totalCount", { count: totalFiltered })
   t("table.copySuccessDesc", { phrase })
   t("table.deleteAria", { phrase })
   t("table.paginationInfo", { start, end, total })
   ```

2. **KeywordCreateDialog.tsx**
   ```typescript
   t("create.toast.successDescription", { phrase: values.phrase })
   ```

3. **SuggestionsDialog.tsx**
   ```typescript
   t("suggestions.toast.fetchSuccessDescription", { count: result.suggestions.length })
   t("suggestions.toast.addSuccessDescription", { created, skipped })
   t("suggestions.listTitle", { count: suggestions.length })
   t("suggestions.selectedCount", { count: selectedKeywords.size })
   ```

4. **Pagination.tsx**
   ```typescript
   t("paginationInfo", { total: totalItems, start: startItem, end: endItem })
   ```

✅ 모든 동적 텍스트가 올바르게 처리되었습니다.

---

## 6. 번역 품질 평가

### 영어 번역 (en.json)
**점수: 75/100**

**문제점:**
1. 많은 UI 텍스트가 번역 파일에 누락됨 (28개)
2. 일부 문구가 부자연스럽거나 누락됨

**개선이 필요한 표현:**
- `suggestions.keywordHelp` - 추가 필요
- `suggestions.contextHelp` - 추가 필요
- `suggestions.loadingDescription` - 추가 필요

### 한국어 번역 (ko.json)
**점수: 70/100**

**문제점:**
1. 마찬가지로 28개의 키가 누락됨
2. 일부 번역이 완성되지 않음

**개선 필요:**
- 영어 번역과 동일한 28개 키가 모두 추가되어야 함
- 톤 일관성 유지

---

## 7. 수정 필요 체크리스트

### 긴급 (한국어 구조 오류 수정)
- [ ] **en.json** `create.toast` 구조를 ko.json과 일치하도록 변경
  ```json
  // Before
  "success": { "title": "...", "desc": "..." }

  // After
  "successTitle": "...",
  "successDescription": "..."
  ```

### 높음 (누락된 28개 키 추가)

**en.json에 추가:**
1. `suggestions.errors.*` (5개)
2. `suggestions.validation.*` (3개)
3. `suggestions.stepInput`, `suggestions.stepResults` (2개)
4. `suggestions.keywordHelp`, `suggestions.contextHelp` (2개)
5. `suggestions.loadingTitle`, `suggestions.loadingDescription` (2개)
6. `suggestions.listTitle`, `suggestions.selectedCount` (2개)
7. `suggestions.emptyResults`, `suggestions.notFetchedYet` (2개)
8. `suggestions.toast.fetchSuccessTitle`, `suggestions.toast.fetchSuccessDescription` (2개)
9. `suggestions.toast.fetchErrorTitle` (1개)
10. `suggestions.toast.noSelectionTitle`, `suggestions.toast.noSelectionDescription` (2개)
11. `suggestions.toast.addSuccessTitle`, `suggestions.toast.addSuccessDescription` (2개)
12. `suggestions.toast.addErrorTitle` (1개)
13. `picker.searchInputPlaceholder`, `picker.searching` (2개)

**ko.json에 추가:** (동일하게 28개 모두 추가)

---

## 8. 완전한 번역 파일 (수정 버전)

### en.json - keywords 섹션 (수정 후)

```json
{
  "keywords": {
    "title": "Keywords",
    "description": "Manage keywords and get AI recommendations to optimize your blog content.",
    "table": {
      "searchPlaceholder": "Search keywords...",
      "clearSearch": "Clear search",
      "filterAll": "All",
      "filterManual": "Manual",
      "filterAi": "AI",
      "columnKeyword": "Keyword",
      "columnSource": "Source",
      "columnCreatedAt": "Created At",
      "columnActions": "Actions",
      "sourceManual": "Manual",
      "sourceAi": "AI",
      "totalCount": "Total {count} keywords",
      "loadError": "Failed to load keywords",
      "loadErrorFallback": "An unexpected error occurred",
      "loading": "Loading keywords...",
      "noResultsTitle": "No keywords found",
      "noResultsDesc": "Try adjusting your search or filter.",
      "emptyTitle": "No registered keywords yet",
      "emptyDesc": "Add your first keyword to optimize SEO.",
      "copySuccess": "Copied to clipboard",
      "copySuccessDesc": "\"{phrase}\" has been copied to clipboard.",
      "copyAria": "Copy {phrase} to clipboard",
      "deleteAria": "Delete {phrase} keyword",
      "paginationInfo": "Showing {start}-{end} of {total}",
      "previous": "Previous",
      "next": "Next"
    },
    "create": {
      "title": "Add New Keyword",
      "description": "Add keywords to use for SEO content optimization.",
      "trigger": "Add Keyword",
      "fieldLabel": "Keyword",
      "fieldPlaceholder": "Enter keyword",
      "cancel": "Cancel",
      "save": "Save",
      "saving": "Saving...",
      "validation": {
        "required": "Please enter a keyword.",
        "minLength": "Please enter at least 2 characters.",
        "maxLength": "Keyword cannot exceed 100 characters."
      },
      "toast": {
        "successTitle": "Keyword Added",
        "successDescription": "The keyword \"{phrase}\" has been added.",
        "errorTitle": "Add Failed",
        "errorFallback": "An unexpected error occurred."
      }
    },
    "delete": {
      "title": "Delete Keyword",
      "description": "Are you sure you want to delete \"{phrase}\"? This action cannot be undone.",
      "cancel": "Cancel",
      "confirm": "Delete",
      "deleting": "Deleting...",
      "successTitle": "Keyword Deleted",
      "successDesc": "\"{phrase}\" has been deleted.",
      "errorTitle": "Delete Failed",
      "errorFallback": "An unexpected error occurred."
    },
    "picker": {
      "searchPlaceholder": "Search keywords...",
      "searchInputPlaceholder": "Search keywords...",
      "loading": "Loading keywords...",
      "searching": "Searching...",
      "noResults": "No keywords found.",
      "selectKeyword": "Select Keyword",
      "selected": "Selected"
    },
    "suggestions": {
      "title": "AI Keyword Suggestions",
      "subtitle": "Get long-tail keyword suggestions to optimize your blog's SEO.",
      "trigger": "Get Suggestions",
      "stepInput": "Input Keyword",
      "stepResults": "Results",
      "keywordLabel": "Topic Keyword",
      "keywordPlaceholder": "e.g., blog writing tips",
      "keywordHelp": "Enter the main keyword you want suggestions for",
      "contextLabel": "Additional Context (Optional)",
      "contextPlaceholder": "Provide additional context to get more relevant recommendations",
      "contextHelp": "Add additional context to get more relevant suggestions",
      "fetchButton": "Get Suggestions",
      "fetching": "Fetching...",
      "fetchHint": "This may take a moment...",
      "generate": "Generate Suggestions",
      "generating": "Generating suggestions...",
      "close": "Close",
      "loadingTitle": "Fetching suggestions...",
      "loadingDescription": "This may take a moment",
      "listTitle": "Suggested Keywords ({count})",
      "selectedCount": "Selected: {count}",
      "addSelected": "Add Selected",
      "addAll": "Add All",
      "addKeyword": "Add Keyword",
      "adding": "Adding...",
      "emptyResults": "No suggestions found. Try different keywords.",
      "notFetchedYet": "Enter a keyword and click \"Get Suggestions\" to start",
      "competition": "Competition",
      "competition_details": {
        "high": "High competition",
        "medium": "Medium competition",
        "low": "Low competition"
      },
      "errors": {
        "validation": {
          "required": "Please enter a keyword.",
          "minLength": "Please enter at least 2 characters.",
          "keywordRequired": "Please enter a keyword",
          "keywordMaxLength": "Keyword must not exceed 100 characters",
          "contextMaxLength": "Context must not exceed 1000 characters"
        },
        "invalidCredentials": "Invalid DataForSEO credentials",
        "rateLimit": "Rate limit exceeded. Please try again later",
        "timeout": "Request timeout. Please try again",
        "apiError": "An error occurred while fetching suggestions",
        "fallback": "An unexpected error occurred",
        "fetch": {
          "title": "Suggestion Failed",
          "desc": "An error occurred while fetching keyword suggestions."
        },
        "add": {
          "title": "Add Failed",
          "desc": "An error occurred while adding the keyword."
        }
      },
      "toast": {
        "fetchSuccessTitle": "Suggestions Retrieved",
        "fetchSuccessDescription": "Found {count} keyword suggestions",
        "fetchErrorTitle": "Suggestion Failed",
        "noSelectionTitle": "No Keywords Selected",
        "noSelectionDescription": "Please select at least one keyword to add",
        "addSuccessTitle": "Keywords Added",
        "addSuccessDescription": "Added {created} keywords ({skipped} already exist)",
        "addErrorTitle": "Add Failed",
        "success": {
          "title": "Keyword Added",
          "desc": "The keyword \"{keyword}\" has been added."
        }
      }
    }
  }
}
```

### ko.json - keywords 섹션 (수정 후)

```json
{
  "keywords": {
    "title": "키워드 관리",
    "description": "블로그 콘텐츠 최적화를 위한 키워드를 관리하고 AI 추천을 받으세요.",
    "suggestions": "AI 추천",
    "new_keyword": "키워드 추가",
    "table": {
      "searchPlaceholder": "키워드 검색...",
      "clearSearch": "검색어 지우기",
      "filterAll": "전체",
      "filterManual": "수동",
      "filterAi": "AI",
      "columnKeyword": "키워드",
      "columnSource": "소스",
      "columnCreatedAt": "생성일",
      "columnActions": "액션",
      "sourceManual": "수동",
      "sourceAi": "AI",
      "totalCount": "총 {count}개의 키워드",
      "loading": "키워드를 불러오는 중...",
      "loadError": "키워드를 불러오는 중 오류가 발생했습니다",
      "loadErrorFallback": "서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.",
      "noResultsTitle": "검색 결과가 없습니다",
      "noResultsDesc": "다른 검색어를 시도하거나 필터를 조정해보세요.",
      "emptyTitle": "아직 키워드가 없습니다",
      "emptyDesc": "첫 키워드를 추가하거나 AI 추천을 받아보세요.",
      "copySuccess": "복사 완료",
      "copySuccessDesc": "\"{phrase}\"가 클립보드에 복사되었습니다.",
      "copyAria": "{phrase} 복사",
      "deleteAria": "{phrase} 삭제",
      "paginationInfo": "{total}개 중 {start}-{end}",
      "previous": "이전",
      "next": "다음"
    },
    "create": {
      "title": "새 키워드 추가",
      "description": "블로그에 사용할 키워드를 직접 추가합니다.",
      "trigger": "키워드 추가",
      "fieldLabel": "키워드",
      "fieldPlaceholder": "키워드를 입력하세요",
      "cancel": "취소",
      "save": "저장",
      "saving": "저장 중...",
      "validation": {
        "required": "키워드를 입력해주세요.",
        "maxLength": "키워드는 100자 이내로 입력해주세요."
      },
      "toast": {
        "successTitle": "키워드 추가 완료",
        "successDescription": "\"{phrase}\"가 추가되었습니다.",
        "errorTitle": "키워드 추가 실패",
        "errorFallback": "키워드를 추가할 수 없습니다. 잠시 후 다시 시도해주세요."
      }
    },
    "delete": {
      "title": "키워드 삭제",
      "description": "\"{phrase}\" 키워드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      "cancel": "취소",
      "confirm": "삭제",
      "deleting": "삭제 중...",
      "successTitle": "키워드 삭제 완료",
      "successDesc": "\"{phrase}\"가 삭제되었습니다.",
      "errorTitle": "키워드 삭제 실패",
      "errorFallback": "키워드를 삭제할 수 없습니다. 잠시 후 다시 시도해주세요."
    },
    "picker": {
      "searchPlaceholder": "키워드 검색...",
      "searchInputPlaceholder": "키워드 검색...",
      "loading": "키워드를 불러오는 중...",
      "searching": "검색 중...",
      "noResults": "키워드가 없습니다.",
      "selectKeyword": "키워드 선택",
      "selected": "선택됨"
    },
    "suggestions": {
      "title": "AI 키워드 추천",
      "subtitle": "주제와 관련된 롱테일 키워드를 추천받으세요.",
      "trigger": "추천받기",
      "stepInput": "키워드 입력",
      "stepResults": "결과",
      "keywordLabel": "주제 키워드",
      "keywordPlaceholder": "예: 블로그 작성법",
      "keywordHelp": "추천받고 싶은 주 키워드를 입력하세요",
      "contextLabel": "컨텍스트 (선택)",
      "contextPlaceholder": "추가 정보를 입력하면 더 정확한 추천을 받을 수 있습니다",
      "contextHelp": "추가 정보를 입력하면 더 정확한 추천을 받을 수 있습니다",
      "fetchButton": "추천받기",
      "fetching": "추천 중...",
      "fetchHint": "잠시만 기다려주세요...",
      "generate": "추천받기",
      "generating": "추천 중...",
      "close": "닫기",
      "loadingTitle": "추천을 가져오는 중...",
      "loadingDescription": "잠시만 기다려주세요",
      "listTitle": "추천 키워드 ({count}개)",
      "selectedCount": "선택됨: {count}개",
      "addSelected": "선택한 키워드 추가",
      "addAll": "전체 추가",
      "addKeyword": "키워드 추가",
      "adding": "추가 중...",
      "emptyResults": "추천 결과가 없습니다.",
      "noResults": "추천 결과가 없습니다.",
      "notFetchedYet": "키워드를 입력하고 \"추천받기\"를 클릭하여 시작하세요",
      "competition": "경쟁도",
      "competition_details": {
        "high": "높음",
        "medium": "중간",
        "low": "낮음"
      },
      "errors": {
        "validation": {
          "required": "키워드를 입력해주세요.",
          "minLength": "키워드는 2자 이상이어야 합니다.",
          "keywordRequired": "키워드를 입력해주세요",
          "keywordMaxLength": "키워드는 100자 이내여야 합니다",
          "contextMaxLength": "컨텍스트는 1000자 이내여야 합니다"
        },
        "invalidCredentials": "유효하지 않은 DataForSEO 자격증명",
        "rateLimit": "요청 제한 초과. 잠시 후 다시 시도하세요",
        "timeout": "요청 시간 초과. 다시 시도하세요",
        "apiError": "키워드 추천을 가져오는 중 오류가 발생했습니다",
        "fallback": "예기치 않은 오류가 발생했습니다",
        "fetch": {
          "title": "추천 실패",
          "desc": "키워드 추천 중 오류가 발생했습니다."
        },
        "add": {
          "title": "추가 실패",
          "desc": "키워드를 추가하는 중 오류가 발생했습니다."
        }
      },
      "toast": {
        "fetchSuccessTitle": "추천 완료",
        "fetchSuccessDescription": "{count}개의 키워드 추천을 받았습니다",
        "fetchErrorTitle": "추천 실패",
        "noSelectionTitle": "선택된 키워드 없음",
        "noSelectionDescription": "추가할 키워드를 최소 1개 이상 선택해주세요",
        "addSuccessTitle": "키워드 추가 완료",
        "addSuccessDescription": "{created}개의 키워드가 추가되었습니다 ({skipped}개는 이미 존재)",
        "addErrorTitle": "추가 실패",
        "successTitle": "키워드 추가 완료",
        "successDescription": "{count}개의 키워드가 추가되었습니다.",
        "errorTitle": "추천 실패",
        "errorFallback": "키워드 추천 중 오류가 발생했습니다."
      }
    }
  }
}
```

---

## 9. 요약

| 항목 | 상태 | 설명 |
|------|------|------|
| 하드코딩된 텍스트 | ✅ 0개 | 모든 텍스트가 i18n으로 처리됨 |
| 누락된 번역 키 | ❌ 28개 | SuggestionsDialog 및 KeywordPicker 키 누락 |
| 구조 불일치 | ❌ 1개 | en.json의 create.toast 구조 문제 |
| 접근성 텍스트 | ✅ 완벽 | 모든 aria-label이 번역됨 |
| 동적 텍스트 | ✅ 완벽 | 모든 변수 삽입이 올바름 |
| 번역 품질 | ⚠️ 70/100 | 누락된 키를 모두 추가하면 개선됨 |

---

## 10. 즉시 해야 할 작업

1. **en.json 수정:**
   - `keywords.create.toast` 구조 변경 (nested에서 flat으로)
   - 28개의 누락된 키 추가

2. **ko.json 수정:**
   - 동일하게 28개의 누락된 키 추가
   - 번역 검수

3. **검증:**
   - 모든 번역 키가 JSON에 존재하는지 확인
   - 애플리케이션 실행 후 UI 텍스트 확인

---

**생성 일시:** 2025-11-16
**검증 완료자:** i18n Quality Check Agent
