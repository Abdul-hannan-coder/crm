"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useCustomFields } from "@/hooks/useCustomFields";
import { getAllHeaders, formatHeader } from "@/lib/table-config";
import type { TableModule } from "@/lib/table-config";
import type { CustomField } from "@/types";

const MODULES: { id: TableModule | "tasks"; label: string }[] = [
  { id: "candidates", label: "Candidates" },
  { id: "contacts", label: "Contacts" },
  { id: "companies", label: "Companies" },
  { id: "tasks", label: "Tasks" },
];

const TASK_BASE_HEADERS = [
  "title",
  "due_date",
  "status",
  "priority",
  "task_type",
  "related_to",
  "reminder",
  "owner",
  "created_at",
];

function getBaseHeaders(module: TableModule | "tasks"): string[] {
  if (module === "tasks") return TASK_BASE_HEADERS;
  return getAllHeaders(module);
}

export function CustomFieldsTab() {
  const { customFields, loading, refetch, createCustomField } = useCustomFields();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["candidates"]));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fieldName: "", fieldType: "text", module: "candidates" as TableModule | "tasks" });

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openAdd = useCallback(() => {
    setForm({ fieldName: "", fieldType: "text", module: "candidates" });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => setShowModal(false), []);

  const handleSave = useCallback(async () => {
    if (!form.fieldName.trim()) return;
    try {
      await createCustomField({
        fieldName: form.fieldName.trim(),
        fieldType: form.fieldType,
        module: form.module,
      });
      refetch();
      closeModal();
    } catch (e) {
      console.error(e);
    }
  }, [form, createCustomField, refetch, closeModal]);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Custom Fields</h1>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Custom Field
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-2">
          {MODULES.map((mod) => {
            const isOpen = expanded.has(mod.id);
            const baseHeaders = getBaseHeaders(mod.id);
            const fieldsForModule = customFields.filter(
              (f) => (f.module ?? "").toLowerCase() === mod.id
            );
            return (
              <div
                key={mod.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(mod.id)}
                  className="w-full flex items-center gap-2 p-4 text-left font-semibold text-gray-900 hover:bg-gray-50"
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  {mod.label}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Base fields &amp; custom fields
                    </div>
                    <ul className="space-y-1">
                      {baseHeaders.map((h) => (
                        <li
                          key={h}
                          className="flex items-center gap-2 py-1.5 text-sm text-gray-700"
                        >
                          <span className="font-medium">{formatHeader(h)}</span>
                          <span className="text-gray-400 text-xs">({h})</span>
                        </li>
                      ))}
                      {fieldsForModule.map((f) => (
                        <li
                          key={f.id}
                          className="flex items-center gap-2 py-1.5 text-sm text-gray-700"
                        >
                          <span className="font-medium">{f.fieldName ?? f.id}</span>
                          <span className="text-gray-400 text-xs">
                            {f.fieldType ?? "text"} · custom
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Custom Field</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Field name</label>
                <input
                  type="text"
                  value={form.fieldName}
                  onChange={(e) => setForm((f) => ({ ...f, fieldName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. LinkedIn URL"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select
                  value={form.fieldType}
                  onChange={(e) => setForm((f) => ({ ...f, fieldType: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Module</label>
                <select
                  value={form.module}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, module: e.target.value as TableModule | "tasks" }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {MODULES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.fieldName.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
