"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { Save, MessageSquare } from "lucide-react";

interface TaskCardProps {
  task: {
    _id: string;
    taskNumber: number;
    title: string;
    description: string;
    selfCheck: string;
  };
  record?: {
    _id?: string;
    status: string;
    notes: string;
    mentorFeedback?: string;
    mentorInitials?: string;
  };
  locked?: boolean;
  onSave?: (taskId: string, status: string, notes: string) => Promise<void>;
  // Mentor mode props
  mentorMode?: boolean;
  onMentorFeedback?: (recordId: string, feedback: string, initials: string) => Promise<void>;
}

export default function TaskCard({
  task,
  record,
  locked,
  onSave,
  mentorMode,
  onMentorFeedback,
}: TaskCardProps) {
  const [status, setStatus] = useState(record?.status || "pending");
  const [notes, setNotes] = useState(record?.notes || "");
  const [feedback, setFeedback] = useState(record?.mentorFeedback || "");
  const [initials, setInitials] = useState(record?.mentorInitials || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave || locked) return;
    setSaving(true);
    try {
      await onSave(task._id, status, notes);
    } finally {
      setSaving(false);
    }
  };

  const handleMentorSave = async () => {
    if (!onMentorFeedback || !record?._id) return;
    setSaving(true);
    try {
      await onMentorFeedback(record._id, feedback, initials);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${locked ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-sdw-teal bg-sdw-teal/10 px-2 py-0.5 rounded">
              Task {task.taskNumber}
            </span>
            <StatusBadge status={status} />
          </div>
          <h4 className="font-semibold text-sdw-navy">{task.title}</h4>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{task.description}</p>

      <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
        <p className="text-xs font-medium text-amber-800">Self-check: {task.selfCheck}</p>
      </div>

      {!mentorMode && !locked && (
        <>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="needs_retry">Needs Retry</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Your Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Write your observations, what you learned..."
              className="w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sdw-teal/50 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-sdw-teal text-white px-4 py-2 rounded text-sm font-medium hover:bg-sdw-teal/90 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      )}

      {record?.mentorFeedback && !mentorMode && (
        <div className="mt-3 bg-teal-50 border border-teal-200 rounded p-3">
          <div className="flex items-center gap-1 mb-1">
            <MessageSquare size={14} className="text-sdw-teal" />
            <span className="text-xs font-medium text-sdw-teal">
              Mentor Feedback {record.mentorInitials && `(${record.mentorInitials})`}
            </span>
          </div>
          <p className="text-sm text-teal-800">{record.mentorFeedback}</p>
        </div>
      )}

      {mentorMode && (
        <div className="mt-3 border-t pt-3">
          {record?.notes && (
            <div className="mb-3 bg-gray-50 rounded p-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Intern&apos;s Notes:</p>
              <p className="text-sm text-gray-700">{record.notes}</p>
            </div>
          )}
          <div className="grid grid-cols-[1fr_auto] gap-2 mb-2">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
              placeholder="Add feedback..."
              className="w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sdw-teal/50 resize-none"
            />
            <input
              value={initials}
              onChange={(e) => setInitials(e.target.value)}
              placeholder="Initials"
              className="w-20 text-sm border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
            />
          </div>
          <button
            onClick={handleMentorSave}
            disabled={saving || !record?._id}
            className="flex items-center gap-2 bg-sdw-teal text-white px-4 py-2 rounded text-sm font-medium hover:bg-sdw-teal/90 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Feedback"}
          </button>
        </div>
      )}
    </div>
  );
}
