// app/api/academics/classes/export/pdf/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = Number(searchParams.get("limit")) || 1000;
    const page = Number(searchParams.get("page")) || 1;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { academicYear: { $regex: search, $options: "i" } },
      ];
    }

    const classes = await Class.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const pdfDoc = await PDFDocument.create();

    // attempt to embed Roboto if present
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
        console.warn("Failed to embed Roboto, using standard fonts", e);
      }
    }

    const page1 = pdfDoc.addPage([595, 842]);
    const { width, height } = page1.getSize();
    let y = height - 50;

    const drawText = (txt, x, font, size = 10) => {
      page1.drawText(txt, { x, y, size, font });
    };

    // Title
    const title = "Classes Export";
    page1.drawText(title, {
      x: width / 2 - boldFont.widthOfTextAtSize(title, 16) / 2,
      y,
      size: 16,
      font: boldFont,
    });
    y -= 24;

    // table header
    drawText("Class", 50, boldFont, 11);
    drawText("Year", 220, boldFont, 11);
    drawText("Sections", 300, boldFont, 11);
    drawText("Capacity", 460, boldFont, 11);
    y -= 18;

    classes.forEach((c) => {
      if (y < 80) {
        // next page1
        page1 = pdfDoc.addPage([595, 842]);
        y = 780;
      }
      const sections = (c.sections || []).map((s) => s.name).join(", ");
      const capacity = (c.sections || []).reduce(
        (a, b) => a + (b.capacity || 0),
        0
      );
      page1.drawText(c.name || "-", { x: 50, y, size: 10, font: regularFont });
      page1.drawText(c.academicYear || "-", {
        x: 220,
        y,
        size: 10,
        font: regularFont,
      });
      page1.drawText(sections || "-", {
        x: 300,
        y,
        size: 10,
        font: regularFont,
      });
      page1.drawText(String(capacity), {
        x: 460,
        y,
        size: 10,
        font: regularFont,
      });
      y -= 16;
    });

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
    console.error("classes pdf export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
