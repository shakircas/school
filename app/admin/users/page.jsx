// "use client";

// import useSWR from "swr";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card } from "@/components/ui/card";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { toast } from "sonner";
// import { MainLayout } from "@/components/layout/main-layout";

// const fetcher = (url) => fetch(url).then((res) => res.json());

// export default function AdminUsersPage() {
//   const { data, isLoading, mutate } = useSWR("/api/admin/users", fetcher);
  
//   if (isLoading) return <LoadingSpinner />;
// console.log(data);
//   const users = data.users;

//   const updateRole = async (id, role) => {
//     await fetch(`/api/admin/users/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ role }),
//     });
//     toast.success("Role updated");
//     mutate();
//   };

//   const toggleActive = async (id, isActive) => {
//     await fetch(`/api/admin/users/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ isActive }),
//     });
//     mutate();
//   };

//   return (
//     <MainLayout>
//       <div className="space-y-4">
//         <h1 className="text-2xl font-bold">User Management</h1>

//         {users.map((user) => (
//           <Card
//             key={user._id}
//             className="p-4 flex justify-between items-center"
//           >
//             <div>
//               <p className="font-medium">{user.name}</p>
//               <p className="text-sm text-muted-foreground">{user.email}</p>
//               <Badge>{user.role}</Badge>
//             </div>

//             <div className="flex gap-2">
//               <Button size="sm" onClick={() => updateRole(user._id, "teacher")}>
//                 Teacher
//               </Button>
//               <Button size="sm" onClick={() => updateRole(user._id, "admin")}>
//                 Admin
//               </Button>
//               <Button
//                 size="sm"
//                 variant={user.isActive ? "destructive" : "default"}
//                 onClick={() => toggleActive(user._id, !user.isActive)}
//               >
//                 {user.isActive ? "Disable" : "Enable"}
//               </Button>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </MainLayout>
//   );
// }

"use client";

import useSWR from "swr";
import * as XLSX from "xlsx";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Download, Shield, UserCog, UserCheck, UserX } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminUsersPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/users", fetcher);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  if (isLoading) return <LoadingSpinner />;

  const users = data?.users || [];

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  /* ---------------- ACTIONS ---------------- */
  const updateRole = async (id, role) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    toast.success(`Role updated to ${role}`);
    mutate();
  };

  const toggleActive = async (id, isActive) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    toast.success(isActive ? "User enabled" : "User disabled");
    mutate();
  };

  /* ---------------- EXCEL EXPORT ---------------- */
  const exportExcel = () => {
    const sheetData = filteredUsers.map((u) => ({
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.isActive ? "Active" : "Disabled",
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Search, filter, manage roles & access
            </p>
          </div>

          <Button onClick={exportExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>

        {/* FILTER BAR */}
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* TABLE */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t hover:bg-muted/40 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <UserCheck className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <UserX className="h-4 w-4" />
                          Disabled
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateRole(user._id, "teacher")}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Teacher
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateRole(user._id, "admin")}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Admin
                        </Button>

                        <Button
                          size="sm"
                          variant={user.isActive ? "destructive" : "default"}
                          onClick={() => toggleActive(user._id, !user.isActive)}
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-10 text-center text-muted-foreground"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
