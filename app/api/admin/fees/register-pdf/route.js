import PDFDocument from "pdfkit";
import Fee from "@/models/Fee";
import { connectDB } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const academicYear = searchParams.get("academicYear");
  const classId = searchParams.get("classId");
  const month = searchParams.get("month");

  const query = { academicYear };
  if (classId && classId !== "all") query.classId = classId;
  if (month && month !== "all") query.month = month;

  const fees = await Fee.find(query)
    .populate("student", "name rollNumber")
    .populate("classId", "name")
    .lean();

  if (!fees.length) {
    return new Response("No records found", { status: 404 });
  }

  /* ---------- FONT FIX ---------- */
  const fontPath = path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf");

  if (!fs.existsSync(fontPath)) {
    throw new Error("Font file not found at " + fontPath);
  }

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.registerFont("Roboto", fontPath);
  doc.font("Roboto");

  const chunks = [];
  doc.on("data", (c) => chunks.push(c));

  /* ---------- HEADER ---------- */
  doc.fontSize(18).text("Fee Register", { align: "center" });
  doc.fontSize(10).text(`Academic Year: ${academicYear}`, { align: "center" });
  doc.moveDown(2);

  /* ---------- CONTENT ---------- */
  fees &&
    fees.forEach((f, i) => {
      doc
        .fontSize(10)
        .text(
          `${i + 1}. ${f?.student?.name} (Roll ${f?.student?.rollNumber}) | ${
            f?.classId?.name
          } | ${f.month}`
        )
        .text(
          `Total: Rs.${f?.totalAmount} | Paid: Rs.${f?.paidAmount} | Due: Rs.${f?.dueAmount}`,
          { indent: 20 }
        )
        .moveDown(0.5);
    });

  doc.end();
  await new Promise((r) => doc.on("end", r));

  return new Response(Buffer.concat(chunks), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=fee-register.pdf",
    },
  });
}
