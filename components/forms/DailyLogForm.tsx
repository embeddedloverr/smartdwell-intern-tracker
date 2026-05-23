"use client";

import { useState } from "react";
import { Save, Star } from "lucide-react";

interface DailyLogData {
  date: string;
  morningTopic: string;
  morningResource: string;
  morningConcept: string;
  morningRevisit: string;
  labTask: string;
  labComponents: string;
  labSteps: string;
  labResult: string;
  labError: string;
  labResolution: string;
  mentorTask: string;
  mentorTaskStatus: string;
  reflection: string;
  gaps: string;
  question: string;
  confidenceScore: number;
  travelExpenseAmount: number;
  travelExpenseDescription: string;
}

interface DailyLogFormProps {
  initialData?: Partial<DailyLogData>;
  date: string;
  onSubmit: (data: DailyLogData) => Promise<void>;
  readOnly?: boolean;
  mentorComment?: string;
}

export default function DailyLogForm({
  initialData,
  date,
  onSubmit,
  readOnly,
  mentorComment,
}: DailyLogFormProps) {
  const [form, setForm] = useState<DailyLogData>({
    date,
    morningTopic: initialData?.morningTopic || "",
    morningResource: initialData?.morningResource || "",
    morningConcept: initialData?.morningConcept || "",
    morningRevisit: initialData?.morningRevisit || "",
    labTask: initialData?.labTask || "",
    labComponents: initialData?.labComponents || "",
    labSteps: initialData?.labSteps || "",
    labResult: initialData?.labResult || "",
    labError: initialData?.labError || "",
    labResolution: initialData?.labResolution || "",
    mentorTask: initialData?.mentorTask || "",
    mentorTaskStatus: initialData?.mentorTaskStatus || "pending",
    reflection: initialData?.reflection || "",
    gaps: initialData?.gaps || "",
    question: initialData?.question || "",
    confidenceScore: initialData?.confidenceScore || 3,
    travelExpenseAmount: initialData?.travelExpenseAmount || 0,
    travelExpenseDescription: initialData?.travelExpenseDescription || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof DailyLogData, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({ ...form, date });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = readOnly
    ? "w-full text-sm border rounded px-3 py-2 bg-gray-50"
    : "w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sdw-teal/50";

  return (
    <div className="space-y-6">
      {/* Section A — Morning Theory */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="font-semibold text-sdw-navy mb-4 flex items-center gap-2">
          <span className="bg-sdw-teal text-white text-xs px-2 py-0.5 rounded">A</span>
          Morning Theory
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Topic covered</label>
            <input value={form.morningTopic} onChange={(e) => set("morningTopic", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Resource used</label>
            <input value={form.morningResource} onChange={(e) => set("morningResource", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Key concept learned</label>
            <input value={form.morningConcept} onChange={(e) => set("morningConcept", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To revisit</label>
            <input value={form.morningRevisit} onChange={(e) => set("morningRevisit", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
        </div>
      </div>

      {/* Section B — Afternoon Lab */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="font-semibold text-sdw-navy mb-4 flex items-center gap-2">
          <span className="bg-sdw-teal text-white text-xs px-2 py-0.5 rounded">B</span>
          Afternoon Lab
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Task done</label>
            <input value={form.labTask} onChange={(e) => set("labTask", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Components used</label>
            <input value={form.labComponents} onChange={(e) => set("labComponents", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Steps followed</label>
            <textarea value={form.labSteps} onChange={(e) => set("labSteps", e.target.value)} rows={3} className={`${inputClass} resize-none`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Result</label>
            <input value={form.labResult} onChange={(e) => set("labResult", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Error faced</label>
            <input value={form.labError} onChange={(e) => set("labError", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">How resolved</label>
            <textarea value={form.labResolution} onChange={(e) => set("labResolution", e.target.value)} rows={2} className={`${inputClass} resize-none`} readOnly={readOnly} />
          </div>
        </div>
      </div>

      {/* Section C — Mentor Task */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="font-semibold text-sdw-navy mb-4 flex items-center gap-2">
          <span className="bg-sdw-teal text-white text-xs px-2 py-0.5 rounded">C</span>
          Mentor Task
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Task given</label>
            <input value={form.mentorTask} onChange={(e) => set("mentorTask", e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={form.mentorTaskStatus} onChange={(e) => set("mentorTaskStatus", e.target.value)} className={inputClass} disabled={readOnly}>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
              <option value="needs_retry">Needs Retry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section D — Reflection */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="font-semibold text-sdw-navy mb-4 flex items-center gap-2">
          <span className="bg-sdw-teal text-white text-xs px-2 py-0.5 rounded">D</span>
          Reflection
        </h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Learning summary</label>
            <textarea value={form.reflection} onChange={(e) => set("reflection", e.target.value)} rows={3} className={`${inputClass} resize-none`} readOnly={readOnly} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gaps identified</label>
              <input value={form.gaps} onChange={(e) => set("gaps", e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Question for tomorrow</label>
              <input value={form.question} onChange={(e) => set("question", e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Confidence Score</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => !readOnly && set("confidenceScore", score)}
                  className={`p-1 transition-colors ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                >
                  <Star
                    size={28}
                    className={
                      score <= form.confidenceScore
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section E — Travel Expenses */}
      <div className="bg-white rounded-lg border p-5">
        <h3 className="font-semibold text-sdw-navy mb-4 flex items-center gap-2">
          <span className="bg-sdw-teal text-white text-xs px-2 py-0.5 rounded">E</span>
          Travel Expenses
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount (₹)</label>
            <input 
              type="number" 
              min="0"
              value={form.travelExpenseAmount} 
              onChange={(e) => set("travelExpenseAmount", Number(e.target.value) || 0)} 
              className={inputClass} 
              readOnly={readOnly} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <input 
              value={form.travelExpenseDescription} 
              onChange={(e) => set("travelExpenseDescription", e.target.value)} 
              className={inputClass} 
              readOnly={readOnly} 
              placeholder="e.g. Bus fare to office"
            />
          </div>
        </div>
      </div>

      {mentorComment && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <p className="text-xs font-medium text-sdw-teal mb-1">Mentor Comment</p>
          <p className="text-sm text-teal-800">{mentorComment}</p>
        </div>
      )}

      {!readOnly && (
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-sdw-teal text-white px-6 py-2.5 rounded-lg font-medium hover:bg-sdw-teal/90 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Submit Daily Log"}
        </button>
      )}
    </div>
  );
}
