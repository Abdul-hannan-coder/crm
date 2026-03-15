"use client";

import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { useAutomations } from "@/hooks/useAutomations";
import { usePipelines } from "@/hooks/usePipelines";
import type { Automation } from "@/types";

interface AutomationsTabProps {
  showNotification: (msg: string, type?: "success" | "error") => void;
}

export function AutomationsTab({ showNotification }: AutomationsTabProps) {
  const { automations, loading, refetch, createAutomation, updateAutomation, deleteAutomation } =
    useAutomations();
  const { pipelines } = usePipelines();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", pipeline_id: "", stage_id: "", conditions: "" });

  const openAdd = useCallback(() => {
    setForm({ name: "", pipeline_id: "", stage_id: "", conditions: "" });
    setEditingId(null);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((a: Automation) => {
    const raw = a as Record<string, unknown>;
    setForm({
      name: a.name ?? "",
      pipeline_id: String(raw.pipeline_id ?? ""),
      stage_id: String(raw.stage_id ?? ""),
      conditions:
        typeof raw.conditions === "string"
          ? raw.conditions
          : JSON.stringify(raw.conditions ?? {}, null, 2),
    });
    setEditingId(a.id);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingId(null);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const payload: Record<string, unknown> = {
        name: form.name || undefined,
        pipeline_id: form.pipeline_id || undefined,
        stage_id: form.stage_id || undefined,
      };
      if (form.conditions.trim()) {
        try {
          payload.conditions = JSON.parse(form.conditions);
        } catch {
          payload.conditions = form.conditions;
        }
      }
      if (editingId) {
        await updateAutomation(editingId, payload as Partial<Automation>);
        showNotification("Automation updated.", "success");
      } else {
        await createAutomation(payload as Partial<Automation>);
        showNotification("Automation created.", "success");
      }
      refetch();
      closeModal();
    } catch (e) {
      showNotification(e instanceof Error ? e.message : "Failed to save", "error");
    }
  }, [form, editingId, updateAutomation, createAutomation, refetch, closeModal, showNotification]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteAutomation(id);
        showNotification("Automation deleted.", "success");
        refetch();
      } catch (e) {
        showNotification(e instanceof Error ? e.message : "Failed to delete", "error");
      }
    },
    [deleteAutomation, refetch, showNotification]
  );

  const handleToggle = useCallback(
    async (a: Automation) => {
      try {
        await updateAutomation(a.id, { is_active: !a.is_active });
        showNotification(a.is_active ? "Automation disabled." : "Automation enabled.", "success");
        refetch();
      } catch (e) {
        showNotification(e instanceof Error ? e.message : "Failed to update", "error");
      }
    },
    [updateAutomation, refetch, showNotification]
  );

  const pipelineOptions = pipelines ?? [];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Automations</h1>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add automation
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 truncate">{a.name ?? "Unnamed"}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(a)}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-100"
                    title={a.is_active ? "Disable" : "Enable"}
                  >
                    {a.is_active ? (
                      <Power className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <PowerOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${a.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                />
                <span className="text-xs text-gray-500">
                  {a.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {automations.length === 0 && !loading && (
        <p className="text-gray-500 text-sm">No automations yet. Add one to get started.</p>
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "Edit automation" : "Add automation"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. Notify on new opportunity"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Pipeline</label>
                <select
                  value={form.pipeline_id}
                  onChange={(e) => setForm((f) => ({ ...f, pipeline_id: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {pipelineOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ?? p.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Stage ID</label>
                <input
                  type="text"
                  value={form.stage_id}
                  onChange={(e) => setForm((f) => ({ ...f, stage_id: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Conditions (JSON)</label>
                <textarea
                  value={form.conditions}
                  onChange={(e) => setForm((f) => ({ ...f, conditions: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-xs min-h-[80px]"
                  placeholder='{"status": "won"}'
                />
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
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
