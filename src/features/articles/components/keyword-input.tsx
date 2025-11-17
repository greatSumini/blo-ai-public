"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useDebounce } from "react-use";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useKeywordList } from "@/features/keywords/hooks/useKeywordQuery";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface KeywordInputProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function KeywordInput({
  value,
  onChange,
  placeholder,
  disabled = false,
}: KeywordInputProps) {
  const t = useTranslations("keywords");
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const actualPlaceholder = placeholder || t("picker.searchPlaceholder");

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery);
    },
    300,
    [searchQuery]
  );

  const { data, isLoading } = useKeywordList(debouncedQuery, 1, 20);

  // 키워드 추가 함수
  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
      setSearchQuery("");
      setOpen(false);
    }
  };

  // 키워드 제거 함수
  const removeKeyword = (keyword: string) => {
    onChange(value.filter((k) => k !== keyword));
  };

  // 키워드 토글 함수 (Dropdown에서 선택 시)
  const toggleKeyword = (keyword: string) => {
    if (value.includes(keyword)) {
      removeKeyword(keyword);
    } else {
      addKeyword(keyword);
    }
  };

  // Input Enter 키 핸들러
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isComposing) return; // IME 조합 중이면 Enter 무시
      e.preventDefault();
      if (inputValue.trim()) {
        addKeyword(inputValue);
      }
    } else if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      // Dropdown의 Command Input으로 포커스 이동
      commandInputRef.current?.focus();
    }
  };

  // Input 포커스 시 Dropdown 열기
  const handleInputFocus = () => {
    setOpen(true);
  };

  // Input 값 변경 시 검색어도 업데이트
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchQuery(newValue);
  };

  return (
    <div className="space-y-2">
      {/* Selected Keywords as Badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="gap-1">
              {keyword}
              <IconButton
                type="button"
                onClick={() => removeKeyword(keyword)}
                disabled={disabled}
                size="sm"
                variant="ghost"
                className="ml-1 h-4 w-4 hover:text-red-500"
                aria-label={t("picker.removeKeyword", { keyword })}
              >
                <X className="h-3 w-3" />
              </IconButton>
            </Badge>
          ))}
        </div>
      )}

      {/* Keyword Input with Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={handleInputKeyDown}
              onFocus={handleInputFocus}
              placeholder={actualPlaceholder}
              disabled={disabled}
              className="w-full"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            // Popover가 열릴 때 Input에 포커스 유지
            inputRef.current?.focus();
          }}
        >
          <Command>
            <CommandInput
              ref={commandInputRef}
              placeholder={t("picker.searchInputPlaceholder")}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>{t("picker.searching")}</CommandEmpty>
              ) : !data || data.items.length === 0 ? (
                <CommandEmpty>{t("picker.noResults")}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {data.items.map((keyword) => (
                    <CommandItem
                      key={keyword.id}
                      value={keyword.phrase}
                      onSelect={() => {
                        toggleKeyword(keyword.phrase);
                        // 선택 후 Input으로 포커스 복귀
                        inputRef.current?.focus();
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(keyword.phrase)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <p>{keyword.phrase}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
