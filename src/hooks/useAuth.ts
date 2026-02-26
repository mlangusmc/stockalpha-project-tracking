"use client";

import { useState, useCallback } from "react";

export function useAuth() {
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireAuth = useCallback(
    (action: () => void) => {
      // Try the action first — if it gets a 401, show PIN dialog
      setPendingAction(() => action);
      action();
    },
    []
  );

  const handleAuthRequired = useCallback(
    (action: () => void) => {
      setPendingAction(() => action);
      setShowPinDialog(true);
    },
    []
  );

  const handlePinSuccess = useCallback(() => {
    setShowPinDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handlePinCancel = useCallback(() => {
    setShowPinDialog(false);
    setPendingAction(null);
  }, []);

  return {
    showPinDialog,
    handleAuthRequired,
    handlePinSuccess,
    handlePinCancel,
    requireAuth,
  };
}
