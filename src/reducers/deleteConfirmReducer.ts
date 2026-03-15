export interface DeleteConfirmState {
  isOpen: boolean;
  type: string;
  id: string | string[] | null;
  name: string;
  collection?: string;
  item?: unknown;
  items?: unknown[];
}

export const initialDeleteConfirmState: DeleteConfirmState = {
  isOpen: false,
  type: "",
  id: null,
  name: "",
};

export type DeleteConfirmAction =
  | {
      type: "OPEN";
      payload: {
        type: string;
        id: string | string[];
        name: string;
        collection?: string;
        item?: unknown;
        items?: unknown[];
      };
    }
  | { type: "CLOSE" };

export function deleteConfirmReducer(
  state: DeleteConfirmState,
  action: DeleteConfirmAction
): DeleteConfirmState {
  switch (action.type) {
    case "OPEN":
      return {
        isOpen: true,
        type: action.payload.type,
        id: action.payload.id,
        name: action.payload.name,
        collection: action.payload.collection,
        item: action.payload.item,
        items: action.payload.items,
      };
    case "CLOSE":
      return initialDeleteConfirmState;
    default:
      return state;
  }
}
