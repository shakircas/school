"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"

const KP_DEPARTMENTS = [
  "Primary Education",
  "Elementary Education",
  "Secondary Education",
  "Higher Secondary Education",
  "Computer Science",
  "Physical Education",
  "Special Education",
];

const KP_DESIGNATIONS = [
  "PST (Primary School Teacher)",
  "CT (Certified Teacher)",
  "AT (Arabic Teacher)",
  "DM (Drawing Master)",
  "PET (Physical Education Teacher)",

  "SST (General)",
  "SST (Biology)",
  "SST (Physics)",
  "SST (Chemistry)",
  "SST (Mathematics)",
  "SST (English)",
  "SST (Urdu)",
  "SST (Islamiyat)",
  "SST (Computer Science)",

  "Head Teacher (HT)",
  "Head Master (HM)",
  "Principal",
  "Vice Principal",
];

const ACADEMIC_QUALIFICATIONS = [
  "Matric",
  "Intermediate",
  "BA",
  "BSc",
  "BS",
  "MA",
  "MSc",
  "B.Ed",
  "M.Ed",
  "MPhil",
  "PhD",
];

const PROFESSIONAL_QUALIFICATIONS = [
  "PTC",
  "CT",
  "ADE",
  "B.Ed",
  "M.Ed",
  "Teaching Diploma",
];

const SPECIALIZATIONS = [
  "General",
  "Biology",
  "Physics",
  "Chemistry",
  "Mathematics",
  "English",
  "Urdu",
  "Islamiyat",
  "Computer Science",
];


const genders = ["Male", "Female", "Other"]

export function TeacherForm({ defaultValues, onSubmit, isLoading }) {
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
      nic: "",
      personalNo: "",
      dateOfBirth: "",
      gender: "",
      // department: "",
      designation: "",
      qualification: "",
      professionalQualification: [],
      specialization: "",
      experience: 0,
      joiningDate: new Date().toISOString().split("T")[0],
      subjectsText: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Pakistan",
      },
      salary: {
        basic: 0,
        allowances: 0,
        deductions: 0,
      },
      bankDetails: {
        bankName: "",
        accountNumber: "",
        ifscCode: "",
      },
      emergencyContact: {
        name: "",
        relation: "",
        phone: "",
      },
      photo: {},
      ...defaultValues,
    },
  });

  const watchedValues = watch()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
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
                    label="Teacher Photo"
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
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { required: "Email is required" })}
                      placeholder="teacher@school.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      {...register("phone", { required: "Phone is required" })}
                      placeholder="03XX-XXXXXXX"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nic">NIC *</Label>
                    <Input
                      id="nic"
                      placeholder="11111-1111111-1"
                      {...register("nic", {
                        required: "NIC is required",
                        pattern: {
                          value: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
                          message: "NIC format must be 11111-1111111-1",
                        },
                      })}
                    />
                    {errors.nic && (
                      <p className="text-sm text-destructive">
                        {errors.nic.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personalNo">Personal No *</Label>
                    <Input
                      id="personalNo"
                      placeholder="00123456"
                      {...register("personalNo", {
                        required: "Personal No is required",
                        pattern: {
                          value: /^[0-9]{8}$/,
                          message: "Personal No must be exactly 8 digits",
                        },
                      })}
                    />
                    {errors.personalNo && (
                      <p className="text-sm text-destructive">
                        {errors.personalNo.message}
                      </p>
                    )}
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

                  {/* <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input
                      id="employeeId"
                      {...register("employeeId", {
                        required: "Employee ID is required",
                      })}
                      placeholder="EMP-XXX"
                    />
                    {errors.employeeId && (
                      <p className="text-sm text-destructive">
                        {errors.employeeId.message}
                      </p>
                    )}
                  </div> */}
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="address.country">Country</Label>
                  <Input
                    id="address.country"
                    {...register("address.country")}
                    placeholder="Pakistan"
                    defaultValue="Pakistan"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select
                    value={watchedValues.department}
                    onValueChange={(v) => setValue("department", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {KP_DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="space-y-2">
                  <Label>Designation *</Label>
                  <Select
                    value={watchedValues.designation}
                    onValueChange={(v) => setValue("designation", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {KP_DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification *</Label>
                  <Select
                    value={watchedValues.qualification}
                    onValueChange={(v) => setValue("qualification", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_QUALIFICATIONS.map((q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.qualification && (
                    <p className="text-sm text-destructive">
                      {errors.qualification.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Professional Qualification(s)</Label>

                  <Select
                    onValueChange={(value) =>
                      setValue("professionalQualification", [
                        ...new Set([
                          ...(watchedValues.professionalQualification || []),
                          value,
                        ]),
                      ])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add professional qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONAL_QUALIFICATIONS.map((q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected chips */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(watchedValues.professionalQualification || []).map(
                      (q) => (
                        <span
                          key={q}
                          className="px-3 py-1 text-sm rounded-full bg-muted border"
                        >
                          {q}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Specialization</Label>

                  <Select
                    value={watchedValues.specialization}
                    onValueChange={(value) =>
                      setValue("specialization", value, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>

                    <SelectContent>
                      {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    {...register("experience", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    {...register("joiningDate")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjects">Subjects (comma separated)</Label>
                <Input
                  id="subjects"
                  {...register("subjectsText")}
                  placeholder="Physics, Chemistry, Mathematics"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Salary & Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Salary Structure</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary.basic">Basic Salary</Label>
                    <Input
                      id="salary.basic"
                      type="number"
                      {...register("salary.basic", { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary.allowances">Allowances</Label>
                    <Input
                      id="salary.allowances"
                      type="number"
                      {...register("salary.allowances", {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary.deductions">Deductions</Label>
                    <Input
                      id="salary.deductions"
                      type="number"
                      {...register("salary.deductions", {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-4">Bank Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.bankName">Bank Name</Label>
                    <Input
                      id="bankDetails.bankName"
                      {...register("bankDetails.bankName")}
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.accountNumber">
                      Account Number
                    </Label>
                    <Input
                      id="bankDetails.accountNumber"
                      {...register("bankDetails.accountNumber")}
                      placeholder="Enter account number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankDetails.ifscCode">Branch Code</Label>
                    <Input
                      id="bankDetails.ifscCode"
                      {...register("bankDetails.ifscCode")}
                      placeholder="Enter branch code"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
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
                    placeholder="e.g., Spouse"
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Teacher"}
        </Button>
      </div>
    </form>
  );
}
