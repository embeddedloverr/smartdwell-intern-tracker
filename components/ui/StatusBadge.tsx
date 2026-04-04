"use client";

const colors: Record<string, string> = {
  pending: "bg-gray-500",
  in_progress: "bg-[#854F0B]",
  done: "bg-[#27500A]",
  needs_retry: "bg-[#A32D2D]",
};

const labels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  needs_retry: "Needs Retry",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${colors[status] || "bg-gray-500"}`}
    >
      {labels[status] || status}
    </span>
  );
}
