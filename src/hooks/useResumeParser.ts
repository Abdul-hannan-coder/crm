"use client";

import { useState, useCallback } from "react";
import { uploadResume } from "@/lib/api/resumes";
import { createCandidate } from "@/lib/api/candidates";

export function useResumeParser(onSuccess?: () => void, onError?: (msg: string) => void) {
  const [isParsing, setIsParsing] = useState(false);

  const parseAndCreate = useCallback(
    async (file: File, parsedData: Record<string, unknown>) => {
      setIsParsing(true);
      try {
        const { url } = await uploadResume(file);
        await createCandidate({ ...parsedData, resume: url });
        onSuccess?.();
      } catch (e) {
        onError?.(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setIsParsing(false);
      }
    },
    [onSuccess, onError]
  );

  return { isParsing, parseAndCreate };
}
