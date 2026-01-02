import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";

export async function POST(req) {
  try {
    await connectDB();
    const { feeId } = await req.json();

    const fee = await Fee.findById(feeId).populate("student");
    if (!fee) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    const phone = fee.student.phone?.replace(/^0/, "92");
    if (!phone) {
      return NextResponse.json({ error: "Phone missing" }, { status: 400 });
    }

    const message = `📢 *Fee Reminder*

Student: *${fee.studentName}*
Class: *${fee.className}-${fee.sectionName}*
Month: *${fee.month}*
Due Amount: *Rs. ${fee.dueAmount}*
Due Date: *${new Date(fee.dueDate).toLocaleDateString()}*

Please clear dues to avoid fine.

— ${process.env.SCHOOL_NAME}`;

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!res.ok) throw new Error("WhatsApp API failed");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to send WhatsApp" },
      { status: 500 }
    );
  }
}
