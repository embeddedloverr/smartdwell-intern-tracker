import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";

// GET — list all expenses for the logged-in intern
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || !user.expensesEnabled) {
    return NextResponse.json({ error: "Expenses feature is not enabled for your account." }, { status: 403 });
  }

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

  const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
  return NextResponse.json(expenses);
}

// POST — create a new expense
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || !user.expensesEnabled) {
    return NextResponse.json({ error: "Expenses feature is not enabled for your account." }, { status: 403 });
  }

  const body = await req.json();

  if (!body.date || !body.description || body.amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const date = new Date(body.date);
  date.setUTCHours(0, 0, 0, 0);

  const expense = await Expense.create({
    internId: session.user.id,
    date,
    category: body.category || "travel",
    description: body.description,
    amount: Number(body.amount),
    receiptNote: body.receiptNote || "",
  });

  return NextResponse.json(expense, { status: 201 });
}
