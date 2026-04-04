import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import TaskRecord from "@/models/TaskRecord";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "mentor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const { recordId, mentorFeedback, mentorInitials } = body;

  if (!recordId) {
    return NextResponse.json({ error: "recordId is required" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (mentorFeedback !== undefined) update.mentorFeedback = mentorFeedback;
  if (mentorInitials !== undefined) update.mentorInitials = mentorInitials;

  const record = await TaskRecord.findByIdAndUpdate(
    recordId,
    { $set: update },
    { new: true }
  );

  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}
