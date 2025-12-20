"use client";

export default function PeriodCard({
  period,
  dayIndex,
  periodIndex,
  onDragStart,
  isClash,
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, dayIndex, periodIndex)}
      className={`p-2 rounded cursor-move text-sm border
        ${
          isClash ? "bg-red-100 border-red-500" : "bg-muted hover:bg-muted/80"
        }`}
    >
      <div className="font-semibold">{period.subject}</div>
      <div className="text-xs text-muted-foreground">{period.time}</div>
    </div>
  );
}
