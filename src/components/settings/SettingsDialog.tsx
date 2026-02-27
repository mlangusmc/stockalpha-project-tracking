"use client";

import { useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { AppSettings, AssigneeConfig, RepoConfig } from "@/lib/types";
import { ASSIGNEE_COLORS, REPO_COLORS } from "@/lib/constants";

interface SettingsDialogProps {
  open: boolean;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsDialog({
  open,
  settings,
  onSave,
  onClose,
}: SettingsDialogProps) {
  const [assignees, setAssignees] = useState<AssigneeConfig[]>(settings.assignees);
  const [repos, setRepos] = useState<RepoConfig[]>(settings.repos);

  // New assignee form state
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeInitials, setNewAssigneeInitials] = useState("");
  const [newAssigneeColor, setNewAssigneeColor] = useState(ASSIGNEE_COLORS[0]);

  // New repo form state
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoShortLabel, setNewRepoShortLabel] = useState("");

  if (!open) return null;

  const handleDeleteAssignee = (name: string) => {
    if (name === "unassigned") return;
    setAssignees((prev) => prev.filter((a) => a.name !== name));
  };

  const handleAddAssignee = () => {
    const name = newAssigneeName.trim();
    const initials = newAssigneeInitials.trim().toUpperCase() || name.slice(0, 2).toUpperCase();
    if (!name) return;
    if (assignees.some((a) => a.name === name)) return;

    setAssignees((prev) => [
      ...prev.filter((a) => a.name !== "unassigned"),
      { name, label: name, initials, color: newAssigneeColor },
      ...prev.filter((a) => a.name === "unassigned"),
    ]);
    setNewAssigneeName("");
    setNewAssigneeInitials("");
    // Pick next unused color
    const usedColors = new Set(assignees.map((a) => a.color));
    const nextColor = ASSIGNEE_COLORS.find((c) => !usedColors.has(c)) || ASSIGNEE_COLORS[0];
    setNewAssigneeColor(nextColor);
  };

  const handleDeleteRepo = (name: string) => {
    setRepos((prev) => prev.filter((r) => r.name !== name));
  };

  const handleAddRepo = () => {
    const name = newRepoName.trim();
    const shortLabel = newRepoShortLabel.trim() || name;
    if (!name) return;
    if (repos.some((r) => r.name === name)) return;

    // Auto-assign color from palette
    const usedColors = new Set(repos.map((r) => r.color));
    const color = REPO_COLORS.find((c) => !usedColors.has(c)) || REPO_COLORS[0];

    setRepos((prev) => [
      ...prev,
      { name, label: name, shortLabel, color },
    ]);
    setNewRepoName("");
    setNewRepoShortLabel("");
  };

  const handleSave = () => {
    if (assignees.length === 0 || repos.length === 0) return;
    onSave({ assignees, repos });
  };

  const inputClasses =
    "w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-lg bg-gray-900 border border-gray-700 p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-0">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-50">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Assignees Section */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-300">Assignees</h3>
          <div className="space-y-2 mb-3">
            {assignees.map((a) => (
              <div
                key={a.name}
                className="flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2"
              >
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${a.color}`}
                >
                  {a.initials}
                </span>
                <span className="flex-1 text-sm text-gray-200">{a.label}</span>
                {a.name !== "unassigned" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAssignee(a.name)}
                    className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add assignee row */}
          <div className="space-y-2 rounded-md border border-gray-700 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAssigneeName}
                onChange={(e) => setNewAssigneeName(e.target.value)}
                placeholder="Name"
                className={inputClasses}
              />
              <input
                type="text"
                value={newAssigneeInitials}
                onChange={(e) => setNewAssigneeInitials(e.target.value.slice(0, 3))}
                placeholder="Initials"
                maxLength={3}
                className={`${inputClasses} w-20 shrink-0`}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Color:</span>
              {ASSIGNEE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewAssigneeColor(c)}
                  className={`h-5 w-5 rounded-full ${c} ${
                    newAssigneeColor === c
                      ? "ring-2 ring-white ring-offset-1 ring-offset-gray-900"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddAssignee}
              disabled={!newAssigneeName.trim()}
              className="flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Assignee
            </button>
          </div>
        </div>

        {/* Repos Section */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-300">Repos</h3>
          <div className="space-y-2 mb-3">
            {repos.map((r) => (
              <div
                key={r.name}
                className="flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2"
              >
                <span
                  className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${r.color}`}
                >
                  {r.shortLabel}
                </span>
                <span className="flex-1 text-sm text-gray-200">{r.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteRepo(r.name)}
                  disabled={repos.length <= 1}
                  className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-red-400 disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add repo row */}
          <div className="space-y-2 rounded-md border border-gray-700 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                placeholder="Repo name"
                className={inputClasses}
              />
              <input
                type="text"
                value={newRepoShortLabel}
                onChange={(e) => setNewRepoShortLabel(e.target.value)}
                placeholder="Short label"
                className={`${inputClasses} w-28 shrink-0`}
              />
            </div>
            <button
              type="button"
              onClick={handleAddRepo}
              disabled={!newRepoName.trim()}
              className="flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Repo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-700 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={assignees.length === 0 || repos.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
