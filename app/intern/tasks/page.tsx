"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import WeekAccordion from "@/components/ui/WeekAccordion";
import Toast from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";

interface Task {
  _id: string;
  phase: number;
  week: number;
  weekTitle: string;
  taskNumber: number;
  title: string;
  description: string;
  selfCheck: string;
}

interface Record {
  _id?: string;
  taskId: string;
  status: string;
  notes: string;
  mentorFeedback?: string;
  mentorInitials?: string;
}

export default function InternTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const userPhase = session?.user?.phase || 1;

  useEffect(() => {
    setActivePhase(userPhase);
  }, [userPhase]);

  const loadData = useCallback(async () => {
    const [tasksRes, recordsRes] = await Promise.all([
      fetch("/api/intern/tasks"),
      fetch("/api/intern/task-records"),
    ]);
    setTasks(await tasksRes.json());
    setRecords(await recordsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (taskId: string, status: string, notes: string) => {
    try {
      const res = await fetch("/api/intern/task-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status, notes }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();

      setRecords((prev) => {
        const existing = prev.findIndex((r) => r.taskId === taskId);
        if (existing >= 0) {
          const copy = [...prev];
          copy[existing] = { ...updated, taskId };
          return copy;
        }
        return [...prev, { ...updated, taskId }];
      });

      setToast({ message: "Task saved successfully!", type: "success" });
    } catch {
      setToast({ message: "Failed to save task", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-sdw-teal" size={32} />
      </div>
    );
  }

  const phaseTasks = tasks.filter((t) => t.phase === activePhase);
  const weeks = [...new Set(phaseTasks.map((t) => t.week))].sort((a, b) => a - b);
  const locked = activePhase > userPhase;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-sdw-navy">My Tasks</h2>

      {/* Phase Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4].map((p) => (
          <button
            key={p}
            onClick={() => setActivePhase(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePhase === p
                ? "bg-sdw-navy text-white"
                : p > userPhase
                ? "bg-gray-200 text-gray-400"
                : "bg-white text-sdw-navy border hover:bg-gray-50"
            }`}
          >
            Phase {p}
          </button>
        ))}
      </div>

      {locked && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          This phase is locked. Complete your current phase first.
        </div>
      )}

      {/* Week Accordions */}
      <div className="space-y-3">
        {weeks.map((week) => {
          const weekTasks = phaseTasks.filter((t) => t.week === week);
          const weekTitle = weekTasks[0]?.weekTitle || "";
          const weekRecords = records.filter((r) =>
            weekTasks.some((t) => t._id === r.taskId)
          );

          return (
            <WeekAccordion
              key={week}
              week={week}
              weekTitle={weekTitle}
              tasks={weekTasks}
              records={weekRecords}
              locked={locked}
              onSave={handleSave}
            />
          );
        })}
      </div>

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
