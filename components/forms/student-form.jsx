"use client";

import { useForm } from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { useEffect } from "react";

// const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const sections = ["A", "B", "C", "D"];
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

export function StudentForm({ defaultValues, onSubmit, isLoading, classes }) {
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
      status: "",
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
    },
  });

  // useEffect(() => {
  //   if (!defaultValues) return;

  //   Object.keys(defaultValues).forEach((key) => {
  //     const value = defaultValues[key];

  //     if (value && typeof value === "object" && !Array.isArray(value)) {
  //       Object.keys(value).forEach((subKey) => {
  //         setValue(`${key}.${subKey}`, value[subKey] ?? "");
  //       });
  //     } else {
  //       setValue(key, value ?? "");
  //     }
  //   });

  //   // Selects
  //   setValue("gender", defaultValues.gender ?? "");
  //   setValue("bloodGroup", defaultValues.bloodGroup ?? "");
  //   setValue("class", defaultValues.class ?? "");
  //   setValue("section", defaultValues.section ?? "");
  //   setValue("status", defaultValues.status ?? "");

  //   // Image
  //   if (defaultValues.photo?.url) {
  //     setValue("photo", { url: defaultValues.photo.url });
  //   }
  // }, [defaultValues, setValue]);
  useEffect(() => {
    if (!defaultValues) return;

    Object.keys(defaultValues).forEach((key) => {
      if (
        typeof defaultValues[key] === "object" &&
        defaultValues[key] !== null
      ) {
        Object.keys(defaultValues[key]).forEach((subKey) => {
          setValue(`${key}.${subKey}`, defaultValues[key][subKey] ?? "");
        });
      } else {
        setValue(key, defaultValues[key] ?? "");
      }
    });

    // CRITICAL
    setValue("classId", defaultValues.classId ?? "");
    setValue("sectionId", defaultValues.sectionId ?? "");

    // Image
    if (defaultValues.photo?.url) {
      setValue("photo", { url: defaultValues.photo.url });
    }
  }, [defaultValues, setValue]);

  const watchedValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="guardian">Guardian</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <ImageUpload
                    value={watchedValues.photo?.url}
                    onChange={(url) => setValue("photo", { url })}
                    label="Student Photo"
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="student@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth", {
                        required: "Date of birth is required",
                      })}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-destructive">
                        {errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                      value={watchedValues.gender}
                      onValueChange={(value) => setValue("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Select
                      value={watchedValues.bloodGroup}
                      onValueChange={(value) => setValue("bloodGroup", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watchedValues.status}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.street">Street Address</Label>
                  <Input
                    id="address.street"
                    {...register("address.street")}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.city">City</Label>
                  <Input
                    id="address.city"
                    {...register("address.city")}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.state">State/Province</Label>
                  <Input
                    id="address.state"
                    {...register("address.state")}
                    placeholder="Enter state"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.zipCode">Zip Code</Label>
                  <Input
                    id="address.zipCode"
                    {...register("address.zipCode")}
                    placeholder="Enter zip code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardian">
          <Card>
            <CardHeader>
              <CardTitle>Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name *</Label>
                  <Input
                    id="fatherName"
                    {...register("fatherName", {
                      required: "Father's name is required",
                    })}
                    placeholder="Enter father's name"
                  />
                  {errors.fatherName && (
                    <p className="text-sm text-destructive">
                      {errors.fatherName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherPhone">Father's Phone</Label>
                  <Input
                    id="fatherPhone"
                    {...register("fatherPhone")}
                    placeholder="03XX-XXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherOccupation">Father's Occupation</Label>
                  <Input
                    id="fatherOccupation"
                    {...register("fatherOccupation")}
                    placeholder="Enter occupation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    {...register("motherName")}
                    placeholder="Enter mother's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherPhone">Mother's Phone</Label>
                  <Input
                    id="motherPhone"
                    {...register("motherPhone")}
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium mb-4">
                  Guardian (if different from parents)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name</Label>
                    <Input
                      id="guardianName"
                      {...register("guardianName")}
                      placeholder="Enter guardian name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Guardian Phone</Label>
                    <Input
                      id="guardianPhone"
                      {...register("guardianPhone")}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianRelation">Relation</Label>
                    <Input
                      id="guardianRelation"
                      {...register("guardianRelation")}
                      placeholder="e.g., Uncle, Aunt"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    {...register("rollNumber", {
                      required: "Roll number is required",
                    })}
                    placeholder="Enter roll number"
                  />
                  {errors.rollNumber && (
                    <p className="text-sm text-destructive">
                      {errors.rollNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">
                    Registration Number *
                  </Label>
                  <Input
                    id="registrationNumber"
                    {...register("registrationNumber", {
                      required: "Registration number is required",
                    })}
                    placeholder="Enter registration number"
                  />
                  {errors.registrationNumber && (
                    <p className="text-sm text-destructive">
                      {errors.registrationNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select
                    value={watchedValues.classId}
                    onValueChange={(value) => {
                      setValue("classId", value);
                      setValue("sectionId", ""); // reset section when class changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
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
                  <Label>Section *</Label>
                  <Select
                    value={watchedValues.sectionId}
                    onValueChange={(value) => setValue("sectionId", value)}
                    disabled={!watchedValues.classId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes
                        .find((c) => c._id === watchedValues.classId)
                        ?.sections.map((sec) => (
                          <SelectItem key={sec._id} value={sec.name}>
                            Section {sec.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admissionDate">Admission Date</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    {...register("admissionDate")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School</Label>
                  <Input
                    id="previousSchool"
                    {...register("previousSchool")}
                    placeholder="Enter previous school name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact & Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.name">Contact Name</Label>
                    <Input
                      id="emergencyContact.name"
                      {...register("emergencyContact.name")}
                      placeholder="Enter name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.relation">Relation</Label>
                    <Input
                      id="emergencyContact.relation"
                      {...register("emergencyContact.relation")}
                      placeholder="e.g., Uncle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.phone">Phone</Label>
                    <Input
                      id="emergencyContact.phone"
                      {...register("emergencyContact.phone")}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-4">Medical Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalInfo.allergies">Allergies</Label>
                    <Textarea
                      id="medicalInfo.allergies"
                      {...register("medicalInfo.allergies")}
                      placeholder="List any allergies"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalInfo.conditions">
                      Medical Conditions
                    </Label>
                    <Textarea
                      id="medicalInfo.conditions"
                      {...register("medicalInfo.conditions")}
                      placeholder="List any medical conditions"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalInfo.medications">
                      Current Medications
                    </Label>
                    <Textarea
                      id="medicalInfo.medications"
                      {...register("medicalInfo.medications")}
                      placeholder="List any medications"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Student"}
        </Button>
      </div>
    </form>
  );
}
