"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";

interface PinDialogProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinDialog({ open, onSuccess, onCancel }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        setPin("");
        onSuccess();
      } else {
        setError("Invalid PIN. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-lg bg-gray-900 border border-gray-700 p-4 sm:p-6 shadow-xl mx-3 sm:mx-0">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-50">Enter PIN</h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-400">
          A PIN is required to create, edit, or delete tasks.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN..."
            autoFocus
            className="mb-3 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {error && (
            <p className="mb-3 text-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-md border border-gray-700 px-3 py-2.5 sm:py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !pin}
              className="flex-1 rounded-md bg-blue-600 px-3 py-2.5 sm:py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
