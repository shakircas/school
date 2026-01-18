// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   GraduationCap,
//   Users,
//   Wallet,
//   BarChart3,
//   ArrowRight,
// } from "lucide-react";
// import { LandingNavbar } from "@/components/landing/navbar";
// import { PricingSection } from "@/components/landing/pricing";
// import { Footer } from "@/components/layout/Footer";

// export default function HomePage() {
//   return (
//     <main className="min-h-screen bg-background">
//       <LandingNavbar isAuthenticated={false} />
//       {/* HERO */}
//       <section className="py-24 text-center bg-gradient-to-br from-primary/10 to-background">
//         <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
//           Smart School Management System
//         </h1>
//         <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
//           Manage students, fees, attendance, exams and analytics — all in one
//           powerful platform.
//         </p>
//         <div className="mt-8 flex justify-center gap-4">
//           <Button size="lg" asChild>
//             <Link href="/login">
//               Get Started
//               <ArrowRight className="h-4 w-4 ml-2" />
//             </Link>
//           </Button>
//           <Button size="lg" variant="outline" asChild>
//             <Link href="/dashboard">Dashboard</Link>
//           </Button>
//         </div>
//       </section>

//       {/* FEATURES */}
//       <section id="features" className="py-20 container mx-auto">
//         <h2 className="text-3xl font-bold text-center mb-12">
//           Everything Your School Needs
//         </h2>

//         <div className="grid md:grid-cols-4 gap-6">
//           <Feature
//             icon={<GraduationCap />}
//             title="Student Management"
//             desc="Admissions, profiles, promotions & history"
//           />
//           <Feature
//             icon={<Wallet />}
//             title="Fee Management"
//             desc="Monthly fees, installments, receipts & reports"
//           />
//           <Feature
//             icon={<Users />}
//             title="Attendance"
//             desc="Daily attendance with analytics"
//           />
//           <Feature
//             icon={<BarChart3 />}
//             title="Reports & Analytics"
//             desc="Real-time insights for management"
//           />
//         </div>
//       </section>

//       {/* STATS */}
//       <section className="py-20 bg-muted">
//         <div className="container mx-auto grid md:grid-cols-4 gap-6 text-center">
//           <Stat number="5K+" label="Students Managed" />
//           <Stat number="200+" label="Teachers" />
//           <Stat number="99.9%" label="Uptime" />
//           <Stat number="24/7" label="Support" />
//         </div>
//       </section>

//       <PricingSection />

//       {/* CTA */}
//       <section className="py-24 text-center">
//         <h2 className="text-3xl font-bold">Ready to Digitize Your School?</h2>
//         <p className="mt-3 text-muted-foreground">
//           Start managing your school smarter today.
//         </p>
//         <Button size="lg" className="mt-6" asChild>
//           <Link href="/login">Launch Dashboard</Link>
//         </Button>
//       </section>

//       {/* FOOTER */}
//       <Footer />
//     </main>
//   );
// }

// /* ================= COMPONENTS ================= */

// function Feature({ icon, title, desc }) {
//   return (
//     <Card className="text-center">
//       <CardContent className="p-6 space-y-3">
//         <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
//           {icon}
//         </div>
//         <h3 className="font-semibold">{title}</h3>
//         <p className="text-sm text-muted-foreground">{desc}</p>
//       </CardContent>
//     </Card>
//   );
// }

// function Stat({ number, label }) {
//   return (
//     <div>
//       <p className="text-3xl font-bold">{number}</p>
//       <p className="text-muted-foreground">{label}</p>
//     </div>
//   );
// }

"use client";

import useSWR from "swr";
import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Play,
  MousePointer2,
} from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const { data: stats } = useSWR("/api/dashboard/stats", fetcher);
  const { data: teachersRes } = useSWR("/api/teachers", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const teachers = teachersRes?.teachers?.slice(0, 4) || [];

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white">
      <LandingNavbar />

      {/* 1. HERO: MINIMALIST LUXURY */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 dark:bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 dark:bg-purple-900/20 blur-[120px] rounded-full" />

        <div className="container mx-auto px-6 text-center z-10">
          <div className="space-y-8 max-w-6xl mx-auto">
            <Badge
              variant="outline"
              className="rounded-full px-6 py-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/50 backdrop-blur-md text-indigo-600 dark:text-indigo-400 font-medium tracking-widest uppercase text-[10px]"
            >
              The Future of Pedagogy
            </Badge>

            <h1 className="text-[clamp(3rem,10vw,8rem)] font-extralight tracking-[-0.04em] leading-[0.9] text-slate-900 dark:text-white">
              Shaping <span className="font-black italic">Brilliance</span>{" "}
              <br />
              Through{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                Innovation.
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Lumina Academy merges traditional excellence with futuristic
              technology. Join a community of{" "}
              <b>{stats?.students?.total || "1,200"}</b> visionaries.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Button
                size="xl"
                className="bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-all duration-500 rounded-full px-12 h-16 text-lg font-medium shadow-2xl shadow-black/10"
              >
                Begin Enrollment
              </Button>
              <button className="flex items-center gap-4 group text-slate-900 dark:text-white transition-all">
                <div className="h-14 w-14 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all duration-500">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="font-semibold tracking-tight">
                  Watch Campus Film
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS: FLOATING NEUMORPHIC BAR */}
      <section className="container mx-auto px-6 pb-24">
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[4rem] p-12 grid grid-cols-2 lg:grid-cols-4 gap-12 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.05)]">
          <StatBlock
            label="Scholars"
            value={stats?.students?.total}
            suffix="+"
          />
          <StatBlock
            label="Mentors"
            value={stats?.teachers?.total}
            suffix="+"
          />
          <StatBlock label="Placement" value="98" suffix="%" />
          <StatBlock
            label="Subjects"
            value={classesRes?.data?.length}
            suffix=""
          />
        </div>
      </section>

      {/* 3. ACADEMICS: THE BENTO GRID LOOK */}
      <section className="py-48 container mx-auto px-6" id="academics">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 sticky top-32 space-y-6">
            <h2 className="text-6xl font-black tracking-tighter">
              Academic Pillars.
            </h2>
            <p className="text-xl text-slate-500 font-light">
              Customized learning paths designed to ignite specific cognitive
              strengths.
            </p>
            <div className="pt-8">
              <MousePointer2 className="text-indigo-500 animate-bounce mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Select Grade Level
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Tabs defaultValue="primary" className="w-full">
              <TabsList className="flex gap-4 bg-transparent h-auto mb-10 overflow-x-auto no-scrollbar">
                {["primary", "middle", "high"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-8 py-4 rounded-full border border-slate-200 dark:border-slate-800 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-lg capitalize transition-all duration-500"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="primary" className="mt-0 outline-none">
                <div className="relative group overflow-hidden rounded-[3rem]">
                  <img
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80"
                    className="w-full h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-12 flex flex-col justify-end">
                    <h3 className="text-white text-4xl font-bold mb-4">
                      Discovery Phase
                    </h3>
                    <p className="text-white/70 text-xl max-w-xl">
                      A Montessori-inspired approach focusing on foundational
                      motor skills and social empathy.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* 4. FACULTY: THE GALLERY LOOK */}
      <section className="py-48 bg-slate-100 dark:bg-[#0a0a0a]" id="faculty">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-24">
            <h2 className="text-7xl font-light tracking-tighter">
              Our <span className="font-black italic">Thinkers</span>
            </h2>
            <Button
              variant="ghost"
              className="text-xl font-bold gap-2 hover:bg-transparent hover:text-indigo-600"
            >
              View Directory <ArrowRight />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teachers.length > 0
              ? teachers.map((t, i) => (
                  <div key={t._id} className={i % 2 !== 0 ? "lg:mt-20" : ""}>
                    <TeacherMinimalCard t={t} />
                  </div>
                ))
              : [1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[500px] rounded-[3rem]" />
                ))}
          </div>
        </div>
      </section>

      <Footer logo="/Logo.png" />
    </main>
  );
}

/* ================= COMPONENT DETAILS ================= */

function StatBlock({ label, value, suffix }) {
  return (
    <div className="text-center space-y-2">
      <h4 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white">
        {value || "0"}
        {suffix}
      </h4>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-500">
        {label}
      </p>
    </div>
  );
}

function TeacherMinimalCard({ t }) {
  return (
    <div className="group cursor-none">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3rem] mb-6">
        <img
          src={
            t.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`
          }
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
        />
      </div>
      <h4 className="text-2xl font-bold">{t.name}</h4>
      <p className="text-slate-500 font-medium">
        {t.designation || "Senior Faculty"}
      </p>
    </div>
  );
}