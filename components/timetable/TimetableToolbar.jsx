"use client";

import { exportToPDF } from "@/lib/timetable/pdfExport";
import { autoBalance } from "@/lib/timetable/autoBalance";

export default function TimetableToolbar({ schedule, setSchedule }) {
  const handleAutoBalance = () => {
    const subjects = schedule.flatMap((d) => d.periods);
    const balanced = autoBalance(subjects);
    setSchedule(balanced);
  };

  const handleSave = async () => {
    localStorage.setItem("timetable-draft", JSON.stringify(schedule));
    alert("Timetable saved locally (offline-safe)");
  };

  return (
    <div className="flex flex-wrap gap-2 justify-between items-center bg-muted p-3 rounded">
      <div className="font-semibold">Timetable Controls</div>

      <div className="flex gap-2">
        <button
          onClick={handleAutoBalance}
          className="px-3 py-1 rounded bg-blue-600 text-white"
        >
          Auto Balance
        </button>

        <button
          onClick={() => exportToPDF(schedule)}
          className="px-3 py-1 rounded bg-green-600 text-white"
        >
          Export PDF
        </button>

        <button
          onClick={handleSave}
          className="px-3 py-1 rounded bg-gray-700 text-white"
        >
          Save Draft
        </button>
      </div>
    </div>
  );
}
