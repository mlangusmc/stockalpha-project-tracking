"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export function useSettings(paused = false) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pause polling while a dialog is open to prevent overwriting edits
    if (paused) return;

    let cancelled = false;

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (cancelled) return;
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        if (cancelled) return;
        setSettings(data.settings);
      } catch {
        if (cancelled) return;
        setSettings(DEFAULT_SETTINGS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSettings();
    const interval = setInterval(fetchSettings, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [paused]);

  const updateSettings = useCallback(
    async (
      newSettings: AppSettings
    ): Promise<{ success: boolean }> => {
      try {
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSettings),
        });

        if (!res.ok) throw new Error("Failed to update settings");

        const data = await res.json();
        setSettings(data.settings);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    []
  );

  return { settings, loading, updateSettings };
}
