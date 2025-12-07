"use client"

import { useState } from "react"
import useSWR from "swr"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, UserMinus } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function WithdrawalsContent() {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { data: students } = useSWR("/api/students?status=Active", fetcher)
  const { data: withdrawals, isLoading, mutate } = useSWR("/api/students?status=withdrawn", fetcher)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      await fetch(`/api/students/${data.student}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "withdrawn",
          withdrawalDate: data.withdrawalDate,
          withdrawalReason: data.reason,
        }),
      })
      toast.success("Student withdrawn successfully")
      setIsWithdrawOpen(false)
      reset()
      mutate()
    } catch (error) {
      toast.error("Failed to process withdrawal")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Student Withdrawals" description="Manage student withdrawals and transfers">
        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Process Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Withdrawal</DialogTitle>
              <DialogDescription>Record a student withdrawal or transfer</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Student</Label>
                <Select onValueChange={(value) => setValue("student", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.data?.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.name} - Class {student.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawalDate">Withdrawal Date</Label>
                <Input id="withdrawalDate" type="date" {...register("withdrawalDate", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Select onValueChange={(value) => setValue("reason", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer to another school</SelectItem>
                    <SelectItem value="relocation">Family relocation</SelectItem>
                    <SelectItem value="financial">Financial reasons</SelectItem>
                    <SelectItem value="health">Health issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" {...register("notes")} rows={3} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsWithdrawOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Process Withdrawal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{withdrawals?.data?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Withdrawals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">This Year</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Records</CardTitle>
          <CardDescription>Students who have left the school</CardDescription>
        </CardHeader>
        <CardContent>
          {!withdrawals?.data?.length ? (
            <EmptyState
              icon={UserMinus}
              title="No withdrawal records"
              description="No students have been withdrawn yet"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Withdrawal Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.data.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.photo || "/placeholder.svg"} />
                          <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Class {student.class}</TableCell>
                    <TableCell>
                      {student.withdrawalDate ? new Date(student.withdrawalDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="capitalize">{student.withdrawalReason || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Withdrawn</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
