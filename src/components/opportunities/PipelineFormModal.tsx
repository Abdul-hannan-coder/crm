"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { Pipeline, PipelineStage } from "@/types";

export interface PipelineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPipeline: Pipeline | null;
  onSave: (data: { name: string; stages: PipelineStage[] }) => Promise<void>;
}

const defaultStages: PipelineStage[] = [
  { id: "1", name: "New Lead", funnel: true, dist: true },
  { id: "2", name: "Contacted", funnel: true, dist: true },
  { id: "3", name: "Proposal Sent", funnel: true, dist: true },
  { id: "4", name: "Closed", funnel: true, dist: true },
];

export function PipelineFormModal({
  isOpen,
  onClose,
  editingPipeline,
  onSave,
}: PipelineFormModalProps) {
  const [name, setName] = useState("");
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [nameError, setNameError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingPipeline) {
        setName(editingPipeline.name ?? "");
        setStages(
          (editingPipeline.stages as PipelineStage[])?.length
            ? (editingPipeline.stages as PipelineStage[]).map((s) => ({
                ...s,
                id: String(s.id),
                name: s.name ?? "",
              }))
            : defaultStages
        );
      } else {
        setName("");
        setStages(
          defaultStages.map((s, i) => ({
            ...s,
            id: String(Date.now() + i),
          }))
        );
      }
      setNameError(false);
    }
  }, [isOpen, editingPipeline]);

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: "",
        funnel: true,
        dist: true,
      },
    ]);
  };

  const updateStage = (id: string, field: keyof PipelineStage, value: string | boolean) => {
    setStages((prev) =>
      prev.map((s) => (String(s.id) === id ? { ...s, [field]: value } : s))
    );
  };

  const removeStage = (id: string) => {
    setStages((prev) => prev.filter((s) => String(s.id) !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        stages: stages.filter((s) => s.name?.trim()),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[80]">
      <div className="bg-white rounded-xl shadow-2xl w-[520px] max-w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {editingPipeline ? "Edit Pipeline" : "Create Pipeline"}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pipeline Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(false);
              }}
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${nameError ? "border-red-500" : "border-gray-300"}`}
              placeholder="e.g. Recruitment"
            />
            {nameError && (
              <p className="text-red-500 text-sm mt-1">Name is required</p>
            )}
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Stages</label>
              <button
                type="button"
                onClick={addStage}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Add Stage
              </button>
            </div>
            <div className="space-y-2">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg"
                >
                  <input
                    type="text"
                    value={stage.name ?? ""}
                    onChange={(e) =>
                      updateStage(String(stage.id), "name", e.target.value)
                    }
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
                    placeholder="Stage name"
                  />
                  <button
                    type="button"
                    onClick={() => removeStage(String(stage.id))}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
