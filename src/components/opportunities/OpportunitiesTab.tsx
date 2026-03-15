"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  ChevronDown,
  CheckCircle2,
  Trash2,
  Target,
  Edit2,
  RefreshCw,
  X,
} from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";
import { usePipelines } from "@/hooks/usePipelines";
import { useDeletedItems } from "@/hooks/useDeletedItems";
import { useCandidates } from "@/hooks/useCandidates";
import { useContacts } from "@/hooks/useContacts";
import * as opportunitiesApi from "@/lib/api/opportunities";
import * as pipelinesApi from "@/lib/api/pipelines";
import { PipelineFormModal } from "./PipelineFormModal";
import { AddOpportunityModal, type AddOpportunityModalProps } from "./AddOpportunityModal";
import type { Opportunity } from "@/types";
import type { Pipeline, PipelineStage } from "@/types";
import type { DeletedItem } from "@/types";

export interface OpportunitiesTabProps {
  triggerDelete?: (payload: {
    type: string;
    id: string | string[];
    name: string;
    collection?: string;
    item?: unknown;
    items?: unknown[];
  }) => void;
  showNotification?: (message: string, type: "success" | "error" | "info") => void;
}

const STAGE_BORDER_COLORS = [
  "border-blue-500",
  "border-amber-400",
  "border-purple-500",
  "border-emerald-500",
  "border-rose-500",
];

export function OpportunitiesTab({
  triggerDelete,
  showNotification = () => {},
}: OpportunitiesTabProps = {}) {
  const [oppSubTab, setOppSubTab] = useState<"Opportunities" | "Pipelines" | "Bulk Actions">(
    "Opportunities"
  );
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [showPipelineForm, setShowPipelineForm] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [showAddOppModal, setShowAddOppModal] = useState(false);
  const [bulkActionExpanded, setBulkActionExpanded] = useState<string>("");
  const [draggingOppId, setDraggingOppId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const { opportunities, loading, refetch: refetchOpportunities } = useOpportunities();
  const { pipelines, refetch: refetchPipelines } = usePipelines();
  const { deletedItems, refetch: refetchDeleted, restoreDeletedItem, deleteDeletedItem } =
    useDeletedItems();
  const { candidates } = useCandidates();
  const { contacts } = useContacts();

  const openCreatePipelineModal = useCallback((pipe: Pipeline | null) => {
    setEditingPipeline(pipe);
    setShowPipelineForm(true);
  }, []);

  const handleSavePipeline = useCallback(
    async (data: { name: string; stages: PipelineStage[] }) => {
      if (editingPipeline) {
        await pipelinesApi.updatePipeline(editingPipeline.id, data);
        showNotification("Pipeline updated successfully!", "success");
      } else {
        await pipelinesApi.createPipeline(data);
        showNotification("Pipeline created successfully!", "success");
      }
      refetchPipelines();
      setShowPipelineForm(false);
      setEditingPipeline(null);
    },
    [editingPipeline, showNotification, refetchPipelines]
  );

  const handleSaveOpportunity = useCallback(
    async (data: Parameters<AddOpportunityModalProps["onSave"]>[0]) => {
      await opportunitiesApi.createOpportunity(data);
      showNotification("Opportunity saved successfully!", "success");
      refetchOpportunities();
      setShowAddOppModal(false);
    },
    [showNotification, refetchOpportunities]
  );

  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    setDraggingOppId(oppId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStageId(stageId);
  };

  const handleDragLeave = () => setDragOverStageId(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent, newStageId: string, newStageName: string) => {
      e.preventDefault();
      setDragOverStageId(null);
      if (!draggingOppId) return;
      const opp = opportunities.find((o) => o.id === draggingOppId);
      if (!opp || String(opp.stage_id) === String(newStageId)) {
        setDraggingOppId(null);
        return;
      }
      try {
        await opportunitiesApi.updateOpportunity(draggingOppId, {
          stage_id: newStageId,
        });
        refetchOpportunities();
        showNotification(`Moved to "${newStageName}"`, "success");
      } catch (err) {
        showNotification("Failed to move: " + (err as Error).message, "error");
      }
      setDraggingOppId(null);
    },
    [draggingOppId, opportunities, showNotification, refetchOpportunities]
  );

  const handleRestore = useCallback(
    async (item: DeletedItem) => {
      try {
        await restoreDeletedItem(item.id);
        refetchDeleted();
        refetchOpportunities();
        refetchPipelines();
        showNotification("Record restored successfully!", "success");
      } catch {
        showNotification("Failed to restore record.", "error");
      }
    },
    [restoreDeletedItem, refetchDeleted, refetchOpportunities, refetchPipelines, showNotification]
  );

  const handlePermanentDelete = useCallback(
    async (id: string) => {
      try {
        await deleteDeletedItem(id);
        refetchDeleted();
        showNotification("Permanently deleted.", "success");
      } catch {
        showNotification("Failed to delete.", "error");
      }
    },
    [deleteDeletedItem, refetchDeleted, showNotification]
  );

  const filteredOpportunities = selectedPipelineId
    ? opportunities.filter(
        (o) => String(o.pipeline_id ?? (o as Record<string, unknown>).pipelineId) === selectedPipelineId
      )
    : [];

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const pipelineStages = (selectedPipeline?.stages as PipelineStage[]) ?? [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f6f8] overflow-hidden">
      <div className="bg-white border-b shadow-sm z-10 flex flex-col">
        <div className="px-6 pt-4">
          <h1 className="text-[22px] font-bold text-gray-900 mb-4">Opportunities</h1>
          <div className="flex gap-6 text-sm font-medium">
            {(["Opportunities", "Pipelines", "Bulk Actions"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOppSubTab(t)}
                className={`pb-3 transition-colors ${oppSubTab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {oppSubTab === "Pipelines" && (
        <div className="flex-1 p-6 overflow-y-auto bg-white m-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pipelines</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your opportunity stages here.</p>
            </div>
            <button
              type="button"
              onClick={() => openCreatePipelineModal(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} /> Create Pipeline
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="p-3 text-[13px] font-semibold text-gray-600">Pipeline Name</th>
                <th className="p-3 text-[13px] font-semibold text-gray-600"># Stages</th>
                <th className="p-3 text-[13px] font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-500 text-sm">
                    No pipelines found. Create one.
                  </td>
                </tr>
              ) : (
                pipelines.map((pipe) => (
                  <tr
                    key={pipe.id}
                    className="border-b border-gray-50 hover:bg-slate-50/60 transition-all group"
                  >
                    <td className="p-3">
                      <div className="text-[14px] font-semibold text-gray-800">{pipe.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {(pipe.stages as PipelineStage[])?.length ?? 0} stages configured
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-600 text-[12px] font-semibold px-2.5 py-1 rounded-lg">
                        {(pipe.stages as PipelineStage[])?.length ?? 0} Stages
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openCreatePipelineModal(pipe)}
                          className="p-1.5 hover:bg-blue-50 hover:text-blue-600 text-gray-400 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerDelete?.({
                              type: "pipeline",
                              id: pipe.id,
                              name: pipe.name ?? "Pipeline",
                            })
                          }
                          className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {oppSubTab === "Opportunities" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b px-6 py-3 flex justify-between items-center z-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPipelineDropdown(!showPipelineDropdown)}
                className="border border-gray-300 rounded-md px-4 py-2 flex items-center justify-between w-64 bg-white hover:bg-gray-50 text-[15px] font-medium text-gray-700"
              >
                {selectedPipeline?.name ?? "Select Pipeline"}
                <ChevronDown size={16} className="text-gray-400 ml-2" />
              </button>
              {showPipelineDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-[999] w-64 max-h-60 overflow-y-auto">
                  {pipelines.map((pipe) => (
                    <button
                      key={pipe.id}
                      type="button"
                      onClick={() => {
                        setSelectedPipelineId(pipe.id);
                        setShowPipelineDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-left flex justify-between items-center ${selectedPipelineId === pipe.id ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      {pipe.name}
                      {selectedPipelineId === pipe.id && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-blue-600 font-medium text-[15px] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
              {filteredOpportunities.length} opportunities
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddOppModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1.5 text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <Plus size={16} /> Add opportunity
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto p-6 flex gap-4 bg-[#f0f2f5] items-start">
            {!selectedPipelineId ? (
              <div className="m-auto text-gray-500 flex flex-col items-center">
                <Target size={48} className="text-gray-300 mb-4" />
                <p className="text-lg font-medium">
                  Please select or create a Pipeline to view board
                </p>
              </div>
            ) : pipelineStages.length === 0 ? (
              <div className="m-auto text-gray-500">No stages in this pipeline.</div>
            ) : (
              pipelineStages.map((stage, idx) => {
                const stageOpps = filteredOpportunities.filter(
                  (o) => String(o.stage_id ?? (o as Record<string, unknown>).stageId) === String(stage.id)
                );
                const isDragOver = dragOverStageId === String(stage.id);
                return (
                  <div
                    key={stage.id}
                    onDragOver={(e) => handleDragOver(e, String(stage.id))}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, String(stage.id), stage.name ?? "")}
                    className={`bg-white border border-gray-200 rounded-2xl shadow-sm w-[260px] flex-shrink-0 flex flex-col border-t-4 ${STAGE_BORDER_COLORS[idx % STAGE_BORDER_COLORS.length]} transition-all ${isDragOver ? "ring-2 ring-blue-400 bg-blue-50/30 scale-[1.02]" : ""}`}
                  >
                    <div className="px-4 py-3 bg-white rounded-t-xl flex justify-between items-center border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-[13px] tracking-tight uppercase">
                        {stage.name}
                      </h3>
                      <span
                        className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full ${stageOpps.length > 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
                      >
                        {stageOpps.length}
                      </span>
                    </div>
                    <div className="p-2.5 space-y-2 min-h-[80px]">
                      {stageOpps.map((opp: Opportunity) => (
                        <div
                          key={opp.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, opp.id)}
                          onDragEnd={() => {
                            setDraggingOppId(null);
                            setDragOverStageId(null);
                          }}
                          className={`bg-white border border-gray-100 px-3 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative group cursor-grab active:cursor-grabbing ${draggingOppId === opp.id ? "opacity-40 scale-95" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900 text-[13px] leading-snug pr-5">
                              {opp.opp_name ?? opp.oppName ?? "—"}
                            </h4>
                            {triggerDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  triggerDelete({
                                    type: "single",
                                    id: opp.id,
                                    name: (opp.opp_name ?? opp.oppName) as string,
                                    collection: "opportunities",
                                    item: opp,
                                  })
                                }
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-[8px] shrink-0">
                              {(opp.contact_name ?? (opp as Record<string, unknown>).contactName ?? "N")
                                .toString()
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <span className="text-[11px] text-gray-500 truncate">
                              {(opp.contact_name ?? (opp as Record<string, unknown>).contactName) as string ?? "No Contact"}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${opp.status === "Won" ? "bg-emerald-50 text-emerald-700" : opp.status === "Lost" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"}`}
                          >
                            {opp.status ?? "Open"}
                          </span>
                        </div>
                      ))}
                      {isDragOver && (
                        <div className="border-2 border-dashed border-blue-400 rounded-xl h-16 flex items-center justify-center">
                          <span className="text-xs text-blue-500 font-semibold">Drop here</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {oppSubTab === "Bulk Actions" && (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
            <div className="flex-1 overflow-y-auto p-2">
              <button
                type="button"
                onClick={() =>
                  setBulkActionExpanded(
                    bulkActionExpanded === "DELETED RECORDS" ? "" : "DELETED RECORDS"
                  )
                }
                className={`w-full flex justify-between items-center p-3 text-sm font-bold text-red-600 rounded mt-1 ${bulkActionExpanded === "DELETED RECORDS" ? "bg-red-50" : "hover:bg-red-50"}`}
              >
                RECYCLE BIN ({deletedItems.length}){" "}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${bulkActionExpanded === "DELETED RECORDS" ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
            {bulkActionExpanded === "DELETED RECORDS" ? (
              <div className="bg-white border border-red-200 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50 rounded-t-lg">
                  <div>
                    <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                      <Trash2 size={20} /> Deleted Records{" "}
                      <span className="text-sm font-normal bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        {deletedItems.length}
                      </span>
                    </h2>
                    <p className="text-sm text-red-600 mt-1">
                      Deleted items will appear here. You can restore them.
                    </p>
                  </div>
                </div>
                <div className="p-0">
                  {deletedItems.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">Recycle bin is empty.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Name / Title
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Original Module
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Deleted Date
                          </th>
                          <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {deletedItems.map((item) => {
                          const data = item.original_data as Record<string, unknown> | undefined;
                          const name =
                            (data?.name ?? data?.company_name ?? data?.title ?? "Unknown") as string;
                          return (
                            <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                              <td className="p-4 text-sm font-medium text-gray-800">{name}</td>
                              <td className="p-4 text-sm text-gray-600 capitalize">
                                {item.original_collection ?? "—"}
                              </td>
                              <td className="p-4 text-sm text-gray-500">
                                {item.deleted_at
                                  ? new Date(item.deleted_at).toLocaleString()
                                  : "—"}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleRestore(item)}
                                  className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-xs font-bold hover:bg-emerald-100 inline-flex items-center gap-1"
                                >
                                  <RefreshCw size={12} /> Restore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePermanentDelete(item.id)}
                                  className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-bold hover:bg-red-100 inline-flex items-center gap-1"
                                >
                                  <X size={12} /> Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full pt-20">
                <Target size={48} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Select an action</h2>
                <p className="text-gray-500 mt-2 max-w-md">
                  Expand &quot;Recycle Bin&quot; from the left to restore or permanently delete
                  records.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <PipelineFormModal
        isOpen={showPipelineForm}
        onClose={() => {
          setShowPipelineForm(false);
          setEditingPipeline(null);
        }}
        editingPipeline={editingPipeline}
        onSave={handleSavePipeline}
      />
      <AddOpportunityModal
        isOpen={showAddOppModal}
        onClose={() => setShowAddOppModal(false)}
        pipelines={pipelines}
        candidates={candidates}
        contacts={contacts}
        selectedPipelineId={selectedPipelineId}
        onSave={handleSaveOpportunity}
      />
    </div>
  );
}
