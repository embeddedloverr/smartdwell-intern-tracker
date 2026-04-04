"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WeekAccordion from "@/components/ui/WeekAccordion";
import DailyLogForm from "@/components/forms/DailyLogForm";
import ConfidenceChart from "@/components/charts/ConfidenceChart";
import CompletionChart from "@/components/charts/CompletionChart";
import Toast from "@/components/ui/Toast";
import { Loader2, Calendar, MessageSquare, Save } from "lucide-react";
import { formatIST } from "@/lib/utils";

interface Intern {
  _id: string;
  name: string;
  email: string;
  phase: number;
  joinDate: string;
  avatarInitials: string;
}

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

interface TaskRec {
  _id: string;
  taskId: string | { _id: string };
  status: string;
  notes: string;
  mentorFeedback: string;
  mentorInitials: string;
  completedAt: string;
}

interface DailyLogData {
  _id: string;
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
  mentorComment: string;
}

export default function InternDetailPage() {
  const params = useParams();
  const internId = params.id as string;

  const [intern, setIntern] = useState<Intern | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [records, setRecords] = useState<TaskRec[]>([]);
  const [logs, setLogs] = useState<DailyLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"tasks" | "logs" | "charts">("tasks");
  const [selectedLog, setSelectedLog] = useState<DailyLogData | null>(null);
  const [comment, setComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function load() {
      const [internsRes, tasksRes, recsRes, logsRes] = await Promise.all([
        fetch("/api/mentor/interns"),
        fetch(`/api/mentor/intern/${internId}/tasks`),
        fetch(`/api/mentor/intern/${internId}/tasks`),
        fetch(`/api/mentor/intern/${internId}/logs`),
      ]);

      const allInterns = await internsRes.json();
      setIntern(allInterns.find((i: Intern) => i._id === internId) || null);

      const recs: TaskRec[] = await recsRes.json();
      setRecords(recs);

      // We need all tasks for the task view
      // Fetch from seed data via a helper
      const allTasks = await fetch("/api/intern/tasks").then(async (r) => {
        // This won't work for mentor — let's use the task records which have populated taskId
        return [];
      });
      // Actually parse populated task records
      const populatedRecs = await tasksRes.json();
      const taskMap = new Map<string, Task>();
      populatedRecs.forEach((rec: { taskId: Task | string }) => {
        if (typeof rec.taskId === "object" && rec.taskId) {
          const t = rec.taskId as Task;
          taskMap.set(t._id, t);
        }
      });
      setTasks(Array.from(taskMap.values()));

      setLogs(await logsRes.json());
      setLoading(false);
    }
    load();
  }, [internId]);

  // We need ALL tasks, not just ones with records. Let's fetch them separately.
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  useEffect(() => {
    fetch("/api/seed", { method: "GET" }).catch(() => {});
    // Fetch tasks from the seed route — actually we need a public tasks route
    // Let's use the existing structure and add a mentor tasks route
    async function loadAllTasks() {
      // Use the tasks endpoint — but it requires intern role
      // We'll rely on the populated records for now and show only tasks that have records
      // For a complete view, we can fetch directly from DB
      const res = await fetch(`/api/mentor/intern/${internId}/all-tasks`);
      if (res.ok) {
        setAllTasks(await res.json());
      }
    }
    loadAllTasks();
  }, [internId]);

  const handleMentorFeedback = async (
    recordId: string,
    feedback: string,
    initials: string
  ) => {
    try {
      const res = await fetch("/api/mentor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, mentorFeedback: feedback, mentorInitials: initials }),
      });
      if (!res.ok) throw new Error();
      setToast({ message: "Feedback saved!", type: "success" });
    } catch {
      setToast({ message: "Failed to save feedback", type: "error" });
    }
  };

  const handleLogComment = async () => {
    if (!selectedLog || !comment) return;
    setSavingComment(true);
    try {
      const res = await fetch(`/api/mentor/intern/${internId}/log-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: selectedLog._id, comment }),
      });
      if (!res.ok) throw new Error();
      setSelectedLog({ ...selectedLog, mentorComment: comment });
      setToast({ message: "Comment saved!", type: "success" });
    } catch {
      setToast({ message: "Failed to save comment", type: "error" });
    } finally {
      setSavingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-sdw-teal" size={32} />
      </div>
    );
  }

  if (!intern) {
    return <div className="text-center text-gray-500 py-12">Intern not found</div>;
  }

  const displayTasks = allTasks.length > 0 ? allTasks : tasks;
  const totalDone = records.filter((r) => r.status === "done").length;
  const overallPct = displayTasks.length > 0 ? Math.round((totalDone / 80) * 100) : 0;

  // Normalize records for WeekAccordion
  const normalizedRecords = records.map((r) => ({
    _id: r._id,
    taskId: typeof r.taskId === "object" ? (r.taskId as Task)._id : r.taskId,
    status: r.status,
    notes: r.notes,
    mentorFeedback: r.mentorFeedback,
    mentorInitials: r.mentorInitials,
  }));

  // Phase completion data
  const phaseData = [1, 2, 3, 4].map((p) => {
    const pTasks = displayTasks.filter((t) => t.phase === p);
    const done = pTasks.filter((t) =>
      records.find((r) => {
        const rid = typeof r.taskId === "object" ? (r.taskId as Task)._id : r.taskId;
        return rid === t._id && r.status === "done";
      })
    ).length;
    return { name: `Phase ${p}`, done, total: pTasks.length || 20 };
  });

  const confidenceData = logs
    .filter((l) => l.confidenceScore)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((l) => ({
      date: formatIST(l.date, "dd MMM"),
      score: l.confidenceScore,
    }));

  const weeks = [...new Set(displayTasks.map((t) => t.week))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sdw-teal text-white flex items-center justify-center text-xl font-semibold">
            {intern.avatarInitials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-sdw-navy">{intern.name}</h2>
            <p className="text-sm text-gray-500">
              Phase {intern.phase} &middot; Joined {formatIST(intern.joinDate, "dd MMM yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-sdw-teal">{overallPct}%</p>
            <p className="text-xs text-gray-500">Overall Completion</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["tasks", "logs", "charts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-sdw-teal text-sdw-teal"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "tasks" ? "Task Progress" : t === "logs" ? "Daily Logs" : "Progress Charts"}
          </button>
        ))}
      </div>

      {/* Task Progress Tab */}
      {tab === "tasks" && (
        <div className="space-y-3">
          {weeks.map((week) => {
            const weekTasks = displayTasks.filter((t) => t.week === week);
            const weekTitle = weekTasks[0]?.weekTitle || "";
            const weekRecords = normalizedRecords.filter((r) =>
              weekTasks.some((t) => t._id === r.taskId)
            );

            return (
              <WeekAccordion
                key={week}
                week={week}
                weekTitle={weekTitle}
                tasks={weekTasks}
                records={weekRecords}
                mentorMode
                onMentorFeedback={handleMentorFeedback}
              />
            );
          })}
          {weeks.length === 0 && (
            <div className="text-center text-gray-400 py-12 text-sm">
              No task data available. Make sure tasks are seeded.
            </div>
          )}
        </div>
      )}

      {/* Daily Logs Tab */}
      {tab === "logs" && (
        <div className="space-y-4">
          {selectedLog ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="text-sm text-sdw-teal hover:underline"
              >
                &larr; Back to log list
              </button>
              <DailyLogForm
                date={selectedLog.date.split("T")[0]}
                initialData={selectedLog}
                onSubmit={async () => {}}
                readOnly
                mentorComment={selectedLog.mentorComment}
              />
              <div className="bg-white rounded-lg border p-4">
                <h4 className="text-sm font-semibold text-sdw-navy mb-2 flex items-center gap-2">
                  <MessageSquare size={16} className="text-sdw-teal" />
                  Mentor Comment
                </h4>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Add your comment on this daily log..."
                  className="w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sdw-teal/50 resize-none mb-2"
                />
                <button
                  onClick={handleLogComment}
                  disabled={savingComment}
                  className="flex items-center gap-2 bg-sdw-teal text-white px-4 py-2 rounded text-sm font-medium hover:bg-sdw-teal/90 disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingComment ? "Saving..." : "Save Comment"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {logs.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-sm">
                  No daily logs submitted yet.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {logs.map((log) => (
                    <button
                      key={log._id}
                      onClick={() => {
                        setSelectedLog(log);
                        setComment(log.mentorComment || "");
                      }}
                      className="bg-white rounded-lg border p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-sdw-teal" />
                        <span className="font-medium text-sdw-navy text-sm">
                          {formatIST(log.date, "EEEE, dd MMM yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Confidence: {log.confidenceScore}/5</span>
                        {log.mentorComment && (
                          <span className="text-sdw-teal">Has comment</span>
                        )}
                      </div>
                      {log.morningTopic && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          Topic: {log.morningTopic}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Charts Tab */}
      {tab === "charts" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-sdw-navy mb-4">Phase Completion</h3>
            <CompletionChart data={phaseData} />
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-sdw-navy mb-4">Confidence Score Trend</h3>
            <ConfidenceChart data={confidenceData} />
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
