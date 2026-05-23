"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronDown,
  MapPin,
  Camera,
  Download,
  X,
  LogOut,
  Timer,
} from "lucide-react";
import { format } from "date-fns";
import Toast from "@/components/ui/Toast";

interface AttendanceRecord {
  _id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  workingMinutes?: number;
  location: { lat: number; lng: number; address: string };
  status: "present" | "half-day" | "late";
  internId: {
    _id: string;
    name: string;
    email: string;
    avatarInitials: string;
    phase: number;
  };
}

interface Summary {
  totalInterns: number;
  presentCount: number;
  clockedOut: number;
  lateCount: number;
  absentCount: number;
}

interface Intern {
  _id: string;
  name: string;
  email: string;
  avatarInitials: string;
  phase: number;
}

const STATUS_STYLE = {
  present:  { bg: "bg-green-100",  text: "text-green-700",  label: "Present"  },
  "half-day": { bg: "bg-amber-100",  text: "text-amber-700",  label: "Half Day" },
  late:     { bg: "bg-orange-100", text: "text-orange-700", label: "Late"     },
  absent:   { bg: "bg-red-100",    text: "text-red-600",    label: "Absent"   },
};

const now = new Date();
const months = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

export default function MentorAttendancePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Filters
  const [viewMode, setViewMode] = useState<"today" | "month">("today");
  const [filterDate, setFilterDate] = useState(format(now, "yyyy-MM-dd"));
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterIntern, setFilterIntern] = useState("all");

  // Selfie lightbox
  const [selfieLoading, setSelfieLoading] = useState(false);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [selfieIntern, setSelfieIntern] = useState<string>("");

  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load interns list for filter dropdown
  useEffect(() => {
    fetch("/api/mentor/interns")
      .then((r) => r.json())
      .then(setInterns);
  }, []);

  // Load summary (today always)
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    const res = await fetch("/api/mentor/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "summary" }),
    });
    const data = await res.json();
    setSummary(data);
    setSummaryLoading(false);
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  // Load records
  const loadRecords = useCallback(async () => {
    setLoading(true);
    let url = "/api/mentor/attendance?";
    if (viewMode === "today") {
      url += `date=${filterDate}`;
    } else {
      url += `month=${filterMonth}&year=${filterYear}`;
    }
    if (filterIntern !== "all") url += `&internId=${filterIntern}`;

    const res = await fetch(url);
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [viewMode, filterDate, filterMonth, filterYear, filterIntern]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  // Open selfie lightbox
  const viewSelfie = async (recordId: string, internName: string) => {
    setSelfieIntern(internName);
    setSelfieData(null);
    setSelfieLoading(true);
    const res = await fetch(`/api/intern/attendance/${recordId}`);
    const data = await res.json();
    setSelfieData(data.selfieBase64 || null);
    setSelfieLoading(false);
  };

  // Export CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const body: Record<string, unknown> = { action: "export" };
      if (filterIntern !== "all") body.internId = filterIntern;
      if (viewMode === "month") {
        body.month = filterMonth;
        body.year = filterYear;
      }
      const res = await fetch("/api/mentor/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${viewMode === "month" ? `${filterMonth}_${filterYear}` : filterDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setToast({ message: "Export failed.", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const fmtMins = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

  // Build "absent" interns for today view
  const presentInternIds = new Set(records.map((r) => r.internId?._id));
  const absentInterns = viewMode === "today"
    ? interns.filter((i) => !presentInternIds.has(i._id))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-sdw-navy flex items-center gap-2">
            <Camera size={22} className="text-sdw-teal" />
            Attendance Tracker
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Monitor intern attendance, selfies & locations</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 border border-sdw-teal text-sdw-teal px-4 py-2 rounded-lg text-sm font-medium hover:bg-sdw-teal hover:text-white transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {/* Summary stats (always today) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryLoading ? (
          <div className="col-span-5 flex justify-center py-4">
            <Loader2 className="animate-spin text-sdw-teal" size={24} />
          </div>
        ) : summary ? (
          <>
            <div className="bg-sdw-navy text-white rounded-xl p-4 flex flex-col gap-1">
              <p className="text-xs text-white/50">Total Interns</p>
              <p className="text-3xl font-bold">{summary.totalInterns}</p>
            </div>
            <div className="bg-white border rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-gray-400"><Users size={12} />Present</div>
              <p className="text-3xl font-bold text-sdw-teal">{summary.presentCount}</p>
            </div>
            <div className="bg-white border rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-gray-400"><CheckCircle size={12} />Clocked Out</div>
              <p className="text-3xl font-bold text-green-600">{summary.clockedOut}</p>
            </div>
            <div className="bg-white border rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} />Late</div>
              <p className="text-3xl font-bold text-orange-500">{summary.lateCount}</p>
            </div>
            <div className="bg-white border rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-gray-400"><AlertCircle size={12} />Absent</div>
              <p className="text-3xl font-bold text-red-500">{summary.absentCount}</p>
            </div>
          </>
        ) : null}
      </div>

      {/* Filter bar */}
      <div className="bg-white border rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border overflow-hidden text-sm">
          <button
            onClick={() => setViewMode("today")}
            className={`px-4 py-1.5 font-medium transition-colors ${viewMode === "today" ? "bg-sdw-teal text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            By Date
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-1.5 font-medium transition-colors ${viewMode === "month" ? "bg-sdw-teal text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            By Month
          </button>
        </div>

        {viewMode === "today" ? (
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
          />
        ) : (
          <>
            <div className="relative">
              <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}
                className="border rounded-lg px-3 py-1.5 text-sm pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-sdw-teal/50">
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}
                className="border rounded-lg px-3 py-1.5 text-sm pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-sdw-teal/50">
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </>
        )}

        <div className="relative">
          <select value={filterIntern} onChange={(e) => setFilterIntern(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-sdw-teal/50">
            <option value="all">All Interns</option>
            {interns.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Attendance records table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <Calendar size={16} className="text-sdw-teal" />
          <span className="text-sm font-semibold text-sdw-navy">
            {viewMode === "today"
              ? format(new Date(filterDate + "T00:00:00"), "EEEE, dd MMMM yyyy")
              : `${months[filterMonth - 1]} ${filterYear}`}
          </span>
          {!loading && (
            <span className="ml-auto text-xs text-gray-400">{records.length} record{records.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-sdw-teal" size={28} />
          </div>
        ) : records.length === 0 && absentInterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <Camera size={36} className="opacity-20" />
            <p className="text-sm">No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Intern</th>
                  {viewMode === "month" && (
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Date</th>
                  )}
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Clock In</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Clock Out</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Hours</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs hidden lg:table-cell">Location</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs">Selfie</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((r) => {
                  const st = STATUS_STYLE[r.status] || STATUS_STYLE.present;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-sdw-teal text-white flex items-center justify-center text-xs font-semibold shrink-0">
                            {r.internId?.avatarInitials}
                          </div>
                          <div>
                            <p className="font-medium text-sdw-navy text-xs">{r.internId?.name}</p>
                            <p className="text-gray-400 text-xs">Phase {r.internId?.phase}</p>
                          </div>
                        </div>
                      </td>
                      {viewMode === "month" && (
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                          {format(new Date(r.date), "EEE, dd MMM")}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {format(new Date(r.clockIn), "hh:mm a")}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {r.clockOut ? (
                          <span className="text-gray-600">{format(new Date(r.clockOut), "hh:mm a")}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Timer size={12} className="animate-pulse" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sdw-teal font-medium text-xs whitespace-nowrap">
                        {r.workingMinutes ? fmtMins(r.workingMinutes) : "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-start gap-1 text-xs text-gray-400 max-w-48">
                          <MapPin size={12} className="shrink-0 mt-0.5 text-sdw-teal" />
                          <span className="truncate">{r.location?.address?.split(",")[0] || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => viewSelfie(r._id, r.internId?.name)}
                          className="inline-flex items-center gap-1 text-xs text-sdw-teal hover:underline font-medium"
                        >
                          <Camera size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Absent interns (only in today view) */}
                {absentInterns.map((intern) => (
                  <tr key={`absent-${intern._id}`} className="bg-red-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold shrink-0">
                          {intern.avatarInitials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-500 text-xs">{intern.name}</p>
                          <p className="text-gray-400 text-xs">Phase {intern.phase}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">Absent</span>
                    </td>
                    <td colSpan={5} className="px-4 py-3 text-xs text-gray-400 italic">Not clocked in</td>
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selfie lightbox */}
      {(selfieLoading || selfieData !== null) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <p className="font-semibold text-sdw-navy text-sm">{selfieIntern}</p>
                <p className="text-xs text-gray-400">Clock-in Selfie</p>
              </div>
              <button onClick={() => setSelfieData(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
              {selfieLoading ? (
                <Loader2 className="animate-spin text-sdw-teal" size={32} />
              ) : selfieData && selfieData !== "[captured]" ? (
                <img src={selfieData} alt="Selfie" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-sm text-center p-6">
                  <Camera size={32} className="mx-auto mb-2 opacity-30" />
                  No selfie available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Absent today detail panel */}
      {viewMode === "today" && !loading && absentInterns.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <LogOut size={16} />
            {absentInterns.length} Intern{absentInterns.length > 1 ? "s" : ""} Not Present Today
          </p>
          <div className="flex flex-wrap gap-2">
            {absentInterns.map((i) => (
              <span key={i._id} className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-full">
                <span className="font-medium">{i.name}</span>
                <span className="text-red-400">· Phase {i.phase}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
