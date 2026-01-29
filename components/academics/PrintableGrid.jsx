"use client";
import React from "react";
import { Download, Plus, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  "08:00 - 08:40",
  "08:40 - 09:20",
  "09:20 - 10:00",
  "10:00 - 10:40",
  "11:00 - 11:40",
  "11:40 - 12:20",
  "12:20 - 01:00",
];

export function PrintableGrid({
  cls,
  teachers,
  onDownload,
  onAddPeriod,
  onEditPeriod,
  onDeletePeriod,
}) {
  return (
    <div
      id={`printable-card-${cls._id}`}
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-12 print:border-slate-300 print:shadow-none"
    >
      {/* HEADER */}
      <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/50 print:bg-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{cls.name}</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
            Weekly Academic Datesheet • 2026
          </p>
        </div>

        <div className="flex gap-2 print:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(cls._id, cls.name)}
            className="h-8 text-xs border border-slate-200"
          >
            <Download className="w-3 h-3 mr-2" /> PDF
          </Button>
          <Button
            size="sm"
            onClick={() => onAddPeriod(cls)}
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-3 h-3 mr-2" /> Add
          </Button>
        </div>
      </div>

      {/* TRANSPOSED EXCEL GRID */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr>
              <th className="w-24 p-2 bg-slate-100/50 border-b border-r border-slate-200 text-[12px] uppercase text-slate-400 font-black">
                Day \ Time
              </th>
              {TIME_SLOTS.map((time) => (
                <th
                  key={time}
                  className="p-2 bg-slate-50 border-b border-r border-slate-200 text-[14px] font-bold text-slate-600 text-center"
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((day) => (
              <tr key={day} className="border-b border-slate-100">
                <td className="p-2 bg-slate-50/50 border-r border-slate-200 font-bold text-slate-800 text-[14px] text-center uppercase">
                  {day.substring(0, 3)}
                </td>

                {TIME_SLOTS.map((time) => {
                  const period = cls.schedule
                    ?.find((s) => s.day === day)
                    ?.periods.find((p) => p.time === time);

                  const idx = cls.schedule
                    ?.find((s) => s.day === day)
                    ?.periods.indexOf(period);

                  return (
                    <td
                      key={`${day}-${time}`}
                      className="p-1 border-r border-slate-100 h-16 relative group align-middle"
                    >
                      {period ? (
                        <div className="h-full w-full p-1.5 flex flex-col justify-center items-center text-center rounded bg-slate-50/50 border border-slate-100 group-hover:border-indigo-200 group-hover:bg-white transition-all">
                          <span className="text-[12px] font-bold text-slate-900 leading-tight block uppercase">
                            {period.subjectName}
                          </span>
                          <span className="text-[10px] font-medium  uppercase mt-0.5">
                            {teachers.find(
                              (t) =>
                                t._id ===
                                (period.teacher?._id || period.teacher),
                            )?.name || "No Teacher"}
                          </span>

                          {/* FLOATING ACTIONS */}
                          <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-bl-md print:hidden">
                            <button
                              onClick={() =>
                                onEditPeriod(cls, period, day, idx)
                              }
                              className="p-1 text-slate-400 hover:text-indigo-600"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => onDeletePeriod(cls, day, idx)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer print:hidden"
                          onClick={() => onAddPeriod(cls, null, day, time)}
                        >
                          <Plus className="w-3 h-3 text-slate-300" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
