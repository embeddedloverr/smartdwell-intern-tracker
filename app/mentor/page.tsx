"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCard from "@/components/ui/StatsCard";
import { Users, CheckCircle, BookOpen, AlertTriangle, Loader2, Eye, Camera } from "lucide-react";
import { formatIST } from "@/lib/utils";

interface InternSummary {
  _id: string;
  name: string;
  email: string;
  phase: number;
  avatarInitials: string;
  tasksDone: number;
  tasksPending: number;
  tasksInProgress: number;
  needsRetry: number;
  lastActive: string;
}

interface Summary {
  totalInterns: number;
  tasksDoneToday: number;
  logsSubmittedToday: number;
  internsWithRetry: number;
  interns: InternSummary[];
}

export default function MentorDashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState<{ presentCount: number; absentCount: number; lateCount: number; totalInterns: number } | null>(null);

  useEffect(() => {
    fetch("/api/mentor/summary")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));

    fetch("/api/mentor/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "summary" }),
    })
      .then((r) => r.json())
      .then(setAttendanceSummary)
      .catch(() => null);
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const result = await res.json();
      setSeedMsg(result.message || result.error);
    } catch {
      setSeedMsg("Failed to seed");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-sdw-teal" size={32} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-sdw-navy">Dashboard Overview</h2>
        <div className="flex items-center gap-3">
          {seedMsg && <span className="text-sm text-gray-500">{seedMsg}</span>}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-sdw-navy text-white rounded-lg text-sm font-medium hover:bg-sdw-navy/90 disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Seed Tasks"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Interns" value={data.totalInterns} icon={Users} />
        <StatsCard
          title="Tasks Done Today"
          value={data.tasksDoneToday}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatsCard
          title="Logs Today"
          value={data.logsSubmittedToday}
          icon={BookOpen}
          color="text-blue-600"
        />
        <StatsCard
          title="Needs Retry"
          value={data.internsWithRetry}
          icon={AlertTriangle}
          color="text-red-600"
        />
      </div>

      {/* Attendance today summary */}
      {attendanceSummary && (
        <Link href="/mentor/attendance" className="block">
          <div className="bg-white rounded-lg border shadow-sm p-5 flex items-center justify-between hover:border-sdw-teal/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sdw-teal/10 flex items-center justify-center">
                <Camera size={20} className="text-sdw-teal" />
              </div>
              <div>
                <p className="text-sm font-semibold text-sdw-navy">Today&apos;s Attendance</p>
                <p className="text-xs text-gray-400">Click to view selfies &amp; locations →</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-sdw-teal">{attendanceSummary.presentCount}</p>
                <p className="text-xs text-gray-400">Present</p>
              </div>
              <div>
                <p className="text-xl font-bold text-orange-500">{attendanceSummary.lateCount}</p>
                <p className="text-xs text-gray-400">Late</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-500">{attendanceSummary.absentCount}</p>
                <p className="text-xs text-gray-400">Absent</p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Intern Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sdw-navy">Intern Comparison</h3>
        </div>
        {data.interns.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No interns yet. Create intern accounts from the Manage Interns page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Intern</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Phase</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Done</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Pending</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Retry</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Last Active</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.interns.map((intern) => (
                  <tr key={intern._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sdw-teal text-white flex items-center justify-center text-xs font-medium">
                          {intern.avatarInitials}
                        </div>
                        <div>
                          <p className="font-medium text-sdw-navy">{intern.name}</p>
                          <p className="text-xs text-gray-400">{intern.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{intern.phase}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">
                      {intern.tasksDone}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {intern.tasksPending}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {intern.needsRetry > 0 ? (
                        <span className="text-red-600 font-medium">{intern.needsRetry}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {formatIST(intern.lastActive, "dd MMM HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/mentor/intern/${intern._id}`}
                        className="inline-flex items-center gap-1 text-sdw-teal hover:underline text-xs font-medium"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
