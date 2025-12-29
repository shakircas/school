import { NextResponse } from "next/server";
import { auth } from "@/auth";
import PDFDocument from "pdfkit";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { students } = await req.json();

  if (!students || !students.length) {
    return NextResponse.json({ error: "No data" }, { status: 400 });
  }

  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {});

  doc.fontSize(18).text("Student Login Credentials", { align: "center" });
  doc.moveDown();

  students.forEach((s, i) => {
    doc
      .fontSize(12)
      .text(`${i + 1}. Name: ${s.name}`)
      .text(`Email: ${s.email}`)
      .text(`Password: ${s.password}`)
      .moveDown();
  });

  doc.end();

  return new Response(Buffer.concat(chunks), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="students-login.pdf"`,
    },
  });
}
