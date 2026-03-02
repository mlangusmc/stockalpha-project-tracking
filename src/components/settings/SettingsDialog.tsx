"use client";

import { useState } from "react";
import { X, Trash2, Plus, Pencil, Check } from "lucide-react";
import { AppSettings, AssigneeConfig, RepoConfig, ClientConfig } from "@/lib/types";
import { ASSIGNEE_COLORS, REPO_COLORS, CLIENT_COLORS } from "@/lib/constants";

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
  const [clients, setClients] = useState<ClientConfig[]>(settings.clients ?? []);

  // New assignee form state
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeInitials, setNewAssigneeInitials] = useState("");
  const [newAssigneeColor, setNewAssigneeColor] = useState(ASSIGNEE_COLORS[0]);

  // New repo form state
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoShortLabel, setNewRepoShortLabel] = useState("");

  // New client form state
  const [newClientName, setNewClientName] = useState("");
  const [newClientLabel, setNewClientLabel] = useState("");

  // Editing state
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null);
  const [editingRepo, setEditingRepo] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);

  if (!open) return null;

  // --- Assignee handlers ---
  const handleDeleteAssignee = (name: string) => {
    if (name === "unassigned") return;
    setAssignees((prev) => prev.filter((a) => a.name !== name));
    if (editingAssignee === name) setEditingAssignee(null);
  };

  const handleUpdateAssignee = (name: string, updates: Partial<AssigneeConfig>) => {
    setAssignees((prev) =>
      prev.map((a) => (a.name === name ? { ...a, ...updates } : a))
    );
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
    const usedColors = new Set(assignees.map((a) => a.color));
    const nextColor = ASSIGNEE_COLORS.find((c) => !usedColors.has(c)) || ASSIGNEE_COLORS[0];
    setNewAssigneeColor(nextColor);
  };

  // --- Repo handlers ---
  const handleDeleteRepo = (name: string) => {
    setRepos((prev) => prev.filter((r) => r.name !== name));
    if (editingRepo === name) setEditingRepo(null);
  };

  const handleUpdateRepo = (name: string, updates: Partial<RepoConfig>) => {
    setRepos((prev) =>
      prev.map((r) => (r.name === name ? { ...r, ...updates } : r))
    );
  };

  const handleAddRepo = () => {
    const name = newRepoName.trim();
    const shortLabel = newRepoShortLabel.trim() || name;
    if (!name) return;
    if (repos.some((r) => r.name === name)) return;

    const usedColors = new Set(repos.map((r) => r.color));
    const color = REPO_COLORS.find((c) => !usedColors.has(c)) || REPO_COLORS[0];

    setRepos((prev) => [
      ...prev,
      { name, label: name, shortLabel, color },
    ]);
    setNewRepoName("");
    setNewRepoShortLabel("");
  };

  // --- Client handlers ---
  const handleDeleteClient = (name: string) => {
    setClients((prev) => prev.filter((c) => c.name !== name));
    if (editingClient === name) setEditingClient(null);
  };

  const handleUpdateClient = (name: string, updates: Partial<ClientConfig>) => {
    setClients((prev) =>
      prev.map((c) => (c.name === name ? { ...c, ...updates } : c))
    );
  };

  const handleAddClient = () => {
    const name = newClientName.trim();
    const label = newClientLabel.trim() || name;
    if (!name) return;
    if (clients.some((c) => c.name === name)) return;

    const usedColors = new Set(clients.map((c) => c.color));
    const color = CLIENT_COLORS.find((c) => !usedColors.has(c)) || CLIENT_COLORS[0];

    setClients((prev) => [...prev, { name, label, color }]);
    setNewClientName("");
    setNewClientLabel("");
  };

  const handleSave = () => {
    if (assignees.length === 0 || repos.length === 0) return;
    setEditingAssignee(null);
    setEditingRepo(null);
    setEditingClient(null);
    onSave({ assignees, repos, clients });
  };

  const inputClasses =
    "w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  const editInputClasses =
    "rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

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
                {editingAssignee === a.name && a.name !== "unassigned" ? (
                  <>
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${a.color}`}
                    >
                      {a.initials}
                    </span>
                    <input
                      type="text"
                      value={a.label}
                      onChange={(e) => handleUpdateAssignee(a.name, { label: e.target.value })}
                      className={`${editInputClasses} flex-1 min-w-0`}
                    />
                    <input
                      type="text"
                      value={a.initials}
                      onChange={(e) => handleUpdateAssignee(a.name, { initials: e.target.value.slice(0, 3).toUpperCase() })}
                      maxLength={3}
                      className={`${editInputClasses} w-14 shrink-0 text-center`}
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {ASSIGNEE_COLORS.slice(0, 8).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleUpdateAssignee(a.name, { color: c })}
                          className={`h-4 w-4 rounded-full ${c} ${
                            a.color === c
                              ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800"
                              : "opacity-50 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingAssignee(null)}
                      className="shrink-0 rounded p-1 text-green-400 hover:bg-gray-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${a.color}`}
                    >
                      {a.initials}
                    </span>
                    <span className="flex-1 text-sm text-gray-200">{a.label}</span>
                    {a.name !== "unassigned" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingAssignee(a.name)}
                          className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-blue-400"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignee(a.name)}
                          className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </>
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
                className={`${inputClasses} flex-1 min-w-0`}
              />
              <input
                type="text"
                value={newAssigneeInitials}
                onChange={(e) => setNewAssigneeInitials(e.target.value.slice(0, 3))}
                placeholder="Initials"
                maxLength={3}
                className={`${inputClasses} !w-16 shrink-0 text-center`}
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
                {editingRepo === r.name ? (
                  <>
                    <span
                      className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${r.color}`}
                    >
                      {r.shortLabel}
                    </span>
                    <input
                      type="text"
                      value={r.label}
                      onChange={(e) => handleUpdateRepo(r.name, { label: e.target.value })}
                      placeholder="Full name"
                      className={`${editInputClasses} flex-1 min-w-0`}
                    />
                    <input
                      type="text"
                      value={r.shortLabel}
                      onChange={(e) => handleUpdateRepo(r.name, { shortLabel: e.target.value })}
                      placeholder="Short"
                      className={`${editInputClasses} w-24 shrink-0`}
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {REPO_COLORS.slice(0, 6).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleUpdateRepo(r.name, { color: c })}
                          className={`h-4 w-4 rounded-full ${c.split(" ")[0]} ${
                            r.color === c
                              ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800"
                              : "opacity-50 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingRepo(null)}
                      className="shrink-0 rounded p-1 text-green-400 hover:bg-gray-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${r.color}`}
                    >
                      {r.shortLabel}
                    </span>
                    <span className="flex-1 text-sm text-gray-200">{r.name}</span>
                    <button
                      type="button"
                      onClick={() => setEditingRepo(r.name)}
                      className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-blue-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRepo(r.name)}
                      disabled={repos.length <= 1}
                      className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-red-400 disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
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

        {/* Clients Section */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-300">Clients</h3>
          <div className="space-y-2 mb-3">
            {clients.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2"
              >
                {editingClient === c.name ? (
                  <>
                    <span
                      className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${c.color}`}
                    >
                      {c.label}
                    </span>
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => handleUpdateClient(c.name, { label: e.target.value })}
                      placeholder="Display label"
                      className={`${editInputClasses} flex-1 min-w-0`}
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {CLIENT_COLORS.slice(0, 6).map((clr) => (
                        <button
                          key={clr}
                          type="button"
                          onClick={() => handleUpdateClient(c.name, { color: clr })}
                          className={`h-4 w-4 rounded-full ${clr.split(" ")[0]} ${
                            c.color === clr
                              ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800"
                              : "opacity-50 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingClient(null)}
                      className="shrink-0 rounded p-1 text-green-400 hover:bg-gray-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${c.color}`}
                    >
                      {c.label}
                    </span>
                    <span className="flex-1 text-sm text-gray-200">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => setEditingClient(c.name)}
                      className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-blue-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(c.name)}
                      className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
            {clients.length === 0 && (
              <p className="text-sm text-gray-500">No clients configured</p>
            )}
          </div>

          {/* Add client row */}
          <div className="space-y-2 rounded-md border border-gray-700 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Client name"
                className={inputClasses}
              />
              <input
                type="text"
                value={newClientLabel}
                onChange={(e) => setNewClientLabel(e.target.value)}
                placeholder="Display label"
                className={`${inputClasses} w-28 shrink-0`}
              />
            </div>
            <button
              type="button"
              onClick={handleAddClient}
              disabled={!newClientName.trim()}
              className="flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Client
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
