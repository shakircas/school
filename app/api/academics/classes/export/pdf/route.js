import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    // 1️⃣ DB
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = Number(searchParams.get("limit")) || 1000;
    const pageParam = Number(searchParams.get("page")) || 1;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { academicYear: { $regex: search, $options: "i" } },
      ];
    }

    const classes = await Class.find(query)
      .skip((pageParam - 1) * limit)
      .limit(limit)
      .lean();

    // 2️⃣ PDF INIT
    const pdfDoc = await PDFDocument.create();

    // 3️⃣ Fonts (Roboto if exists, fallback otherwise)
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

    let regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    if (fs.existsSync(fontRegularPath) && fs.existsSync(fontBoldPath)) {
      try {
        regularFont = await pdfDoc.embedFont(fs.readFileSync(fontRegularPath));
        boldFont = await pdfDoc.embedFont(fs.readFileSync(fontBoldPath));
      } catch (e) {
        console.warn("Roboto embed failed, using default fonts");
      }
    }

    // 4️⃣ PAGE SETUP
    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    const drawText = (text, x, font, size = 10) => {
      page.drawText(String(text), { x, y, size, font });
    };

    // 5️⃣ TITLE
    const title = "Classes Export";
    page.drawText(title, {
      x: width / 2 - boldFont.widthOfTextAtSize(title, 16) / 2,
      y,
      size: 16,
      font: boldFont,
    });
    y -= 30;

    // 6️⃣ TABLE HEADER
    const drawHeader = () => {
      drawText("Class", 50, boldFont, 11);
      drawText("Year", 220, boldFont, 11);
      drawText("Sections", 300, boldFont, 11);
      drawText("Capacity", 460, boldFont, 11);
      y -= 18;
    };

    drawHeader();

    // 7️⃣ DATA ROWS
    for (const c of classes) {
      if (y < 80) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 50;
        drawHeader();
      }

      const sections = (c.sections || []).map((s) => s.name).join(", ");
      const capacity = (c.sections || []).reduce(
        (sum, s) => sum + (s.capacity || 0),
        0
      );

      page.drawText(c.name || "-", {
        x: 50,
        y,
        size: 10,
        font: regularFont,
      });

      page.drawText(c.academicYear || "-", {
        x: 220,
        y,
        size: 10,
        font: regularFont,
      });

      page.drawText(sections || "-", {
        x: 300,
        y,
        size: 10,
        font: regularFont,
      });

      page.drawText(String(capacity), {
        x: 460,
        y,
        size: 10,
        font: regularFont,
      });

      y -= 16;
    }

    // 8️⃣ SAVE PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="classes_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Classes PDF export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
