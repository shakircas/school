import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";
import Class from "@/models/Class";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const fee = await Fee.findById(id)
      .populate("student", "name rollNumber class section fatherName phone")
      .populate("classId", "name")
      .lean();

    if (!fee) {
      return NextResponse.json(
        { error: "Fee record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(fee);
  } catch (error) {
    console.error("Error fetching fee:", error);
    return NextResponse.json({ error: "Failed to fetch fee" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const updates = await request.json();

    const fee = await Fee.findById(id);
    if (!fee)
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });

    /* ===============================
       🔹 ALLOWED EDITS ONLY
    =============================== */
    fee.discount = updates.discount ?? fee.discount;
    fee.scholarship = updates.scholarship ?? fee.scholarship;
    fee.fine = updates.fine ?? fee.fine;

    /* ===============================
       🔹 RECOMPUTE NET (NO INSTALLMENTS)
    =============================== */
    const installmentFineTotal =
      fee.installments.reduce((s, i) => s + (i.fine || 0), 0) || 0;

    fee.netAmount =
      fee.totalAmount -
      (fee.discount || 0) -
      (fee.scholarship || 0) +
      (fee.fine || 0) +
      installmentFineTotal;

    if (fee.netAmount < fee.paidAmount) fee.netAmount = fee.paidAmount;

    fee.dueAmount = fee.netAmount - fee.paidAmount;

    /* ===============================
       🔹 STATUS
    =============================== */
    if (fee.dueAmount === 0) fee.status = "Paid";
    else if (fee.paidAmount > 0) fee.status = "Partial";
    else fee.status = "Pending";

    await fee.save();
    return NextResponse.json(fee);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}



export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const fee = await Fee.findByIdAndDelete(id);

    if (!fee) {
      return NextResponse.json(
        { error: "Fee record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Fee record deleted successfully" });
  } catch (error) {
    console.error("Error deleting fee:", error);
    return NextResponse.json(
      { error: "Failed to delete fee" },
      { status: 500 }
    );
  }
}



export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { amount, paymentDate, paymentMethod, receiptNumber } =
      await req.json();

    const fee = await Fee.findById(id);
    if (!fee)
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });

    let remaining = amount;

    // Allocate payment to installments first
    const updatedInstallments = fee.installments.map((inst) => {
      if (remaining <= 0 || inst.locked) return inst;

      const instTotal = inst.amount + (inst.fine || 0);
      const instDue = instTotal - (inst.paidAmount || 0);

      const pay = Math.min(instDue, remaining);
      inst.paidAmount = (inst.paidAmount || 0) + pay;
      remaining -= pay;

      // Lock installment if fully paid
      inst.locked = inst.paidAmount >= instTotal;
      return inst;
    });

    // Remaining goes to general paidAmount
    fee.paidAmount = (fee.paidAmount || 0) + remaining;

    // Add payment history
    fee.payments.push({
      amount,
      paymentDate,
      paymentMethod,
      receiptNumber,
      collectedBy: "Admin",
      remarks: "Online payment",
    });

    // Recalculate netAmount and dueAmount
    const total =
      fee.totalAmount -
      (fee.discount || 0) -
      (fee.scholarship || 0) +
      (fee.fine || 0);
    const installmentsPaid = updatedInstallments.reduce(
      (sum, i) => sum + (i.paidAmount || 0),
      0
    );
    const dueAmount = Math.max(total - installmentsPaid - fee.paidAmount, 0);

    fee.dueAmount = dueAmount;
    fee.netAmount = total;

    // Update status
    if (dueAmount === 0 && total > 0) fee.status = "Paid";
    else if (dueAmount > 0 && fee.paidAmount + installmentsPaid > 0)
      fee.status = "Partial";
    else fee.status = "Pending";

    fee.installments = updatedInstallments;

    await fee.save();

    return NextResponse.json(fee);
  } catch (error) {
    console.error("Payment failed:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
