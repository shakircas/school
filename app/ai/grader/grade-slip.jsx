export function GradeSlip({ result, markingType }) {
  const date = new Date().toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "2026",
  });

  return (
    <div className="p-8 border-4 border-double border-slate-900 bg-white max-w-2xl mx-auto my-4 shadow-sm font-sans text-slate-900">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">
            EduForge Result Slip
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            Board Standard AI Verification
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase">{date}</p>
          <p className="text-[10px] font-bold text-indigo-600 uppercase">
            Session: 2025-26
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-8 mb-6 text-sm font-bold uppercase">
        <p className="border-b border-slate-100 pb-1">
          Student:{" "}
          <span className="font-black italic underline">
            {result.studentName || "N/A"}
          </span>
        </p>
        <p className="border-b border-slate-100 pb-1">
          Roll No:{" "}
          <span className="font-black italic underline">
            {result.rollNo || "N/A"}
          </span>
        </p>
        <p className="border-b border-slate-100 pb-1">
          Type:{" "}
          <span className="font-black italic underline">
            {markingType} Assessment
          </span>
        </p>
        <p className="border-b border-slate-100 pb-1">
          Code:{" "}
          <span className="font-black italic underline">
            {result.paperCode || "A"}
          </span>
        </p>
      </div>

      <div className="bg-slate-900 text-white p-4 flex justify-between items-center rounded-sm mb-6">
        <span className="text-xs font-black uppercase tracking-widest">
          Total Marks Obtained
        </span>
        <span className="text-3xl font-black">
          {result.score || result.totalMarks} / {result.total || 100}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-1">
            AI Diagnostic Feedback:
          </h4>
          <p className="text-xs italic font-medium leading-relaxed border-l-2 border-indigo-500 pl-3">
            "{result.feedback}"
          </p>
        </div>

        <div className="pt-8 flex justify-between gap-12">
          <div className="flex-1 border-t border-slate-900 text-center pt-1">
            <p className="text-[8px] font-black uppercase">
              Examiner Signature
            </p>
          </div>
          <div className="flex-1 border-t border-slate-900 text-center pt-1">
            <p className="text-[8px] font-black uppercase">Official Seal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
