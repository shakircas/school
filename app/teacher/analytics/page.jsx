import QuizAttempt from "@/models/QuizAttempt";
import { connectDB } from "@/lib/db";

export default async function AnalyticsPage() {
  await connectDB();

  const attempts = await QuizAttempt.find()
    .populate("student", "name email")
    .populate("quiz", "title");

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Quiz Analytics</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10">
          <thead className="bg-white/10">
            <tr>
              <th>Student</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Time</th>
              <th>⚠ Tabs</th>
              <th>📋 Copy</th>
              <th>🖥 Exit</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a._id} className="border-t border-white/10">
                <td>{a.student.name}</td>
                <td>{a.quiz.title}</td>
                <td>
                  {a.score}/{a.total}
                </td>
                <td>{Math.floor(a.timeTaken / 60)} min</td>
                <td className={a.tabSwitches > 3 ? "text-red-500" : ""}>
                  {a.tabSwitches}
                </td>
                <td>{a.copyAttempts}</td>
                <td>{a.fullscreenExit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
