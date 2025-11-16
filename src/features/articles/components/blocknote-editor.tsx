"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useEffect, useState } from "react";

interface BlockNoteEditorProps {
  value: string; // 마크다운 문자열
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
}

// 마크다운 정제 함수: ordered list의 start 속성 문제 해결
function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return "";

  // ordered list를 unordered list로 변환하여 start 속성 문제 회피
  // 예: "1. item" -> "- item"
  const sanitized = markdown.replace(/^\d+\.\s/gm, "- ");

  return sanitized;
}

export function BlockNoteEditor({
  value,
  onChange,
  height = "500px",
  placeholder = "Type '/' for commands...",
}: BlockNoteEditorProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // 에디터 인스턴스를 useMemo로 메모이제이션
  const editor = useCreateBlockNote({
    placeholders: {
      default: placeholder,
    },
  });

  // 초기 마크다운 값을 BlockNote 블록으로 변환
  useEffect(() => {
    if (!editor || isInitialized) return;

    const loadMarkdown = async () => {
      try {
        // value가 비어있으면 기본 빈 블록으로 시작
        if (!value || value.trim() === "") {
          setIsInitialized(true);
          return;
        }

        // 마크다운 정제
        const sanitized = sanitizeMarkdown(value);
        console.log("Original markdown:", value);
        console.log("Sanitized markdown:", sanitized);

        const blocks = await editor.tryParseMarkdownToBlocks(sanitized);
        editor.replaceBlocks(editor.document, blocks);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to parse markdown:", error);
        console.error("Problematic markdown value:", value);
        // 파싱 실패 시 빈 에디터로 시작
        setIsInitialized(true);
      }
    };

    loadMarkdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]); // editor가 준비되면 실행

  // 에디터 변경 시 마크다운으로 변환하여 전달
  const handleChange = async () => {
    // 초기화가 완료되기 전에는 onChange를 호출하지 않음
    if (!editor || !isInitialized) {
      console.log("Skipping onChange - editor not initialized yet");
      return;
    }

    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      console.log("Editor content changed, new markdown:", markdown);
      onChange(markdown);
    } catch (error) {
      console.error("Failed to convert to markdown:", error);
    }
  };

  return (
    <div className="blocknote-wrapper">
      <BlockNoteView
        editor={editor}
        theme="light"
        onChange={handleChange}
      />
    </div>
  );
}
