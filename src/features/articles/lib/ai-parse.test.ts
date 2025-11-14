import { describe, it, expect } from 'vitest';
import { parseStreamingTextToJson, parseGeneratedText } from './ai-parse';

describe('parseStreamingTextToJson', () => {
  it('parses complete JSON code block', () => {
    const input = [
      '```json',
      '{',
      '  "title": "테스트 제목",',
      '  "content": "본문입니다.\n## 소제목\n내용",',
      '  "metaDescription": "메타 설명입니다.",',
      '  "keywords": ["nextjs", "react"],',
      '  "headings": ["소제목"]',
      '}',
      '```',
    ].join('\n');

    const json = parseStreamingTextToJson(input);
    expect(json.title).toBe('테스트 제목');
    expect(json.metaDescription).toBe('메타 설명입니다.');
    expect(json.keywords).toEqual(['nextjs', 'react']);
    // 스트리밍 파서는 완전하지 않은 JSON도 허용 -> 내용 일부 추출만 보장
    expect(json.content?.includes('본문입니다.')).toBe(true);
  });

  it('does not throw for incomplete JSON block', () => {
    const input = [
      '```json',
      '{',
      '  "title": "부분 제목",',
      '  "keywords": ["a", "b",',
      // no closing ] or }
    ].join('\n');

    const fn = () => parseStreamingTextToJson(input);
    expect(fn).not.toThrow();
    const json = fn();
    expect(json.title).toBe('부분 제목');
    // Should extract at least the tokens present
    expect(json.keywords && json.keywords.length).toBeGreaterThanOrEqual(2);
  });

  it('parses key:value text sections', () => {
    const input = [
      'title: 키:값 제목',
      'content: ## 소개',
      '설명 텍스트',
      'keywords:',
      '- alpha',
      '- beta',
    ].join('\n');

    const json = parseStreamingTextToJson(input);
    expect(json.title).toBe('키:값 제목');
    expect(json.keywords).toEqual(['alpha', 'beta']);
    expect(json.content?.includes('## 소개')).toBe(true);
  });

  it('falls back to markdown heading as title', () => {
    const input = [
      '# 대제목',
      '',
      '본문 일부 텍스트',
    ].join('\n');

    const json = parseStreamingTextToJson(input);
    expect(json.title).toBe('대제목');
    expect((json.content || '').length).toBeGreaterThan(0);
  });
});

describe('parseGeneratedText', () => {
  it('parses fenced JSON when complete', () => {
    const input = '```json\n{"title":"완전제목","content":"본문"}\n```';
    const out = parseGeneratedText(input);
    expect(out.title).toBe('완전제목');
    expect(out.content).toBe('본문');
  });
});
