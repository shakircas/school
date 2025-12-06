"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Phone, Mail, MapPin, Calendar, Heart, Users, GraduationCap } from "lucide-react"

export function StudentProfile({ student }) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photo?.url || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{student.name?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <Badge variant={student.status === "Active" ? "default" : "secondary"}>{student.status}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{student.rollNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registration No.</p>
                  <p className="font-medium">{student.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Class</p>
                  <p className="font-medium">
                    {student.class} - {student.section}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Admission Date</p>
                  <p className="font-medium">{new Date(student.admissionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="guardian">Guardian</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
        </TabsList>

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
                <InfoItem
                  icon={Calendar}
                  label="Date of Birth"
                  value={new Date(student.dateOfBirth).toLocaleDateString()}
                />
                <InfoItem icon={User} label="Gender" value={student.gender} />
                <InfoItem icon={Heart} label="Blood Group" value={student.bloodGroup || "Not specified"} />
                <InfoItem icon={Mail} label="Email" value={student.email || "Not specified"} />
                <InfoItem icon={Phone} label="Phone" value={student.phone || "Not specified"} />
                <InfoItem icon={MapPin} label="Address" value={formatAddress(student.address)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardian">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Father's Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoItem label="Name" value={student.fatherName} />
                    <InfoItem label="Phone" value={student.fatherPhone || "Not specified"} />
                    <InfoItem label="Occupation" value={student.fatherOccupation || "Not specified"} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Mother's Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Name" value={student.motherName || "Not specified"} />
                    <InfoItem label="Phone" value={student.motherPhone || "Not specified"} />
                  </div>
                </div>

                {student.guardianName && (
                  <div>
                    <h4 className="font-medium mb-4">Guardian Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoItem label="Name" value={student.guardianName} />
                      <InfoItem label="Phone" value={student.guardianPhone || "Not specified"} />
                      <InfoItem label="Relation" value={student.guardianRelation || "Not specified"} />
                    </div>
                  </div>
                )}

                {student.emergencyContact?.name && (
                  <div>
                    <h4 className="font-medium mb-4">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoItem label="Name" value={student.emergencyContact.name} />
                      <InfoItem label="Phone" value={student.emergencyContact.phone || "Not specified"} />
                      <InfoItem label="Relation" value={student.emergencyContact.relation || "Not specified"} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Current Class" value={`${student.class} - ${student.section}`} />
                <InfoItem label="Admission Class" value={student.admissionClass || student.class} />
                <InfoItem label="Admission Date" value={new Date(student.admissionDate).toLocaleDateString()} />
                <InfoItem label="Previous School" value={student.previousSchool || "Not specified"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <InfoItem label="Allergies" value={student.medicalInfo?.allergies || "None reported"} />
                <InfoItem label="Medical Conditions" value={student.medicalInfo?.conditions || "None reported"} />
                <InfoItem label="Current Medications" value={student.medicalInfo?.medications || "None"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function formatAddress(address) {
  if (!address) return "Not specified"
  const parts = [address.street, address.city, address.state, address.zipCode, address.country]
  return parts.filter(Boolean).join(", ") || "Not specified"
}
