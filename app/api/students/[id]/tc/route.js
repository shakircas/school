import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const student = await Student.findById(id).lean();
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // PDF document
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // font paths
    const fontRegularPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Roboto-Regular.ttf"
    );

    const fontBoldPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Roboto-Bold.ttf"
    );

    // fallback fonts
    let regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // embed custom fonts if available
    if (fs.existsSync(fontRegularPath) && fs.existsSync(fontBoldPath)) {
      const robotoRegularBytes = fs.readFileSync(fontRegularPath);
      const robotoBoldBytes = fs.readFileSync(fontBoldPath);

      regularFont = await pdfDoc.embedFont(robotoRegularBytes);
      boldFont = await pdfDoc.embedFont(robotoBoldBytes);
    }

    // A4 page
    const page = pdfDoc.addPage([595, 842]);
    const { width } = page.getSize();
    let y = 800;

    // -------------------- HEADER --------------------
    const center = (text, size, font) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      return width / 2 - textWidth / 2;
    };

    page.drawText("SCHOOL NAME", {
      x: center("SCHOOL NAME", 18, boldFont),
      y,
      size: 18,
      font: boldFont,
    });

    y -= 25;

    page.drawText("Address • City • Phone", {
      x: center("Address • City • Phone", 12, regularFont),
      y,
      size: 12,
      font: regularFont,
    });

    y -= 40;

    page.drawText("TRANSFER CERTIFICATE", {
      x: center("TRANSFER CERTIFICATE", 14, boldFont),
      y,
      size: 14,
      font: boldFont,
    });

    y -= 40;

    // -------------------- BODY --------------------
    const line = (label, value) => {
      page.drawText(`${label}: ${value}`, {
        x: 50,
        y,
        size: 12,
        font: regularFont,
      });
      y -= 22;
    };

    line("Name", student.name);
    line("Father Name", student.fatherName);
    line("Class", `${student.class} - ${student.section}`);
    line(
      "Admission Date",
      student.admissionDate
        ? new Date(student.admissionDate).toLocaleDateString()
        : "-"
    );
    line(
      "Withdrawal Date",
      student.withdrawalDate
        ? new Date(student.withdrawalDate).toLocaleDateString()
        : "-"
    );
    line("Reason", student.withdrawalReason || "-");

    y -= 40;

    page.drawText("Principal Signature: ________________________", {
      x: 50,
      y,
      size: 12,
      font: regularFont,
    });

    y -= 20;

    page.drawText("Admin / Clerk: _____________________________", {
      x: 50,
      y,
      size: 12,
      font: regularFont,
    });

    // -------------------- SAVE PDF --------------------
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="TC_${student.name}.pdf"`,
      },
    });
  } catch (err) {
    console.error("TC PDF ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
