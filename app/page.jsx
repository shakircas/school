// import { MainLayout } from "@/components/layout/main-layout"
// import { DashboardContent } from "@/components/dashboard/dashboard-content"

// export default function DashboardPage() {
//   return (
//     <MainLayout>
//       <DashboardContent />
//     </MainLayout>
//   )
// }

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  Wallet,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
import { PricingSection } from "@/components/landing/pricing";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingNavbar isAuthenticated={false} />
      {/* HERO */}
      <section className="py-24 text-center bg-gradient-to-br from-primary/10 to-background">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Smart School Management System
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Manage students, fees, attendance, exams and analytics — all in one
          powerful platform.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/login">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything Your School Needs
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          <Feature
            icon={<GraduationCap />}
            title="Student Management"
            desc="Admissions, profiles, promotions & history"
          />
          <Feature
            icon={<Wallet />}
            title="Fee Management"
            desc="Monthly fees, installments, receipts & reports"
          />
          <Feature
            icon={<Users />}
            title="Attendance"
            desc="Daily attendance with analytics"
          />
          <Feature
            icon={<BarChart3 />}
            title="Reports & Analytics"
            desc="Real-time insights for management"
          />
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto grid md:grid-cols-4 gap-6 text-center">
          <Stat number="5K+" label="Students Managed" />
          <Stat number="200+" label="Teachers" />
          <Stat number="99.9%" label="Uptime" />
          <Stat number="24/7" label="Support" />
        </div>
      </section>

      <PricingSection />

      {/* CTA */}
      <section className="py-24 text-center">
        <h2 className="text-3xl font-bold">Ready to Digitize Your School?</h2>
        <p className="mt-3 text-muted-foreground">
          Start managing your school smarter today.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/login">Launch Dashboard</Link>
        </Button>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}

/* ================= COMPONENTS ================= */

function Feature({ icon, title, desc }) {
  return (
    <Card className="text-center">
      <CardContent className="p-6 space-y-3">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function Stat({ number, label }) {
  return (
    <div>
      <p className="text-3xl font-bold">{number}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
