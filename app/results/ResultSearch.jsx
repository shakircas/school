"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Printer, UserCircle } from "lucide-react";

export function ResultSearch() {
  const [rollNo, setRollNo] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNo) return;

    setResult(null);
    setError(null);
    setIsSearching(true);

    try {
      const res = await fetch(`/api/results/${rollNo}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Result not found");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="py-24 bg-emerald-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/50">
              Online Portal
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black italic">
              Check Exam{" "}
              <span className="text-emerald-400 not-italic">Results</span>
            </h2>
            <p className="text-emerald-100/70">
              Enter your official Board Roll Number to view marks.
            </p>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-2 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Enter Roll Number"
                className="w-full pl-14 pr-6 py-6 rounded-[2rem] text-slate-900 outline-none font-bold text-lg"
              />
            </div>

            <Button
              type="submit"
              disabled={!rollNo || isSearching}
              className="bg-emerald-600 hover:bg-emerald-700 px-10 py-6 rounded-[2rem] text-lg font-bold"
            >
              {isSearching ? "Searching..." : "Show Result"}
            </Button>
          </form>

          {error && (
            <p className="text-red-300 mt-6 text-center font-semibold">
              {error}
            </p>
          )}

          {/* Result Card */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-12 bg-white rounded-[3rem] overflow-hidden shadow-2xl text-slate-900"
              >
                {/* Student Header */}
                <div className="bg-slate-50 p-8 border-b flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                      <UserCircle size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{result.name}</h3>
                      <p className="text-slate-500 text-sm">
                        Roll No: {rollNo}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-lg px-4">
                    {result.status}
                  </Badge>
                </div>

                {/* Summary */}
                <div className="p-8 md:p-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <ResultStat label="Father Name" value={result.fatherName} />
                  <ResultStat label="Class" value={result.className} />
                  <ResultStat
                    label="Marks"
                    value={`${result?.obtainedMarks} / ${result.totalMarks}`}
                  />
                  <ResultStat label="Percentage" value={result.percentage} />
                </div>

                {/* Subjects */}
                <div className="p-8 border-t">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Subject Breakdown
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-slate-400 border-b">
                          <th className="py-2 text-left">Subject</th>
                          <th>Total</th>
                          <th>Obtained</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.subjects?.map((sub, i) => (
                          <tr
                            key={i}
                            className="border-b last:border-0 text-sm"
                          >
                            <td className="py-3 font-bold">{sub.subject}</td>
                            <td>{sub.totalMarks}</td>
                            <td
                              className={`font-bold ${
                                sub.obtainedMarks < sub.passingMarks
                                  ? "text-red-500"
                                  : "text-emerald-600"
                              }`}
                            >
                              {sub.isAbsent ? "ABS" : sub.obtainedMarks}
                            </td>
                            <td>
                              <Badge variant="outline" className="text-[10px]">
                                {sub.obtainedMarks >= sub.passingMarks
                                  ? "Pass"
                                  : "Fail"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <div className="text-4xl font-black text-emerald-400">
                    {result.grade}
                  </div>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <Printer size={18} /> Print Marksheet
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ResultStat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}
