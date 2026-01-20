"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Megaphone,
  ArrowRight,
  Download,
  GraduationCap,
  Users,
  BookOpen,
  MapPin,
  CheckCircle,
  Trophy,
  Microscope,
  Laptop,
  Library,
  Heart,
  Quote,
  Award,
  BookMarked,
  Clock,
  Phone,
  Mail,
  Send,
  User,
  MessageSquare,
  ClipboardList,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ResultSearch } from "./results/ResultSearch";
import NoticeBoard from "./home/NoticeBoard";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

const slides = [
  {
    image: "/show.jpg",
    title: "GHS Hamza Rashaka Nowshera",
    subtitle:
      "A legacy of academic excellence and character building in Nowshera.",
  },
  {
    image: "/show3.jpg",
    title: "Future-Ready Education",
    subtitle:
      "From Class 6th to 10th, we prepare students for the modern world.",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: stats } = useSWR("/api/dashboard/stats", fetcher);
  const { data: teachersRes } = useSWR("/api/teachers", fetcher);

  const teachers = teachersRes?.teachers?.slice(0, 4) || [];

  const newsItems = [
    "Annual Board Exam Forms for Grade 10 deadline: Feb 20th.",
    "New Science Lab equipment inaugurated by DEO Nowshera.",
    "Congratulations to our Cricket Team for winning the District Cup!",
    "Admission for Class 6th is now open for the 2026 Session.",
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="print:hidden mt-16 min-h-screen bg-[#fcfcfc] dark:bg-[#080808] text-slate-900 dark:text-white">
      <LandingNavbar />

      {/* 1. NEWS TICKER */}
      {/* 1. NEWS TICKER - Animated Crossfade Version */}
      <div className="mt-24 bg-emerald-700 text-white py-3 overflow-hidden border-y border-emerald-600/50">
        <div className="container mx-auto px-6 flex items-center">
          {/* Label */}
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded text-xs font-bold uppercase mr-6 shrink-0 z-10">
            <Megaphone size={14} className="animate-pulse" /> Urgent
          </div>

          {/* Animated News Container */}
          <div className="relative h-6 flex-1 flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide} // We reuse the currentSlide index or create a new state for news
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute whitespace-nowrap text-sm font-medium tracking-wide flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {newsItems[currentSlide % newsItems.length]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. HERO CAROUSEL - Adjusted for better responsiveness */}
      <section className="relative h-[85vh] md:h-screen w-full overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
            <img
              src={slides[currentSlide].image}
              className="w-full h-full object-cover opacity-60"
              alt="Hero"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl space-y-6">
              <Badge className="bg-emerald-500 text-white px-4 py-1 animate-fade-in">
                Govt. High School Nowshera
              </Badge>
              <h1 className="text-4xl md:text-7xl font-black text-white leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-slate-200 max-w-xl">
                {slides[currentSlide].subtitle}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="xl"
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-10 h-14 md:h-16"
                >
                  Enrollment 2026
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-full px-10 h-14 md:h-16 backdrop-blur-md"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS BAR - Centered and Aligned */}
      <section className="container mx-auto px-6 -mt-16 relative z-30">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 shadow-2xl">
          <StatBox
            icon={<Users />}
            label="Students"
            value={stats?.students?.total || "900+"}
          />
          <StatBox
            icon={<GraduationCap />}
            label="Experts"
            value={stats?.teachers?.total || "42"}
          />
          <StatBox icon={<Trophy />} label="Years" value="25+" />
          <StatBox icon={<MapPin />} label="Nowshera" value="KPK" />
        </div>
      </section>

      {/* 9. HEADMASTER'S MESSAGE SECTION */}
      <section
        id="headmaster"
        className="py-24 bg-white dark:bg-[#050505] overflow-hidden"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-2/5">
              <div className="relative group">
                <div className="relative z-10 rounded-[3rem] overflow-hidden border-[12px] border-white dark:border-slate-800 shadow-2xl aspect-[4/5]">
                  <img
                    src="/headmaster.jpg"
                    alt="Dr. Abdul Hafeez"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 z-20 bg-emerald-600 text-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
                  <div className="text-4xl font-black">10+</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                    Years of <br /> Educational <br /> Leadership
                  </div>
                </div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-100 dark:bg-emerald-900/20 rounded-full -z-10 blur-3xl" />
              </div>
            </div>

            <div className="w-full lg:w-3/5 space-y-8">
              <div className="space-y-4">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-1">
                  Leadership Message
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  From the Desk of the{" "}
                  <span className="text-emerald-600 italic">Headmaster</span>
                </h2>
              </div>
              <div className="relative">
                <Quote className="absolute -top-8 -left-8 text-emerald-100 dark:text-emerald-900/30 h-24 w-24 -z-10" />
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-light italic">
                  "At GHS Hamza Rashaka Nowshera, we believe that education is
                  not merely the acquisition of knowledge, but the formation of
                  character."
                </p>
              </div>
              <div className="space-y-6 text-slate-500 dark:text-slate-400 text-lg">
                <p>
                  It is an honor to lead this historic institution. In alignment
                  with the KPK Government's vision, we are prioritizing STEM
                  education and digital literacy.
                </p>
                <p>
                  We invite parents and the community to join us in this journey
                  of excellence. Together, we can build a future where every
                  child succeeds.
                </p>
              </div>
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Dr. Abdul Hafeez
                  </h4>
                  <p className="text-emerald-600 font-medium tracking-wide uppercase text-sm">
                    PhD in Education | Headmaster
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <Award className="text-emerald-600 mb-1" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Certified
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <BookMarked className="text-emerald-600 mb-1" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Visionary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. RESULTS SEARCH */}
      <section id="results" className="py-12">
        <ResultSearch />
      </section>

      {/* 4. MISSION & VISION */}
      <section id="mission" className="py-24 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Our Mission to <span className="text-emerald-600">Empower</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              To provide high-quality, accessible education that fosters
              critical thinking, moral integrity, and social responsibility in
              the youth of Hamza Rashaka.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "State-certified faculty",
                "Modern Science & IT Labs",
                "Free Textbooks",
                "Uniform Support",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800"
                >
                  <CheckCircle className="text-emerald-500 shrink-0" /> {text}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/20 p-10 rounded-[3rem] text-center space-y-4 hover:translate-y-[-10px] transition-transform">
              <Heart className="mx-auto text-emerald-600" size={48} />
              <h3 className="font-bold text-xl">Character Building</h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-10 rounded-[3rem] text-center space-y-4 mt-12 hover:translate-y-[-10px] transition-transform">
              <Microscope className="mx-auto text-blue-600" size={48} />
              <h3 className="font-bold text-xl">Practical Learning</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NOTICE BOARD & DOWNLOADS */}
      <NoticeBoard />

      {/* 7. TEACHERS SECTION */}
      <section
        id="faculty"
        className="py-24 bg-[#0a0a0a] text-white overflow-hidden"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic">
                Our Mentors
              </h2>
              <p className="text-slate-400 mt-2 text-lg">
                Guided by the best subject specialists in Nowshera.
              </p>
            </div>
            <Button
              variant="link"
              className="text-emerald-400 p-0 h-auto text-lg hover:text-emerald-300"
            >
              View All Faculty <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.length > 0
              ? teachers.map((t) => <TeacherCard key={t._id} teacher={t} />)
              : [1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-[450px] bg-slate-800 rounded-3xl"
                  />
                ))}
          </div>
        </div>
      </section>

      {/* 8. ADMISSION STEPS */}
      <section className="py-24 bg-emerald-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
            How to Join Us
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12">
            <Step num="01" text="Visit School Office" />
            <Step num="02" text="Submit Documents" />
            <Step num="03" text="Entrance Assessment" />
            <Step num="04" text="Final Enrollment" />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
      </section>

      {/* 10. CONTACT & LOCATION SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Find Us in <span className="text-emerald-600">Nowshera</span>
            </h2>
            <p className="text-slate-500 text-lg">
              Located in the heart of Hamza Rashaka, easily accessible for
              students across Kheshgi Payan.
            </p>
          </div>

          <div id="contact" className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <ContactInfoCard
                icon={<MapPin />}
                title="Visit Us"
                color="emerald"
                details="3W26+23X, Kheshgi Payan, Nowshera, KPK"
                link="http://maps.google.com"
                linkText="Get Directions"
              />
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">School Hours</h3>
                <div className="space-y-3 text-sm">
                  <p className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">Mon - Sat:</span>{" "}
                    <span className="font-bold">7:00 AM - 2:00 PM</span>
                  </p>
                  <p className="flex justify-between text-red-500 font-bold">
                    <span>Sunday:</span> <span>Closed</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 min-h-[500px] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative group">
              <iframe
                title="GHS Hamza Rashaka Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.626463378526!2d71.9567439757165!3d34.05344301764103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d9298517208753%3A0xc6c769493f0b2a7d!2sGovt.%20High%20School%20Hamza%20Rashaka%20Nowshera!5e0!3m2!1sen!2s!4v1700000000000"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl z-20">
                <h4 className="font-bold mb-4">Quick Contact</h4>
                <div className="space-y-4">
                  <a
                    href="tel:#"
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  >
                    <Phone size={16} className="text-emerald-600" /> +92 (000)
                    000-0000
                  </a>
                  <a
                    href="mailto:info@ghshamzarashaka.edu.pk"
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  >
                    <Mail size={16} className="text-emerald-600" />{" "}
                    info@ghshamzarashaka.edu.pk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. QUICK CONTACT FORM */}
      <section className="pb-24 container mx-auto px-6">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="bg-emerald-600 p-12 md:p-20 text-white space-y-8 flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Have a Question?
                </h2>
                <p className="text-emerald-100 text-lg mt-6">
                  Whether it's about Class 6th admissions, exam schedules, or
                  general inquiries, our team is here.
                </p>
                <div className="space-y-6 pt-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    <p className="font-medium text-lg">
                      Response within 24-48 hours
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    <p className="font-medium text-lg">
                      Professional academic guidance
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="p-12 md:p-20">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField
                    label="Full Name"
                    icon={<User />}
                    placeholder="e.g. Ahmad Khan"
                  />
                  <InputField
                    label="Phone Number"
                    icon={<Phone />}
                    placeholder="+92 XXX XXXXXXX"
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare
                      className="absolute left-4 top-6 text-slate-400"
                      size={18}
                    />
                    <textarea
                      rows={4}
                      placeholder="How can we help you today?"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 focus:ring-0 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
                <Button
                  size="xl"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-16 text-lg font-bold shadow-xl shadow-emerald-900/20 group"
                >
                  Send Inquiry{" "}
                  <Send
                    size={18}
                    className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 12. ADMISSIONS DETAIL SECTION */}
      <section id="admissions" className="py-24 bg-white dark:bg-[#080808]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4">
                  Eligibility
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Age <span className="text-emerald-600">Requirements</span>
                </h2>
                <p className="text-slate-500 text-lg">
                  As per KPK Education Department regulations for the 2026
                  academic year.
                </p>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="p-6 font-bold text-slate-900 dark:text-white">
                        Class Level
                      </th>
                      <th className="p-6 font-bold text-slate-900 dark:text-white text-right">
                        Age Bracket
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { grade: "Class 6th", age: "11 - 12 Years" },
                      { grade: "Class 7th", age: "12 - 13 Years" },
                      { grade: "Class 8th", age: "13 - 14 Years" },
                      { grade: "Class 9th", age: "14 - 15 Years" },
                      { grade: "Class 10th", age: "15 - 16 Years" },
                    ].map((row) => (
                      <tr
                        key={row.grade}
                        className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                      >
                        <td className="p-6 font-bold text-lg">{row.grade}</td>
                        <td className="p-6 text-slate-500 text-right font-medium">
                          {row.age}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>Verification Required:</strong> Age is calculated as
                  of 1st March. A valid NADRA B-Form is mandatory for all new
                  enrollments.
                </p>
              </div>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-10 md:p-16 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-xl">
                    <FileText className="text-emerald-600" size={40} />
                  </div>
                  <h3 className="text-3xl font-bold leading-tight">
                    Required <br />{" "}
                    <span className="text-emerald-600">Documentation</span>
                  </h3>
                </div>
                <ul className="grid gap-6">
                  {[
                    {
                      title: "Student B-Form",
                      desc: "Original + 2 attested copies",
                    },
                    { title: "Guardian CNIC", desc: "Attested photocopies" },
                    {
                      title: "Leaving Certificate",
                      desc: "From previous recognized school",
                    },
                    {
                      title: "Passport Photos",
                      desc: "4 recent blue background photos",
                    },
                    {
                      title: "Character Certificate",
                      desc: "From last school attended",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4 group">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 className="text-emerald-500" size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                          {item.title}
                        </h4>
                        <p className="text-slate-500">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-black h-16 rounded-2xl text-lg font-bold hover:scale-[1.02] transition-all shadow-xl">
                  <Download className="mr-2" /> Admission Guide (PDF)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* --- HELPER SUB-COMPONENTS --- */

function StatBox({ icon, label, value }) {
  return (
    <div className="flex items-center gap-5 group p-2">
      <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-black leading-none">{value}</p>
        <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mt-2">
          {label}
        </p>
      </div>
    </div>
  );
}

function ContactInfoCard({ icon, title, details, link, linkText, color }) {
  const colorClass =
    color === "emerald"
      ? "bg-emerald-100 text-emerald-600"
      : "bg-blue-100 text-blue-600";
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl group hover:-translate-y-1 transition-all">
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${colorClass}`}
      >
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
        {details}
      </p>
      <Link
        href={link}
        target="_blank"
        className="text-emerald-600 font-bold text-sm flex items-center hover:gap-2 transition-all"
      >
        {linkText} <ArrowRight size={14} className="ml-1" />
      </Link>
    </div>
  );
}

function InputField({ label, icon, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 focus:ring-0 transition-all outline-none"
        />
      </div>
    </div>
  );
}

function Step({ num, text }) {
  return (
    <div className="space-y-4 group">
      <div className="text-7xl font-black opacity-20 group-hover:opacity-100 transition-opacity duration-500">
        {num}
      </div>
      <p className="text-xl font-bold leading-tight">{text}</p>
    </div>
  );
}

function TeacherCard({ teacher }) {
  return (
    <div className="group space-y-5">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-slate-800 shadow-2xl">
        <img
          src={
            teacher.photo.url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`
          }
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
          alt={teacher.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
          <Button className="w-full bg-emerald-600 rounded-xl">
            Profile Details
          </Button>
        </div>
      </div>
      <div className="text-center md:text-left px-2">
        <h4 className="text-2xl font-bold group-hover:text-emerald-500 transition-colors">
          {teacher.name}
        </h4>
        <p className="text-emerald-500 font-medium tracking-wide uppercase text-xs mt-1">
          {teacher.designation || "Senior Faculty"}
        </p>
      </div>
    </div>
  );
}
