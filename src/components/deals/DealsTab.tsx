"use client";

import { useState, useMemo } from "react";
import { Menu, Plus, Search, LayoutGrid, List, Trash2, X } from "lucide-react";
import type { Deal } from "@/types";
import { useDeals } from "@/hooks/useDeals";

const DEAL_STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

interface DealsTabProps {
  showNotification: (msg: string, type?: "success" | "error") => void;
}

const defaultForm = {
  name: "",
  stage: "Lead",
  value: 0,
  company: "",
  job: "",
  candidate_name: "",
  contact: "",
  owner: "",
  close_date: "",
  collaborator: "",
};

export function DealsTab({ showNotification }: DealsTabProps) {
  const { deals, createDeal, updateDeal, deleteDeal, refetch } = useDeals();
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [dealSearch, setDealSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [dealForm, setDealForm] = useState(defaultForm);

  const filteredDeals = useMemo(() => {
    let list = [...deals];
    if (dealSearch.trim()) {
      const q = dealSearch.toLowerCase();
      list = list.filter(
        (d) =>
          (d.name ?? "").toLowerCase().includes(q) ||
          (d.company ?? "").toLowerCase().includes(q) ||
          (d.candidate_name ?? "").toLowerCase().includes(q)
      );
    }
    if (stageFilter) {
      list = list.filter((d) => (d.stage ?? "") === stageFilter);
    }
    return list;
  }, [deals, dealSearch, stageFilter]);

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    DEAL_STAGES.forEach((s) => (map[s] = []));
    filteredDeals.forEach((d) => {
      const stage = d.stage ?? "Lead";
      if (!map[stage]) map[stage] = [];
      map[stage].push(d);
    });
    return map;
  }, [filteredDeals]);

  const handleSave = async () => {
    try {
      if (!dealForm.name.trim()) {
        showNotification("Deal name is required", "error");
        return;
      }
      const payload = {
        ...dealForm,
        value: Number(dealForm.value) || 0,
        close_date: dealForm.close_date || undefined,
        created_at: new Date().toISOString(),
      };
      if (editingDeal?.id) {
        await updateDeal(editingDeal.id, payload);
        showNotification("Deal updated!");
      } else {
        await createDeal(payload);
        showNotification("Deal created!");
      }
      refetch();
      setShowAddModal(false);
      setEditingDeal(null);
      setDealForm(defaultForm);
    } catch (e) {
      showNotification(
        e instanceof Error ? e.message : "Failed",
        "error"
      );
    }
  };

  const openEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setDealForm({
      name: deal.name ?? "",
      stage: deal.stage ?? "Lead",
      value: Number(deal.value) ?? 0,
      company: (deal.company as string) ?? "",
      job: (deal.job as string) ?? "",
      candidate_name: (deal.candidate_name as string) ?? "",
      contact: (deal.contact as string) ?? "",
      owner: (deal.owner as string) ?? "",
      close_date: deal.close_date ? new Date(deal.close_date).toISOString().slice(0, 10) : "",
      collaborator: (deal.collaborator as string) ?? "",
    });
    setShowAddModal(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Menu size={18} className="text-gray-400" />
          <h1 className="text-[15px] font-semibold text-gray-800">Deals</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-md overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm ${viewMode === "list" ? "bg-blue-50 text-blue-600 border-r border-gray-200" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 text-sm ${viewMode === "board" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <button
            onClick={() => {
              setEditingDeal(null);
              setDealForm(defaultForm);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
      <div className="bg-white border-b px-6 py-2 flex items-center gap-4 flex-wrap">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 w-64">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search deals..."
            value={dealSearch}
            onChange={(e) => setDealSearch(e.target.value)}
            className="bg-transparent outline-none ml-2 text-sm w-full"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All stages</option>
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {viewMode === "list" && (
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Name</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Stage</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Value</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Company</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50/80">
                  <td className="p-3 text-sm font-medium text-gray-800">{deal.name ?? "—"}</td>
                  <td className="p-3 text-sm text-gray-600">{deal.stage ?? "—"}</td>
                  <td className="p-3 text-sm text-gray-600">{deal.value ?? 0}</td>
                  <td className="p-3 text-sm text-gray-600">{deal.company ?? "—"}</td>
                  <td className="p-3 text-right flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(deal)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm("Delete this deal?")) {
                          try {
                            await deleteDeal(deal.id);
                            refetch();
                            showNotification("Deal deleted.");
                          } catch {
                            showNotification("Delete failed.", "error");
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "board" && (
        <div className="flex-1 overflow-x-auto p-6 flex gap-4 bg-[#f0f2f5] items-start">
          {DEAL_STAGES.map((stage, idx) => {
            const stageDeals = dealsByStage[stage] ?? [];
            const borderColors = [
              "border-blue-500",
              "border-amber-400",
              "border-purple-500",
              "border-emerald-500",
              "border-rose-500",
              "border-gray-400",
            ];
            return (
              <div
                key={stage}
                className={`bg-white border border-gray-200 rounded-xl shadow-sm w-[260px] flex-shrink-0 flex flex-col border-t-4 ${borderColors[idx % borderColors.length]}`}
              >
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-[13px] uppercase">{stage}</h3>
                  <span className="text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="p-2 space-y-2 min-h-[80px]">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white border border-gray-100 px-3 py-2.5 rounded-lg shadow-sm hover:shadow-md group"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900 text-[13px]">
                          {deal.name ?? "—"}
                        </h4>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(deal)}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm("Delete this deal?")) {
                                try {
                                  await deleteDeal(deal.id);
                                  refetch();
                                  showNotification("Deal deleted.");
                                } catch {
                                  showNotification("Delete failed.", "error");
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {deal.company ?? "—"} · ${deal.value ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[520px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDeal ? "Edit Deal" : "Add Deal"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingDeal(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="Deal name"
                  value={dealForm.name}
                  onChange={(e) => setDealForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stage</label>
                <select
                  value={dealForm.stage}
                  onChange={(e) => setDealForm((f) => ({ ...f, stage: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {DEAL_STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Value</label>
                <input
                  type="number"
                  placeholder="0"
                  value={dealForm.value || ""}
                  onChange={(e) =>
                    setDealForm((f) => ({ ...f, value: Number(e.target.value) || 0 }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={dealForm.company}
                    onChange={(e) => setDealForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Job</label>
                  <input
                    type="text"
                    value={dealForm.job}
                    onChange={(e) => setDealForm((f) => ({ ...f, job: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Candidate / Contact</label>
                <input
                  type="text"
                  value={dealForm.candidate_name}
                  onChange={(e) =>
                    setDealForm((f) => ({ ...f, candidate_name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Candidate or contact name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Owner</label>
                  <input
                    type="text"
                    value={dealForm.owner}
                    onChange={(e) => setDealForm((f) => ({ ...f, owner: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Close Date</label>
                  <input
                    type="date"
                    value={dealForm.close_date}
                    onChange={(e) => setDealForm((f) => ({ ...f, close_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Collaborator</label>
                <input
                  type="text"
                  value={dealForm.collaborator}
                  onChange={(e) =>
                    setDealForm((f) => ({ ...f, collaborator: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingDeal(null);
                }}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
