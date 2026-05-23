import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "mentor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (body.phase) update.phase = body.phase;
  if (body.active !== undefined) update.active = body.active;
  if (body.canDownloadExpenses !== undefined) update.canDownloadExpenses = body.canDownloadExpenses;
  if (body.password) {
    update.passwordHash = await bcrypt.hash(body.password, 12);
  }

  const intern = await User.findByIdAndUpdate(params.id, { $set: update }, { new: true }).select(
    "-passwordHash"
  );

  if (!intern) {
    return NextResponse.json({ error: "Intern not found" }, { status: 404 });
  }

  return NextResponse.json(intern);
}
