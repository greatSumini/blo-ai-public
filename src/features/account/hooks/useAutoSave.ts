"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "react-use";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  onSave: (data: T) => Promise<unknown>;
  debounceMs?: number;
}

export function useAutoSave<T>({ onSave, debounceMs = 2000 }: UseAutoSaveOptions<T>) {
  const [pendingData, setPendingData] = useState<T | null>(null);
  const [debouncedData, setDebouncedData] = useState<T | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Debounce pending data
  useDebounce(
    () => {
      if (pendingData !== null) {
        setDebouncedData(pendingData);
      }
    },
    debounceMs,
    [pendingData]
  );

  // Save when debounced data changes
  useEffect(() => {
    if (debouncedData === null) return;

    const save = async () => {
      setSaveStatus("saving");
      try {
        await onSave(debouncedData);
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Auto save failed", error);
        setSaveStatus("error");
      }
    };

    void save();
  }, [debouncedData, onSave]);

  const save = useCallback((data: T) => {
    setPendingData(data);
  }, []);

  return {
    save,
    saveStatus,
  };
}
