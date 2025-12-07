// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent } from "@/components/ui/card";
// import { toast } from "sonner";

// // ----------------- ZOD VALIDATION -----------------
// const schema = z.object({
//   fullName: z.string().min(3, "Full name is required"),
//   fatherName: z.string().min(3, "Father name is required"),
//   rollNumber: z.string().min(1, "Roll Number is required"),
//   registrationNumber: z.string().min(1, "Registration Number is required"),
//   class: z.string().min(1, "Class is required"),
//   section: z.string().min(1, "Section is required"),
//   gender: z.string().min(1, "Gender is required"),
//   dob: z.string().min(1, "Date of Birth is required"),
//   admissionDate: z.string().min(1, "Admission Date is required"),
//   contact: z.string().min(10, "Invalid contact number"),
//   address: z.string().optional(),
//   previousSchool: z.string().optional(),
//   notes: z.string().optional(),
//   photo: z.any().optional(),
// });

// export default function CreateAdmissionForm() {
//   const router = useRouter();
//   const [photoPreview, setPhotoPreview] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(schema) });

//   const onSubmit = async (data) => {
//     try {
//       const formData = new FormData();

//       Object.entries(data).forEach(([key, value]) => {
//         if (key === "photo" && value?.[0]) {
//           formData.append("image", value[0]); // match schema
//         } else if (key === "dob") {
//           formData.append("dateOfBirth", value);
//         } else if (key === "contact") {
//           formData.append("contactNumber", value);
//         } else if (key === "gender") {
//           // Capitalize first letter to match enum
//           formData.append(
//             "gender",
//             value.charAt(0).toUpperCase() + value.slice(1)
//           );
//         } else {
//           formData.append(key, value);
//         }
//       });

//       const res = await fetch("/api/admissions", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Failed to create admission");

//       toast.success("Admission created successfully");
//       router.push("/admissions");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   return (
//     <Card className="max-w-3xl mx-auto">
//       <CardContent className="p-6 space-y-6">
//         <h2 className="text-xl font-semibold">Create New Admission</h2>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//           {/* Full Name */}
//           <div className="space-y-2">
//             <Label>Full Name</Label>
//             <Input placeholder="Enter full name" {...register("fullName")} />
//             {errors.fullName && (
//               <p className="text-red-500 text-sm">{errors.fullName.message}</p>
//             )}
//           </div>

//           {/* Father Name */}
//           <div className="space-y-2">
//             <Label>Father Name</Label>
//             <Input
//               placeholder="Enter father name"
//               {...register("fatherName")}
//             />
//             {errors.fatherName && (
//               <p className="text-red-500 text-sm">
//                 {errors.fatherName.message}
//               </p>
//             )}
//           </div>

//           {/* Roll Number */}
//           <div className="space-y-2">
//             <Label>Roll Number</Label>
//             <Input
//               placeholder="Enter roll number"
//               {...register("rollNumber")}
//             />
//             {errors.rollNumber && (
//               <p className="text-red-500 text-sm">
//                 {errors.rollNumber.message}
//               </p>
//             )}
//           </div>

//           {/* Registration Number */}
//           <div className="space-y-2">
//             <Label>Registration Number</Label>
//             <Input
//               placeholder="Enter registration number"
//               {...register("registrationNumber")}
//             />
//             {errors.registrationNumber && (
//               <p className="text-red-500 text-sm">
//                 {errors.registrationNumber.message}
//               </p>
//             )}
//           </div>

//           {/* Class + Section */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>Class</Label>
//               <Select onValueChange={(v) => setValue("class", v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Class" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {[
//                     "Nursery",
//                     "Prep",
//                     "1",
//                     "2",
//                     "3",
//                     "4",
//                     "5",
//                     "6",
//                     "7",
//                     "8",
//                     "9",
//                     "10",
//                   ].map((c) => (
//                     <SelectItem key={c} value={c}>
//                       {c}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label>Section</Label>
//               <Select onValueChange={(v) => setValue("section", v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Section" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {["A", "B", "C", "D"].map((s) => (
//                     <SelectItem key={s} value={s}>
//                       {s}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Gender */}
//           <div className="space-y-2">
//             <Label>Gender</Label>
//             <Select onValueChange={(v) => setValue("gender", v)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Gender" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Male">Male</SelectItem>
//                 <SelectItem value="Female">Female</SelectItem>
//                 <SelectItem value="Other">Other</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Dates */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>Date of Birth</Label>
//               <Input type="date" {...register("dob")} />
//             </div>
//             <div>
//               <Label>Admission Date</Label>
//               <Input type="date" {...register("admissionDate")} />
//             </div>
//           </div>

//           {/* Contact */}
//           <div className="space-y-2">
//             <Label>Contact Number</Label>
//             <Input placeholder="03XXXXXXXXX" {...register("contact")} />
//           </div>

//           {/* Address */}
//           <div className="space-y-2">
//             <Label>Address</Label>
//             <Textarea rows={2} {...register("address")} />
//           </div>

//           {/* Previous School */}
//           <div className="space-y-2">
//             <Label>Previous School (Optional)</Label>
//             <Input {...register("previousSchool")} />
//           </div>

//           {/* Notes */}
//           <div className="space-y-2">
//             <Label>Notes</Label>
//             <Textarea {...register("notes")} />
//           </div>

//           {/* Photo Upload */}
//           <div className="space-y-2">
//             <Label>Student Photo</Label>
//             <Input
//               type="file"
//               accept="image/*"
//               {...register("photo")}
//               onChange={(e) => {
//                 if (e.target.files[0]) {
//                   const url = URL.createObjectURL(e.target.files[0]);
//                   setPhotoPreview(url);
//                 }
//               }}
//             />
//             {photoPreview && (
//               <img
//                 src={photoPreview}
//                 className="h-24 w-24 rounded-md object-cover mt-2"
//               />
//             )}
//           </div>

//           <Button type="submit" className="w-full">
//             Submit Admission
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }

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

// ----------------- ZOD VALIDATION -----------------
const schema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  fatherName: z.string().min(3, "Father name is required"),
  rollNumber: z.string().min(1, "Roll Number is required"),
  registrationNumber: z.string().min(1, "Registration Number is required"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  admissionDate: z.string().min(1, "Admission Date is required"),
  contact: z.string().min(10, "Invalid contact number"),
  address: z.string().optional(),
  previousSchool: z.string().optional(),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

export default function AdmissionForm({ admission }) {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState(admission?.image || null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: admission
      ? {
          fullName: admission.fullName || "",
          fatherName: admission.fatherName || "",
          rollNumber: admission.rollNumber || "",
          registrationNumber: admission.registrationNumber || "",
          class: admission.class || "",
          section: admission.section || "",
          gender: admission.gender?.toLowerCase() || "",
          dob: admission.dateOfBirth
            ? new Date(admission.dateOfBirth).toISOString().slice(0, 10)
            : "",
          admissionDate: admission.admissionDate
            ? new Date(admission.admissionDate).toISOString().slice(0, 10)
            : "",
          contact: admission.contactNumber || "",
          address: admission.address || "",
          previousSchool: admission.previousSchool || "",
          notes: admission.notes || "",
        }
      : {},
  });

  // Update default values if admission prop changes
  useEffect(() => {
    if (admission) {
      reset({
        fullName: admission.fullName || "",
        fatherName: admission.fatherName || "",
        rollNumber: admission.rollNumber || "",
        registrationNumber: admission.registrationNumber || "",
        class: admission.class || "",
        section: admission.section || "",
        gender: admission.gender?.toLowerCase() || "",
        dob: admission.dateOfBirth
          ? new Date(admission.dateOfBirth).toISOString().slice(0, 10)
          : "",
        admissionDate: admission.admissionDate
          ? new Date(admission.admissionDate).toISOString().slice(0, 10)
          : "",
        contact: admission.contactNumber || "",
        address: admission.address || "",
        previousSchool: admission.previousSchool || "",
        notes: admission.notes || "",
      });
      setPhotoPreview(admission.image || null);
    }
  }, [admission, reset]);

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

      const url = admission
        ? `/api/admissions/${admission._id}`
        : "/api/admissions";
      const method = admission ? "PUT" : "POST";

      const res = await fetch(url, { method, body: JSON.stringify(data) });

      if (!res.ok)
        throw new Error(admission ? "Failed to update" : "Failed to create");

      toast.success(
        admission
          ? "Admission updated successfully"
          : "Admission created successfully"
      );
      router.push("/admissions");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">
          {admission ? "Update Admission" : "Create New Admission"}
        </h2>

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
                  <SelectValue placeholder="Select Class" />
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
                  <SelectValue placeholder="Select Section" />
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
                <SelectValue placeholder="Select Gender" />
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
            <Label>Previous School (Optional)</Label>
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
            {admission ? "Update Admission" : "Create Admission"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
