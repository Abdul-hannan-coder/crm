"use client";

import { X, Plus, Trash2 } from "lucide-react";
import type { FilterRule } from "@/reducers/tableReducer";
import { formatHeader } from "@/lib/table-config";

const OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "is", label: "Is" },
  { value: "is after", label: "Is after" },
  { value: "contains at least ...", label: "Contains at least ..." },
];

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: FilterRule[];
  updateFilter: (id: number, field: keyof FilterRule, value: string) => void;
  addFilterRow: () => void;
  removeFilterRow: (id: number) => void;
  getAllHeaders: () => string[];
}

export function FilterModal({
  isOpen,
  onClose,
  activeFilters,
  updateFilter,
  addFilterRow,
  removeFilterRow,
  getAllHeaders,
}: FilterModalProps) {
  if (!isOpen) return null;

  const renderFilterInput = (filter: FilterRule) => {
    if (filter.operator === "is after") {
      return (
        <input
          type="date"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
        />
      );
    }
    if (filter.operator === "contains at least ...") {
      return (
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }
    if (
      filter.operator === "is" &&
      (filter.column === "resume" || filter.column === "currentlyWorking")
    ) {
      return (
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
        >
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }
    return (
      <input
        type="text"
        placeholder="Enter here"
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        value={filter.value}
        onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
      />
    );
  };

  const headers = getAllHeaders();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[80]">
      <div className="bg-white rounded-xl shadow-2xl w-[640px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex justify-between items-center border-b shrink-0">
          <h3 className="text-lg font-bold text-gray-800">Filter</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {activeFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <select
                  className="w-[180px] border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white shrink-0"
                  value={filter.column}
                  onChange={(e) =>
                    updateFilter(filter.id, "column", e.target.value)
                  }
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {formatHeader(h)}
                    </option>
                  ))}
                </select>
                <select
                  className="w-[160px] border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white shrink-0"
                  value={filter.operator}
                  onChange={(e) =>
                    updateFilter(filter.id, "operator", e.target.value)
                  }
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
                <div className="flex-1 min-w-0">{renderFilterInput(filter)}</div>
                <button
                  type="button"
                  onClick={() => removeFilterRow(filter.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFilterRow}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <Plus size={16} /> Add filter row
          </button>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
