import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const phase = req.nextUrl.searchParams.get("phase");
  const filter = phase ? { phase: Number(phase) } : {};
  const tasks = await Task.find(filter).sort({ phase: 1, week: 1, taskNumber: 1 });

  return NextResponse.json(tasks);
}
