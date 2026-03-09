// components/ml/ReportPDFTemplate.tsx
import { BrainCircuit, Award, Calendar } from "lucide-react";

export default function ReportPDFTemplate({ stats }) {
  const { student, predictedScore, weakestLink, date } = stats;

  return (
    <div
      id="pdf-report"
      className="hidden print:block p-12 bg-white text-black min-h-screen"
    >
      {/* Watermark Header */}
      <div className="flex justify-between items-center border-b-4 border-indigo-600 pb-6 mb-10">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 uppercase tracking-tighter">
            Academic Performance Roadmap
          </h1>
          <div className="flex gap-4 mt-2 text-sm font-medium text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {new Date().toLocaleDateString()}
            </span>
            <span>ID: {student.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>
        <BrainCircuit size={60} className="text-indigo-600" />
      </div>

      {/* Student Details Info Box */}
      <div className="grid grid-cols-3 gap-8 bg-gray-50 p-6 rounded-2xl mb-10">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Student Name
          </p>
          <p className="text-xl font-bold">{student.name}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Roll Number
          </p>
          <p className="text-xl font-bold">#{student.rollNumber}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Class/Grade
          </p>
          <p className="text-xl font-bold">{student.classId?.name}</p>
        </div>
      </div>

      {/* The "Seal" of Prediction */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[3rem] p-12 mb-10">
        <Award size={48} className="text-indigo-600 mb-4" />
        <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.3em] mb-2">
          Validated AI Projection
        </p>
        <span className="text-8xl font-black text-indigo-700">
          {predictedScore.toFixed(1)}%
        </span>
        <p className="mt-4 text-center text-gray-600 max-w-md">
          Based on current attendance and academic performance metrics, this
          student is projected to achieve the above score in the final
          examination.
        </p>
      </div>

      {/* Strategy Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold border-l-4 border-indigo-600 pl-4">
          Intervention Strategy
        </h3>
        <div className="p-6 bg-indigo-50 rounded-2xl">
          <p className="text-sm leading-relaxed text-indigo-900">
            <strong>Primary Focus Area:</strong> {weakestLink.name}
            <br />
            Our AI analysis indicates that prioritizing {weakestLink.name} will
            yield the highest statistical improvement in the final grade. A
            target improvement of 10% in this area could shift the projected
            outcome significantly.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-12 left-12 right-12 flex justify-between items-end pt-10 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">
            Computer Generated Academic Report
          </p>
          <p className="text-[10px] text-gray-300">
            Predictive Model: v2.4-RandomForest-63r2
          </p>
        </div>
        <div className="text-right">
          <div className="h-10 w-32 border-b border-gray-400 mb-2"></div>
          <p className="text-xs font-bold">Authorized Signature</p>
        </div>
      </footer>
    </div>
  );
}
