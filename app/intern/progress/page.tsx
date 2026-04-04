"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ConfidenceChart from "@/components/charts/ConfidenceChart";
import CompletionChart from "@/components/charts/CompletionChart";
import { Loader2, Flame } from "lucide-react";
import { formatIST } from "@/lib/utils";

interface Task {
  _id: string;
  phase: number;
  week: number;
}

interface TaskRecord {
  taskId: string;
  status: string;
}

interface DailyLog {
  date: string;
  confidenceScore: number;
}

export default function ProgressPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [records, setRecords] = useState<TaskRecord[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [t, r, l] = await Promise.all([
        fetch("/api/intern/tasks").then((res) => res.json()),
        fetch("/api/intern/task-records").then((res) => res.json()),
        fetch("/api/intern/daily-logs").then((res) => res.json()),
      ]);
      setTasks(t);
      setRecords(r);
      setLogs(l);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-sdw-teal" size={32} />
      </div>
    );
  }

  // Phase progress
  const phaseData = [1, 2, 3, 4].map((p) => {
    const pTasks = tasks.filter((t) => t.phase === p);
    const done = pTasks.filter((t) =>
      records.find((r) => r.taskId === t._id && r.status === "done")
    ).length;
    return { name: `Phase ${p}`, done, total: pTasks.length };
  });

  // Week-by-week grid
  const allWeeks = [...new Set(tasks.map((t) => t.week))].sort((a, b) => a - b);
  const weekGrid = allWeeks.map((week) => {
    const weekTasks = tasks.filter((t) => t.week === week);
    const weekRecords = records.filter((r) =>
      weekTasks.some((t) => t._id === r.taskId)
    );
    const allDone = weekRecords.filter((r) => r.status === "done").length === weekTasks.length && weekTasks.length > 0;
    const someStarted = weekRecords.length > 0;
    const status = allDone ? "done" : someStarted ? "in_progress" : "not_started";
    return { week, status };
  });

  // Confidence data
  const confidenceData = logs
    .filter((l) => l.confidenceScore)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((l) => ({
      date: formatIST(l.date, "dd MMM"),
      score: l.confidenceScore,
    }));

  // Streak
  let streak = 0;
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  if (sortedLogs.length > 0) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setUTCHours(0, 0, 0, 0);
      if (logDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (logDate.getTime() < checkDate.getTime()) {
        break;
      }
    }
  }

  const userPhase = session?.user?.phase || 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-sdw-navy">My Progress</h2>

      {/* Phase Progress Bars */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="font-semibold text-sdw-navy mb-4">Phase Progress</h3>
        <div className="space-y-4">
          {phaseData.map((p) => (
            <div key={p.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{p.name}</span>
                <span className="text-gray-500">
                  {p.done}/{p.total}
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sdw-teal rounded-full transition-all"
                  style={{
                    width: `${p.total > 0 ? (p.done / p.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week Grid + Streak */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="font-semibold text-sdw-navy mb-4">Weekly Completion</h3>
          <div className="grid grid-cols-8 gap-2">
            {weekGrid.map(({ week, status }) => (
              <div
                key={week}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                  status === "done"
                    ? "bg-green-500 text-white"
                    : status === "in_progress"
                    ? "bg-amber-400 text-white"
                    : "bg-gray-200 text-gray-500"
                } ${week <= getPhaseEndWeek(userPhase) ? "" : "opacity-40"}`}
                title={`Week ${week}`}
              >
                W{week}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-200" /> Not started
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-400" /> In progress
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" /> Completed
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center justify-center min-w-[160px]">
          <Flame size={32} className="text-orange-500 mb-2" />
          <p className="text-3xl font-bold text-sdw-navy">{streak}</p>
          <p className="text-sm text-gray-500">Day Streak</p>
        </div>
      </div>

      {/* Confidence Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="font-semibold text-sdw-navy mb-4">Confidence Score Trend</h3>
        <ConfidenceChart data={confidenceData} />
      </div>

      {/* Completion Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="font-semibold text-sdw-navy mb-4">Phase Completion</h3>
        <CompletionChart data={phaseData} />
      </div>
    </div>
  );
}

function getPhaseEndWeek(phase: number): number {
  const ends: Record<number, number> = { 1: 3, 2: 7, 3: 12, 4: 16 };
  return ends[phase] || 16;
}
