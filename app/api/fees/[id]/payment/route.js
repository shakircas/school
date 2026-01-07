// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Fee from "@/models/Fee";
// import mongoose from "mongoose";

// export async function POST(request, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 });
//     }

//     const { amount, paymentMethod, collectedBy, remarks } =
//       await request.json();

//     /* ======================
//        BASIC VALIDATION
//     ====================== */
//     if (!amount || amount <= 0) {
//       return NextResponse.json(
//         { error: "Payment amount must be greater than 0" },
//         { status: 400 }
//       );
//     }

//     if (!paymentMethod) {
//       return NextResponse.json(
//         { error: "Payment method is required" },
//         { status: 400 }
//       );
//     }

//     const fee = await Fee.findById(id);

//     if (!fee) {
//       return NextResponse.json(
//         { error: "Fee record not found" },
//         { status: 404 }
//       );
//     }

//     /* ❌ Prevent over-payment */
//     if (amount > fee.dueAmount) {
//       return NextResponse.json(
//         { error: `Payment exceeds due amount (${fee.dueAmount})` },
//         { status: 400 }
//       );
//     }

//     /* ======================
//        RECEIPT
//     ====================== */
//     const receiptNumber = `RCP-${fee.academicYear}-${Date.now()}-${Math.floor(
//       Math.random() * 1000
//     )}`;

//     /* ======================
//        PAYMENT HISTORY (KEEP)
//     ====================== */
//     fee.payments.push({
//       amount,
//       paymentMethod,
//       paymentDate: new Date(),
//       receiptNumber,
//       collectedBy,
//       remarks,
//     });

//     /* ======================
//        INSTALLMENT LOGIC
//     ====================== */

//     let remainingAmount = amount;

//     if (fee.installments?.length) {
//       for (const inst of fee.installments) {
//         if (remainingAmount <= 0) break;

//         if (inst.status === "Paid") continue;
//         if (inst.locked) {
//           continue; // skip paid installments
//         }

//         const instDue = inst.amount - inst.paidAmount;

//         const payNow = Math.min(instDue, remainingAmount);

//         inst.paidAmount += payNow;
//         remainingAmount -= payNow;

//         if (inst.paidAmount >= inst.amount) {
//           inst.status = "Paid";
//           inst.locked = true; // 🔒 LOCK IT
//         } else {
//           inst.status = "Partial";
//         }
//       }
//     }

//     /* ======================
//        RECALCULATE TOTALS
//     ====================== */
//     const totalPaidFromInstallments = fee.installments?.length
//       ? fee.installments.reduce((s, i) => s + i.paidAmount, 0)
//       : fee.paidAmount + amount;

//     fee.paidAmount = totalPaidFromInstallments;
//     fee.dueAmount = fee.netAmount - fee.paidAmount;

//     /* ======================
//        STATUS UPDATE
//     ====================== */
//     if (fee.dueAmount <= 0) {
//       fee.status = "Paid";
//       fee.dueAmount = 0;
//     } else if (fee.paidAmount > 0) {
//       fee.status = "Partial";
//     } else {
//       fee.status = "Pending";
//     }

//     await fee.save();

//     return NextResponse.json({
//       success: true,
//       receiptNumber,
//       fee,
//     });
//   } catch (error) {
//     console.error("Error processing payment:", error);
//     return NextResponse.json(
//       { error: "Failed to process payment" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
 import connectDB from "@/lib/db";
import Fee from "@/models/Fee";
import mongoose from "mongoose";
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { amount, paymentMethod, collectedBy, remarks } =
      await request.json();

    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 });

    if (!amount || amount <= 0)
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );

    const fee = await Fee.findById(id);
    if (!fee)
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });

    /* ===============================
       🔹 CALCULATE TOTAL FINE (SAFE)
    =============================== */
    const today = new Date();
    let installmentFineTotal = 0;

    fee.installments.forEach((inst) => {
      if (!inst.locked && inst.dueDate && today > inst.dueDate) {
        const daysLate = Math.ceil(
          (today - inst.dueDate) / (1000 * 60 * 60 * 24)
        );
        inst.fine = daysLate * 10; // Rs 10/day
      }
      installmentFineTotal += inst.fine || 0;
    });

    const totalFine = (fee.fine || 0) + installmentFineTotal;

    /* ===============================
       🔹 NET AMOUNT (AUTHORITATIVE)
    =============================== */
    const netAmount =
      fee.totalAmount -
      (fee.discount || 0) -
      (fee.scholarship || 0) +
      totalFine;

    /* ===============================
       🔹 PAID & DUE
    =============================== */
    const alreadyPaid = fee.payments.reduce((s, p) => s + p.amount, 0) || 0;

    const remainingDue = netAmount - alreadyPaid;
    if (amount > remainingDue)
      return NextResponse.json(
        { error: `Max payable Rs.${remainingDue}` },
        { status: 400 }
      );

    /* ===============================
       🔹 SAVE PAYMENT
    =============================== */
    const receiptNumber = `RCP-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    fee.payments.push({
      amount,
      paymentMethod,
      collectedBy: collectedBy || "Admin",
      remarks,
      receiptNumber,
      paymentDate: new Date(),
    });

    /* ===============================
       🔹 INSTALLMENT ALLOCATION
    =============================== */
    let remaining = amount;

    for (const inst of fee.installments) {
      if (remaining <= 0) break;
      if (inst.locked) continue;

      const instTotal =
        inst.amount - (fee.discount + fee.scholarship - (fee.fine || 0)) / 2;
      const instRemaining = instTotal - inst.paidAmount;

      if (instRemaining <= 0) {
        inst.locked = true;
        inst.status = "Paid";
        continue;
      }

      const pay = Math.min(instRemaining, remaining);
      inst.paidAmount += pay;
      remaining -= pay;

      if (inst.paidAmount >= instTotal) {
        inst.status = "Paid";
        inst.locked = true;
      } else {
        inst.status = "Partial";
      }
    }

    /* ===============================
       🔹 FINAL TOTALS
    =============================== */
    fee.netAmount = netAmount;
    fee.paidAmount = alreadyPaid + amount;
    fee.dueAmount = netAmount - fee.paidAmount;

    if (fee.dueAmount === 0) fee.status = "Paid";
    else if (fee.paidAmount > 0) fee.status = "Partial";
    else fee.status = "Pending";

    await fee.save();

    return NextResponse.json({ success: true, receiptNumber, fee });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
