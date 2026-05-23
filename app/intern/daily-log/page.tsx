"use client";

import { useEffect, useState } from "react";
import DailyLogForm from "@/components/forms/DailyLogForm";
import Toast from "@/components/ui/Toast";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

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
  mentorComment?: string;
}

export default function DailyLogPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [logData, setLogData] = useState<DailyLogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function loadLog() {
      setLoading(true);
      const res = await fetch(`/api/intern/daily-logs?date=${date}`);
      const logs = await res.json();
      setLogData(logs.length > 0 ? logs[0] : null);
      setLoading(false);
    }
    loadLog();
  }, [date]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/intern/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      setLogData(saved);
      setToast({ message: "Daily log saved successfully!", type: "success" });
    } catch {
      setToast({ message: "Failed to save daily log", type: "error" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-sdw-navy">Daily Log</h2>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-sdw-teal" size={32} />
        </div>
      ) : (
        <DailyLogForm
          key={date}
          date={date}
          initialData={logData || undefined}
          onSubmit={handleSubmit}
          mentorComment={logData?.mentorComment}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
