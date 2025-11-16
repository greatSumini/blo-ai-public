"use client";

import { useState } from "react";
import { useDebounce } from "react-use";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface KeywordPickerProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function KeywordPicker({
  value,
  onChange,
  placeholder,
  disabled = false,
}: KeywordPickerProps) {
  const t = useTranslations("keywords");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const actualPlaceholder = placeholder || t("picker.searchPlaceholder");

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery);
    },
    300,
    [searchQuery]
  );

  const { data, isLoading } = useKeywordList(debouncedQuery, 1, 20);

  const handleSelect = (keyword: string) => {
    if (value.includes(keyword)) {
      onChange(value.filter((k) => k !== keyword));
    } else {
      onChange([...value, keyword]);
    }
  };

  const handleRemove = (keyword: string) => {
    onChange(value.filter((k) => k !== keyword));
  };

  return (
    <div className="space-y-2">
      {/* Selected Keywords as Badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="gap-1">
              {keyword}
              <button
                type="button"
                onClick={() => handleRemove(keyword)}
                disabled={disabled}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Keyword Picker Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {actualPlaceholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
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
                        handleSelect(keyword.phrase);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(keyword.phrase) ? "opacity-100" : "opacity-0"
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
