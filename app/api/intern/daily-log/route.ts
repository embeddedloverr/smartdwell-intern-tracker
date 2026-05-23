import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DailyLog from "@/models/DailyLog";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();

  const date = new Date(body.date);
  date.setUTCHours(0, 0, 0, 0);

  const log = await DailyLog.findOneAndUpdate(
    { internId: session.user.id, date },
    {
      $set: {
        morningTopic: body.morningTopic || "",
        morningResource: body.morningResource || "",
        morningConcept: body.morningConcept || "",
        morningRevisit: body.morningRevisit || "",
        labTask: body.labTask || "",
        labComponents: body.labComponents || "",
        labSteps: body.labSteps || "",
        labResult: body.labResult || "",
        labError: body.labError || "",
        labResolution: body.labResolution || "",
        mentorTask: body.mentorTask || "",
        mentorTaskStatus: body.mentorTaskStatus || "pending",
        reflection: body.reflection || "",
        gaps: body.gaps || "",
        question: body.question || "",
        confidenceScore: body.confidenceScore || 3,
        travelExpenseAmount: Number(body.travelExpenseAmount) || 0,
        travelExpenseDescription: body.travelExpenseDescription || "",
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json(log);
}
