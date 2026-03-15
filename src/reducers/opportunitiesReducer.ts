export interface OpportunitiesState {
  draggingOppId: string | null;
  dragOverStageId: string | null;
  showAddOppModal: boolean;
  showPipelineForm: boolean;
  editingPipelineId: string | null;
  showPipelineDropdown: boolean;
  showOppSortMenu: boolean;
}

export const initialOpportunitiesState: OpportunitiesState = {
  draggingOppId: null,
  dragOverStageId: null,
  showAddOppModal: false,
  showPipelineForm: false,
  editingPipelineId: null,
  showPipelineDropdown: false,
  showOppSortMenu: false,
};

export type OpportunitiesAction =
  | { type: "SET_DRAGGING_OPP"; payload: string | null }
  | { type: "SET_DRAG_OVER_STAGE"; payload: string | null }
  | { type: "SET_SHOW_ADD_OPP_MODAL"; payload: boolean }
  | { type: "SET_SHOW_PIPELINE_FORM"; payload: boolean }
  | { type: "SET_EDITING_PIPELINE_ID"; payload: string | null }
  | { type: "SET_SHOW_PIPELINE_DROPDOWN"; payload: boolean }
  | { type: "SET_SHOW_OPP_SORT_MENU"; payload: boolean };

export function opportunitiesReducer(
  state: OpportunitiesState,
  action: OpportunitiesAction
): OpportunitiesState {
  switch (action.type) {
    case "SET_DRAGGING_OPP":
      return { ...state, draggingOppId: action.payload };
    case "SET_DRAG_OVER_STAGE":
      return { ...state, dragOverStageId: action.payload };
    case "SET_SHOW_ADD_OPP_MODAL":
      return { ...state, showAddOppModal: action.payload };
    case "SET_SHOW_PIPELINE_FORM":
      return { ...state, showPipelineForm: action.payload };
    case "SET_EDITING_PIPELINE_ID":
      return { ...state, editingPipelineId: action.payload };
    case "SET_SHOW_PIPELINE_DROPDOWN":
      return { ...state, showPipelineDropdown: action.payload };
    case "SET_SHOW_OPP_SORT_MENU":
      return { ...state, showOppSortMenu: action.payload };
    default:
      return state;
  }
}
