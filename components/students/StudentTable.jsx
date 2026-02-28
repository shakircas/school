import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  Printer,
  CalendarDays,
  MoreHorizontal,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

// UI Components (Assuming Shadcn/UI structure)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "../ui/empty-state";
import { LoadingSpinner } from "../ui/loading-spinner";
import Link from "next/link";

// Sub-components like LoadingSpinner and EmptyState are assumed to be defined in your project

export default function StudentTable({
  students,
  studentsLoading,
  clearFilters,
  handleDelete,
}) {
  const router = useRouter();

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-t border-slate-100">
        {/* {studentsLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-in fade-in duration-500">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-indigo-50 border-t-indigo-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-900">
                Syncing Database
              </p>
              <p className="text-sm text-slate-500">
                Fetching the latest student records...
              </p>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="py-24 px-6 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No students found
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">
              We couldn't find any records matching your current filters.
            </p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="rounded-full px-6"
            >
              Reset All Filters
            </Button>
          </div> */}
        {studentsLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <LoadingSpinner size="lg" className="text-indigo-600" />
            <p className="text-sm text-slate-500 font-medium">
              Fetching records...
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20">
            <EmptyState
              icon={GraduationCap}
              title="No students found"
              description="Adjust your filters or add a new student to the system."
              action={
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* --- MOBILE VIEW (Card Layout) --- */}
            <div className="grid gap-4 p-4 sm:hidden bg-slate-50/50">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="group relative rounded-2xl border border-slate-200 p-5 space-y-4 bg-white shadow-sm transition-all active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                          <AvatarImage
                            src={student.photo?.url}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg">
                            {student.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white",
                            student.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-slate-300",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          className="cursor-pointer"
                          href={`/dashboard/adaptive/${student._id}`}
                        >
                          <h4 className="font-bold text-slate-900 truncate tracking-tight text-base">
                            {student.name}
                          </h4>
                        </Link>
                        <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">
                          Roll: {student.rollNumber}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-slate-100"
                        >
                          <MoreHorizontal className="h-5 w-5 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-xl p-2 shadow-xl border-slate-200"
                      >
                        {/* Dropdown items same as desktop for consistency */}
                        <StudentActions
                          student={student}
                          router={router}
                          handleDelete={handleDelete}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 px-1 border-y border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        Academic
                      </p>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">
                          {student.classId?.name}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span>{student.sectionId || "N/A"}</span>
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        Parent
                      </p>
                      <p className="text-sm font-semibold text-slate-700 truncate capitalize">
                        {student.fatherName.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-indigo-600">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs font-bold">
                          {student.phone || student.fatherPhone}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                        student.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100",
                      )}
                    >
                      {student.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* --- DESKTOP VIEW --- */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-b border-slate-200">
                    <TableHead className="pl-6 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-widest">
                      Student Profile
                    </TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">
                      Academic Info
                    </TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">
                      Guardian
                    </TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">
                      Contact Details
                    </TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest text-center">
                      Status
                    </TableHead>
                    <TableHead className="w-20 pr-6 text-right font-bold text-slate-500 uppercase text-[11px] tracking-widest">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow
                      key={student._id}
                      className="group transition-all hover:bg-indigo-50/40 border-b border-slate-100 last:border-0"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage
                              src={student.photo?.url}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-black">
                              {student.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <Link
                              className="cursor-pointer"
                              href={`/dashboard/adaptive/${student._id}`}
                            >
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                {student.name}
                              </span>
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              ID: {student.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-white text-slate-700 border-slate-200 font-bold px-2 py-0"
                            >
                              {student.classId?.name}
                            </Badge>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-bold text-slate-600">
                              {student.sectionId || "N/A"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-500/80 uppercase">
                            Roll #{student.rollNumber}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">
                            {student.fatherName}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <User className="h-3 w-3" /> Father/Guardian
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="text-sm font-medium tracking-tight">
                              {student.phone || student.fatherPhone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-500">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="text-xs truncate max-w-[140px]">
                              {student.email || "No email provided"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "rounded-full font-black text-[10px] uppercase tracking-wider px-3 py-1 border shadow-sm",
                            student.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200",
                          )}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-9 w-9 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100"
                            >
                              <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl p-2 shadow-2xl border-slate-200"
                          >
                            <StudentActions
                              student={student}
                              router={router}
                              handleDelete={handleDelete}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** * Reusable Action Items for both Mobile and Desktop
 */
function StudentActions({ student, router, handleDelete }) {
  return (
    <>
      <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Management
      </div>
      <DropdownMenuItem
        onClick={() => router.push(`/students/${student._id}`)}
        className="rounded-lg cursor-pointer py-2.5"
      >
        <Eye className="h-4 w-4 mr-3 text-indigo-500" />{" "}
        <span className="font-medium">View Full Profile</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => router.push(`/students/${student._id}/report`)}
        className="rounded-lg cursor-pointer py-2.5"
      >
        <CalendarDays className="h-4 w-4 mr-3 text-amber-500" />{" "}
        <span className="font-medium">Attendance Record</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => router.push(`/students/${student._id}/edit`)}
        className="rounded-lg cursor-pointer py-2.5"
      >
        <Edit className="h-4 w-4 mr-3 text-blue-500" />{" "}
        <span className="font-medium">Edit Student Data</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1" />
      <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Documents
      </div>

      <DropdownMenuItem
        onClick={() => router.push(`/students/${student._id}/admission-form`)}
        className="rounded-lg cursor-pointer py-2.5"
      >
        <Printer className="h-4 w-4 mr-3 text-slate-500" />{" "}
        <span className="font-medium">Print Admission Form</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => router.push(`/students/${student._id}/print`)}
        className="rounded-lg cursor-pointer py-2.5"
      >
        <Printer className="h-4 w-4 mr-3 text-slate-500" />{" "}
        <span className="font-medium">Generate ID Card</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1" />

      <DropdownMenuItem
        onClick={() => handleDelete(student._id)}
        className="rounded-lg cursor-pointer py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
      >
        <Trash2 className="h-4 w-4 mr-3" />{" "}
        <span className="font-bold">Delete Student</span>
      </DropdownMenuItem>
    </>
  );
}
