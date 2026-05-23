import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";

// PATCH — update a specific expense
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();

  const expense = await Expense.findOne({
    _id: params.id,
    internId: session.user.id,
  });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (body.date) {
    const date = new Date(body.date);
    date.setUTCHours(0, 0, 0, 0);
    expense.date = date;
  }
  if (body.category !== undefined) expense.category = body.category;
  if (body.description !== undefined) expense.description = body.description;
  if (body.amount !== undefined) expense.amount = Number(body.amount);
  if (body.receiptNote !== undefined) expense.receiptNote = body.receiptNote;

  await expense.save();
  return NextResponse.json(expense);
}

// DELETE — delete a specific expense
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const expense = await Expense.findOneAndDelete({
    _id: params.id,
    internId: session.user.id,
  });

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
