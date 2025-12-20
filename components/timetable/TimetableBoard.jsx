"use client";

import PeriodCard from "./PeriodCard";

export default function TimetableBoard({
  schedule,
  setSchedule,
  clashes = [],
}) {
  const onDragStart = (e, fromDay, fromIdx) => {
    e.dataTransfer.setData("slot", JSON.stringify({ fromDay, fromIdx }));
  };

  const onDrop = (e, toDay) => {
    const { fromDay, fromIdx } = JSON.parse(e.dataTransfer.getData("slot"));

    const updated = structuredClone(schedule);
    const item = updated[fromDay].periods[fromIdx];

    updated[fromDay].periods.splice(fromIdx, 1);
    updated[toDay].periods.push(item);

    setSchedule(updated);
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {schedule.map((day, dIdx) => (
        <div
          key={day.day}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, dIdx)}
          className="border rounded p-2 min-h-[180px]"
        >
          <div className="font-semibold mb-2">{day.day}</div>

          <div className="space-y-1">
            {day.periods.map((p, i) => (
              <PeriodCard
                key={i}
                period={p}
                dayIndex={dIdx}
                periodIndex={i}
                onDragStart={onDragStart}
                isClash={clashes.some(
                  (c) => c.teacher === p.teacher && c.time === p.time
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
