"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { FileText } from "lucide-react";
import { createCandidate } from "@/lib/api/candidates";
import { useTableState } from "@/hooks/useTableState";
import { MainDataTable } from "@/components/shared/MainDataTable";
import { RecordDetailView } from "@/components/shared/RecordDetailView";
import { FilterModal } from "@/components/shared/FilterModal";
import { CustomizeTableModal } from "@/components/shared/CustomizeTableModal";
import { ImportCsvModal } from "@/components/shared/ImportCsvModal";
import { SkillsPopup } from "@/components/shared/SkillsPopup";
import { getAllHeaders, INITIAL_HIDDEN_COLUMNS } from "@/lib/table-config";
import type { Candidate } from "@/types";

export interface CandidatesTabProps {
  selectedItem?: unknown;
  setSelectedItem?: (item: unknown) => void;
  showForm?: boolean;
  setShowForm?: (v: boolean) => void;
  triggerDelete?: (payload: {
    type: string;
    id: string | string[];
    name: string;
    collection?: string;
    item?: unknown;
    items?: unknown[];
  }) => void;
  showFilterModal?: boolean;
  setShowFilterModal?: (v: boolean) => void;
  showCustomizeTable?: boolean;
  setShowCustomizeTable?: (v: boolean) => void;
  showImportModal?: boolean;
  setShowImportModal?: (v: boolean) => void;
  openCustomizeTableModal?: () => void;
  setShowResumeParser?: (v: boolean) => void;
  onOpenResumePreview?: (url: string) => void;
  showNotification?: (message: string, type: "success" | "error" | "info") => void;
  candidates?: Candidate[];
  loading?: boolean;
  refetch?: () => void;
}

const emptyText = <span className="text-gray-400 text-xs font-light">—</span>;

export function CandidatesTab({
  selectedItem,
  setSelectedItem,
  showForm = false,
  setShowForm,
  triggerDelete,
  showFilterModal = false,
  setShowFilterModal = () => {},
  showCustomizeTable = false,
  setShowCustomizeTable = () => {},
  showImportModal = false,
  setShowImportModal = () => {},
  openCustomizeTableModal = () => {},
  setShowResumeParser,
  onOpenResumePreview,
  showNotification,
  candidates = [],
  loading = false,
  refetch = () => {},
}: CandidatesTabProps = {}) {
  const table = useTableState("candidates");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [tempHiddenColumns, setTempHiddenColumns] = useState<string[]>([]);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [skillsPopup, setSkillsPopup] = useState<{ x: number; y: number; skills: string } | null>(null);

  useEffect(() => {
    if (showCustomizeTable) {
      setTempHiddenColumns(table.hiddenColumns);
      setTempColumnOrder((table.columnOrder["candidates"] as string[]) ?? getAllHeaders("candidates"));
    }
  }, [showCustomizeTable, table.hiddenColumns, table.columnOrder]);

  const activeData = useMemo(() => {
    let data = [...candidates];
    if (table.globalSearch.trim()) {
      const q = table.globalSearch.toLowerCase();
      data = data.filter((item) =>
        Object.values(item).some((v) =>
          String(v ?? "").toLowerCase().includes(q)
        )
      );
    }
    const validFilters = table.activeFilters.filter((f) => f.column && f.value);
    if (validFilters.length > 0) {
      data = data.filter((item) =>
        validFilters.every((filter) => {
          const itemVal = String(
            (item as Record<string, unknown>)[filter.column] ?? ""
          ).toLowerCase();
          const searchVal = filter.value.toLowerCase();
          switch (filter.operator) {
            case "contains":
              return itemVal.includes(searchVal);
            case "is":
              return itemVal === searchVal;
            case "is after":
              return new Date(itemVal) > new Date(searchVal);
            default:
              return true;
          }
        })
      );
    }
    if (table.sortConfig.key) {
      const key = table.sortConfig.key;
      data = [...data].sort((a, b) => {
        const aVal = String((a as Record<string, unknown>)[key] ?? "")
          .toLowerCase();
        const bVal = String((b as Record<string, unknown>)[key] ?? "")
          .toLowerCase();
        if (aVal < bVal) return table.sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return table.sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [
    candidates,
    table.globalSearch,
    table.activeFilters,
    table.sortConfig,
  ]);

  const handleAddRecord = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await createCandidate(formData as Partial<Candidate>);
        refetch();
        setFormData({});
        setShowForm?.(false);
      } catch (_err) {
        // notification can be shown by parent
      }
    },
    [formData, createCandidate, refetch, setShowForm]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const renderCellContent = useCallback(
    (item: Candidate, header: string) => {
      const val = (item as Record<string, unknown>)[header];
      if (val === undefined || val === null) {
        if (header === "resume") return emptyText;
        return emptyText;
      }
      const strVal = String(val);
      switch (header) {
        case "name":
          return (
            <div
              className="flex flex-col cursor-pointer"
              onClick={() => setSelectedItem?.(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedItem?.(item);
              }}
            >
              <span className="font-semibold text-gray-800 hover:text-blue-600 transition-colors text-[13px] leading-tight">
                {strVal || "—"}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                {item.position_title || item.current_organization || ""}
              </span>
            </div>
          );
        case "email":
          return (
            <a
              href={`mailto:${strVal}`}
              className="text-blue-500 hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {strVal}
            </a>
          );
        case "phone":
          return (
            <a
              href={`tel:${strVal}`}
              className="text-blue-500 hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {strVal}
            </a>
          );
        case "resume":
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowResumeParser?.(true);
              }}
              className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100 transition-colors font-medium"
            >
              <FileText size={12} />
              {strVal.length > 15 ? strVal.slice(0, 15) + "..." : strVal}
            </button>
          );
        case "skills":
          if (!strVal) return emptyText;
          const skillsArr = strVal.split(",").map((s) => s.trim()).filter(Boolean);
          const visibleSkills = skillsArr.slice(0, 3);
          return (
            <button
              type="button"
              className="flex flex-wrap gap-1 max-w-[220px] text-left hover:opacity-90"
              onClick={(e) => setSkillsPopup({ x: e.clientX, y: e.clientY, skills: strVal })}
            >
              {visibleSkills.map((s, i) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-100 font-medium"
                >
                  {s}
                </span>
              ))}
              {skillsArr.length > 3 && (
                <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium">
                  +{skillsArr.length - 3} more
                </span>
              )}
            </button>
          );
        case "owner":
          return (
            <span className="text-sm text-gray-700 font-medium">{strVal}</span>
          );
        default:
          return <span className="text-sm text-gray-700">{strVal}</span>;
      }
    },
    [setSelectedItem, setShowResumeParser]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (selectedItem && (selectedItem as Candidate).id && triggerDelete) {
    return (
      <RecordDetailView
        activeTab="candidates"
        selectedItem={selectedItem as Record<string, unknown> & { id: string }}
        setSelectedItem={setSelectedItem ?? (() => {})}
        triggerDelete={triggerDelete}
        showNotification={showNotification}
        onOpenResumePreview={onOpenResumePreview}
      />
    );
  }

  const visibleFromTemp = tempColumnOrder.filter((h) => !tempHiddenColumns.includes(h));
  const hiddenFromTemp = tempColumnOrder.filter((h) => tempHiddenColumns.includes(h));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal?.(false)}
        activeFilters={table.activeFilters}
        updateFilter={(id, field, value) =>
          table.setFilters(
            table.activeFilters.map((f) =>
              f.id === id ? { ...f, [field]: value } : f
            )
          )
        }
        addFilterRow={() =>
          table.setFilters([
            ...table.activeFilters,
            {
              id: Date.now(),
              column: getAllHeaders("candidates")[0] ?? "name",
              operator: "contains",
              value: "",
            },
          ])
        }
        removeFilterRow={(id) =>
          table.setFilters(table.activeFilters.filter((f) => f.id !== id))
        }
        getAllHeaders={() => getAllHeaders("candidates")}
      />
      <CustomizeTableModal
        isOpen={showCustomizeTable}
        onClose={() => setShowCustomizeTable?.(false)}
        visibleHeaders={visibleFromTemp}
        hiddenHeaders={hiddenFromTemp}
        tempHiddenColumns={tempHiddenColumns}
        tempColumnOrder={tempColumnOrder}
        setTempHiddenColumns={setTempHiddenColumns}
        setTempColumnOrder={setTempColumnOrder}
        onApply={() => {
          table.setHiddenColumns(tempHiddenColumns);
          table.setColumnOrder({
            ...table.columnOrder,
            candidates: tempColumnOrder,
          });
        }}
        onReset={() => {
          setTempHiddenColumns(INITIAL_HIDDEN_COLUMNS.candidates);
          setTempColumnOrder(getAllHeaders("candidates"));
        }}
        getAllHeaders={() => getAllHeaders("candidates")}
      />
      <ImportCsvModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal?.(false)}
        activeTab="candidates"
        getAllHeaders={() => getAllHeaders("candidates")}
        onExecuteImport={async (rows) => {
          setIsImporting(true);
          try {
            for (const r of rows) {
              await createCandidate(r as Partial<Candidate>);
            }
            refetch();
            showNotification?.(
              `Imported ${rows.length} candidate(s) successfully.`,
              "success"
            );
          } catch (e) {
            showNotification?.(
              (e as Error).message ?? "Import failed",
              "error"
            );
          } finally {
            setIsImporting(false);
          }
        }}
        isImporting={isImporting}
      />
      <MainDataTable<Candidate>
        activeTab="candidates"
        globalSearch={table.globalSearch}
        setGlobalSearch={table.setGlobalSearch}
        selectedRows={table.selectedRows}
        setSelectedRows={table.setSelectedRows}
        triggerDelete={triggerDelete ?? (() => {})}
        setShowFilterModal={setShowFilterModal}
        showForm={showForm}
        setShowForm={setShowForm ?? (() => {})}
        setShowImportModal={setShowImportModal}
        setShowResumeParser={setShowResumeParser}
        openCustomizeTableModal={openCustomizeTableModal}
        activeData={activeData}
        visibleHeaders={table.visibleHeaders}
        pinnedColumns={table.pinnedColumns}
        sortConfig={table.sortConfig}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        togglePinColumn={table.togglePinColumn}
        hideSingleColumn={table.hideSingleColumn}
        onSort={table.setSort}
        renderCellContent={renderCellContent}
        getAllHeaders={() => getAllHeaders("candidates")}
        handleAddRecord={handleAddRecord}
        handleInputChange={handleInputChange}
        formData={formData}
      />
      <SkillsPopup
        skills={skillsPopup?.skills ?? ""}
        anchor={skillsPopup ? { x: skillsPopup.x, y: skillsPopup.y } : null}
        onClose={() => setSkillsPopup(null)}
      />
    </div>
  );
}
