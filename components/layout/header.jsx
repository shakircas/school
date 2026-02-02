"use client";

import { useTheme } from "next-themes";
import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  LogIn,
  UserPlus,
  Check,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function Header() {
  const { theme, setTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const { data: session, status } = useSession();
  const user = session?.user;

  // 1. Dynamic Fetching of Notifications
  const { data: notifications, mutate } = useSWR(
    status === "authenticated" ? "/api/notifications" : null,
    fetcher,
    { refreshInterval: 30000 } // Auto-refresh every 30s
  );

  // 2. Calculate Unread Count
  const unreadNotifications =
    notifications?.filter(
      (n) =>
        !n.readBy?.some(
          (read) => read.user === user?.id || read.user?._id === user?.id
        )
    ) || [];

  // 3. Mark as Read Function
  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      mutate(); // Optimistic UI update
    } catch (error) {
      console.error("Error marking read", error);
    }
  };

  return (
    <header className="print:hidden sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* LEFT: Branding/Search Placeholder */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="font-black text-xl tracking-tighter text-indigo-600"
          >
            SCHOOL<span className="text-slate-400">OS</span>
          </Link>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border ${
              isOnline
                ? "bg-emerald-50 border-emerald-100"
                : "bg-amber-50 border-amber-100"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full animate-pulse ${
                isOnline ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isOnline ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isOnline ? "Live" : "Offline"}
            </span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </Button>

          {status === "authenticated" ? (
            <>
              {/* Dynamic Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200 transition-all"
                  >
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-950 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 rounded-[1.5rem] p-2 shadow-2xl border-slate-100"
                >
                  <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="p-0 font-bold text-base">
                      Updates
                    </DropdownMenuLabel>
                    <Badge
                      variant="secondary"
                      className="text-[10px] rounded-md"
                    >
                      {unreadNotifications.length} New
                    </Badge>
                  </div>
                  <DropdownMenuSeparator className="mx-2" />

                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {notifications?.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm italic">
                        No announcements yet
                      </div>
                    ) : (
                      notifications?.slice(0, 5).map((n) => {
                        const isRead = n.readBy?.some(
                          (r) => r.user === user.id || r.user?._id === user.id
                        );
                        return (
                          <DropdownMenuItem
                            key={n._id}
                            className={`flex flex-col items-start gap-1 p-4 cursor-pointer rounded-xl mb-1 transition-colors ${
                              !isRead
                                ? "bg-indigo-50/50 dark:bg-indigo-900/10"
                                : ""
                            }`}
                            onClick={() => !isRead && markAsRead(n._id)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`text-xs font-bold ${
                                  !isRead ? "text-indigo-600" : "text-slate-500"
                                }`}
                              >
                                {n.category}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatDistanceToNow(new Date(n.createdAt))} ago
                              </span>
                            </div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                              {n.title}
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {n.message}
                            </p>
                            {!isRead && (
                              <div className="mt-2 flex items-center text-[10px] font-bold text-indigo-600 gap-1 uppercase tracking-widest">
                                <Check className="h-3 w-3" /> Mark as read
                              </div>
                            )}
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </div>

                  <DropdownMenuSeparator className="mx-2" />
                  <Link href="/notifications" className="block w-full">
                    <Button
                      variant="ghost"
                      className="w-full text-xs font-bold text-slate-500 hover:text-indigo-600 rounded-xl"
                    >
                      View All Notifications
                    </Button>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Account */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-indigo-100 transition-all"
                  >
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="bg-indigo-600 text-white font-bold">
                        {user.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-[1.5rem] p-2 shadow-2xl"
                >
                  <div className="p-4 flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16 mb-2 border-4 border-indigo-50">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="bg-indigo-600 text-white text-xl">
                        {user.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-black text-slate-800 dark:text-slate-100">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-400 mb-2">
                      {user.email}
                    </span>
                    <Badge className="bg-indigo-100 text-indigo-700 border-none capitalize font-bold text-[10px]">
                      {user.role || "Member"}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl p-3 cursor-pointer"
                  >
                    <Link href="/profile">
                      <User className="mr-3 h-4 w-4" /> Profile Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl p-3 cursor-pointer"
                  >
                    <Link href="/settings">
                      <Settings className="mr-3 h-4 w-4" /> Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="rounded-xl p-3 cursor-pointer text-rose-600 hover:bg-rose-50"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-3 h-4 w-4" />{" "}
                    <strong>Sign Out</strong>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="rounded-xl font-bold"
                onClick={() => signIn()}
              >
                Login
              </Button>
              <Button
                className="rounded-xl bg-indigo-600 font-bold shadow-lg shadow-indigo-100"
                asChild
              >
                <Link href="/auth/signup">Join School</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
