import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DailyLog from "@/models/DailyLog";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "mentor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const { logId, comment } = body;

  if (!logId || !comment) {
    return NextResponse.json({ error: "logId and comment are required" }, { status: 400 });
  }

  const log = await DailyLog.findOneAndUpdate(
    { _id: logId, internId: params.id },
    { $set: { mentorComment: comment } },
    { new: true }
  );

  if (!log) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  return NextResponse.json(log);
}
