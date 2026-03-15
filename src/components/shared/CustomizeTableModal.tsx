"use client";

import { useState } from "react";
import { X, Search, GripVertical } from "lucide-react";
import { formatHeader } from "@/lib/table-config";

export interface CustomizeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleHeaders: string[];
  hiddenHeaders: string[];
  tempHiddenColumns: string[];
  tempColumnOrder: string[];
  setTempHiddenColumns: (cols: string[]) => void;
  setTempColumnOrder: (order: string[]) => void;
  onApply: () => void;
  onReset: () => void;
  getAllHeaders: () => string[];
}

export function CustomizeTableModal({
  isOpen,
  onClose,
  visibleHeaders,
  hiddenHeaders,
  tempHiddenColumns,
  tempColumnOrder,
  setTempHiddenColumns,
  setTempColumnOrder,
  onApply,
  onReset,
  getAllHeaders,
}: CustomizeTableModalProps) {
  const [search, setSearch] = useState("");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const searchLower = search.toLowerCase().trim();
  const visibleFiltered = visibleHeaders.filter((h) =>
    formatHeader(h).toLowerCase().includes(searchLower)
  );
  const hiddenFiltered = hiddenHeaders.filter((h) =>
    formatHeader(h).toLowerCase().includes(searchLower)
  );

  const toggleColumn = (header: string, currentlyHidden: boolean) => {
    if (currentlyHidden) {
      setTempHiddenColumns(tempHiddenColumns.filter((h) => h !== header));
    } else {
      setTempHiddenColumns([...tempHiddenColumns, header]);
    }
  };

  const handleDeselectAll = () => {
    const visible = tempColumnOrder.filter((h) => !tempHiddenColumns.includes(h));
    setTempHiddenColumns([...new Set([...tempHiddenColumns, ...visibleFiltered])]);
  };

  const handleSelectAll = () => {
    setTempHiddenColumns(
      tempHiddenColumns.filter((h) => !hiddenFiltered.includes(h))
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    const draggedCol = visibleFiltered[draggedIdx];
    const targetCol = visibleFiltered[index];
    if (!draggedCol || !targetCol) return;
    const newOrder = [...tempColumnOrder];
    const fromI = newOrder.indexOf(draggedCol);
    const toI = newOrder.indexOf(targetCol);
    newOrder.splice(fromI, 1);
    newOrder.splice(toI, 0, draggedCol);
    setTempColumnOrder(newOrder);
    setDraggedIdx(index);
  };

  const handleDragEnd = () => setDraggedIdx(null);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[80]">
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex justify-between items-center border-b shrink-0">
          <h3 className="text-lg font-bold text-gray-800">Customize columns</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 border-b">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Visible
              </span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Deselect All
              </button>
            </div>
            <ul className="space-y-1 border border-gray-200 rounded-lg p-2 min-h-[120px] bg-gray-50/50">
              {visibleFiltered.map((header, index) => (
                <li
                  key={header}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-100 cursor-move hover:border-blue-200 ${draggedIdx === index ? "opacity-50" : ""}`}
                >
                  <GripVertical size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-800 truncate flex-1">
                    {formatHeader(header)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleColumn(header, false)}
                    className="text-xs text-gray-500 hover:text-red-600 shrink-0"
                  >
                    Hide
                  </button>
                </li>
              ))}
              {visibleFiltered.length === 0 && (
                <li className="text-sm text-gray-400 py-4 text-center">
                  No visible columns
                </li>
              )}
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Hidden
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Select All
              </button>
            </div>
            <ul className="space-y-1 border border-gray-200 rounded-lg p-2 min-h-[120px] bg-gray-50/50">
              {hiddenFiltered.map((header) => (
                <li
                  key={header}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-100 hover:border-blue-200"
                >
                  <span className="text-sm text-gray-600 truncate">
                    {formatHeader(header)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleColumn(header, true)}
                    className="ml-auto text-xs text-blue-600 hover:text-blue-700"
                  >
                    Show
                  </button>
                </li>
              ))}
              {hiddenFiltered.length === 0 && (
                <li className="text-sm text-gray-400 py-4 text-center">
                  No hidden columns
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-white"
          >
            Reset
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApply();
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
