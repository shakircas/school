// // app/ml/[id]/page.tsx
// import { notFound } from "next/navigation";
// import Student from "@/models/Student";
// import StudentFeature from "@/models/StudentFeature";
// import { predictFinalExam } from "@/lib/ml/predictFinalExam";
// import { getActiveAcademicYear } from "@/lib/getAcademicYear";
// import { MainLayout } from "@/components/layout/main-layout";
// import PredictionButton from "@/lib/PredictionButton";
// import { calculateStudentFeatures } from "@/lib/ml/calculateStudentFeatures";
// import { TrendingDown, FileDown, BrainCircuit, Target, Info } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default async function ScorePredictedPage({ params }) {
//   const { id } = await params;
//   const academicYear = await getActiveAcademicYear();

//   const MAE = 3.58;
//   const PASS_MARK = 50;

//   const student = await Student.findById(id)
//     .select("name rollNumber classId")
//     .populate("classId")
//     .lean();

//   if (!student) return notFound();

//   let featuresDoc = await StudentFeature.findOne({ student: id });
//   if (!featuresDoc) {
//     featuresDoc = await calculateStudentFeatures(id, academicYear);
//   }

//   const features = {
//     attendance: featuresDoc.attendance || 0,
//     midterm: featuresDoc.midterm || 0,
//     unit_avg: featuresDoc.unit_avg || 0,
//     previous_exam: featuresDoc.previous_exam || 0,
//   };

//   const predictionData = await predictFinalExam(features);
//   const predictedScore = predictionData?.prediction ?? null;
//   const contributions = predictionData?.contributions ?? { attendance: 0, midterm: 0, unit_avg: 0, previous_exam: 0 };

//   // --- SMART INSIGHTS ENGINE ---
//   const findWeakestLink = () => {
//     const values = [
//       { name: "Attendance", val: features.attendance, impact: contributions.attendance, threshold: 75 },
//       { name: "Unit Tests", val: features.unit_avg, impact: contributions.unit_avg, threshold: 60 },
//       { name: "Midterm", val: features.midterm, impact: contributions.midterm, threshold: 60 },
//     ];
//     // Sort to find the one furthest below its threshold
//     return values.sort((a, b) => (a.val - a.threshold) - (b.val - b.threshold))[0];
//   };

//   const weakest = findWeakestLink();

//   const isFailing = predictedScore !== null && predictedScore < PASS_MARK;
//   const isAtRisk = predictedScore !== null && predictedScore >= PASS_MARK && predictedScore < PASS_MARK + MAE;

//   return (
//     <MainLayout>
//       <div className="max-w-3xl mx-auto p-8 mt-10 bg-white shadow-2xl rounded-[2rem] border border-gray-100 print:shadow-none print:border-none print:mt-0">

//         {/* Header with Print Action */}
//         <header className="flex justify-between items-start border-b pb-6 mb-8">
//           <div>
//             <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
//               <BrainCircuit className="text-indigo-600" size={32} />
//               AI Performance Report
//             </h1>
//             <p className="text-gray-500 mt-1 font-medium">
//               Academic Analysis for <span className="text-black font-bold">{student.name}</span> • Roll #{student.rollNumber}
//             </p>
//           </div>
//           <button
//             onClick={() => window.print()}
//             className="print:hidden flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all font-bold text-sm"
//           >
//             <FileDown size={18} />
//             Download PDF
//           </button>
//         </header>

//         <RiskAnalysisBanner isFailing={isFailing} isAtRisk={isAtRisk} score={predictedScore} mae={MAE} />

//         {/* Prediction Hero Box */}
//         <div className={`relative p-10 rounded-[2.5rem] text-center border-4 mb-8 transition-all ${
//           isFailing ? "bg-red-50 border-red-100" : isAtRisk ? "bg-amber-50 border-amber-100" : "bg-indigo-50 border-indigo-100"
//         }`}>
//           <h2 className="text-xs uppercase tracking-[0.25em] font-black text-gray-400 mb-2">Projected Final Grade</h2>
//           <div className="flex items-center justify-center gap-2">
//             <span className={`text-8xl font-black tracking-tighter ${
//               isFailing ? "text-red-700" : isAtRisk ? "text-amber-700" : "text-indigo-700"
//             }`}>
//               {predictedScore?.toFixed(1)}%
//             </span>
//           </div>

//           {/* Variance Analysis */}
//           <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
//             <div className="bg-white/60 p-3 rounded-2xl border border-white/50">
//                <p className="text-[10px] font-black text-gray-400 uppercase">Worst Case (Lower Bound)</p>
//                <p className="text-lg font-bold text-gray-700">{(predictedScore - MAE).toFixed(1)}%</p>
//             </div>
//             <div className="bg-white/60 p-3 rounded-2xl border border-white/50">
//                <p className="text-[10px] font-black text-gray-400 uppercase">Best Case (Upper Bound)</p>
//                <p className="text-lg font-bold text-gray-700">{(predictedScore + MAE).toFixed(1)}%</p>
//             </div>
//           </div>
//         </div>

//         {/* Feature Insights Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="space-y-4">
//              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
//                <Target className="text-indigo-500" size={20} /> Metric Contributions
//              </h3>
//              <div className="space-y-3">
//                <ContributionBar label="Attendance" value={features.attendance} contribution={contributions.attendance} />
//                <ContributionBar label="Midterm" value={features.midterm} contribution={contributions.midterm} />
//                <ContributionBar label="Unit Avg" value={features.unit_avg} contribution={contributions.unit_avg} />
//                <ContributionBar label="Prev Exam" value={features.previous_exam} contribution={contributions.previous_exam} />
//              </div>
//           </div>

//           {/* SMART INSIGHTS SECTION */}
//           <div className="bg-gray-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
//              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
//              <h3 className="text-indigo-400 font-black uppercase text-xs tracking-widest mb-4">Smart Intervention</h3>

//              <div className="flex gap-4 items-start">
//                <div className="bg-white/10 p-3 rounded-xl">
//                  <TrendingDown className={weakest.val < weakest.threshold ? "text-red-400" : "text-emerald-400"} />
//                </div>
//                <div>
//                  <p className="font-bold text-lg leading-tight">Focus on {weakest.name}</p>
//                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">
//                    Currently at <span className="text-white">{weakest.val}%</span>.
//                    {isFailing
//                      ? ` Critical improvement in ${weakest.name} is the fastest way to pull the score above 50%.`
//                      : ` Strengthening this area could increase the final projection by up to ${(Math.abs(weakest.impact) * 0.5).toFixed(1)}%.`}
//                  </p>
//                </div>
//              </div>

//              <div className="mt-6 pt-6 border-t border-white/10">
//                 <p className="text-[10px] font-bold text-indigo-400 uppercase">Faculty Recommendation</p>
//                 <p className="text-xs italic mt-1 text-gray-400">"Schedule a 15-minute review session focusing on {weakest.name} modules."</p>
//              </div>
//           </div>
//         </div>

//         {/* Technical Summary Footer */}
//         <div className="flex flex-col gap-4">
//           <details className="text-xs text-gray-400 cursor-pointer group bg-gray-50 p-4 rounded-xl">
//             <summary className="hover:text-gray-600 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest">
//               <Info size={14} /> Model Feature Metadata
//             </summary>
//             <pre className="mt-3 p-3 bg-gray-900 text-emerald-400 rounded-lg overflow-x-auto font-mono">
//               {JSON.stringify(features, null, 2)}
//             </pre>
//           </details>
//           <PredictionButton studentId={id} predicted={predictedScore} />
//         </div>
//       </div>

//       {/* CSS for print mode */}
//       <style jsx global>{`
//         @media print {
//           body { background: white !important; }
//           .print\:hidden { display: none !important; }
//           main { padding: 0 !important; }
//         }
//       `}</style>
//     </MainLayout>
//   );
// }

// function ContributionBar({ label, value, contribution }) {
//   return (
//     <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group hover:border-indigo-200 transition-all">
//       <div className="flex justify-between items-end mb-1">
//         <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{label}</span>
//         <span className="text-sm font-bold">{value}%</span>
//       </div>
//       <div className="flex justify-between items-center">
//         <div className="text-[10px] font-medium text-gray-500 italic">Score Impact</div>
//         <div className="text-[10px] font-black text-indigo-600">+{contribution.toFixed(2)} pts</div>
//       </div>
//     </div>
//   );
// }

// function RiskAnalysisBanner({ isFailing, isAtRisk, score, mae }) {
//   if (score === null) return null;

//   const status = isFailing
//     ? { color: "bg-red-600", label: "Critical Risk", icon: "⚠️" }
//     : isAtRisk
//     ? { color: "bg-amber-500", label: "Needs Monitoring", icon: "💡" }
//     : { color: "bg-emerald-600", label: "Excellent Standing", icon: "✅" };

//   return (
//     <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 text-white shadow-lg ${status.color}`}>
//       <span className="text-2xl">{status.icon}</span>
//       <div>
//         <p className="text-[10px] font-black uppercase tracking-widest opacity-80">AI Classification</p>
//         <p className="text-xl font-black leading-none">{status.label}</p>
//       </div>
//     </div>
//   );
// }

// app/ml/[id]/page.tsx
import { notFound } from "next/navigation";
import Student from "@/models/Student";
import StudentFeature from "@/models/StudentFeature";
import { predictFinalExam } from "@/lib/ml/predictFinalExam";
import { getActiveAcademicYear } from "@/lib/getAcademicYear";
import { MainLayout } from "@/components/layout/main-layout";
import PredictionClientWrapper from "./PredictionClientWrapper";
import { calculateStudentFeatures } from "@/lib/ml/calculateStudentFeatures";

export default async function ScorePredictedPage({ params }) {
  const { id } = await params;
  const academicYear = await getActiveAcademicYear();

  const MAE = 3.58;
  const PASS_MARK = 50;

  const student = await Student.findById(id)
    .select("name rollNumber classId")
    .populate("classId")
    .lean();

  if (!student) return notFound();

  let featuresDoc = await StudentFeature.findOne({ student: id });
  if (!featuresDoc) {
    featuresDoc = await calculateStudentFeatures(id, academicYear);
  }

  const features = {
    attendance: featuresDoc.attendance || 0,
    midterm: featuresDoc.midterm || 0,
    unit_avg: featuresDoc.unit_avg || 0,
    previous_exam: featuresDoc.previous_exam || 0,
  };

  const predictionData = await predictFinalExam(features);

  // Package data for the Client Component
  const stats = {
    student: {
      name: student.name,
      rollNumber: student.rollNumber,
      id: student._id.toString(),
    },
    features,
    predictedScore: predictionData?.prediction ?? 0,
    contributions: predictionData?.contributions ?? {
      attendance: 0,
      midterm: 0,
      unit_avg: 0,
      previous_exam: 0,
    },
    MAE,
    PASS_MARK,
  };

  console.log(predictionData);

  return (
    <MainLayout>
      <PredictionClientWrapper stats={stats} />
    </MainLayout>
  );
}
