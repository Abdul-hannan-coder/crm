"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Pipeline, PipelineStage } from "@/types";
import type { Candidate } from "@/types";
import type { Contact } from "@/types";

export interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelines: Pipeline[];
  candidates: Candidate[];
  contacts: Contact[];
  selectedPipelineId: string | null;
  onSave: (data: {
    opp_name: string;
    pipeline_id: string;
    stage_id: string;
    contact_id?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    status?: string;
    value?: number;
    owner?: string;
  }) => Promise<void>;
}

export function AddOpportunityModal({
  isOpen,
  onClose,
  pipelines,
  candidates,
  contacts,
  selectedPipelineId,
  onSave,
}: AddOpportunityModalProps) {
  const [oppName, setOppName] = useState("");
  const [pipelineId, setPipelineId] = useState("");
  const [stageId, setStageId] = useState("");
  const [contactId, setContactId] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Open");
  const [value, setValue] = useState("");
  const [owner, setOwner] = useState("Unassigned");
  const [saving, setSaving] = useState(false);

  const selectedPipeline = pipelines.find((p) => p.id === pipelineId);
  const stages: PipelineStage[] = (selectedPipeline?.stages as PipelineStage[]) ?? [];

  useEffect(() => {
    if (isOpen) {
      setPipelineId(selectedPipelineId ?? pipelines[0]?.id ?? "");
      setStageId("");
      setOppName("");
      setContactId("");
      setContactName("");
      setEmail("");
      setPhone("");
      setStatus("Open");
      setValue("");
      setOwner("Unassigned");
    }
  }, [isOpen, selectedPipelineId, pipelines]);

  useEffect(() => {
    if (pipelineId && !stages.some((s) => String(s.id) === stageId)) {
      setStageId(stages[0] ? String(stages[0].id) : "");
    }
  }, [pipelineId, stages, stageId]);

  const contactOptions = [
    ...candidates.map((c) => ({ id: c.id, name: c.name ?? "—", email: c.email, phone: c.phone })),
    ...contacts.map((c) => ({ id: c.id, name: c.name ?? "—", email: c.email, phone: c.phone })),
  ];

  const handleContactSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setContactId(id);
    const c = contactOptions.find((x) => x.id === id);
    if (c) {
      setContactName(c.name);
      setEmail(c.email ?? "");
      setPhone(c.phone ?? "");
    } else {
      setContactName("");
      setEmail("");
      setPhone("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppName.trim() || !pipelineId || !stageId) return;
    setSaving(true);
    try {
      await onSave({
        opp_name: oppName.trim(),
        pipeline_id: pipelineId,
        stage_id: stageId,
        contact_id: contactId || undefined,
        contact_name: contactName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        status,
        value: value ? Number(value) : undefined,
        owner,
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
          <h3 className="text-lg font-bold text-gray-800">Add Opportunity</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Name *</label>
            <input
              type="text"
              value={oppName}
              onChange={(e) => setOppName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g. Senior Developer Role"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline *</label>
            <select
              value={pipelineId}
              onChange={(e) => setPipelineId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
              required
            >
              <option value="">Select pipeline</option>
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
              required
            >
              <option value="">Select stage</option>
              {stages.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact / Candidate</label>
            <select
              value={contactId}
              onChange={handleContactSelect}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
            >
              <option value="">— None —</option>
              {contactOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
              >
                <option value="Open">Open</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
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
