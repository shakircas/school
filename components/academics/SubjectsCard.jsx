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
import { Input } from "@/components/ui/input";

export default function SubjectsCard({
  control,
  register,
  subjectsArray,
  subjects,
  teachers,
}) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Subjects</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {subjectsArray.fields.map((field, idx) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Controller
              name={`subjects.${idx}.subjectId`}
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <Controller
              name={`subjects.${idx}.teacher`}
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Teacher" />
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

            <Input
              type="number"
              placeholder="Periods"
              {...register(`subjects.${idx}.periods`, {
                valueAsNumber: true,
                min: 1,
              })}
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => subjectsArray.remove(idx)}
            >
              Remove
            </Button>
          </div>
        ))}

        <Button
          type="button"
          onClick={() =>
            subjectsArray.append({
              subjectId: "",
              teacher: "",
              periods: 1,
            })
          }
        >
          Add Subject
        </Button>
      </CardContent>
    </Card>
  );
}
