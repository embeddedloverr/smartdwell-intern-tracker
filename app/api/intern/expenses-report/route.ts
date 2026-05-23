import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import DailyLog from "@/models/DailyLog";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "intern") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user || !user.canDownloadExpenses) {
    return NextResponse.json({ error: "Forbidden: Download not allowed" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  let query: any = { internId: session.user.id };

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  const logs = await DailyLog.find(query).sort({ date: 1 });

  let csvContent = "Date,Amount (INR),Description\n";
  let totalAmount = 0;

  logs.forEach(log => {
    if (log.travelExpenseAmount > 0) {
      const formattedDate = format(new Date(log.date), "yyyy-MM-dd");
      // Escape description if it contains commas
      const description = `"${(log.travelExpenseDescription || "").replace(/"/g, '""')}"`;
      csvContent += `${formattedDate},${log.travelExpenseAmount},${description}\n`;
      totalAmount += log.travelExpenseAmount;
    }
  });

  csvContent += `\nTotal,${totalAmount},\n`;

  const filename = `travel_expenses_${user.name.replace(/\s+/g, "_")}_${month || 'all'}_${year || 'time'}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
