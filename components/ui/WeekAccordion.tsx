"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import TaskCard from "./TaskCard";

interface Task {
  _id: string;
  taskNumber: number;
  title: string;
  description: string;
  selfCheck: string;
}

interface Record {
  _id?: string;
  taskId: string;
  status: string;
  notes: string;
  mentorFeedback?: string;
  mentorInitials?: string;
}

interface WeekAccordionProps {
  week: number;
  weekTitle: string;
  tasks: Task[];
  records: Record[];
  locked?: boolean;
  onSave?: (taskId: string, status: string, notes: string) => Promise<void>;
  mentorMode?: boolean;
  onMentorFeedback?: (recordId: string, feedback: string, initials: string) => Promise<void>;
  defaultOpen?: boolean;
}

export default function WeekAccordion({
  week,
  weekTitle,
  tasks,
  records,
  locked,
  onSave,
  mentorMode,
  onMentorFeedback,
  defaultOpen = false,
}: WeekAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const doneCount = tasks.filter((t) => {
    const r = records.find((rec) => rec.taskId === t._id);
    return r?.status === "done";
  }).length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown size={20} className="text-gray-400" />
          ) : (
            <ChevronRight size={20} className="text-gray-400" />
          )}
          <div className="text-left">
            <span className="text-sm font-semibold text-sdw-navy">
              Week {week}: {weekTitle}
            </span>
            <span className="ml-3 text-xs text-gray-400">
              {doneCount}/{tasks.length} done
            </span>
          </div>
        </div>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sdw-teal rounded-full transition-all"
            style={{ width: `${(doneCount / tasks.length) * 100}%` }}
          />
        </div>
      </button>

      {open && (
        <div className="p-4 bg-gray-50 space-y-4 border-t">
          {tasks
            .sort((a, b) => a.taskNumber - b.taskNumber)
            .map((task) => {
              const record = records.find((r) => r.taskId === task._id);
              return (
                <TaskCard
                  key={task._id}
                  task={task}
                  record={record}
                  locked={locked}
                  onSave={onSave}
                  mentorMode={mentorMode}
                  onMentorFeedback={onMentorFeedback}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
