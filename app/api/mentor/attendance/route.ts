import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { format } from "date-fns";

// GET — mentor: get all interns' attendance for a date or range
// Query params: date (yyyy-MM-dd) OR month + year OR internId
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "mentor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const internId = searchParams.get("internId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (internId) query.internId = internId;

  if (dateParam) {
    const d = new Date(dateParam);
    d.setUTCHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setUTCHours(23, 59, 59, 999);
    query.date = { $gte: d, $lte: end };
  } else if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  } else {
    // Default: today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);
    query.date = { $gte: today, $lte: todayEnd };
  }

  const records = await Attendance.find(query)
    .select("-selfieBase64")
    .sort({ date: -1, clockIn: 1 })
    .populate("internId", "name email avatarInitials phase");

  return NextResponse.json(records);
}

// GET /api/mentor/attendance/summary — today's summary stats
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "mentor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const body = await req.json();
  const { action } = body;

  if (action === "summary") {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const [totalInterns, todayRecords] = await Promise.all([
      User.countDocuments({ role: "intern", active: true }),
      Attendance.find({ date: { $gte: today, $lte: todayEnd } }).select(
        "status clockOut workingMinutes internId"
      ),
    ]);

    const presentCount = todayRecords.length;
    const clockedOut = todayRecords.filter((r) => r.clockOut).length;
    const lateCount = todayRecords.filter((r) => r.status === "late").length;
    const absentCount = totalInterns - presentCount;

    return NextResponse.json({
      totalInterns,
      presentCount,
      clockedOut,
      lateCount,
      absentCount,
    });
  }

  // Export monthly attendance as CSV
  if (action === "export") {
    const { month, year, internId } = body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = {};
    if (internId) q.internId = internId;
    if (month && year) {
      q.date = {
        $gte: new Date(Number(year), Number(month) - 1, 1),
        $lte: new Date(Number(year), Number(month), 0, 23, 59, 59, 999),
      };
    }

    const records = await Attendance.find(q)
      .select("-selfieBase64")
      .populate("internId", "name email")
      .sort({ date: 1 });

    let csv = "Date,Intern,Email,Status,Clock In,Clock Out,Working Hours,Location\n";
    records.forEach((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const intern = r.internId as any;
      const dateStr = format(new Date(r.date), "dd MMM yyyy");
      const clockInStr = format(new Date(r.clockIn), "HH:mm");
      const clockOutStr = r.clockOut ? format(new Date(r.clockOut), "HH:mm") : "—";
      const hours = r.workingMinutes
        ? `${Math.floor(r.workingMinutes / 60)}h ${r.workingMinutes % 60}m`
        : "—";
      const address = `"${(r.location?.address || "").replace(/"/g, '""')}"`;
      csv += `${dateStr},${intern?.name || ""},${intern?.email || ""},${r.status},${clockInStr},${clockOutStr},${hours},${address}\n`;
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance_${month || "all"}_${year || "time"}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
