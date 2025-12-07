"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const schema = z.object({
  fullName: z.string().min(3),
  fatherName: z.string().min(3),
  rollNumber: z.string().min(1),
  registrationNumber: z.string().min(1),
  class: z.string().min(1),
  section: z.string().min(1),
  gender: z.string().min(1),
  dob: z.string().min(1),
  admissionDate: z.string().min(1),
  contact: z.string().min(10),
  address: z.string().optional(),
  previousSchool: z.string().optional(),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

export default function UpdateAdmissionForm({ id }) {
  const router = useRouter();
  const [admission, setAdmission] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  // Fetch admission data
  useEffect(() => {
    const fetchAdmission = async () => {
      try {
        const res = await fetch(`/api/admissions/${id}`);
        if (!res.ok) throw new Error("Failed to fetch admission");

        const data = await res.json();
        setAdmission(data);

        // Set form values
        reset({
          fullName: data.fullName || "",
          fatherName: data.fatherName || "",
          rollNumber: data.rollNumber || "",
          registrationNumber: data.registrationNumber || "",
          class: data.class || "",
          section: data.section || "",
          gender: data.gender?.toLowerCase() || "",
          dob: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString().slice(0, 10)
            : "",
          admissionDate: data.admissionDate
            ? new Date(data.admissionDate).toISOString().slice(0, 10)
            : "",
          contact: data.contactNumber || "",
          address: data.address || "",
          previousSchool: data.previousSchool || "",
          notes: data.notes || "",
        });

        setPhotoPreview(data.image || null);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmission();
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "photo" && value?.[0]) formData.append("image", value[0]);
        else if (key === "dob") formData.append("dateOfBirth", value);
        else if (key === "contact") formData.append("contactNumber", value);
        else if (key === "gender")
          formData.append(
            "gender",
            value.charAt(0).toUpperCase() + value.slice(1)
          );
        else formData.append(key, value);
      });

      const res = await fetch(`/api/admissions/${admission._id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update admission");

      toast.success("Admission updated successfully");
      router.push("/admissions");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p>Loading admission...</p>;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Update Admission</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Enter full name" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName.message}</p>
            )}
          </div>

          {/* Father Name */}
          <div className="space-y-2">
            <Label>Father Name</Label>
            <Input
              placeholder="Enter father name"
              {...register("fatherName")}
            />
            {errors.fatherName && (
              <p className="text-red-500 text-sm">
                {errors.fatherName.message}
              </p>
            )}
          </div>

          {/* Roll & Registration Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Roll Number</Label>
              <Input
                placeholder="Enter roll number"
                {...register("rollNumber")}
              />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input
                placeholder="Enter registration number"
                {...register("registrationNumber")}
              />
            </div>
          </div>

          {/* Class + Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={watch("class")}
                onValueChange={(v) => setValue("class", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Nursery",
                    "Prep",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={watch("section")}
                onValueChange={(v) => setValue("section", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={watch("gender")}
              onValueChange={(v) => setValue("gender", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {["male", "female", "other"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" {...register("dob")} />
            </div>
            <div>
              <Label>Admission Date</Label>
              <Input type="date" {...register("admissionDate")} />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label>Contact Number</Label>
            <Input placeholder="03XXXXXXXXX" {...register("contact")} />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea rows={2} {...register("address")} />
          </div>

          {/* Previous School */}
          <div className="space-y-2">
            <Label>Previous School</Label>
            <Input {...register("previousSchool")} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...register("notes")} />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Student Photo</Label>
            <Input
              type="file"
              accept="image/*"
              {...register("photo")}
              onChange={(e) => {
                if (e.target.files[0])
                  setPhotoPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
            {photoPreview && (
              <img
                src={photoPreview}
                className="h-24 w-24 rounded-md object-cover mt-2"
              />
            )}
          </div>

          <Button type="submit" className="w-full">
            Update Admission
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
