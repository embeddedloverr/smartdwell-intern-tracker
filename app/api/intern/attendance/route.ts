import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

// GET — fetch intern's own attendance (filterable by month/year)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { internId: session.user.id };

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  // Exclude heavy selfie base64 from list view to keep response small
  const records = await Attendance.find(query)
    .select("-selfieBase64")
    .sort({ date: -1 });

  return NextResponse.json(records);
}

// POST — clock in (creates today's attendance record)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const body = await req.json();
  const { selfieBase64, location } = body;

  if (!selfieBase64 || !location?.lat || !location?.lng) {
    return NextResponse.json(
      { error: "Selfie and location are required to clock in." },
      { status: 400 }
    );
  }

  const now = new Date();
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);

  // Check already clocked in today
  const existing = await Attendance.findOne({
    internId: session.user.id,
    date: today,
  });
  if (existing) {
    return NextResponse.json(
      { error: "Already clocked in today." },
      { status: 409 }
    );
  }

  // Determine status: after 9:30 AM IST = late
  const istHour = now.getUTCHours() + 5;
  const istMinute = now.getUTCMinutes() + 30;
  const totalMinutesIST = istHour * 60 + istMinute;
  const lateThreshold = 9 * 60 + 30; // 9:30 AM IST
  const status = totalMinutesIST > lateThreshold ? "late" : "present";

  const record = await Attendance.create({
    internId: session.user.id,
    date: today,
    clockIn: now,
    selfieBase64,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address || "",
    },
    status,
  });

  // Return without selfie to keep response light
  const result = record.toObject();
  result.selfieBase64 = "[captured]";
  return NextResponse.json(result, { status: 201 });
}
