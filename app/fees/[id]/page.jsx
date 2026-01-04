"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import {
  User,
  Phone,
  School,
  IndianRupee,
  Trash2,
  Save,
  ArrowLeft,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

/* ============================= */

export default function FeeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [edit, setEdit] = useState({
    discount: 0,
    fine: 0,
  });

  /* Fetch Fee */
  useEffect(() => {
    fetch(`/api/fees/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setFee(d);
        setEdit({
          discount: d.discount || 0,
          fine: d.fine || 0,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  console.log(fee);

  /* Save updates */
  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/fees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });

    if (!res.ok) {
      toast({ title: "Update failed", variant: "destructive" });
      setSaving(false);
      return;
    }

    const updated = await res.json();
    setFee(updated);
    toast({ title: "Fee updated successfully" });
    setSaving(false);
  };

  /* Delete */
  const remove = async () => {
    if (!confirm("Delete this fee record?")) return;

    await fetch(`/api/fees/${id}`, { method: "DELETE" });
    toast({ title: "Fee deleted" });
    router.push("/fees");
  };

  if (loading) return <Skeleton className="h-[500px]" />;

  if (!fee) return <p>Not found</p>;

  const statusColor =
    fee.status === "Paid"
      ? "bg-green-500"
      : fee.status === "Partial"
      ? "bg-yellow-500"
      : "bg-red-500";

  /* ============================= */

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <Badge className={`${statusColor} text-white`}>{fee.status}</Badge>
        </div>

        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Info label="Name" value={fee.student?.name} />
            <Info label="Roll No" value={fee.student?.rollNumber} />
            <Info
              label="Class"
              value={
                fee.classId?.name
                  ? `${fee.classId.name} - ${fee.sectionId}`
                  : "N/A"
              }
              icon={<School className="h-4 w-4" />}
            />
            <p>{fee.month}</p>
            <Info label="Father" value={fee.student?.fatherName} />
            <Info
              label="Phone"
              value={fee.student?.phone}
              icon={<Phone className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          <Stat title="Total" value={fee.totalAmount} />
          <Stat title="Discount" value={fee.discount} />
          <Stat title="Fine" value={fee.fine} />
          <Stat title="Net Payable" value={fee.netAmount} />
        </div>

        {/* Edit Discount & Fine */}
        <Card>
          <CardHeader>
            <CardTitle>Adjustments</CardTitle>
            <CardDescription>
              Apply discount or fine (recalculates automatically)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                value={edit.discount}
                onChange={(e) =>
                  setEdit((p) => ({ ...p, discount: +e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Fine</Label>
              <Input
                type="number"
                value={edit.fine}
                onChange={(e) =>
                  setEdit((p) => ({ ...p, fine: +e.target.value }))
                }
              />
            </div>

            <div className="flex items-end">
              <Button onClick={save} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {fee.payments?.length ? (
              <div className="space-y-3">
                {fee.payments.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Receipt: {p.receiptNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold">Rs. {p.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No payments yet</p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={remove}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Fee Record
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

/* ============================= */

function Info({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold flex items-center gap-1">
          <IndianRupee className="h-4 w-4" />
          {Number(value || 0).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
