"use client";

import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Database,
  Table as TableIcon,
  HardDrive,
  RefreshCcw,
  Search,
  Filter,
  FileText,
  CalendarCheck,
  ClipboardList,
  Users,
  Layers,
  XCircle,
  FileSearch,
  Trash2,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorageHealthMonitor } from "../StorageHealthMonitor";

export default function ArchiveManagement() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [purging, setPurging] = useState(null); // Tracks which collection is being deleted

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

  // Filter Logic
  const filteredStats = useMemo(() => {
    return stats.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.year.includes(searchTerm);
      const matchesCategory =
        activeCategory === "All" || item.type === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stats, searchTerm, activeCategory]);

  // Global Summary Logic
  const summary = useMemo(() => {
    const totals = {
      Results: { count: 0, size: 0, color: "text-red-600", icon: FileText },
      Attendance: {
        count: 0,
        size: 0,
        color: "text-blue-600",
        icon: CalendarCheck,
      },
      Exams: {
        count: 0,
        size: 0,
        color: "text-indigo-600",
        icon: ClipboardList,
      },
      Students: { count: 0, size: 0, color: "text-emerald-600", icon: Users },
    };

    stats.forEach((item) => {
      if (totals[item.type]) {
        totals[item.type].count += item.count;
        totals[item.type].size += parseFloat(item.size);
      }
    });

    const totalSize = Object.values(totals).reduce(
      (acc, curr) => acc + curr.size,
      0,
    );
    return { totals, totalSize: totalSize.toFixed(2) };
  }, [stats]);

  const handlePurge = async (collectionName) => {
    const confirmName = prompt(
      `WARNING: This is permanent. Type "DELETE" to confirm purging ${collectionName}:`,
    );

    if (confirmName !== "DELETE") {
      alert("Purge cancelled. Confirmation text did not match.");
      return;
    }

    setPurging(collectionName);
    try {
      const res = await fetch("/api/archive/purge", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionName }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchStats(); // Refresh the list
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setPurging(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header & Sync */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Layers className="text-blue-600" /> Archive Master Hub
            </h1>
            <p className="text-slate-500 font-medium">
              Control center for school data lifecycle and cold storage.
            </p>
          </div>
          <Button
            onClick={fetchStats}
            disabled={loading}
            variant="outline"
            className="h-11 shadow-sm border-2"
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Sync Registry
          </Button>
        </div>

        {/* Global Health & Footprint */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StorageHealthMonitor totalSize={summary.totalSize} limitMB={512} />
          </div>
          <Card className="bg text-black border-none shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <HardDrive size={120} />
            </div>
            <CardContent className="pt-8 relative z-10">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Total Footprint
              </p>
              <h3 className="text-5xl font-black mt-2">
                {summary.totalSize}{" "}
                <span className="text-xl text-slate-500">MB</span>
              </h3>
              <div className="mt-4 flex items-center gap-2 text-blue-400 text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                SYSTEM STATUS: OPTIMAL
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Insight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(summary.totals).map(([key, data]) => (
            <Card
              key={key}
              onClick={() =>
                setActiveCategory(key === activeCategory ? "All" : key)
              }
              className={`cursor-pointer transition-all border-2 ${activeCategory === key ? "border-blue-500 bg-blue-50/30" : "border-slate-50 hover:border-slate-200 shadow-sm"}`}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-2 rounded-lg bg-white shadow-sm border ${data.color}`}
                  >
                    <data.icon size={20} />
                  </div>
                  <Badge variant="outline" className="font-bold">
                    {data.size.toFixed(1)} MB
                  </Badge>
                </div>
                <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">
                  {key} Archive
                </h4>
                <p className="text-2xl font-black text-slate-800">
                  {data.count.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="Search collection or year..."
              className="pl-10 h-11 border-slate-200 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter size={16} className="text-slate-400 shrink-0" />
            {["All", "Results", "Attendance", "Exams", "Students"].map(
              (cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={activeCategory === cat ? "default" : "ghost"}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 h-8 text-[11px] font-bold ${activeCategory === cat ? "bg-blue-600" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {cat}
                </Button>
              ),
            )}
          </div>
        </div>

        {/* Results Inventory */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/30 border-b px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">
                Inventory Breakdown
              </CardTitle>
              <CardDescription>
                Showing {filteredStats.length} filtered collections
              </CardDescription>
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-slate-400 hover:text-red-500"
              >
                <XCircle size={16} className="mr-2" /> Clear Search
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-4">Namespace</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Session</th>
                    <th className="px-6 py-4 text-right">Records</th>
                    <th className="px-6 py-4 text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStats.map((item) => (
                    <tr
                      key={item.name}
                      className="hover:bg-blue-50/20 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-[10px] text-blue-600 font-bold">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className="font-bold text-[10px]"
                        >
                          {item.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.year}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {item.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">
                        {item.size} MB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStats.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                  <FileSearch className="mx-auto mb-2 opacity-20" size={48} />
                  <p className="font-medium">No matching archives found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/30 border-b px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">
                Inventory & Purge Control
              </CardTitle>
              <CardDescription>
                Manage permanent deletion of historical data
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-4">Namespace</th>
                    <th className="px-6 py-4">Session</th>
                    <th className="px-6 py-4 text-right">Records</th>
                    <th className="px-6 py-4 text-right">Size</th>
                    <th className="px-6 py-4 text-center text-red-500">
                      Danger Zone
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStats.map((item) => (
                    <tr
                      key={item.name}
                      className="hover:bg-red-50/10 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-600 font-bold">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.year}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {item.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">
                        {item.size} MB
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={purging === item.name}
                          onClick={() => handlePurge(item.name)}
                          className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 p-0 transition-colors"
                        >
                          {purging === item.name ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Security Note */}
        <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <ShieldAlert size={14} className="text-amber-500" />
            Archived data is read-only
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <AlertCircle size={14} className="text-red-500" />
            Purging is irreversible
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
