"use client";

import useSWR from "swr";
import { ShieldCheck, XCircle, GraduationCap, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function VerificationPage({ params }) {
  console.log("page");
  const { id } = React.use(params);

  console.log(id);
  const {
    data: result,
    error,
    isLoading,
  } = useSWR(`/api/verify/${id}`, fetcher);

  console.log(result);

  if (isLoading)
    return (
      <div className="p-10 text-center font-bold">
        Verifying Authenticity...
      </div>
    );
  if (error || result?.error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <XCircle className="text-red-500 h-16 w-16 mb-4" />
        <h1 className="text-2xl font-bold">Invalid Certificate</h1>
        <p className="text-slate-500">
          This record could not be found in our official database.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Verification Badge */}
        <div className="bg-green-100 border-2 border-green-600 rounded-2xl p-6 flex items-center gap-4">
          <ShieldCheck className="text-green-600 h-12 w-12" />
          <div>
            <h1 className="text-green-900 font-black text-xl uppercase italic">
              Authenticity Verified
            </h1>
            <p className="text-green-700 text-sm">
              Official Record of EduManage Systems
            </p>
          </div>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap /> Result Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">
                  Student
                </p>
                <p className="font-black text-lg">{result.student?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase text-[10px]">
                  Roll No
                </p>
                <p className="font-mono font-bold text-lg">
                  {result.student?.rollNumber}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">
                  Exam
                </p>
                <p className="font-bold">{result.examId?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase text-[10px]">
                  Class
                </p>
                <p className="font-bold">{result.classId?.name}</p>
              </div>
            </div>

            <div className="border-t-2 border-dashed pt-4 mt-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">
                    Final Percentage
                  </p>
                  <p className="text-3xl font-black text-indigo-600">
                    {result.percentage}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">
                    Status
                  </p>
                  <p
                    className={`text-xl font-black ${result.status === "PASS" ? "text-green-600" : "text-red-600"}`}
                  >
                    {result.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-2 text-[10px] text-slate-500 italic">
              <Calendar size={12} />
              This result was originally issued on{" "}
              {new Date(result.createdAt).toLocaleDateString()}.
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
          EduManage Security Protocol v2.1
        </p>
      </div>
    </div>
  );
}
