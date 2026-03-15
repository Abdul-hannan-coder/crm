"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface ResumeParserTabProps {
  onOpenParser: () => void;
}

export function ResumeParserTab({ onOpenParser }: ResumeParserTabProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-4 max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Sparkles size={32} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">AI Resume Parser</h2>
        <p className="text-gray-400 text-sm text-center">
          Upload resumes and let AI extract candidate details automatically.
        </p>
        <button
          onClick={onOpenParser}
          className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm text-sm"
        >
          <Sparkles size={16} className="text-amber-400" /> Open AI Parser
        </button>
      </div>
    </div>
  );
}
