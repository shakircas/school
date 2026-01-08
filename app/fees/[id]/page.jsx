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
  CreditCard,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { generateReceiptPDF } from "@/components/fees/receipt-pdf";

export default function FeeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [edit, setEdit] = useState({
    discount: 0,
    scholarship: 0,
    fine: 0,
  });

  const [payment, setPayment] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    receiptNumber: "",
  });

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch(`/api/fees/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setFee(d);
        setEdit({
          discount: d.discount || 0,
          scholarship: d.scholarship || 0,
          fine: d.fine || 0,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  console.log(fee);

  /* ================= SAVE ADJUSTMENTS ================= */

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
    toast({ title: "Adjustments saved successfully" });
    setSaving(false);
  };

  /* ================= PAYMENT RECEIPT ================= */
  const printReceipt = async (payment) => {
    await generateReceiptPDF({
      schoolName: "Al Noor Public School",
      studentName: fee.student?.name,
      rollNo: fee.student?.rollNumber,
      className: `${fee.classId?.name}-${fee.sectionId}`,
      receiptNo: payment.receiptNumber,
      date: new Date(payment.paymentDate).toLocaleDateString(),
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      collectedBy: payment.collectedBy,
    });
  };


  /* ================= PAYMENT ================= */

  const payFee = async () => {
    if (payment.amount <= 0) {
      toast({ title: "Enter valid amount", variant: "destructive" });
      return;
    }

    const res = await fetch(`/api/fees/${id}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });

    if (!res.ok) {
      toast({ title: "Payment failed", variant: "destructive" });
      return;
    }

    const updated = await res.json();
    setFee(updated);
    setPayment({
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      receiptNumber: "",
    });
    toast({ title: "Payment successful" });
  };

  /* ================= DELETE ================= */

  const remove = async () => {
    if (!confirm("Delete this fee record?")) return;
    await fetch(`/api/fees/${id}`, { method: "DELETE" });
    toast({ title: "Fee deleted" });
    router.push("/fees");
  };

  if (loading) return <Skeleton className="h-[500px]" />;
  if (!fee) return <p>Fee record not found</p>;

  const statusColor =
    fee.status === "Paid"
      ? "bg-green-600"
      : fee.status === "Partial"
      ? "bg-yellow-500"
      : "bg-red-600";

  /* ================= RENDER ================= */

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
            <Info label="Father" value={fee.student?.fatherName} />
            <Info
              label="Phone"
              value={fee.student?.phone}
              icon={<Phone className="h-4 w-4" />}
            />
            <Info label="Month" value={fee.month} />
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid md:grid-cols-6 gap-4">
          <Stat title="Total" value={fee.totalAmount} />
          <Stat title="Discount" value={fee.discount} />
          <Stat title="Scholarship" value={fee.scholarship} />
          <Stat title="Fine" value={fee.fine} />
          <Stat title="Paid" value={fee.paidAmount} />
          <Stat title="Due" value={fee.dueAmount} />
        </div>

        {/* Installments (READ ONLY) */}
        <Card>
          <CardHeader>
            <CardTitle>Installments</CardTitle>
            <CardDescription>
              Installments are locked once payment is applied
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fee.installments?.length ? (
              fee.installments.map((inst, i) => (
                <div
                  key={i}
                  className={`p-4 border rounded-lg flex justify-between ${
                    inst.locked ? "bg-green-50 border-green-300" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      Installment {i + 1}
                      {inst.locked && (
                        <Badge className="ml-2 bg-green-600 text-white">
                          Locked
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due:{" "}
                      {inst.dueDate
                        ? new Date(inst.dueDate).toLocaleDateString()
                        : "-"}
                    </p>
                    <p>
                      Amount: Rs.{" "}
                      {inst.amount -
                        (fee.discount + fee.scholarship - (fee.fine || 0)) / 2}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">
                      Paid: Rs. {inst.paidAmount}
                    </p>
                    <p>
                      Due: Rs.{" "}
                      {inst.amount -
                        (fee.discount + fee.scholarship - (fee.fine || 0)) / 2 -
                        inst.paidAmount}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No installments</p>
            )}
          </CardContent>
        </Card>

        {/* Adjustments */}
        <Card>
          <CardHeader>
            <CardTitle>Adjustments</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
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
              <Label>Scholarship</Label>
              <Input
                type="number"
                value={edit.scholarship}
                onChange={(e) =>
                  setEdit((p) => ({ ...p, scholarship: +e.target.value }))
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
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle>
              <CreditCard className="inline h-4 w-4 mr-2" />
              Make Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <Input
              type="number"
              placeholder="Amount"
              value={payment.amount}
              onChange={(e) =>
                setPayment((p) => ({ ...p, amount: +e.target.value }))
              }
            />
            <Input
              type="date"
              value={payment.paymentDate}
              onChange={(e) =>
                setPayment((p) => ({ ...p, paymentDate: e.target.value }))
              }
            />
            <select
              className="border rounded px-2 py-1"
              value={payment.paymentMethod}
              onChange={(e) =>
                setPayment((p) => ({ ...p, paymentMethod: e.target.value }))
              }
            >
              <option>Cash</option>
              <option>Bank</option>
              <option>Card</option>
              <option>Online</option>
            </select>
            <Input
              placeholder="Receipt No"
              value={payment.receiptNumber}
              onChange={(e) =>
                setPayment((p) => ({ ...p, receiptNumber: e.target.value }))
              }
            />
            <Button className="md:col-span-4" onClick={payFee}>
              Pay
            </Button>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {fee.payments?.length ? (
              fee.payments.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between border p-3 rounded"
                >
                  <div>
                    <p>Receipt: {p.receiptNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold">Rs. {p.amount}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printReceipt(p)}
                  >
                    Print Receipt
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No payments</p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Danger */}
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

/* ================= HELPERS ================= */

function Info({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2">
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
