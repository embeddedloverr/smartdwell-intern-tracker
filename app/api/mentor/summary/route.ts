import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import TaskRecord from "@/models/TaskRecord";
import DailyLog from "@/models/DailyLog";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "mentor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const interns = await User.find({ role: "intern", active: true }).select("-passwordHash");
  const totalInterns = interns.length;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasksDoneToday = await TaskRecord.countDocuments({
    status: "done",
    completedAt: { $gte: today, $lt: tomorrow },
  });

  const logsToday = await DailyLog.countDocuments({
    date: { $gte: today, $lt: tomorrow },
  });

  const needsRetryInterns = await TaskRecord.distinct("internId", {
    status: "needs_retry",
  });

  const internDetails = await Promise.all(
    interns.map(async (intern) => {
      const records = await TaskRecord.find({ internId: intern._id });
      const done = records.filter((r) => r.status === "done").length;
      const pending = records.filter((r) => r.status === "pending").length;
      const needsRetry = records.filter((r) => r.status === "needs_retry").length;
      const inProgress = records.filter((r) => r.status === "in_progress").length;
      const lastRecord = await TaskRecord.findOne({ internId: intern._id })
        .sort({ updatedAt: -1 });

      return {
        _id: intern._id,
        name: intern.name,
        email: intern.email,
        phase: intern.phase,
        avatarInitials: intern.avatarInitials,
        joinDate: intern.joinDate,
        tasksDone: done,
        tasksPending: pending + (80 - records.length),
        tasksInProgress: inProgress,
        needsRetry,
        lastActive: lastRecord?.updatedAt || intern.joinDate,
      };
    })
  );

  return NextResponse.json({
    totalInterns,
    tasksDoneToday,
    logsSubmittedToday: logsToday,
    internsWithRetry: needsRetryInterns.length,
    interns: internDetails,
  });
}
