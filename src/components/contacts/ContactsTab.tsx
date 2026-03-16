"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { createContact } from "@/lib/api/contacts";
import { useTableState } from "@/hooks/useTableState";
import { MainDataTable } from "@/components/shared/MainDataTable";
import { RecordDetailView } from "@/components/shared/RecordDetailView";
import { FilterModal } from "@/components/shared/FilterModal";
import { CustomizeTableModal } from "@/components/shared/CustomizeTableModal";
import { ImportCsvModal } from "@/components/shared/ImportCsvModal";
import { getAllHeaders, INITIAL_HIDDEN_COLUMNS } from "@/lib/table-config";
import type { Contact } from "@/types";

export interface ContactsTabProps {
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
  showNotification?: (message: string, type: "success" | "error" | "info") => void;
  contacts?: Contact[];
  loading?: boolean;
  refetch?: () => void;
}

const emptyText = <span className="text-gray-400 text-xs font-light">—</span>;

export function ContactsTab({
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
  showNotification,
  contacts = [],
  loading = false,
  refetch = () => {},
}: ContactsTabProps = {}) {
  const table = useTableState("contacts");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [tempHiddenColumns, setTempHiddenColumns] = useState<string[]>([]);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (showCustomizeTable) {
      setTempHiddenColumns(table.hiddenColumns);
      setTempColumnOrder((table.columnOrder["contacts"] as string[]) ?? getAllHeaders("contacts"));
    }
  }, [showCustomizeTable, table.hiddenColumns, table.columnOrder]);

  const activeData = useMemo(() => {
    let data = [...contacts];
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
    contacts,
    table.globalSearch,
    table.activeFilters,
    table.sortConfig,
  ]);

  const handleAddRecord = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await createContact(formData as Partial<Contact>);
        refetch();
        setFormData({});
        setShowForm?.(false);
      } catch (_err) {}
    },
    [formData, createContact, refetch, setShowForm]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const renderCellContent = useCallback(
    (item: Contact, header: string) => {
      const val = (item as Record<string, unknown>)[header];
      if (val === undefined || val === null) return emptyText;
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
                if (e.key === "Enter" || e.key === " ")
                  setSelectedItem?.(item);
              }}
            >
              <span className="font-semibold text-gray-800 hover:text-blue-600 transition-colors text-[13px] leading-tight">
                {strVal || "—"}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                {item.job_title || item.company_name || ""}
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
        case "company_name":
          return <span className="text-sm text-gray-700">{strVal}</span>;
        case "linkedin_profile_url":
        case "facebook_profile_url":
        case "twitter_profile_url":
        case "xing_profile_url":
          return (
            <a
              href={strVal.startsWith("http") ? strVal : `https://${strVal}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline text-sm truncate max-w-[150px] block"
              onClick={(e) => e.stopPropagation()}
            >
              {strVal}
            </a>
          );
        case "owner":
          return (
            <span className="text-sm text-gray-700 font-medium">{strVal}</span>
          );
        default:
          return <span className="text-sm text-gray-700">{strVal}</span>;
      }
    },
    [setSelectedItem]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (selectedItem && (selectedItem as Contact).id && triggerDelete) {
    return (
      <RecordDetailView
        activeTab="contacts"
        selectedItem={selectedItem as Record<string, unknown> & { id: string }}
        setSelectedItem={setSelectedItem ?? (() => {})}
        triggerDelete={triggerDelete}
        showNotification={showNotification}
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
              column: getAllHeaders("contacts")[0] ?? "name",
              operator: "contains",
              value: "",
            },
          ])
        }
        removeFilterRow={(id) =>
          table.setFilters(table.activeFilters.filter((f) => f.id !== id))
        }
        getAllHeaders={() => getAllHeaders("contacts")}
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
            contacts: tempColumnOrder,
          });
        }}
        onReset={() => {
          setTempHiddenColumns(INITIAL_HIDDEN_COLUMNS.contacts);
          setTempColumnOrder(getAllHeaders("contacts"));
        }}
        getAllHeaders={() => getAllHeaders("contacts")}
      />
      <ImportCsvModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal?.(false)}
        activeTab="contacts"
        getAllHeaders={() => getAllHeaders("contacts")}
        onExecuteImport={async (rows) => {
          setIsImporting(true);
          try {
            for (const r of rows) {
              await createContact(r as Partial<Contact>);
            }
            refetch();
            showNotification?.(
              `Imported ${rows.length} contact(s) successfully.`,
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
      <MainDataTable<Contact>
        activeTab="contacts"
        globalSearch={table.globalSearch}
        setGlobalSearch={table.setGlobalSearch}
        selectedRows={table.selectedRows}
        setSelectedRows={table.setSelectedRows}
        triggerDelete={triggerDelete ?? (() => {})}
        setShowFilterModal={setShowFilterModal}
        showForm={showForm}
        setShowForm={setShowForm ?? (() => {})}
        setShowImportModal={setShowImportModal}
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
        getAllHeaders={() => getAllHeaders("contacts")}
        handleAddRecord={handleAddRecord}
        handleInputChange={handleInputChange}
        formData={formData}
      />
    </div>
  );
}
