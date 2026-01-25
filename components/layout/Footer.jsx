import React from "react";
import Link from "next/link";
import {
  School,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-zinc-800 pt-16 pb-8 overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
                <School className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-black tracking-tight uppercase italic">
                Edu<span className="text-blue-500">Manage</span>
              </h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Empowering the next generation with AI-driven academic management
              and a seamless learning experience.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-blue-900 hover:border-blue-900 transition-all"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-black font-bold mb-6 uppercase text-xs tracking-[0.2em]">
              Academics
            </h3>
            <ul className="space-y-4">
              {[
                "Admissions",
                "Curriculum",
                "Exam Schedule",
                "Library",
                "E-Learning",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-zinc-500 hover:text-primary text-sm transition-colors flex items-center group"
                  >
                    <ArrowUpRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-blue-500" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support / Legal */}
          <div>
            <h3 className="text-black font-bold mb-6 uppercase text-xs tracking-[0.2em]">
              Information
            </h3>
            <ul className="space-y-4">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Student Portal",
                "Teacher Handbook",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-zinc-500 hover:text-primary text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & AI Status */}
          <div className="space-y-6">
            <h3 className="text-black font-bold mb-2 uppercase text-xs tracking-[0.2em]">
              Get In Touch
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-zinc-400">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span>
                  123 Education Ave, <br />
                  Learning District, NY 10001
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span>+1 (555) 000-1234</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>hello@edumanage.edu</span>
              </div>
            </div>

            {/* AI Status Card */}
            <div className="p-4 rounded-2xl from-zinc-900 to-zinc-950 border border-zinc-800 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-[11px] font-bold text-black uppercase tracking-tighter">
                  AI Core Status
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mb-2">
                Paper Generator & Marking Engine are active.
              </p>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[94%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">
            © {currentYear} EduManage School Systems. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-600 text-xs">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Data Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System V.2.4.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
