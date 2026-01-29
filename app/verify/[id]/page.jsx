// app/verify/[id]/page.jsx
// import { StudentResultCard } from "@/components/results/student-result-card";
import { StudentResultCard } from "@/components/exams/StudentResultCard";
import { ShieldCheck, AlertCircle } from "lucide-react";

async function getResult(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/results/public/${id}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function VerificationPage({ params }) {
  const data = await getResult(params.id);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold italic">Invalid Transcript</h1>
        <p className="text-slate-500">
          This result could not be verified in our official records.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Verification Badge */}
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg">
          <ShieldCheck className="h-6 w-6" />
          <p className="font-bold uppercase tracking-widest text-sm">
            Official Verified Result - EduManage Academy
          </p>
        </div>

        {/* Display the Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <StudentResultCard result={data.result} isPublicView={true} />
        </div>

        <p className="text-center text-[10px] text-slate-400 uppercase font-medium">
          Verification ID: {params.id} • Digital Signature Timestamp:{" "}
          {new Date(data.result.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
