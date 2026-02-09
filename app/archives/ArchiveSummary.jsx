"use client";

import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Users, HardDrive, TrendingUp } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function ArchiveSummary() {
  const { data, error, isLoading } = useSWR("/api/archive/summary", fetcher);
  const summary = data?.summary || [];

  const totalArchived = summary.reduce((acc, curr) => acc + curr.count, 0);

  if (isLoading)
    return (
      <div className="h-24 w-full bg-slate-100 animate-pulse rounded-xl" />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Total Overview Card */}
      <Card className="bg-indigo-600 text-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase">
                Total Archived
              </p>
              <h3 className="text-3xl font-bold">{totalArchived}</h3>
            </div>
            <Database className="text-indigo-300 opacity-50" size={24} />
          </div>
          <p className="text-[10px] mt-2 text-indigo-200 italic">
            Saved across {summary.length} collections
          </p>
        </CardContent>
      </Card>

      {/* Dynamic Year Cards */}
      {summary.map((item) => (
        <Card
          key={item.collectionName}
          className="hover:shadow-md transition-shadow"
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">
                  {item.year}
                </p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {item.count}
                </h3>
              </div>
              <Users className="text-slate-300" size={20} />
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                Cold Storage
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
