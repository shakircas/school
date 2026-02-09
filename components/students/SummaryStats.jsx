import React from "react";
import { Card } from "../ui/card";
import { BadgeCheck, BookOpen, GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const SummaryStats = ({ data, teachers, subjects, classes }) => {
  return (
    <div>
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: data?.total || 0,
            icon: Users,
            color: "black",
          },

          {
            label: "Teachers",
            value: teachers?.length || 0,
            icon: GraduationCap,
            color: "black",
          },

          {
            label: "Subjects",
            value: subjects?.length || 0,
            icon: BookOpen,
            color: "black",
          },

          {
            label: "Classes",
            value: classes?.length || 0,
            icon: BadgeCheck,
            color: "black",
          },
        ].map((card, idx) => (
          <Card
            key={idx}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5  shadow-lg shadow-indigo-100/20 bg-gradient-to-br",
              card.color,
            )}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
                <p className="text-3xl font-bold tracking-tight">
                  {card.value}
                </p>
              </div>
              <card.icon className="h-10 w-10 opacity-30" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-white/10 blur-2xl" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SummaryStats;
