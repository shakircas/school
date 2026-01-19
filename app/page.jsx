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
} from "lucide-react";
import { Quote, Award, BookMarked } from "lucide-react";
import { Clock, Phone, Mail, Send } from "lucide-react";
import { User, MessageSquare } from "lucide-react";
import {
  ClipboardList,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ResultSearch } from "./results/ResultSearch";
import NoticeBoard from "./home/NoticeBoard";

const fetcher = (url) => fetch(url).then((res) => res.json());

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071",
    title: "GHS Hamza Rashaka Nowshera",
    subtitle:
      "A legacy of academic excellence and character building in Nowshera.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2170",
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

  return (
    <main className="print:hidden mt-22 min-h-screen bg-[#fcfcfc] dark:bg-[#080808] text-slate-900 dark:text-white">
      <LandingNavbar />
      {/* 1. NEWS TICKER */}
      <div className="bg-emerald-700 text-white py-3 overflow-hidden mt-16">
        <div className="container mx-auto px-6 flex items-center">
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded text-xs font-bold uppercase mr-4 shrink-0">
            <Megaphone size={14} className="animate-pulse" /> Urgent
          </div>
          <div className="whitespace-nowrap animate-marquee flex gap-12 text-sm font-medium">
            <span>
              • Annual Board Exam Forms for Grade 10 deadline: Feb 20th.
            </span>
            <span>
              • New Science Lab equipment inaugurated by DEO Nowshera.
            </span>
            <span>
              • Congratulations to our Cricket Team for winning the District
              Cup!
            </span>
          </div>
        </div>
      </div>
      {/* 9. HEADMASTER'S MESSAGE SECTION */}
      <Card className="container my-4 mx-auto px-6">
        <section className="py-8 relative overflow-hidden bg-white dark:bg-[#050505]">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 dark:bg-emerald-900/5 -skew-x-12 translate-x-20 hidden lg:block" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Image Side */}
              <div className="w-full lg:w-2/5">
                <div className="relative">
                  {/* Main Photo Frame */}
                  <div className="relative z-10 rounded-[3rem] overflow-hidden border-[12px] border-white dark:border-slate-800 shadow-2xl aspect-[4/5]">
                    <img
                      src="/headmaster.jpg" // Replace with Dr. Abdul Hafeez's actual photo
                      alt="Dr. Abdul Hafeez - Headmaster GHS Hamza Rashaka"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Experience Badge */}
                  <div className="absolute -bottom-6 -right-6 z-20 bg-emerald-600 text-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
                    <div className="text-4xl font-black">10+</div>
                    <div className="text-xs font-bold uppercase tracking-widest leading-tight">
                      Years of <br /> Educational <br /> Leadership
                    </div>
                  </div>

                  {/* Decorative SVG Pattern */}
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-100 dark:bg-emerald-900/20 rounded-full -z-10 blur-3xl" />
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-3/5 space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none px-4 py-1">
                    Leadership Message
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                    From the Desk of the{" "}
                    <span className="text-emerald-600 italic">Headmaster</span>
                  </h2>
                </div>

                <div className="relative">
                  <Quote className="absolute -top-6 -left-8 text-emerald-100 dark:text-emerald-900/30 h-20 w-20 -z-10" />
                  <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-light italic">
                    "At GHS Hamza Rashaka Nowshera, we believe that education is
                    not merely the acquisition of knowledge, but the formation
                    of character. Our mission is to transform the bright young
                    minds of Nowshera into responsible, innovative, and
                    empathetic citizens of Pakistan."
                  </p>
                </div>

                <div className="space-y-6 text-slate-500 dark:text-slate-400">
                  <p>
                    It is an honor to lead this historic institution. In
                    alignment with the KPK Government's vision, we are
                    prioritizing STEM education and digital literacy to ensure
                    our students from Class 6th to 10th are ready for the global
                    stage.
                  </p>
                  <p>
                    We invite parents and the community to join us in this
                    journey of excellence. Together, we can build a future where
                    every child has the tools to succeed regardless of their
                    background.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Dr. Abdul Hafeez
                    </h4>
                    <p className="text-emerald-600 font-medium tracking-wide uppercase text-sm">
                      PhD in Education | Headmaster
                    </p>
                  </div>
                  <div className="hidden sm:flex gap-4">
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
      </Card>

      <ResultSearch />
      {/* 2. HERO CAROUSEL */}
      <section className="relative h-screen py-4 w-full overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10" />
            <img
              src={slides[currentSlide].image}
              className="w-full h-full object-cover opacity-60"
              alt="Hero"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 z-20 flex items-center container mx-auto px-6">
          <div className="max-w-3xl space-y-6">
            <Badge className="bg-emerald-500 text-white px-4 py-1">
              Govt. High School Nowshera11
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl text-slate-200">
              {slides[currentSlide].subtitle}
            </p>
            <div className="flex gap-4 pt-4">
              <Button
                size="xl"
                className="bg-emerald-600 rounded-full px-10 h-16"
              >
                Enrollment 2026
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="bg-white/10 text-white border-white/20 rounded-full px-10 h-16 backdrop-blur-md"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* 3. STATS BAR */}
      <section className="container mx-auto px-6 -mt-12 relative z-30">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 grid grid-cols-2 lg:grid-cols-4 gap-8 shadow-2xl">
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
      {/* 4. MISSION & VISION (NEW) */}
      <Card className="container my-8 mx-auto px-6 py-16">
        <section className="py-4 container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black mb-6">
              Our Mission to <span className="text-emerald-600">Empower</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-8">
              To provide high-quality, accessible education that fosters
              critical thinking, moral integrity, and social responsibility in
              the youth of Hamza Rashaka.
            </p>
            <div className="space-y-4">
              {[
                "State-certified faculty",
                "Modern Science & IT Labs",
                "Free Textbooks & Uniform Support",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200"
                >
                  <CheckCircle className="text-emerald-500" /> {text}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/20 p-8 rounded-[2rem] text-center space-y-4">
              <Heart className="mx-auto text-emerald-600" size={40} />
              <h3 className="font-bold">Character Building</h3>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-[2rem] text-center space-y-4 mt-8">
              <Microscope className="mx-auto text-blue-600" size={40} />
              <h3 className="font-bold">Practical Learning</h3>
            </div>
          </div>
        </section>
      </Card>
      {/* 5. NOTICE BOARD & DOWNLOADS */}
      <Card className="container mx-auto px-6">
        <NoticeBoard />
      </Card>

      {/* 7. TEACHERS SECTION */}
      <section className="py-24 bg-[#0a0a0a] text-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-5xl font-black tracking-tighter italic">
                Our Mentors
              </h2>
              <p className="text-slate-400 mt-2">
                Guided by the best subject specialists in Nowshera.
              </p>
            </div>
            <Button variant="link" className="text-emerald-400">
              View All Faculty
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.length > 0
              ? teachers.map((t) => <TeacherCard key={t._id} teacher={t} />)
              : [1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-[400px] bg-slate-800 rounded-3xl"
                  />
                ))}
          </div>
        </div>
      </section>
      {/* 8. ADMISSION STEPS (NEW) */}
      <section className="py-24 bg-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-white">
            How to Join Us
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Step num="01" text="Visit School Office" />
            <Step num="02" text="Submit Documents" />
            <Step num="03" text="Entrance Assessment" />
            <Step num="04" text="Final Enrollment" />
          </div>
        </div>
      </section>
      {/* 10. CONTACT & LOCATION SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Find Us in <span className="text-emerald-600">Nowshera</span>
            </h2>
            <p className="text-slate-500">
              We are located in the heart of Hamza Rashaka, easily accessible
              for students and parents across the Kheshgi Payan area.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Contact Information Cards */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm group hover:shadow-xl transition-all">
                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white text-wrap">
                  Visit Us
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  3W26+23X, Kheshgi Payan,
                  <br />
                  Nowshera, Khyber Pakhtunkhwa
                </p>
                <Button
                  variant="link"
                  className="px-0 text-emerald-600 mt-4 h-auto"
                  asChild
                >
                  <a
                    href="https://maps.google.com/?cid=14556189708803996360&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Directions <ArrowRight size={14} className="ml-2" />
                  </a>
                </Button>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm group hover:shadow-xl transition-all">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  School Hours
                </h3>
                <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <p className="flex justify-between">
                    <span>Mon - Sat:</span> <span>7:00 AM - 2:00 PM</span>
                  </p>
                  <p className="flex justify-between font-bold text-red-500">
                    <span>Sunday:</span> <span>Closed</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Map Embed Area */}
            <div className="lg:col-span-2 h-full min-h-[500px] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              {/*
          Instructions for Real Map: 
          Replace the iframe src with your specific Google Maps Embed API key/URL.
        */}
              <iframe
                title="GHS Hamza Rashaka Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3303.4567!2d71.9395605!3d34.0985433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d933da9c9c9917%3A0xca01f96b0c757ac8!2sGovernment%20high%20school%20(GHS)%20Hamza%20Rashaka!5e0!3m2!1sen!2s!4v1700000000000"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700"
              />

              {/* Floating Contact Overlay (Optional) */}
              <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl z-20">
                <h4 className="font-bold mb-4">Quick Contact</h4>
                <div className="space-y-3">
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
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left Side: Illustration or Text */}
            <div className="bg-emerald-600 p-12 lg:p-20 text-white space-y-8 flex flex-col justify-center">
              <h2 className="text-4xl font-bold">Have a Question?</h2>
              <p className="text-emerald-100 text-lg">
                Whether it's about Class 6th admissions, exam schedules, or
                general inquiries, our administrative team is here to help you.
              </p>

              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <p className="font-medium">
                    Direct response within 24-48 hours
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <p className="font-medium">
                    Secure and confidential handling
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Actual Form */}
            <div className="p-12 lg:p-20">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="e.g. Ahmad Khan"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="tel"
                        placeholder="+92 XXX XXXXXXX"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
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
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                <Button
                  size="xl"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-16 text-lg font-bold shadow-lg shadow-emerald-900/20"
                >
                  Send Inquiry <Send size={18} className="ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 12. ADMISSIONS DETAIL SECTION */}
      <section className="py-24 bg-white dark:bg-[#080808]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Age Requirements Table */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Eligibility
                </Badge>
                <h2 className="text-4xl font-black tracking-tight">
                  Age <span className="text-emerald-600">Requirements</span>
                </h2>
                <p className="text-slate-500">
                  As per the KPK Education Department regulations, students must
                  meet the following age criteria for admission.
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900">
                      <th className="p-6 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
                        Class Level
                      </th>
                      <th className="p-6 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
                        Minimum Age
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
                        className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-colors"
                      >
                        <td className="p-6 font-medium">{row.grade}</td>
                        <td className="p-6 text-slate-500">{row.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Age is calculated as of 1st March of
                  the admission year. A valid B-Form is mandatory for age
                  verification.
                </p>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-10 lg:p-16 rounded-[3rem] border border-slate-100 dark:border-slate-800">
              <div className="space-y-8">
                <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-3xl font-bold">
                  Required <br />{" "}
                  <span className="text-emerald-600">Documentation</span>
                </h3>

                <ul className="space-y-6">
                  {[
                    {
                      title: "Student B-Form",
                      desc: "Original and 2 attested photocopies.",
                    },
                    {
                      title: "Father/Guardian CNIC",
                      desc: "Attested photocopies required.",
                    },
                    {
                      title: "School Leaving Certificate (SLC)",
                      desc: "From the previous recognized institution.",
                    },
                    {
                      title: "Passport Size Photos",
                      desc: "4 recent photos with blue background.",
                    },
                    {
                      title: "Character Certificate",
                      desc: "Issued by the last school attended.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <CheckCircle2
                        className="text-emerald-500 shrink-0 mt-1"
                        size={20}
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-none mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-black p-6 rounded-2xl text-lg sm:text-base hover:scale-[1.02] transition-transform">
                 <Download /> Admission Guide (PDF)
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

/* --- SUB-COMPONENTS --- */

function StatBox({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-3xl font-bold leading-none">{value}</p>
        <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

function Step({ num, text }) {
  return (
    <div className="space-y-4">
      <div className="text-6xl font-black opacity-30">{num}</div>
      <p className="text-xl font-bold">{text}</p>
    </div>
  );
}

function TeacherCard({ teacher }) {
  return (
    <div className="group space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-slate-800 shadow-2xl">
        <img
          src={
            teacher.photo ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`
          }
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          alt={teacher.name}
        />
      </div>
      <div>
        <h4 className="text-xl font-bold">{teacher.name}</h4>
        <p className="text-emerald-500 text-sm">
          {teacher.designation || "Senior Faculty"}
        </p>
      </div>
    </div>
  );
}
