"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"
import { exportToExcel, exportToCSV } from "@/lib/excel-utils"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Download, FileSpreadsheet, Users } from "lucide-react"

const fetcher = (url) => fetch(url).then((res) => res.json())

const departments = ["Science", "Mathematics", "English", "Social Studies", "Computer", "Arts", "Physical Education"]
const statuses = ["Active", "Inactive", "On Leave", "Resigned"]

export function TeachersContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("Active")

  const queryParams = new URLSearchParams()
  if (search) queryParams.set("search", search)
  if (departmentFilter) queryParams.set("department", departmentFilter)
  if (statusFilter) queryParams.set("status", statusFilter)

  const { data, isLoading, mutate } = useSWR(`/api/teachers?${queryParams.toString()}`, fetcher)

  const teachers = data?.teachers || []

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return

    try {
      const response = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Teacher deleted",
          description: "The teacher has been removed successfully.",
        })
        mutate()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExport = (format) => {
    const exportData = teachers.map((t) => ({
      "Employee ID": t.employeeId,
      Name: t.name,
      Email: t.email,
      Phone: t.phone,
      Department: t.department,
      Designation: t.designation,
      Qualification: t.qualification,
      Experience: `${t.experience} years`,
      Status: t.status,
      "Joining Date": new Date(t.joiningDate).toLocaleDateString(),
    }))

    if (format === "excel") {
      exportToExcel(exportData, "teachers", "Teachers")
    } else {
      exportToCSV(exportData, "teachers")
    }

    toast({
      title: "Export successful",
      description: `Teachers data exported as ${format.toUpperCase()}`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Teachers" description={`Manage all ${data?.total || 0} teachers and staff`}>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild>
            <Link href="/teachers/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teachers found"
          description="Get started by adding your first teacher or adjust your filters."
          action={
            <Button asChild>
              <Link href="/teachers/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={teacher.photo?.url || "/placeholder.svg"} />
                        <AvatarFallback>{teacher.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{teacher.employeeId}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>{teacher.designation}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{teacher.phone}</p>
                      <p className="text-muted-foreground">{teacher.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/teachers/${teacher._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/teachers/${teacher._id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(teacher._id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
