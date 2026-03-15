"use client";

import {
  Search,
  Menu,
  Filter,
  Upload,
  Plus,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  Pin,
  ChevronDown,
  ArrowUpAZ,
  ArrowDownZA,
  EyeOff,
} from "lucide-react";
import type { SortConfig } from "@/reducers/tableReducer";
import { formatHeader } from "@/lib/table-config";
import type { TableModule } from "@/lib/table-config";

export interface MainDataTableProps<T extends { id: string }> {
  activeTab: TableModule;
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  triggerDelete: (payload: {
    type: string;
    id: string | string[];
    name: string;
    collection?: string;
    item?: unknown;
    items?: unknown[];
  }) => void;
  setShowFilterModal: (v: boolean) => void;
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  setShowImportModal: (v: boolean) => void;
  setShowResumeParser?: (v: boolean) => void;
  openCustomizeTableModal: () => void;
  activeData: T[];
  visibleHeaders: string[];
  pinnedColumns: string[];
  sortConfig: SortConfig;
  activeDropdown: string | null;
  setActiveDropdown: (h: string | null) => void;
  togglePinColumn: (header: string) => void;
  hideSingleColumn: (header: string) => void;
  onSort: (key: string | null, direction: "asc" | "desc") => void;
  renderCellContent: (item: T, header: string) => React.ReactNode;
  getAllHeaders: () => string[];
  handleAddRecord: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: Record<string, string>;
}

export function MainDataTable<T extends { id: string }>({
  activeTab,
  globalSearch,
  setGlobalSearch,
  selectedRows,
  setSelectedRows,
  triggerDelete,
  setShowFilterModal,
  showForm,
  setShowForm,
  setShowImportModal,
  setShowResumeParser,
  openCustomizeTableModal,
  activeData,
  visibleHeaders,
  pinnedColumns,
  sortConfig,
  activeDropdown,
  setActiveDropdown,
  togglePinColumn,
  hideSingleColumn,
  onSort,
  renderCellContent,
  getAllHeaders,
  handleAddRecord,
  handleInputChange,
  formData,
}: MainDataTableProps<T>) {
  const title =
    activeTab === "companies"
      ? "Companies List"
      : `All ${activeTab.replace(/_/g, " ")}...`;
  const isCompanies = activeTab === "companies";
  const addLabel =
    activeTab === "candidates"
      ? "Candidate"
      : activeTab === "companies"
        ? "Company"
        : "Contact";

  const handleHeaderClick = (header: string) => {
    const next =
      sortConfig.key === header && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    onSort(header, next);
  };

  return (
    <>
      <header className="bg-white border-b z-10 shadow-sm">
        <div className="px-6 py-2 border-b border-gray-100 flex items-center bg-white">
          <div className="flex items-center bg-slate-50 border border-gray-200 rounded-md px-3 py-1.5 w-[500px] max-w-full">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search By Name, Job, Email & LinkedIn URL"
              className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-slate-400"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-white flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Menu size={18} className="text-gray-500 shrink-0" />
            <h1 className="text-[15px] font-semibold text-gray-800 capitalize truncate">
              {title} • Page 1
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4 flex-wrap">
            {selectedRows.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  triggerDelete({
                    type: "bulk",
                    id: selectedRows,
                    name: "",
                    collection: activeTab,
                    items: activeData.filter((d) => selectedRows.includes(d.id)),
                  })
                }
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-sm transition-colors text-sm font-semibold"
              >
                <Trash2 size={14} /> Delete ({selectedRows.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold"
            >
              <Filter size={14} /> Filter
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold"
            >
              <Upload size={14} /> Import CSV
            </button>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-1.5 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-semibold transition-colors ${isCompanies ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <Plus size={15} /> Add {addLabel}
            </button>
            {activeTab === "candidates" && setShowResumeParser && (
              <button
                type="button"
                onClick={() => setShowResumeParser(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-3 py-2 rounded-lg shadow-sm transition-all text-sm font-semibold border border-slate-600"
              >
                <Sparkles size={14} className="text-amber-400" /> AI Parser
              </button>
            )}
            <button
              type="button"
              onClick={openCustomizeTableModal}
              className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-gray-500 transition-all shrink-0"
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        {showForm && (
          <div className="m-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Add New Record
            </h2>
            <form
              onSubmit={handleAddRecord}
              className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5 items-end"
            >
              {getAllHeaders().map((header) => {
                const isDateField =
                  header.toLowerCase().includes("date") || header.includes("On");
                return (
                  <div key={header} className="w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-1 truncate">
                      {formatHeader(header)}
                    </label>
                    <input
                      type={isDateField ? "date" : "text"}
                      name={header}
                      value={formData[header] ?? ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder={
                        isDateField ? "" : `Enter ${formatHeader(header)}`
                      }
                    />
                  </div>
                );
              })}
              <div className="flex gap-2 w-full mt-4 lg:col-span-full pt-4 border-t">
                <button
                  type="submit"
                  className={`text-white px-6 py-2 rounded-lg font-medium transition-colors ${isCompanies ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Save Details
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="bg-white border-t border-gray-200 overflow-visible relative min-h-0">
          <div className="overflow-x-auto overflow-y-auto pb-32 max-h-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="p-3 w-12 text-center border-r border-gray-100 bg-gray-50/80 sticky left-0 z-30">
                    <input
                      type="checkbox"
                      checked={
                        activeData.length > 0 &&
                        selectedRows.length === activeData.length
                      }
                      onChange={(e) =>
                        setSelectedRows(
                          e.target.checked ? activeData.map((d) => d.id) : []
                        )
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  {visibleHeaders.map((header, index) => {
                    const isPinned = pinnedColumns.includes(header);
                    return (
                      <th
                        key={header}
                        className={`p-3 font-bold text-gray-400 text-[10px] uppercase tracking-widest group relative hover:bg-gray-100/50 transition-colors border-r border-gray-100 ${isPinned ? "sticky left-12 bg-gray-50/80 z-20" : "z-10"}`}
                      >
                        <div
                          className="flex justify-between items-center gap-3 cursor-pointer select-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(
                              activeDropdown === header ? null : header
                            );
                          }}
                        >
                          <span
                            className="flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHeaderClick(header);
                            }}
                          >
                            {isPinned && (
                              <Pin size={12} className="text-blue-500" />
                            )}
                            {formatHeader(header)}
                            {sortConfig.key === header &&
                              (sortConfig.direction === "asc" ? (
                                <ArrowUpAZ size={14} className="text-blue-500" />
                              ) : (
                                <ArrowDownZA
                                  size={14}
                                  className="text-blue-500"
                                />
                              ))}
                          </span>
                          <div
                            className={`p-1 rounded hover:bg-slate-200 transition-colors ${activeDropdown === header ? "bg-slate-200" : "opacity-0 group-hover:opacity-100"}`}
                          >
                            <ChevronDown
                              size={14}
                              className="text-gray-500"
                            />
                          </div>
                        </div>
                        {activeDropdown === header && (
                          <div
                            className={`absolute top-full mt-1 w-56 bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-50 font-normal normal-case ${index > visibleHeaders.length - 4 ? "right-0" : "left-0"}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => togglePinColumn(header)}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700"
                            >
                              <Pin
                                size={14}
                                className={
                                  isPinned ? "text-blue-500" : "text-gray-400"
                                }
                              />
                              {isPinned ? "Unpin Column" : "Pin Column"}
                            </button>
                            <div className="h-px bg-gray-100 my-1" />
                            <button
                              type="button"
                              onClick={() => hideSingleColumn(header)}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                            >
                              <EyeOff size={14} /> Hide Column
                            </button>
                          </div>
                        )}
                      </th>
                    );
                  })}
                  <th className="p-4 font-semibold text-slate-700 text-[11px] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeData.map((item) => (
                  <tr
                    key={item.id}
                    className={`${selectedRows.includes(item.id) ? "bg-blue-50" : "hover:bg-slate-50/80"} transition-all duration-150 group`}
                  >
                    <td className="p-3 text-center border-r border-gray-50 bg-white group-hover:bg-slate-50/80 sticky left-0 z-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedRows([...selectedRows, item.id]);
                          else
                            setSelectedRows(
                              selectedRows.filter((id) => id !== item.id)
                            );
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    {visibleHeaders.map((header) => {
                      const isPinned = pinnedColumns.includes(header);
                      return (
                        <td
                          key={`${item.id}-${header}`}
                          className={`p-3 text-[13px] text-gray-600 border-r border-gray-50/80 ${isPinned ? "sticky left-12 bg-white group-hover:bg-slate-50/80 z-10" : ""}`}
                        >
                          {renderCellContent(item, header)}
                        </td>
                      );
                    })}
                    <td className="p-3 text-right bg-white group-hover:bg-slate-50/80 border-l border-gray-50 z-10 relative">
                      <button
                        type="button"
                        onClick={() =>
                          triggerDelete({
                            type: "single",
                            id: item.id,
                            name:
                              (item as { name?: string }).name ??
                              (item as { company_name?: string }).company_name ??
                              "Record",
                            collection: activeTab,
                            item,
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {activeData.length === 0 && (
                  <tr>
                    <td
                      colSpan={visibleHeaders.length + 2}
                      className="p-16 text-center text-gray-400"
                    >
                      <Filter
                        size={48}
                        className="mx-auto mb-4 text-gray-200"
                      />
                      <p className="text-lg text-gray-500 mb-1">No data found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
