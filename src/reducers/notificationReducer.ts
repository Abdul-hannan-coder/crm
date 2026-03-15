export interface NotificationState {
  message: string | null;
  type: "success" | "error" | "info";
}

export const initialNotificationState: NotificationState = {
  message: null,
  type: "success",
};

export type NotificationAction =
  | { type: "SHOW"; payload: { message: string; type?: "success" | "error" | "info" } }
  | { type: "HIDE" };

export function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "SHOW":
      return {
        message: action.payload.message,
        type: action.payload.type ?? "success",
      };
    case "HIDE":
      return { ...state, message: null };
    default:
      return state;
  }
}
