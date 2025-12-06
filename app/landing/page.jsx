import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  ArrowRight,
  Star,
  BookOpen,
  DollarSign,
  FileText,
  Brain,
  Download,
  Bell,
  School,
} from "lucide-react"

const features = [
  {
    icon: GraduationCap,
    title: "Student Management",
    description:
      "Complete student lifecycle management from admission to graduation with detailed profiles and tracking.",
  },
  {
    icon: Users,
    title: "Teacher Management",
    description: "Manage faculty profiles, assignments, schedules, and performance tracking in one place.",
  },
  {
    icon: Calendar,
    title: "Smart Attendance",
    description: "Quick one-click attendance marking with reports, analytics, and automated notifications.",
  },
  {
    icon: BookOpen,
    title: "Exams & Results",
    description: "Create exams, manage results, generate DMCs and roll number slips automatically.",
  },
  {
    icon: DollarSign,
    title: "Fee Management",
    description: "Track fee collection, generate challans, manage scholarships, and send payment reminders.",
  },
  {
    icon: Brain,
    title: "AI Assistant",
    description: "Generate exam papers, notes, and auto-mark MCQs with Gemini AI integration.",
  },
]

const stats = [
  { value: "10,000+", label: "Schools Trust Us" },
  { value: "5M+", label: "Students Managed" },
  { value: "99.9%", label: "Uptime Guaranteed" },
  { value: "24/7", label: "Support Available" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <School className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">EduManage Pro</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Trusted by 10,000+ Schools Worldwide
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
              Modern School Management
              <span className="text-primary block mt-2">Made Simple</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Streamline your school operations with our comprehensive management system. From admissions to
              graduations, manage everything in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
                <Link href="#features">See Features</Link>
              </Button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border shadow-2xl overflow-hidden bg-card">
              <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">EduManage Pro Dashboard</span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 w-full max-w-4xl">
                  {[
                    { icon: GraduationCap, label: "1,234 Students", color: "text-blue-500" },
                    { icon: Users, label: "85 Teachers", color: "text-green-500" },
                    { icon: DollarSign, label: "Rs. 2.5M Collected", color: "text-amber-500" },
                    { icon: Calendar, label: "95% Attendance", color: "text-purple-500" },
                  ].map((item, i) => (
                    <Card key={i} className="bg-background/80 backdrop-blur">
                      <CardContent className="p-4 text-center">
                        <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                        <p className="font-semibold text-sm">{item.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to manage every aspect of your school efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-muted/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Why Choose Us
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Built for Modern Schools</h2>
              <div className="space-y-4">
                {[
                  { icon: Zap, text: "Lightning fast performance with offline support" },
                  { icon: Shield, text: "Enterprise-grade security for all your data" },
                  { icon: Globe, text: "Access from anywhere, any device" },
                  { icon: Download, text: "Export data to Excel, CSV, or beautiful PDFs" },
                  { icon: Bell, text: "Smart notifications for parents and staff" },
                  { icon: FileText, text: "Automated report generation and analytics" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BarChart3, label: "Analytics Dashboard", desc: "Real-time insights" },
                { icon: Brain, label: "AI-Powered", desc: "Smart automation" },
                { icon: Calendar, label: "Scheduling", desc: "Easy timetables" },
                { icon: CheckCircle2, label: "Compliance", desc: "Audit ready" },
              ].map((item, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="p-6">
                    <item.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <h4 className="font-semibold mb-1">{item.label}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your School?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of schools already using EduManage Pro to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              <span className="font-semibold">EduManage Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 EduManage Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
