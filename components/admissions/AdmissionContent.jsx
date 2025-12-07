"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AdmissionContent() {
  const { toast } = useToast();

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [section, setSection] = useState("");
  const [status, setStatus] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Admissions
  const fetchAdmissions = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      search,
      class: classFilter,
      section,
      status,
      page,
      limit: 25,
    });

    try {
      const res = await fetch(`/api/admissions?${params.toString()}`);
      const data = await res.json();

      setAdmissions(data.admissions || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load admissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [search, classFilter, section, status, page]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Deleted", description: "Admission removed" });
        fetchAdmissions();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete admission",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Server error",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admissions</h2>
        <Link href="/admissions/create">
          <Button className="gap-2">
            <Plus size={18} /> New Admission
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name / roll / reg no..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select onValueChange={setClassFilter}>
            <SelectTrigger>{classFilter || "Filter by class"}</SelectTrigger>
            <SelectContent>
              {["6", "7", "8", "9", "10"].map((cls) => (
                <SelectItem key={cls} value={cls}>
                  Class {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSection}>
            <SelectTrigger>{section || "Section"}</SelectTrigger>
            <SelectContent>
              {["A", "B", "C", "D"].map((sec) => (
                <SelectItem key={sec} value={sec}>
                  {sec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setStatus}>
            <SelectTrigger>{status || "Status"}</SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admission List</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" size={30} />
            </div>
          ) : admissions.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">
              No admissions found.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Roll</th>
                  <th className="p-3 text-left">Reg No</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((adm) => (
                  <tr key={adm._id} className="border-b">
                    <td className="p-3">{adm.fullName}</td>
                    <td className="p-3">{adm.class}</td>
                    <td className="p-3">{adm.rollNumber}</td>
                    <td className="p-3">{adm.registrationNumber}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          adm.status === "Active"
                            ? "default"
                            : adm.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {adm.status}
                      </Badge>
                    </td>

                    <td className="p-3 flex justify-end gap-3">
                      <Link href={`/admissions/update/${adm._id}`}>
                        <Button size="icon" variant="outline">
                          <Edit size={16} />
                        </Button>
                      </Link>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(adm._id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </motion.div>
  );
}
