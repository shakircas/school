import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get("academicYear");

    if (!academicYear) {
      return NextResponse.json(
        { error: "academicYear required" },
        { status: 400 }
      );
    }

    const fees = await Fee.find({ academicYear }).lean();

    const totalCollected = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
    const totalPending = fees.reduce((s, f) => s + (f.dueAmount || 0), 0);

    /* ================= PDF ================= */
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let y = 780;

    const draw = (text, size = 12) => {
      page.drawText(text, { x: 50, y, size, font });
      y -= size + 8;
    };

    draw("GOVERNMENT HIGH SCHOOL", 16);
    draw(`Fee Financial Statement (${academicYear})`, 14);
    y -= 10;

    draw(`Total Collected: Rs. ${totalCollected.toLocaleString()}`);
    draw(`Total Pending: Rs. ${totalPending.toLocaleString()}`);
    draw(
      `Collection Rate: ${(
        (totalCollected / (totalCollected + totalPending || 1)) *
        100
      ).toFixed(1)}%`
    );

    y -= 20;
    draw("Generated on: " + new Date().toLocaleDateString(), 10);

    const pdfBytes = await pdf.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=fee-report.pdf",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
