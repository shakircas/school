import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const classFilter = searchParams.get("class");
    const section = searchParams.get("section");
    const status = searchParams.get("status") || "Inactive";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 1000;

    const query = {};
    if (search) query.$text = { $search: search };
    if (classFilter) query.class = classFilter;
    if (section) query.section = section;
    if (status) query.status = status;

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // ----------------- PDF DOCUMENT -----------------
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load font paths
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

    // Default fonts
    let regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // If Roboto exists → use it
    if (fs.existsSync(fontRegularPath) && fs.existsSync(fontBoldPath)) {
      regularFont = await pdfDoc.embedFont(fs.readFileSync(fontRegularPath));
      boldFont = await pdfDoc.embedFont(fs.readFileSync(fontBoldPath));
    }

    const page1 = pdfDoc.addPage([595, 842]); // A4 page1
    const { width } = page1.getSize();
    let y = 800;

    // ----------------- TITLE -----------------
    const center = (text, size, font) =>
      width / 2 - font.widthOfTextAtSize(text, size) / 2;

    page1.drawText("Withdrawal Records", {
      x: center("Withdrawal Records", 18, boldFont),
      y,
      size: 18,
      font: boldFont,
    });

    y -= 40;
    page1.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    y -= 20;

    // ----------------- TABLE HEADER -----------------
    const header = (text, x) => {
      page1.drawText(text, {
        x,
        y,
        size: 10,
        font: boldFont,
      });
    };

    header("Name", 50);
    header("Roll", 200);
    header("Class", 260);
    header("Withdraw Date", 330);
    header("Reason", 450);

    y -= 20;

    // ----------------- TABLE ROWS -----------------
    const row = (text, x) => {
      page1.drawText(text, {
        x,
        y,
        size: 10,
        font: regularFont,
      });
    };

    students.forEach((s) => {
      if (y < 60) {
        // new page1 if needed
        y = 780;
        pdfDoc.addPage();
      }

      row(s.name || "-", 50);
      row(s.rollNumber || "-", 200);
      row(s.class || "-", 260);
      row(
        s.withdrawalDate
          ? new Date(s.withdrawalDate).toLocaleDateString()
          : "-",
        330
      );
      row(s.withdrawalReason || "-", 450);

      y -= 20;
    });

    // ----------------- SAVE PDF -----------------
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="withdrawals.pdf"`,
      },
    });
  } catch (err) {
    console.error("Export PDF error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
