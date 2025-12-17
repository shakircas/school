// "use client";

// import { useState } from "react";
// import useSWR from "swr";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { PageHeader } from "@/components/ui/page-header";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { EmptyState } from "@/components/ui/empty-state";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Plus,
//   Search,
//   UserPlus,
//   Eye,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";
// import { toast } from "sonner";

// const fetcher = (url) => fetch(url).then((res) => res.json());

// export function AdmissionsContent() {
//   const [status, setStatus] = useState("");
//   const queryParams = new URLSearchParams();
//   if (status) queryParams.set("search", status);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const {
//     data: students,
//     isLoading,
//     mutate,
//   } = useSWR(`/api/students?${queryParams.toString()}`, fetcher);

//   const handleApprove = async (id) => {
//     try {
//       await fetch(`/api/students/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: "Active" }),
//       });
//       toast.success("Admission approved");
//       mutate();
//     } catch (error) {
//       toast.error("Failed to approve");
//     }
//   };

//   const handleReject = async (id) => {
//     if (!confirm("Reject this admission?")) return;
//     try {
//       await fetch(`/api/students/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: "rejected" }),
//       });
//       toast.success("Admission rejected");
//       mutate();
//     } catch (error) {
//       toast.error("Failed to reject");
//     }
//   };

//   const filteredStudents =
//     students?.data?.filter((student) => {
//       if (
//         searchQuery &&
//         !student.name.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//         return false;
//       return true;
//     }) || [];

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="Admissions"
//         description="Manage new student admissions"
//       >
//         <Button asChild>
//           <Link href="/students/add">
//             <Plus className="h-4 w-4 mr-2" />
//             New Admission
//           </Link>
//         </Button>
//       </PageHeader>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-2xl font-bold">
//               {students?.data?.length || 0}
//             </div>
//             <p className="text-sm text-muted-foreground">Pending Admissions</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-2xl font-bold text-green-600">0</div>
//             <p className="text-sm text-muted-foreground">Approved Today</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-2xl font-bold text-red-600">0</div>
//             <p className="text-sm text-muted-foreground">Rejected</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Search */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="relative max-w-sm">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search applications..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Applications Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Pending Applications</CardTitle>
//           <CardDescription>
//             Review and process admission applications
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {!filteredStudents.length ? (
//             <EmptyState
//               icon={UserPlus}
//               title="No pending admissions"
//               description="All admission applications have been processed"
//             />
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Student</TableHead>
//                   <TableHead>Class</TableHead>
//                   <TableHead>Father Name</TableHead>
//                   <TableHead>Phone</TableHead>
//                   <TableHead>Applied On</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredStudents.map((student) => (
//                   <TableRow key={student._id}>
//                     <TableCell>
//                       <div className="flex items-center gap-3">
//                         <Avatar>
//                           <AvatarImage
//                             src={student.photo || "/placeholder.svg"}
//                           />
//                           <AvatarFallback>
//                             {student.name?.charAt(0)}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div>
//                           <p className="font-medium">{student.name}</p>
//                           <p className="text-sm text-muted-foreground">
//                             {student.email}
//                           </p>
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell>Class {student.class}</TableCell>
//                     <TableCell>{student.fatherName}</TableCell>
//                     <TableCell>{student.phone}</TableCell>
//                     <TableCell>
//                       {new Date(student.createdAt).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-1">
//                         <Button variant="ghost" size="icon" asChild>
//                           <Link href={`/students/${student._id}`}>
//                             <Eye className="h-4 w-4" />
//                           </Link>
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-green-600"
//                           onClick={() => handleApprove(student._id)}
//                         >
//                           <CheckCircle className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-red-600"
//                           onClick={() => handleReject(student._id)}
//                         >
//                           <XCircle className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  UserPlus,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function AdmissionsContent() {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fixed: Fetch ONLY admission requests (status = Pending)
  const { data, isLoading, mutate } = useSWR(
    `/api/students?status=Pending`,
    fetcher
  );

  const students = data?.students || [];

  // ------------------------
  // APPROVE ADMISSION
  // ------------------------
  const handleApprove = async (id) => {
    try {
      await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Active", // Student becomes active
          admissionStatus: "approved",
        }),
      });

      toast.success("Admission approved");
      mutate();
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  // ------------------------
  // REJECT ADMISSION
  // ------------------------
  const handleReject = async (id) => {
    if (!confirm("Reject this admission?")) return;

    try {
      await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionStatus: "rejected",
          status: "Inactive",
        }),
      });

      toast.success("Admission rejected");
      mutate();
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  // ------------------------
  // SEARCH FILTER
  // ------------------------
  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description="Manage new student admissions"
      >
        <Button asChild>
          <Link href="/students/add">
            <Plus className="h-4 w-4 mr-2" />
            New Admission
          </Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-sm text-muted-foreground">Pending Admissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-sm text-muted-foreground">Approved Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>Review and process new admissions</CardDescription>
        </CardHeader>

        <CardContent>
          {!filteredStudents.length ? (
            <EmptyState
              icon={UserPlus}
              title="No pending admissions"
              description="All admission applications have been processed"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student?.photo?.url} />
                          <AvatarFallback>
                            {student.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      Class {student.class}-{student.section}
                    </TableCell>

                    <TableCell>{student.fatherName}</TableCell>

                    <TableCell>{student.phone}</TableCell>

                    <TableCell>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/students/${student._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600"
                          onClick={() => handleApprove(student._id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleReject(student._id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
