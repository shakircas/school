"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

export function TeacherProfile({ teacher }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={teacher.photo?.url || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">
                {teacher.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{teacher.name}</h2>
                <Badge
                  variant={
                    teacher.status === "Active" ? "default" : "secondary"
                  }
                >
                  {teacher.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <InfoBlock label="Teacher ID" value={teacher.teacherId} />
                <InfoBlock label="Designation" value={teacher.designation} />
                <InfoBlock
                  label="Joining Date"
                  value={formatDate(teacher.joiningDate)}
                />
                <InfoBlock
                  label="Qualification"
                  value={teacher.qualification}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        {/* PERSONAL */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Full Name" value={teacher.name} icon={User} />
                <InfoItem label="Gender" value={teacher.gender} icon={User} />
                <InfoItem
                  label="Date of Birth"
                  value={formatDate(teacher.dateOfBirth)}
                  icon={Calendar}
                />
                <InfoItem label="Email" value={teacher.email} icon={Mail} />
                <InfoItem label="Phone" value={teacher.phone} icon={Phone} />
                <InfoItem
                  label="Address"
                  value={formatAddress(teacher.address)}
                  icon={MapPin}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFESSIONAL */}
        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  label="Designation"
                  value={teacher.designation}
                  icon={School}
                />
                <InfoItem
                  label="Qualification"
                  value={teacher.qualification}
                  icon={GraduationCap}
                />
                <InfoItem
                  label="Experience"
                  value={`${teacher.experience} Years`}
                  icon={BookOpen}
                />
                <InfoItem
                  label="Joining Date"
                  value={formatDate(teacher.joiningDate)}
                  icon={Calendar}
                />
                <InfoItem
                  label="Previous School"
                  value={teacher.previousSchool || "Not specified"}
                  icon={School}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBJECTS */}
        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subjects Taught
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {teacher.subjects?.length ? (
                  teacher.subjects.map((sub) => (
                    <Badge
                      key={sub}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      {sub}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No subjects assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMERGENCY CONTACT */}
        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Name" value={teacher.emergencyContact?.name} />
                <InfoItem
                  label="Relation"
                  value={teacher.emergencyContact?.relation}
                />
                <InfoItem
                  label="Phone"
                  value={teacher.emergencyContact?.phone}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* Helper: Small label/value block (header section) */
function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Not specified"}</p>
    </div>
  );
}

/* Helper: Icon + label + value items */
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "Not specified"}</p>
      </div>
    </div>
  );
}

/* Format date */
function formatDate(date) {
  if (!date) return "Not specified";
  return new Date(date).toLocaleDateString();
}

/* Format address */
function formatAddress(address) {
  if (!address) return "Not specified";
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ];
  return parts.filter(Boolean).join(", ") || "Not specified";
}
