"use client";

import { useState } from "react";

interface InternFormProps {
  onSubmit: (data: { name: string; email: string; password: string; phase: number }) => Promise<void>;
  onCancel: () => void;
}

export default function InternForm({ onSubmit, onCancel }: InternFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({ name, email, password, phase });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create intern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
          placeholder="e.g., Amit Kumar"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
          placeholder="e.g., amit@smartdwell.in"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
          placeholder="Minimum 6 characters"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Starting Phase</label>
        <select
          value={phase}
          onChange={(e) => setPhase(Number(e.target.value))}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
        >
          <option value={1}>Phase 1 — Foundations</option>
          <option value={2}>Phase 2 — Hardware & IoT</option>
          <option value={3}>Phase 3 — Firmware & Protocols</option>
          <option value={4}>Phase 4 — Client Support & Docs</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-sdw-teal text-white py-2 rounded font-medium text-sm hover:bg-sdw-teal/90 disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Intern"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
