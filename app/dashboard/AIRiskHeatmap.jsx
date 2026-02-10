"use client";

import useSWR from 'swr';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, User, MessageSquare, ShieldCheck } from "lucide-react";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function AIRiskHeatmap() {
  const { data, isLoading } = useSWR('/api/analytics/risk-heatmap', fetcher);

  if (isLoading) return <div className="p-20 text-center font-black animate-pulse">AI ANALYZING DATA...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {data?.map((student) => (
        <Card key={student.id} className={`border-2 rounded-3xl transition-all hover:shadow-xl ${
          student.level === 'High' ? 'border-red-500 bg-red-50/10' : 'border-slate-100'
        }`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${student.level === 'High' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">{student.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Roll: {student.rollNumber}</p>
                </div>
              </div>
              <Badge className={student.level === 'High' ? 'bg-red-600' : 'bg-emerald-600'}>
                {student.level}
              </Badge>
            </div>

            {/* Risk Visualizer */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400">AI RISK INDEX</span>
                <span className={`text-lg font-black ${student.level === 'High' ? 'text-red-600' : 'text-slate-900'}`}>{student.riskScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${student.level === 'High' ? 'bg-red-600' : 'bg-emerald-500'}`}
                  style={{ width: `${student.riskScore}%` }}
                />
              </div>

              {/* Reason Tags */}
              <div className="flex flex-wrap gap-2 py-2">
                {student.reasons.map((reason, i) => (
                  <span key={i} className="flex items-center gap-1 text-[9px] font-black px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600">
                    {student.trend === 'down' ? <TrendingDown size={10} className="text-red-500" /> : <ShieldCheck size={10} className="text-emerald-500" />}
                    {reason}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" className="rounded-xl font-black text-[10px] border-2 h-10 gap-2">
                  <MessageSquare size={14} /> Profile
                </Button>
                <Button className="rounded-xl font-black text-[10px] h-10 gap-2 bg-slate-900">
                  <AlertTriangle size={14} /> Alert Parent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}