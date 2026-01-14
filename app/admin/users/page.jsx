"use client";

import useSWR from "swr";
import * as XLSX from "xlsx";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Download } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const roleColors = {
  admin: "destructive",
  teacher: "secondary",
  student: "outline",
};

export default function AdminUsersPage() {
  const [confirmUser, setConfirmUser] = useState(null);

  const { data, isLoading, mutate } = useSWR("/api/admin/users", fetcher);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const users = data?.users || [];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const updateRole = async (id, role) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    toast.success("Role updated");
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

  const handleRoleChange = (user, role) => {
    if (role === "admin") {
      setConfirmUser({ user, role });
    } else {
      updateRole(user._id, role);
    }
  };


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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage roles and access control
            </p>
          </div>

          <Button onClick={exportExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* FILTERS */}
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* USERS */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card
              key={user._id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                  {user.name[0]}
                </div>

                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={roleColors[user.role]} className="capitalize">
                  {user.role}
                </Badge>

                <Select
                  value={user.role}
                  // onValueChange={(val) => updateRole(user._id, val)}
                  onValueChange={(val) => handleRoleChange(user, val)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="text-xs">Active</span>
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={(val) => toggleActive(user._id, val)}
                  />
                </div>
              </div>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <Card className="py-10 text-center text-muted-foreground">
              No users found
            </Card>
          )}
        </div>
      </div>
      <AlertDialog
        open={!!confirmUser}
        onOpenChange={() => setConfirmUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Grant Admin Access?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to give <b>ADMIN</b> privileges to{" "}
              <b>{confirmUser?.user?.name}</b>.
              <br />
              This user will have full system control.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={() => {
                updateRole(confirmUser.user._id, "admin");
                setConfirmUser(null);
              }}
            >
              Confirm Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
