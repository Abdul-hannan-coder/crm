"use client";

import { useReducer, useCallback } from "react";
import {
  notificationReducer,
  initialNotificationState,
} from "@/reducers/notificationReducer";

export function useNotification() {
  const [state, dispatch] = useReducer(
    notificationReducer,
    initialNotificationState
  );

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      dispatch({ type: "SHOW", payload: { message, type } });
      if (typeof window !== "undefined") {
        setTimeout(() => dispatch({ type: "HIDE" }), 4000);
      }
    },
    []
  );

  const hide = useCallback(() => dispatch({ type: "HIDE" }), []);

  return {
    message: state.message,
    type: state.type,
    showNotification,
    hide,
  };
}
