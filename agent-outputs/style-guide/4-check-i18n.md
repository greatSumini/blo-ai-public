# i18n 품질 검증 보고서 - Style Guide

## 1. 하드코딩된 텍스트 발견

### 발견 항목

#### 항목 1: 언어 표시 텍스트 - style-guide-card.tsx
- **파일**: `src/features/style-guide/components/style-guide-card.tsx:76`
- **코드**:
  ```typescript
  {guide.language === "ko" ? "한국어" : "English"}
  ```
- **문제**: 하드코딩된 한국어/영어 텍스트
- **수정안**:
  ```typescript
  const tLabels = useTranslations("styleGuide.labels");
  {guide.language === "ko" ? tLabels("language.korean") : tLabels("language.english")}
  ```

#### 항목 2: 언어 표시 텍스트 - style-guide-preview-modal-improved.tsx
- **파일**: `src/features/style-guide/components/style-guide-preview-modal-improved.tsx:111`
- **코드**:
  ```typescript
  value={guide.language === "ko" ? "한국어" : "English"}
  ```
- **문제**: 하드코딩된 한국어/영어 텍스트
- **수정안**:
  ```typescript
  const tLabels = useTranslations("styleGuide.labels");
  value={guide.language === "ko" ? tLabels("language.korean") : tLabels("language.english")}
  ```

## 2. 번역 키 누락

### styleGuide.labels에 추가 필요
```json
{
  "language": {
    "korean": "한국어",
    "english": "English"
  }
}
```

## 3. 번역 키 불일치

두 파일 모두 `styleGuide.labels.language` 키를 사용하여야 하지만:
- en.json의 `styleGuide.modal.language`는 "Language"로 정의되어 있음
- 언어 선택 옵션의 값(한국어/English)과는 다른 키임

## 4. 수정 체크리스트

### 긴급 (하드코딩 제거)
- [ ] src/features/style-guide/components/style-guide-card.tsx:76 - 언어 표시 텍스트를 번역 키로 변경
- [ ] src/features/style-guide/components/style-guide-preview-modal-improved.tsx:111 - 언어 표시 텍스트를 번역 키로 변경

### 높음 (번역 키 추가)
- [ ] messages/en.json에 `styleGuide.labels.language.korean`, `styleGuide.labels.language.english` 추가
- [ ] messages/ko.json에 `styleGuide.labels.language.korean`, `styleGuide.labels.language.english` 추가

## 5. 최종 번역 파일

### en.json (styleGuide.labels에 추가)
```json
{
  "styleGuide": {
    "labels": {
      "language": {
        "korean": "Korean",
        "english": "English"
      }
    }
  }
}
```

### ko.json (styleGuide.labels에 추가)
```json
{
  "styleGuide": {
    "labels": {
      "language": {
        "korean": "한국어",
        "english": "영어"
      }
    }
  }
}
```
