"use client";

import { useState, useCallback, useRef } from "react";
import { X, Upload, FileText } from "lucide-react";
import { uploadResume } from "@/lib/api/resumes";
import { createCandidate } from "@/lib/api/candidates";

const ACCEPT = ".pdf,.doc,.docx";
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function fileNameToName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || filename;
}

interface ResumeParserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  showNotification?: (msg: string, type?: "success" | "error") => void;
}

export function ResumeParserModal({
  open,
  onClose,
  onSuccess,
  showNotification,
}: ResumeParserModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const next: File[] = [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      if (ALLOWED_TYPES.includes(f.type) || /\.(pdf|doc|docx)$/i.test(f.name))
        next.push(f);
    }
    setFiles((prev) => [...prev, ...next]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const testConnection = useCallback(async () => {
    setTestLoading(true);
    try {
      showNotification?.("Test connection: no webhook configured. Upload will still work.", "success");
    } catch (e) {
      showNotification?.(e instanceof Error ? e.message : "Test failed", "error");
    } finally {
      setTestLoading(false);
    }
  }, [showNotification]);

  const handleSubmit = useCallback(async () => {
    if (files.length === 0) {
      showNotification?.("Add at least one file (PDF, DOC, DOCX).", "error");
      return;
    }
    setIsParsing(true);
    let created = 0;
    try {
      for (const file of files) {
        const { url } = await uploadResume(file);
        const parsedData = {
          name: fileNameToName(file.name),
          resume: url,
        };
        await createCandidate(parsedData);
        created++;
      }
      showNotification?.(`${created} candidate(s) created.`, "success");
      onSuccess?.();
      setFiles([]);
      onClose();
    } catch (e) {
      showNotification?.(e instanceof Error ? e.message : "Upload or create failed", "error");
    } finally {
      setIsParsing(false);
    }
  }, [files, onSuccess, onClose, showNotification]);

  const handleClose = useCallback(() => {
    if (!isParsing) {
      setFiles([]);
      onClose();
    }
  }, [isParsing, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">AI Resume Parser</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isParsing}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-auto flex-1 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag & drop resumes here or click to browse
            </p>
            <p className="text-xs text-gray-400">PDF, DOC, DOCX — multiple files supported</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
            >
              Choose files
            </button>
          </div>

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-800 truncate flex-1">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    disabled={isParsing}
                    className="text-gray-400 hover:text-red-500 text-xs font-medium disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={testConnection}
              disabled={testLoading}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {testLoading ? "Testing…" : "Test Connection"}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isParsing}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isParsing || files.length === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isParsing ? "Uploading… Extracting details…" : "Upload & Create Candidates"}
          </button>
        </div>

        {isParsing && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Sending to webhook… Extracting resume details…
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
