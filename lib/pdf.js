import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

/**
 * Generate PDF from a title and rows
 * @param {String} title
 * @param {Array} headers - array of header strings
 * @param {Array} rows - array of row arrays
 * @returns {Promise<Uint8Array>} PDF bytes
 */
export async function generatePDF({ title, headers, rows }) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

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
    regularFont = await pdfDoc.embedFont(fs.readFileSync(fontRegularPath));
    boldFont = await pdfDoc.embedFont(fs.readFileSync(fontBoldPath));
  }

  let pdfPage = pdfDoc.addPage([595, 842]);
  const { width } = pdfPage.getSize();
  let y = 800;

  const center = (text, size, font) =>
    width / 2 - font.widthOfTextAtSize(text, size) / 2;

  // Title
  pdfPage.drawText(title, {
    x: center(title, 18, boldFont),
    y,
    size: 18,
    font: boldFont,
  });

  y -= 40;

  // Table header
  headers.forEach((h, i) => {
    const x = 50 + i * 120; // basic spacing
    pdfPage.drawText(h, { x, y, size: 10, font: boldFont });
  });

  y -= 20;

  // Rows
  rows.forEach((row) => {
    if (y < 60) {
      pdfPage = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    row.forEach((cell, i) => {
      const x = 50 + i * 120;
      pdfPage.drawText(cell?.toString() || "-", {
        x,
        y,
        size: 10,
        font: regularFont,
      });
    });

    y -= 20;
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
