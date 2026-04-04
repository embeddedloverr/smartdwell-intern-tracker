import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import TaskRecord from "@/models/TaskRecord";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const { taskId, status, notes } = body;

  if (!taskId || !status) {
    return NextResponse.json({ error: "taskId and status are required" }, { status: 400 });
  }

  const update: Record<string, unknown> = { status, notes: notes || "" };
  if (status === "done") {
    update.completedAt = new Date();
  }

  const record = await TaskRecord.findOneAndUpdate(
    { internId: session.user.id, taskId },
    { $set: update },
    { upsert: true, new: true }
  );

  return NextResponse.json(record);
}
