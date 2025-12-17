"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, BookOpen, Calendar } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TeacherTimetable() {
  const { data, isLoading } = useSWR("/api/academics/timetable", fetcher);

  const [selectedTeacher, setSelectedTeacher] = useState("");

  if (!data?.data) return <p>Loading...</p>;

  const classes = data.data;

  // Extract unique teachers from schedules
  const uniqueTeachers = Array.from(
    new Set(
      classes.flatMap((cls) =>
        cls.schedule?.flatMap((d) => d.periods?.map((p) => p.teacher) || [])
      )
    )
  ).filter(Boolean);

  const getTeacherPeriodsForDay = (day) => {
    let periods = [];

    classes.forEach((cls) => {
      const dayEntry = cls.schedule?.find((d) => d.day === day);

      if (dayEntry) {
        dayEntry.periods.forEach((p) => {
          if (p.teacher === selectedTeacher) {
            periods.push({
              className: cls.name,
              time: p.time,
              subject: p.subject,
            });
          }
        });
      }
    });

    return periods;
  };

  const today = WEEKDAYS[new Date().getDay() - 1];

  return (
    <div className="space-y-6 p-4">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Teacher Timetable</CardTitle>
          <CardDescription>
            View weekly & daily schedules based on teacher name
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Select Teacher */}
          <Select onValueChange={(v) => setSelectedTeacher(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent>
              {uniqueTeachers.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTeacher && (
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                <TabsTrigger value="daily">Daily View</TabsTrigger>
              </TabsList>

              {/* WEEKLY VIEW */}
              <TabsContent value="weekly">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Weekly Timetable</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {WEEKDAYS.map((day) => {
                        const periods = getTeacherPeriodsForDay(day);

                        return (
                          <Card
                            key={day}
                            className="p-3 border shadow-sm rounded-xl bg-white"
                          >
                            <h3 className="font-bold text-blue-600 mb-2">
                              {day}
                            </h3>

                            {periods.length === 0 ? (
                              <p className="text-sm text-gray-400">
                                No periods
                              </p>
                            ) : (
                              periods.map((p, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-2 mb-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow-sm"
                                >
                                  <div className="text-xs text-gray-500">
                                    <Clock className="inline w-3 h-3 mr-1" />
                                    {p.time}
                                  </div>

                                  <div className="font-medium text-gray-800">
                                    <BookOpen className="inline w-3 h-3 mr-1" />
                                    {p.subject}
                                  </div>

                                  <div className="text-[11px] text-gray-600">
                                    Class: {p.className}
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DAILY VIEW */}
              <TabsContent value="daily">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Timetable</CardTitle>
                    <CardDescription>{today}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {getTeacherPeriodsForDay(today).length === 0 ? (
                        <p className="text-gray-500">No periods today</p>
                      ) : (
                        getTeacherPeriodsForDay(today).map((p, i) => (
                          <div
                            key={i}
                            className="p-3 bg-blue-50 rounded-lg shadow-sm border"
                          >
                            <div className="text-sm font-semibold flex gap-2 items-center">
                              <Clock className="w-4 h-4" /> {p.time}
                            </div>
                            <div className="mt-1">📘 {p.subject}</div>
                            <div className="text-xs text-gray-500">
                              Class: {p.className}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
