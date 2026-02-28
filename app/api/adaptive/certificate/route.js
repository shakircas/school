import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const studentId = searchParams.get("studentId");

  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // Stream the PDF back to the client
  const stream = new Promise((resolve) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    // Certificate Design
    doc.fontSize(30).text("CERTIFICATE OF MASTERY", { align: "center" });
    doc.moveDown();
    doc.fontSize(18).text(`This is to certify that`, { align: "center" });
    doc.moveDown();
    doc.fontSize(24).fillColor("indigo").text(studentId, { align: "center" });
    doc
      .fontSize(18)
      .fillColor("black")
      .text(`has successfully demonstrated mastery in`, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(22)
      .fillColor("emerald")
      .text(subject.toUpperCase(), { align: "center" });
    doc.moveDown(2);
    doc
      .fontSize(12)
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });

    doc.end();
  });

  const pdfBuffer = await stream;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Mastery_${subject}.pdf`,
    },
  });
}
