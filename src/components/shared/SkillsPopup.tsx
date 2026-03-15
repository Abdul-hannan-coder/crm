"use client";

import { useEffect, useRef } from "react";

interface SkillsPopupProps {
  skills: string;
  anchor: { x: number; y: number } | null;
  onClose: () => void;
}

export function SkillsPopup({ skills, anchor, onClose }: SkillsPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!anchor || !skills.trim()) return null;

  const list = skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div
      ref={ref}
      className="fixed z-[100] bg-white rounded-lg shadow-lg border border-gray-200 py-2 px-3 max-w-xs"
      style={{ left: anchor.x, top: anchor.y }}
    >
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        Skills
      </div>
      <div className="flex flex-wrap gap-1">
        {list.map((s, i) => (
          <span
            key={i}
            className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
