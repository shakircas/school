"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Table as TableIcon,
  HardDrive,
  RefreshCcw,
  ExternalLink,
  History,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorageHealthMonitor } from "../StorageHealthMonitor";

export default function ArchiveManagement() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/archive/stats");
      const data = await res.json();
      setStats(data.stats || []);
    } catch (err) {
      console.error("Error loading stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalSize = stats
    .reduce((acc, curr) => acc + parseFloat(curr.size), 0)
    .toFixed(2);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* The Storage Health Monitor takes up 2 columns for visibility */}
        <div className="md:col-span-2">
          <StorageHealthMonitor totalSize={totalSize} limitMB={512} />
        </div>
        <Card className="bg-slate-900 text-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">
                  Total Cold Storage
                </p>
                <h3 className="text-2xl font-black">{totalSize} MB</h3>
              </div>
              <HardDrive className="text-slate-700" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">
                  Archived Cycles
                </p>
                <h3 className="text-2xl font-black">{stats.length}</h3>
              </div>
              <History className="text-slate-200" size={32} />
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="h-full border-2 border-dashed flex flex-col gap-2 hover:bg-slate-50"
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCcw className={loading ? "animate-spin" : ""} size={20} />
          Refresh Registry
        </Button>
      </div>

      {/* Main Inventory Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <TableIcon size={18} className="text-blue-600" />
            Archive Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                <tr>
                  <th className="px-6 py-4">Collection Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Records</th>
                  <th className="px-6 py-4">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.map((item) => (
                  <tr
                    key={item.name}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          item.type === "Results" ? "default" : "secondary"
                        }
                      >
                        {item.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.year}</td>
                    <td className="px-6 py-4">{item.count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500">{item.size} MB</td>
                  </tr>
                ))}
                {stats.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-400 italic"
                    >
                      No archived collections detected in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
