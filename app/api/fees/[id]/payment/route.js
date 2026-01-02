// import { NextResponse } from "next/server"
// import connectDB from "@/lib/db"
// import Fee from "@/models/Fee"

// export async function POST(request, { params }) {
//   try {
//     await connectDB()

//     const { id } = await params
//     const paymentData = await request.json()
//     console.log(paymentData)

//     const fee = await Fee.findById(id)

//     if (!fee) {
//       return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
//     }

//     // Generate receipt number
//     const receiptNumber = `RCP-${Date.now()}`

//     // Add payment to payments array
//     fee.payments.push({
//       ...paymentData,
//       receiptNumber,
//       paymentDate: new Date(),
//     })

//     // Update paid amount and due amount
//     fee.paidAmount += paymentData.amount
//     fee.dueAmount = fee.netAmount - fee.paidAmount

//     // Update status
//     if (fee.dueAmount <= 0) {
//       fee.status = "Paid"
//     } else {
//       fee.status = "Partial"
//     }

//     await fee.save()

//     return NextResponse.json({
//       fee,
//       receiptNumber,
//     })
//   } catch (error) {
//     console.error("Error processing payment:", error)
//     return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 });
    }

    const { amount, paymentMethod, collectedBy, remarks } =
      await request.json();

    // ✅ Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    const fee = await Fee.findById(id);

    if (!fee) {
      return NextResponse.json(
        { error: "Fee record not found" },
        { status: 404 }
      );
    }

    // ❌ Prevent over-payment
    if (amount > fee.dueAmount) {
      return NextResponse.json(
        { error: `Payment exceeds due amount (${fee.dueAmount})` },
        { status: 400 }
      );
    }

    // ✅ Strong receipt number
    const receiptNumber = `RCP-${fee.academicYear}-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // ✅ Push payment entry (THIS FIXES PIE CHART)
    fee.payments.push({
      amount,
      paymentMethod,
      paymentDate: new Date(),
      receiptNumber,
      collectedBy,
      remarks,
    });

    // ✅ Update totals
    fee.paidAmount += amount;
    fee.dueAmount = fee.netAmount - fee.paidAmount;

    // ✅ Update status
    if (fee.dueAmount <= 0) {
      fee.status = "Paid";
      fee.dueAmount = 0;
    } else {
      fee.status = "Partial";
    }

    await fee.save();

    return NextResponse.json({
      success: true,
      receiptNumber,
      fee,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
