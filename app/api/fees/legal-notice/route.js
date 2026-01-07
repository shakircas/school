// /api/fees/legal-notice/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GET(req) {
  // Changed from POST to GET
  await connectDB();

  // Get feeId from the URL search parameters
  const { searchParams } = new URL(req.url);
  const feeId = searchParams.get("feeId");

  if (!feeId)
    return NextResponse.json({ error: "ID required" }, { status: 400 });

  const fee = await Fee.findById(feeId);
  if (!fee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.TimesRoman);

  const text = `
LEGAL NOTICE – FEE PAYMENT

This is to inform you that the fee of:
Student: ${fee.studentName}
Class: ${fee.classId.name}-${fee.sectionId}
Month: ${fee.month}
Due Amount: Rs. ${fee.dueAmount}

has not been paid despite reminders. You are advised to clear the dues within 7 days, 
failing which strict action will be taken as per school policy.

Principal
${process.env.SCHOOL_NAME || "School Name"}
`;

  page.drawText(text, { x: 50, y: 750, size: 12, font, lineHeight: 18 });

  const bytes = await pdf.save();

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=legal-notice-${fee.studentName}.pdf`,
    },
  });
}
