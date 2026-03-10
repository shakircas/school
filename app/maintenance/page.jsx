"use client";

import { Hammer, Cog, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        {/* Animated Icon Container */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100">
            <Cog
              size={64}
              className="text-indigo-600 animate-[spin_8s_linear_infinite]"
            />
            <Hammer
              size={32}
              className="text-indigo-400 absolute bottom-6 right-6 animate-bounce"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            System Update in Progress
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            We are currently synchronizing the database for the
            <span className="text-indigo-600 font-bold">
              {" "}
              New Academic Year
            </span>
            . Access will be restored shortly.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full text-amber-700 text-xs font-black uppercase tracking-widest">
            <span className="h-2 w-2 bg-amber-500 rounded-full animate-ping" />
            Database Re-indexing Active
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
