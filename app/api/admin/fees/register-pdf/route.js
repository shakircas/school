import PDFDocument from "pdfkit";
import Fee from "@/models/Fee";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const month = searchParams.get("month");

  const fees = await Fee.find({ classId, month })
    .populate("student", "name rollNumber")
    .populate("classId", "name");

  const doc = new PDFDocument({ margin: 30, size: "A4" });

  const chunks = [];
  doc.on("data", (c) => chunks.push(c));

  doc.fontSize(16).text("Fee Register", { align: "center" });
  doc.moveDown();

  fees.forEach((f, i) => {
    doc
      .fontSize(10)
      .text(
        `${i + 1}. ${f.student.name} | Roll: ${f.student.rollNumber} | Total: ${
          f.totalAmount
        } | Paid: ${f.paidAmount} | Due: ${f.dueAmount}`
      );
  });

  doc.end();

  return new Response(Buffer.concat(chunks), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=fee-register.pdf",
    },
  });
}
