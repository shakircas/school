"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherLoadAnalytics({ data }) {
  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Load Analytics</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {data.map((t) => (
          <div
            key={t.teacherId}
            className={`p-3 rounded border ${
              t.totalPeriods > 30
                ? "bg-red-50 border-red-300"
                : "bg-green-50 border-green-300"
            }`}
          >
            <div className="font-semibold">Teacher ID: {t.teacherId}</div>

            <div>Total Periods: {t.totalPeriods}</div>

            <div className="text-sm text-muted-foreground">
              {Object.entries(t.byDay).map(([day, count]) => (
                <span key={day} className="mr-3">
                  {day}: {count}
                </span>
              ))}
            </div>

            {t.totalPeriods > 30 && (
              <div className="text-red-600 text-sm font-medium">
                ⚠ Overloaded teacher
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
