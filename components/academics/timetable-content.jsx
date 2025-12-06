"use client";

import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function TimetableContent() {
  const { data, isLoading, mutate } = useSWR(
    "/api/academics/timetable",
    fetcher
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");

  const openEditor = (cls) => {
    setSelectedClass(cls);
    setIsOpen(true);
  };

  const addPeriod = async () => {
    const cls = selectedClass;

    let schedule = cls.schedule || [];

    let targetDay = schedule.find((d) => d.day === day);
    if (!targetDay) {
      targetDay = { day, periods: [] };
      schedule.push(targetDay);
    }

    targetDay.periods.push({ time, subject });

    await fetch("/api/academics/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: cls._id, schedule }),
    });

    toast.success("Period added");
    setIsOpen(false);
    mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable"
        description="Manage class-wise daily timetable"
      />

      <Card>
        <CardHeader>
          <CardTitle>All Timetables</CardTitle>
          <CardDescription>
            View & edit timetable for each class
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!data?.data?.length ? (
            <p>No classes found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.data.map((cls) => (
                  <TableRow key={cls._id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{cls.schedule?.length || 0} days</TableCell>
                    <TableCell>
                      <Button onClick={() => openEditor(cls)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Edit Timetable
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timetable – {selectedClass?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Day</Label>
            <Input
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="Monday"
            />

            <Label>Time</Label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="9:00 - 10:00"
            />

            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Maths"
            />
          </div>

          <DialogFooter>
            <Button onClick={addPeriod}>
              <Plus className="h-4 w-4 mr-2" />
              Add Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
