"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User,
  Search,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Notices", href: "#notices" },
    { name: "Message", href: "#headmaster" },
    { name: "Mission", href: "#mission" },
    { name: "Faculty", href: "#faculty" },
    { name: "Admissions", href: "#admissions" },
    { name: "Results", href: "#results" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={cn(
        " fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out",
        isScrolled
          ? "py-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-md px-6"
          : "py-6 bg-black px-8"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* SCHOOL LOGO & NAME */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center group-hover:rotate-[10deg] transition-transform duration-500 shadow-xl shadow-emerald-500/20">
            <GraduationCap className="text-white" size={28} />
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                "text-xl font-black tracking-tighter leading-none transition-colors",
                !isScrolled ? "text-white" : "text-slate-900 dark:text-white"
              )}
            >
              GHS HAMZA RASHAKA
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] mt-1",
                !isScrolled ? "text-emerald-400" : "text-emerald-600"
              )}
            >
              Nowshera, KPK
            </span>
          </div>
        </Link>

        {/* CENTER NAVIGATION - HIDDEN ON MOBILE */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-[13px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all hover:bg-emerald-500/10",
                !isScrolled
                  ? "text-slate-200 hover:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* ACTION SECTION */}
        <div className="flex items-center gap-3">
          {/* USER PORTAL DROPDOWN */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200">
                  <div className="h-8 w-8 rounded-full overflow-hidden relative border-2 border-white shadow-sm">
                    <Image
                      src={
                        session.user.image ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name}`
                      }
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:block">
                    My Account
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 rounded-2xl shadow-2xl border-slate-100"
              >
                <DropdownMenuLabel className="p-4">
                  <p className="text-sm font-bold">{session.user.name}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                  <Badge className="mt-2 bg-emerald-600 hover:bg-emerald-600">
                    {session.user.role || "Student"}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="rounded-xl py-3 cursor-pointer"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-xl py-3 cursor-pointer"
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-xl py-3 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "rounded-full px-6",
                  !isScrolled
                    ? "text-white hover:bg-white/10"
                    : "text-slate-600"
                )}
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Link href="/signup">Join Portal</Link>
              </Button>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "xl:hidden rounded-full h-10 w-10",
              !isScrolled
                ? "text-white hover:bg-white/10"
                : "text-slate-900 dark:text-white"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* MOBILE NAV OVERLAY */}
      {mobileOpen && (
        <div className="xl:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between group py-4 border-b border-slate-50 dark:border-slate-900"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {link.name}
                </span>
                <ChevronRight className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
          {!session && (
            <div className="flex flex-col gap-3 pt-4">
              <Button
                className="w-full bg-emerald-600 h-14 text-lg rounded-2xl"
                asChild
              >
                <Link href="/signup">Join Us</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 text-lg rounded-2xl"
                asChild
              >
                <Link href="/login">Portal Login</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
