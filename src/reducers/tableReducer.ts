export interface FilterRule {
  id: number;
  column: string;
  operator: string;
  value: string;
}

export interface SortConfig {
  key: string | null;
  direction: "asc" | "desc";
}

export interface TableState {
  activeFilters: FilterRule[];
  sortConfig: SortConfig;
  selectedRows: string[];
  hiddenColumns: string[];
  pinnedColumns: string[];
  columnOrder: Record<string, string[]>;
  globalSearch: string;
}

export const initialTableState: TableState = {
  activeFilters: [{ id: Date.now(), column: "name", operator: "contains", value: "" }],
  sortConfig: { key: null, direction: "asc" },
  selectedRows: [],
  hiddenColumns: [],
  pinnedColumns: ["name"],
  columnOrder: {},
  globalSearch: "",
};

export type TableAction =
  | { type: "SET_FILTERS"; payload: FilterRule[] }
  | { type: "SET_SORT"; payload: SortConfig }
  | { type: "SET_SELECTED_ROWS"; payload: string[] }
  | { type: "TOGGLE_ROW"; payload: string }
  | { type: "SET_HIDDEN_COLUMNS"; payload: string[] }
  | { type: "SET_PINNED_COLUMNS"; payload: string[] }
  | { type: "SET_COLUMN_ORDER"; payload: Record<string, string[]> }
  | { type: "SET_GLOBAL_SEARCH"; payload: string }
  | { type: "RESET_TABLE"; payload: Partial<TableState> };

export function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "SET_FILTERS":
      return { ...state, activeFilters: action.payload };
    case "SET_SORT":
      return { ...state, sortConfig: action.payload };
    case "SET_SELECTED_ROWS":
      return { ...state, selectedRows: action.payload };
    case "TOGGLE_ROW": {
      const id = action.payload;
      const selected = state.selectedRows.includes(id)
        ? state.selectedRows.filter((r) => r !== id)
        : [...state.selectedRows, id];
      return { ...state, selectedRows: selected };
    }
    case "SET_HIDDEN_COLUMNS":
      return { ...state, hiddenColumns: action.payload };
    case "SET_PINNED_COLUMNS":
      return { ...state, pinnedColumns: action.payload };
    case "SET_COLUMN_ORDER":
      return { ...state, columnOrder: action.payload };
    case "SET_GLOBAL_SEARCH":
      return { ...state, globalSearch: action.payload };
    case "RESET_TABLE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
