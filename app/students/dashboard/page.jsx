import { auth } from "@/auth";
import { MainLayout } from "@/components/layout/main-layout";

export default async function StudentDashboard() {
  const session = await auth();

  return (
    <MainLayout>
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <p className="opacity-70 mt-2">Welcome, {session.user.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <DashboardCard title="My Quizzes" href="/student/quizzes" />
        <DashboardCard title="My Results" href="/student/results" />
        <DashboardCard title="Practice MCQs" href="/mcqs/practice" />
      </div>
    </div>
    </MainLayout>
  );
}

function DashboardCard({ title, href }) {
  return (
    <a
      href={href}
      className="rounded-xl bg-white/10 p-4 hover:bg-white/20 transition"
    >
      <h3 className="font-semibold text-black">{title}</h3>
    </a>
  );
}
