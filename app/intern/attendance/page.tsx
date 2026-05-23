"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  LogIn,
  LogOut,
  Loader2,
  AlertCircle,
  X,
  Calendar,
  ChevronDown,
  Timer,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Toast from "@/components/ui/Toast";

interface AttendanceRecord {
  _id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  workingMinutes?: number;
  location: { lat: number; lng: number; address: string };
  status: "present" | "half-day" | "late";
}

const STATUS_STYLE = {
  present:  { bg: "bg-green-100",  text: "text-green-700",  label: "Present"  },
  half_day: { bg: "bg-amber-100",  text: "text-amber-700",  label: "Half Day" },
  late:     { bg: "bg-orange-100", text: "text-orange-700", label: "Late"     },
};

const now = new Date();

export default function AttendancePage() {
  /* ─── Today state ─── */
  const [today, setToday] = useState<AttendanceRecord | null | "loading">("loading");
  const [clockedIn, setClockedIn] = useState(false);
  const [clockedOut, setClockedOut] = useState(false);

  /* ─── Camera / capture state ─── */
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* ─── History state ─── */
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear,  setFilterYear]  = useState(now.getFullYear());

  /* ─── Submission ─── */
  const [submitting, setSubmitting] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  /* ─── Live clock ─── */
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ─── Load today's record ─── */
  const loadToday = useCallback(async () => {
    setToday("loading");
    const res = await fetch("/api/intern/attendance/today");
    const data = await res.json();
    setToday(data);
    if (data) {
      setClockedIn(true);
      setClockedOut(!!data.clockOut);
    }
  }, []);

  useEffect(() => { loadToday(); }, [loadToday]);

  /* ─── Load history ─── */
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const res = await fetch(`/api/intern/attendance?month=${filterMonth}&year=${filterYear}`);
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
    setHistoryLoading(false);
  }, [filterMonth, filterYear]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  /* ─── Camera ─── */
  const openCamera = async () => {
    setCameraError("");
    setCapturedImage(null);
    setLocation(null);
    setLocationError("");
    setCameraOpen(true);

    // Get geolocation simultaneously
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const geoData = await geo.json();
          if (geoData?.display_name) address = geoData.display_name;
        } catch { /* use coordinates as fallback */ }
        setLocation({ lat, lng, address });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location permission denied. Please allow access and try again."
            : "Could not get your location. Please try again."
        );
        setLocationLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );

    // Start camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permission and try again.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width  = 480;
    canvas.height = 360;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(videoRef.current, 0, 0, 480, 360);
    const base64 = canvas.toDataURL("image/jpeg", 0.65);
    setCapturedImage(base64);
    // Stop camera stream after capture
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const retakePhoto = async () => {
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("Could not restart camera.");
    }
  };

  /* ─── Clock In ─── */
  const handleClockIn = async () => {
    if (!capturedImage) return;
    if (!location) {
      setToast({ message: "Waiting for location…", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/intern/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieBase64: capturedImage, location }),
      });
      if (res.status === 409) {
        setToast({ message: "Already clocked in today!", type: "error" });
        stopCamera();
        loadToday();
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      setToast({ message: "Clocked in successfully! 🎉", type: "success" });
      stopCamera();
      loadToday();
      loadHistory();
    } catch (e: unknown) {
      setToast({ message: (e as Error).message || "Failed to clock in.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Clock Out ─── */
  const handleClockOut = async () => {
    if (!confirm("Confirm clock out?")) return;
    setClockingOut(true);
    try {
      const res = await fetch("/api/intern/attendance/today", { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to clock out");
      setToast({ message: "Clocked out. Have a great day! 👋", type: "success" });
      loadToday();
      loadHistory();
    } catch {
      setToast({ message: "Failed to clock out.", type: "error" });
    } finally {
      setClockingOut(false);
    }
  };

  const fmtMins = (mins: number) =>
    `${Math.floor(mins / 60)}h ${mins % 60}m`;

  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  /* ─── Attendance summary ─── */
  const totalDays  = history.length;
  const presentDays  = history.filter((r) => r.status === "present").length;
  const lateDays     = history.filter((r) => r.status === "late").length;
  const halfDays     = history.filter((r) => r.status === "half-day").length;
  const totalMins    = history.reduce((s, r) => s + (r.workingMinutes || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with live clock */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-sdw-navy flex items-center gap-2">
            <Camera size={22} className="text-sdw-teal" />
            Attendance
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(liveTime, "EEEE, dd MMMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-sdw-navy text-white px-4 py-2 rounded-lg">
          <Clock size={16} />
          <span className="font-mono text-lg font-semibold tracking-wider">
            {format(liveTime, "HH:mm:ss")}
          </span>
        </div>
      </div>

      {/* Today's status card */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sdw-navy to-sdw-teal p-5 text-white">
          <p className="text-xs text-white/60 mb-1">Today&apos;s Status</p>
          {today === "loading" ? (
            <div className="flex items-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : today === null ? (
            <p className="text-lg font-semibold">Not Clocked In Yet</p>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-lg font-semibold capitalize">{today.status.replace("-", " ")}</p>
                <p className="text-sm text-white/70">
                  In: {format(new Date(today.clockIn), "hh:mm a")}
                  {today.clockOut && ` · Out: ${format(new Date(today.clockOut), "hh:mm a")}`}
                </p>
                {today.workingMinutes && (
                  <p className="text-xs text-white/60 mt-0.5">
                    {fmtMins(today.workingMinutes)} worked
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs bg-white/20 px-3 py-1.5 rounded-full">
                <MapPin size={12} />
                <span className="truncate max-w-48">{today.location?.address?.split(",")[0]}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 flex gap-3 flex-wrap">
          {!clockedIn ? (
            <button
              onClick={openCamera}
              className="flex items-center gap-2 bg-sdw-teal text-white px-6 py-2.5 rounded-lg font-medium hover:bg-sdw-teal/90 transition-colors"
            >
              <LogIn size={18} />
              Clock In with Selfie
            </button>
          ) : !clockedOut ? (
            <button
              onClick={handleClockOut}
              disabled={clockingOut}
              className="flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <LogOut size={18} />
              {clockingOut ? "Clocking out…" : "Clock Out"}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle size={18} />
              All done for today!
            </div>
          )}
          {clockedIn && !clockedOut && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-lg">
              <Timer size={16} className="text-sdw-teal" />
              {today !== "loading" && today?.clockIn && (
                <span>Working for {formatDistanceToNow(new Date(today.clockIn))}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-sdw-navy flex items-center gap-2">
                <Camera size={18} className="text-sdw-teal" />
                Take Selfie to Clock In
              </h3>
              <button onClick={stopCamera} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Camera error */}
              {cameraError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {cameraError}
                </div>
              )}

              {/* Video / Captured image */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured selfie"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover mirror"
                    style={{ transform: "scaleX(-1)" }}
                  />
                )}
                {/* Status overlay */}
                {capturedImage && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ✓ Captured
                  </div>
                )}
              </div>

              {/* Location status */}
              <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-gray-50 border">
                <MapPin size={16} className={`mt-0.5 shrink-0 ${locationLoading ? "text-gray-400" : location ? "text-sdw-teal" : "text-red-400"}`} />
                {locationLoading ? (
                  <span className="text-gray-500 flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Detecting location…
                  </span>
                ) : locationError ? (
                  <span className="text-red-600">{locationError}</span>
                ) : location ? (
                  <span className="text-gray-700 text-xs leading-relaxed">{location.address}</span>
                ) : null}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {!capturedImage ? (
                  <button
                    onClick={capturePhoto}
                    disabled={!!cameraError}
                    className="flex-1 flex items-center justify-center gap-2 bg-sdw-teal text-white py-3 rounded-xl font-semibold hover:bg-sdw-teal/90 disabled:opacity-40 transition-colors"
                  >
                    <Camera size={20} />
                    Capture
                  </button>
                ) : (
                  <>
                    <button
                      onClick={retakePhoto}
                      className="flex items-center gap-2 border px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <RefreshCw size={16} />
                      Retake
                    </button>
                    <button
                      onClick={handleClockIn}
                      disabled={submitting || !location || locationLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-sdw-navy text-white py-3 rounded-xl font-semibold hover:bg-sdw-navy/90 disabled:opacity-40 transition-colors"
                    >
                      {submitting ? (
                        <><Loader2 size={18} className="animate-spin" /> Clocking In…</>
                      ) : (
                        <><LogIn size={18} /> Confirm Clock In</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly summary cards */}
      {!historyLoading && history.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-sdw-navy text-white rounded-xl p-4">
            <p className="text-xs text-white/50 mb-1">Total Days</p>
            <p className="text-3xl font-bold">{totalDays}</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">On Time</p>
            <p className="text-3xl font-bold text-green-600">{presentDays}</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Late</p>
            <p className="text-3xl font-bold text-orange-500">{lateDays}</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Total Hours</p>
            <p className="text-3xl font-bold text-sdw-teal">{Math.floor(totalMins / 60)}h</p>
            {halfDays > 0 && <p className="text-xs text-amber-500 mt-0.5">{halfDays} half day{halfDays > 1 ? "s" : ""}</p>}
          </div>
        </div>
      )}

      {/* History table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-3 flex-wrap">
          <Calendar size={16} className="text-sdw-teal" />
          <span className="text-sm font-semibold text-sdw-navy">History</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(Number(e.target.value))}
                className="border rounded-lg px-3 py-1.5 text-sm pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
              >
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="border rounded-lg px-3 py-1.5 text-sm pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-sdw-teal" size={28} />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
            <Calendar size={32} className="opacity-30" />
            <p className="text-sm">No attendance records this month.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Clock In</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Clock Out</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Hours</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs hidden md:table-cell">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((r) => {
                  const st = STATUS_STYLE[r.status as keyof typeof STATUS_STYLE] || STATUS_STYLE.present;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sdw-navy font-medium whitespace-nowrap">
                        {format(new Date(r.date), "EEE, dd MMM")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {format(new Date(r.clockIn), "hh:mm a")}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {r.clockOut ? format(new Date(r.clockOut), "hh:mm a") : <span className="text-amber-500">Active</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-sdw-teal whitespace-nowrap">
                        {r.workingMinutes ? fmtMins(r.workingMinutes) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell max-w-48 truncate">
                        {r.location?.address?.split(",")[0] || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
