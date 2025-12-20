"use client";

import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SECTION_OPTIONS = ["A", "B", "C", "D"];

export default function SectionsCard({ control, sectionsArray, teachers }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Sections</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {sectionsArray.fields.map((field, idx) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Controller
              name={`sections.${idx}.name`}
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <Controller
              name={`sections.${idx}.classTeacher`}
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Class Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => sectionsArray.remove(idx)}
            >
              Remove
            </Button>
          </div>
        ))}

        <Button
          type="button"
          onClick={() =>
            sectionsArray.append({
              name: "A",
              capacity: 40,
              classTeacher: "",
            })
          }
        >
          Add Section
        </Button>
      </CardContent>
    </Card>
  );
}
