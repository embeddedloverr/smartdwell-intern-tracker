"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProgressRing from "@/components/ui/ProgressRing";
import StatsCard from "@/components/ui/StatsCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  ListTodo,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  MessageSquare,
  Receipt,
  IndianRupee,
  Download,
} from "lucide-react";
import Link from "next/link";
import { formatIST, getGreeting } from "@/lib/utils";

interface TaskData {
  _id: string;
  phase: number;
  week: number;
  weekTitle: string;
  taskNumber: number;
  title: string;
}

interface RecordData {
  _id: string;
  taskId: string;
  status: string;
  mentorFeedback?: string;
  updatedAt: string;
}

export default function InternOverview() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [canDownloadExpenses, setCanDownloadExpenses] = useState(false);
  const [expensesEnabled, setExpensesEnabled] = useState(false);
  const [monthlyExpenseTotal, setMonthlyExpenseTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const [tasksRes, recordsRes, profileRes, expensesRes] = await Promise.all([
        fetch("/api/intern/tasks"),
        fetch("/api/intern/task-records"),
        fetch("/api/intern/profile"),
        fetch(`/api/intern/expenses?month=${month}&year=${year}`),
      ]);
      setTasks(await tasksRes.json());
      setRecords(await recordsRes.json());
      const profile = await profileRes.json();
      setCanDownloadExpenses(profile.canDownloadExpenses || false);
      setExpensesEnabled(profile.expensesEnabled || false);
      const expenses = await expensesRes.json();
      if (Array.isArray(expenses)) {
        setMonthlyExpenseTotal(expenses.reduce((s: number, e: { amount: number }) => s + e.amount, 0));
      }
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

  const phase = session?.user?.phase || 1;
  const phaseTasks = tasks.filter((t) => t.phase === phase);
  const phaseRecords = records.filter((r) =>
    phaseTasks.some((t) => t._id === r.taskId)
  );
  const done = phaseRecords.filter((r) => r.status === "done").length;
  const inProgress = phaseRecords.filter((r) => r.status === "in_progress").length;
  const needsRetry = phaseRecords.filter((r) => r.status === "needs_retry").length;
  const pending = phaseTasks.length - done - inProgress - needsRetry;
  const percentage = phaseTasks.length > 0 ? (done / phaseTasks.length) * 100 : 0;

  // Current week tasks
  const currentWeekTasks = phaseTasks
    .sort((a, b) => a.week - b.week || a.taskNumber - b.taskNumber)
    .filter((t) => {
      const rec = records.find((r) => r.taskId === t._id);
      return !rec || rec.status !== "done";
    })
    .slice(0, 5);

  const currentWeek = currentWeekTasks[0]?.week;
  const currentWeekTitle = currentWeekTasks[0]?.weekTitle;

  // Recent feedback
  const recentFeedback = records
    .filter((r) => r.mentorFeedback)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="bg-white rounded-lg p-6 shadow-sm border flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-sdw-navy">
            {getGreeting()}, {session?.user?.name}!
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {formatIST(new Date(), "EEEE, dd MMMM yyyy")} &middot; Phase {phase}
          </p>
        </div>
      </div>

      {/* Progress + Stats */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center justify-center">
          <ProgressRing percentage={percentage} />
          <p className="text-sm text-gray-500 mt-3">Phase {phase} Progress</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Tasks" value={phaseTasks.length} icon={ListTodo} />
          <StatsCard title="Done" value={done} icon={CheckCircle} color="text-green-600" />
          <StatsCard title="In Progress" value={inProgress} icon={Clock} color="text-amber-600" />
          <StatsCard title="Needs Retry" value={needsRetry} icon={AlertTriangle} color="text-red-600" />
        </div>
      </div>

      {/* Expenses summary card — only if admin has enabled the feature */}
      {expensesEnabled && (
        <Link href="/intern/expenses" className="block">
          <div className="bg-white rounded-lg border shadow-sm p-5 flex items-center justify-between hover:border-sdw-teal/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sdw-teal/10 flex items-center justify-center">
                <Receipt size={20} className="text-sdw-teal" />
              </div>
              <div>
                <p className="text-sm font-semibold text-sdw-navy">This Month&apos;s Expenses</p>
                <p className="text-xs text-gray-400">Manage and track your expenses →</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-sdw-teal flex items-center gap-0.5">
                <IndianRupee size={16} />
                {monthlyExpenseTotal.toLocaleString("en-IN")}
              </p>
              {canDownloadExpenses && (
                <a
                  href={`/api/intern/expenses-report?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-sdw-teal hover:underline"
                >
                  Download CSV
                </a>
              )}
            </div>
          </div>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Week */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="font-semibold text-sdw-navy mb-4">
            {currentWeek
              ? `Week ${currentWeek}: ${currentWeekTitle}`
              : "All tasks completed!"}
          </h3>
          {currentWeekTasks.length > 0 ? (
            <div className="space-y-3">
              {currentWeekTasks.map((task) => {
                const rec = records.find((r) => r.taskId === task._id);
                return (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="text-xs text-sdw-teal font-medium mr-2">
                        {task.taskNumber}.
                      </span>
                      <span className="text-sm text-sdw-navy">{task.title}</span>
                    </div>
                    <StatusBadge status={rec?.status || "pending"} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {pending === 0
                ? "Great work! All phase tasks are done."
                : "No pending tasks in current week."}
            </p>
          )}
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="font-semibold text-sdw-navy mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-sdw-teal" />
            Recent Mentor Feedback
          </h3>
          {recentFeedback.length > 0 ? (
            <div className="space-y-3">
              {recentFeedback.map((rec) => {
                const task = tasks.find((t) => t._id === rec.taskId);
                return (
                  <div key={rec._id} className="bg-teal-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-sdw-teal mb-1">
                      {task?.title}
                    </p>
                    <p className="text-sm text-teal-800">{rec.mentorFeedback}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No feedback yet. Keep working on your tasks!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
