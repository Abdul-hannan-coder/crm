"use client";

import { X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmValue: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Yes, Delete",
  confirmValue,
  inputValue,
  onInputChange,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;
  const canConfirm = inputValue === confirmValue;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100]">
      <div className="bg-white rounded-xl shadow-2xl w-[500px] max-w-full overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">{message}</p>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Type &quot;DELETE&quot; to confirm
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter DELETE"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
          />
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-white"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded font-medium text-white transition-colors ${
              canConfirm
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
