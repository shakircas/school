import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Fee from "@/models/Fee"

export async function POST(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const paymentData = await request.json()

    const fee = await Fee.findById(id)

    if (!fee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}`

    // Add payment to payments array
    fee.payments.push({
      ...paymentData,
      receiptNumber,
      paymentDate: new Date(),
    })

    // Update paid amount and due amount
    fee.paidAmount += paymentData.amount
    fee.dueAmount = fee.netAmount - fee.paidAmount

    // Update status
    if (fee.dueAmount <= 0) {
      fee.status = "Paid"
    } else {
      fee.status = "Partial"
    }

    await fee.save()

    return NextResponse.json({
      fee,
      receiptNumber,
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
