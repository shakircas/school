"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  User,
  Users,
  GraduationCap,
  Info,
  Save,
  XCircle,
  Phone,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const genders = ["Male", "Female", "Other"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const statuses = [
  "Active",
  "Inactive",
  "Graduated",
  "Transferred",
  "Expelled",
  "Withdrawn",
  "Pending",
];

export function StudentForm({
  defaultValues,
  onSubmit,
  isLoading,
  classes = [],
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      status: "Active",
      classId: "",
      sectionId: "",
      rollNumber: "",
      registrationNumber: "",
      fatherName: "",
      fatherPhone: "",
      fatherOccupation: "",
      motherName: "",
      motherPhone: "",
      guardianName: "",
      guardianPhone: "",
      guardianRelation: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Pakistan",
      },
      admissionDate: new Date().toISOString().split("T")[0],
      previousSchool: "",
      emergencyContact: {
        name: "",
        relation: "",
        phone: "",
      },
      medicalInfo: {
        allergies: "",
        conditions: "",
        medications: "",
      },
      createAccount: true,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (!defaultValues) return;

    // Deeply set values for nested objects
    Object.keys(defaultValues).forEach((key) => {
      if (
        typeof defaultValues[key] === "object" &&
        defaultValues[key] !== null &&
        key !== "photo"
      ) {
        Object.keys(defaultValues[key]).forEach((subKey) => {
          setValue(`${key}.${subKey}`, defaultValues[key][subKey] ?? "");
        });
      } else {
        setValue(key, defaultValues[key] ?? "");
      }
    });

    // Special handling for selection fields
    if (defaultValues.classId) setValue("classId", defaultValues.classId);
    if (defaultValues.sectionId) setValue("sectionId", defaultValues.sectionId);

    // Image handling
    if (defaultValues.photo?.url) {
      setValue("photo", { url: defaultValues.photo.url });
    }
  }, [defaultValues, setValue]);

  const selectedClass = classes.find((c) => c._id === watchedValues.classId);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-5xl mx-auto"
    >
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-slate-100 rounded-xl">
          <TabsTrigger value="personal" className="py-3 rounded-lg flex gap-2">
            <User className="h-4 w-4" /> Personal
          </TabsTrigger>
          <TabsTrigger value="guardian" className="py-3 rounded-lg flex gap-2">
            <Users className="h-4 w-4" /> Guardian
          </TabsTrigger>
          <TabsTrigger value="academic" className="py-3 rounded-lg flex gap-2">
            <GraduationCap className="h-4 w-4" /> Academic
          </TabsTrigger>
          <TabsTrigger value="other" className="py-3 rounded-lg flex gap-2">
            <Info className="h-4 w-4" /> Medical/Misc
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="personal"
          className="mt-6 animate-in fade-in-50 duration-300"
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Personal Details</CardTitle>
              <CardDescription>
                Basic information and contact details of the student.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <ImageUpload
                    value={watchedValues.photo?.url}
                    onChange={(url) => setValue("photo", { url })}
                    label="Student Photo"
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      placeholder="Enter full name"
                      className={cn(errors.name && "border-rose-500")}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="student@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-slate-700">
                      Date of Birth <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth", { required: "Required" })}
                      className={cn(errors.dateOfBirth && "border-rose-500")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">
                      Gender <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={watchedValues.gender}
                      onValueChange={(v) => setValue("gender", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Blood Group</Label>
                    <Select
                      value={watchedValues.bloodGroup}
                      onValueChange={(v) => setValue("bloodGroup", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                  <MapPin className="h-4 w-4 text-indigo-500" /> Address
                  Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2 space-y-2">
                    <Label className="text-slate-600 text-xs uppercase font-bold tracking-wider">
                      Street
                    </Label>
                    <Input
                      {...register("address.street")}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 text-xs uppercase font-bold tracking-wider">
                      City
                    </Label>
                    <Input {...register("address.city")} placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 text-xs uppercase font-bold tracking-wider">
                      Zip Code
                    </Label>
                    <Input {...register("address.zipCode")} placeholder="Zip" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="guardian"
          className="mt-6 animate-in fade-in-50 duration-300"
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Father's Name *</Label>
                  <Input
                    {...register("fatherName", { required: "Required" })}
                    placeholder="Enter father's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Father's Phone</Label>
                  <Input
                    {...register("fatherPhone")}
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Mother's Name</Label>
                  <Input
                    {...register("motherName")}
                    placeholder="Enter mother's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Father's Occupation</Label>
                  <Input
                    {...register("fatherOccupation")}
                    placeholder="Occupation"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-tight">
                  Legal Guardian (If different)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    {...register("guardianName")}
                    placeholder="Guardian Name"
                  />
                  <Input
                    {...register("guardianPhone")}
                    placeholder="Guardian Phone"
                  />
                  <Input
                    {...register("guardianRelation")}
                    placeholder="Relation (e.g. Uncle)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="academic"
          className="mt-6 animate-in fade-in-50 duration-300"
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Academic Record</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Roll Number *</Label>
                <Input
                  {...register("rollNumber", { required: "Required" })}
                  placeholder="e.g. 2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Registration Number *</Label>
                <Input
                  {...register("registrationNumber", { required: "Required" })}
                  placeholder="System Reg ID"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Assign Class *</Label>
                <Select
                  value={watchedValues.classId}
                  onValueChange={(v) => {
                    setValue("classId", v);
                    setValue("sectionId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Assign Section *</Label>
                <Select
                  value={watchedValues.sectionId}
                  onValueChange={(v) => setValue("sectionId", v)}
                  disabled={!watchedValues.classId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClass?.sections.map((sec) => (
                      <SelectItem key={sec._id} value={sec.name}>
                        Section {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Admission Date</Label>
                <Input type="date" {...register("admissionDate")} />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Account Status</Label>
                <Select
                  value={watchedValues.status}
                  onValueChange={(v) => setValue("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="other"
          className="mt-6 animate-in fade-in-50 duration-300"
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Medical & Emergency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Emergency Contact Person</Label>
                  <Input
                    {...register("emergencyContact.name")}
                    placeholder="Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Input
                    {...register("emergencyContact.relation")}
                    placeholder="e.g. Brother"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Phone</Label>
                  <Input
                    {...register("emergencyContact.phone")}
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <Textarea
                    {...register("medicalInfo.allergies")}
                    placeholder="List any allergies..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medical Conditions</Label>
                  <Textarea
                    {...register("medicalInfo.conditions")}
                    placeholder="Known medical history..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl border border-indigo-100 shadow-sm">
        <div className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            id="createAccount"
            {...register("createAccount")}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="createAccount"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Create student login account
            <p className="text-[11px] text-slate-500 mt-1">
              Student can access dashboard using Roll No.
            </p>
          </label>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            type="button"
            variant="outline"
            className="flex-1 md:flex-none"
            onClick={() => router.back()}
          >
            <XCircle className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Student
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
