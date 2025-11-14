import { describe, it, expect } from 'vitest';
import {
  CreateKeywordSchema,
  ListKeywordsSchema,
  BulkCreateKeywordsSchema,
  KeywordSuggestionsSchema,
} from './schema';

describe('CreateKeywordSchema', () => {
  it('should accept valid phrase', () => {
    const result = CreateKeywordSchema.safeParse({ phrase: 'React' });
    expect(result.success).toBe(true);
  });

  it('should reject empty phrase', () => {
    const result = CreateKeywordSchema.safeParse({ phrase: '' });
    expect(result.success).toBe(false);
  });

  it('should reject too long phrase', () => {
    const result = CreateKeywordSchema.safeParse({ phrase: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe('ListKeywordsSchema', () => {
  it('should apply defaults', () => {
    const result = ListKeywordsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('should coerce page and limit to numbers', () => {
    const result = ListKeywordsSchema.safeParse({ page: '2', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it('should reject invalid page', () => {
    const result = ListKeywordsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit over 100', () => {
    const result = ListKeywordsSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});

describe('BulkCreateKeywordsSchema', () => {
  it('should accept valid phrases array', () => {
    const result = BulkCreateKeywordsSchema.safeParse({
      phrases: ['React', 'Vue', 'Angular'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty array', () => {
    const result = BulkCreateKeywordsSchema.safeParse({ phrases: [] });
    expect(result.success).toBe(false);
  });

  it('should reject over 50 phrases', () => {
    const result = BulkCreateKeywordsSchema.safeParse({
      phrases: Array(51).fill('keyword'),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid phrase in array', () => {
    const result = BulkCreateKeywordsSchema.safeParse({
      phrases: ['valid', ''],
    });
    expect(result.success).toBe(false);
  });
});

describe('KeywordSuggestionsSchema', () => {
  it('should accept valid keyword without context', () => {
    const result = KeywordSuggestionsSchema.safeParse({ keyword: 'React' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.keyword).toBe('React');
      expect(result.data.context).toBeUndefined();
    }
  });

  it('should accept keyword with context', () => {
    const result = KeywordSuggestionsSchema.safeParse({
      keyword: 'React',
      context: '프론트엔드 개발자 대상 블로그 글',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.keyword).toBe('React');
      expect(result.data.context).toBe(
        '프론트엔드 개발자 대상 블로그 글',
      );
    }
  });

  it('should reject empty keyword', () => {
    const result = KeywordSuggestionsSchema.safeParse({ keyword: '' });
    expect(result.success).toBe(false);
  });

  it('should reject too long keyword', () => {
    const result = KeywordSuggestionsSchema.safeParse({
      keyword: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('should reject too long context', () => {
    const result = KeywordSuggestionsSchema.safeParse({
      keyword: 'React',
      context: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
