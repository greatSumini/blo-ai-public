import type { Block, BlockNoteEditor } from "@blocknote/core";

/**
 * 마크다운 문자열을 BlockNote 블록 배열로 변환
 */
export async function markdownToBlocks(
  editor: BlockNoteEditor,
  markdown: string
): Promise<Block[]> {
  try {
    if (!markdown || markdown.trim() === "") {
      return [];
    }

    const blocks = await editor.tryParseMarkdownToBlocks(markdown);
    return blocks;
  } catch (error) {
    console.error("Failed to parse markdown to blocks:", error);
    // 폴백: 빈 paragraph 블록 반환
    return [
      {
        type: "paragraph",
        content: [{ type: "text", text: markdown, styles: {} }],
      } as Block,
    ];
  }
}

/**
 * BlockNote 블록 배열을 마크다운 문자열로 변환
 */
export async function blocksToMarkdown(
  editor: BlockNoteEditor,
  blocks: Block[]
): Promise<string> {
  try {
    if (!blocks || blocks.length === 0) {
      return "";
    }

    const markdown = await editor.blocksToMarkdownLossy(blocks);
    return markdown;
  } catch (error) {
    console.error("Failed to convert blocks to markdown:", error);
    // 폴백: 빈 문자열 반환
    return "";
  }
}

/**
 * 마크다운에서 헤딩을 추출하여 TOC 생성
 */
export function extractHeadings(markdown: string): {
  level: number;
  text: string;
  id: string;
}[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    // # 으로 시작하는 헤딩 라인 찾기
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      // ID는 텍스트를 kebab-case로 변환
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-");

      headings.push({ level, text, id });
    }
  }

  return headings;
}
