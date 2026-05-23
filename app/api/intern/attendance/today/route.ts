import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

// GET — fetch today's attendance for the intern (including selfie)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const record = await Attendance.findOne({
    internId: session.user.id,
    date: today,
  });

  return NextResponse.json(record || null);
}

// PATCH — clock out
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const record = await Attendance.findOne({
    internId: session.user.id,
    date: today,
  });

  if (!record) {
    return NextResponse.json({ error: "No clock-in found for today." }, { status: 404 });
  }

  if (record.clockOut) {
    return NextResponse.json({ error: "Already clocked out." }, { status: 409 });
  }

  const now = new Date();
  const workingMinutes = Math.round(
    (now.getTime() - record.clockIn.getTime()) / 60000
  );

  // Half day if less than 4 hours
  const status = workingMinutes < 240 ? "half-day" : record.status;

  record.clockOut = now;
  record.workingMinutes = workingMinutes;
  record.status = status;
  await record.save();

  const result = record.toObject();
  result.selfieBase64 = "[captured]";
  return NextResponse.json(result);
}
