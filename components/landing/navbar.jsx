"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, GraduationCap, User } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export function LandingNavbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isAuthenticated = !!session?.user;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
      <div className="container mx-auto h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold">
          <GraduationCap className="h-6 w-6 text-primary" />
          SmartSchool
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="nav-link">
            Features
          </Link>
          <Link href="#pricing" className="nav-link">
            Pricing
          </Link>
          <Link href="#contact" className="nav-link">
            Contact
          </Link>

          {/* Auth Section */}
          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{session.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({session.user.role})
                </span>
              </div>

              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </Button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="flex flex-col p-4 gap-3">
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#contact">Contact</Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/signup">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
