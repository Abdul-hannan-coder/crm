"use client";

import { useReducer, useMemo } from "react";
import {
  tableReducer,
  initialTableState,
  type TableState,
  type FilterRule,
} from "@/reducers/tableReducer";
import {
  INITIAL_HIDDEN_COLUMNS,
  getVisibleHeaders,
  getAllHeaders,
  type TableModule,
} from "@/lib/table-config";

export function useTableState(module: TableModule) {
  const initialHidden =
    INITIAL_HIDDEN_COLUMNS[module] ?? initialTableState.hiddenColumns;
  const [state, dispatch] = useReducer(tableReducer, {
    ...initialTableState,
    hiddenColumns: initialHidden,
    columnOrder: { [module]: getAllHeaders(module) },
  });

  const visibleHeaders = useMemo(
    () => getVisibleHeaders(module, state),
    [
      module,
      state.hiddenColumns,
      state.pinnedColumns,
      state.columnOrder,
    ]
  );

  return {
    ...state,
    visibleHeaders,
    setFilters: (filters: FilterRule[]) =>
      dispatch({ type: "SET_FILTERS", payload: filters }),
    setSort: (key: string | null, direction: "asc" | "desc") =>
      dispatch({ type: "SET_SORT", payload: { key, direction } }),
    setSelectedRows: (ids: string[]) =>
      dispatch({ type: "SET_SELECTED_ROWS", payload: ids }),
    toggleRow: (id: string) => dispatch({ type: "TOGGLE_ROW", payload: id }),
    setHiddenColumns: (cols: string[]) =>
      dispatch({ type: "SET_HIDDEN_COLUMNS", payload: cols }),
    setPinnedColumns: (cols: string[]) =>
      dispatch({ type: "SET_PINNED_COLUMNS", payload: cols }),
    setColumnOrder: (order: Record<string, string[]>) =>
      dispatch({ type: "SET_COLUMN_ORDER", payload: order }),
    setGlobalSearch: (q: string) =>
      dispatch({ type: "SET_GLOBAL_SEARCH", payload: q }),
    reset: (payload: Partial<TableState>) =>
      dispatch({ type: "RESET_TABLE", payload }),
    togglePinColumn: (header: string) => {
      const next = state.pinnedColumns.includes(header)
        ? state.pinnedColumns.filter((h) => h !== header)
        : [...state.pinnedColumns, header];
      dispatch({ type: "SET_PINNED_COLUMNS", payload: next });
    },
    hideSingleColumn: (header: string) => {
      const next = [...state.hiddenColumns, header];
      dispatch({ type: "SET_HIDDEN_COLUMNS", payload: next });
    },
  };
}
