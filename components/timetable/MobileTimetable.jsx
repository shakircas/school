"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function MobileTimetable({ schedule }) {
  const [day, setDay] = useState(schedule?.[0]?.day);

  const selectedDay = schedule.find((d) => d.day === day);

  if (!schedule?.length) return null;

  return (
    <div className="md:hidden space-y-3">
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger>
          <SelectValue placeholder="Select Day" />
        </SelectTrigger>
        <SelectContent>
          {schedule.map((d) => (
            <SelectItem key={d.day} value={d.day}>
              {d.day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedDay?.periods.map((p, i) => (
        <Card key={i}>
          <CardContent className="p-3 space-y-1">
            <div className="font-semibold">{p.time}</div>
            <div>{p.subject}</div>
            <div className="text-sm text-muted-foreground">
              Teacher: {p.teacher || "—"}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
