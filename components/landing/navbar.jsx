"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  Bell,
  Settings,
  Badge,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle scroll effect for transparent to glass transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Academics", href: "#academics" },
    { name: "Faculty", href: "#faculty" },
    { name: "Admissions", href: "#admissions" },
    { name: "Events", href: "#events" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out px-6",
        isScrolled
          ? "py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
          : "py-6 bg-black"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={28}
              height={28}
              className="brightness-0 invert"
            />
          </div>
          <span
            className={cn(
              "text-2xl font-black tracking-tighter transition-colors",
              !isScrolled ? "text-white" : "text-slate-900 dark:text-white"
            )}
          >
            Lumina
          </span>
        </Link>

        {/* DESKTOP NAV - CENTERED */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-all hover:opacity-70",
                !isScrolled
                  ? "text-indigo-50"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* AUTH SECTION - RIGHT */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 border border-slate-200/50 overflow-hidden shadow-inner"
                  >
                    <Image
                      src={
                        session.user.image ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name}`
                      }
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2 rounded-2xl mt-2 backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                      <Badge className="w-fit mt-2 bg-indigo-50 text-indigo-600 border-none text-[10px] uppercase font-black">
                        {session.user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl cursor-pointer py-3"
                  >
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl cursor-pointer py-3">
                    <User size={18} className="mr-2" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="rounded-xl cursor-pointer py-3 text-red-500 focus:text-red-500 focus:bg-red-50"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut size={18} className="mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                asChild
                className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 shadow-lg shadow-indigo-500/25"
              >
                <Link href="/dashboard">Portal</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "rounded-full px-6 transition-colors",
                  !isScrolled
                    ? "text-white hover:bg-white/10"
                    : "text-slate-900"
                )}
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 shadow-lg shadow-indigo-500/25"
              >
                <Link href="/signup">Join Us</Link>
              </Button>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "lg:hidden rounded-xl",
              !isScrolled ? "text-white" : "text-slate-900 dark:text-white"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
              onClick={() => setMobileOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-slate-100 dark:border-slate-800" />
          {!session && (
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-indigo-600" asChild>
                <Link href="/signup">Signup</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
