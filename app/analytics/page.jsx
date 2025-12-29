"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MainLayout } from "@/components/layout/main-layout";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function AnalyticsDashboard() {
  const { data } = useSWR("/api/analytics/overview", fetcher);
  const { data: subjects } = useSWR("/api/analytics/subject", fetcher);

  if (!data) return null;

  return (
    <MainLayout>
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold">Analytics Overview</h1>

        <div className="grid md:grid-cols-4 gap-4">
          <Stat title="Total Attempts" value={data.totalAttempts} />
          <Stat title="Avg %" value={data.averagePercentage + "%"} />
          <Stat title="Pass" value={data.passCount} />
          <Stat title="Fail" value={data.failCount} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjects?.result.map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm">
                  <span>{s.subject}</span>
                  <span>{s.average}%</span>
                </div>
                <Progress value={s.average} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function Stat({ title, value }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  );
}
