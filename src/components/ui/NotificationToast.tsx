"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface NotificationToastProps {
  message: string | null;
  type: "success" | "error" | "info";
}

export function NotificationToast({ message, type }: NotificationToastProps) {
  if (!message) return null;

  const isError = type === "error";
  return (
    <div className="fixed top-4 right-4 z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
          isError
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}
      >
        {isError ? (
          <AlertCircle size={20} className="shrink-0" />
        ) : (
          <CheckCircle2 size={20} className="shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
