import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Expense from "@/models/Expense";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || !user.canDownloadExpenses) {
    return NextResponse.json(
      { error: "Forbidden: Download not allowed. Please ask your mentor to enable this." },
      { status: 403 }
    );
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

  const expenses = await Expense.find(query).sort({ date: 1 });

  // Group by category for summary
  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;

  let csvContent = `Expense Report - ${user.name}\n`;
  csvContent += `Generated: ${format(new Date(), "dd MMM yyyy HH:mm")}\n`;
  if (month && year) {
    csvContent += `Period: ${format(new Date(Number(year), Number(month) - 1, 1), "MMMM yyyy")}\n`;
  } else {
    csvContent += `Period: All Time\n`;
  }
  csvContent += `\n`;
  csvContent += `Date,Category,Description,Amount (INR),Receipt Note\n`;

  expenses.forEach((exp) => {
    const formattedDate = format(new Date(exp.date), "dd MMM yyyy");
    const description = `"${(exp.description || "").replace(/"/g, '""')}"`;
    const receiptNote = `"${(exp.receiptNote || "").replace(/"/g, '""')}"`;
    const category = exp.category.charAt(0).toUpperCase() + exp.category.slice(1);
    csvContent += `${formattedDate},${category},${description},${exp.amount},${receiptNote}\n`;
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    grandTotal += exp.amount;
  });

  csvContent += `\n--- Summary by Category ---\n`;
  csvContent += `Category,Total (INR)\n`;
  Object.entries(categoryTotals).forEach(([cat, total]) => {
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    csvContent += `${label},${total}\n`;
  });
  csvContent += `\nGrand Total,${grandTotal}\n`;

  const periodStr = month && year ? `${month}_${year}` : "all_time";
  const filename = `expenses_${user.name.replace(/\s+/g, "_")}_${periodStr}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
