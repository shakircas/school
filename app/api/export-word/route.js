import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from "docx";

/* ---------------------------------------------------
   1. THE "CLEANER": Strips all AI garbage & LaTeX
--------------------------------------------------- */
// function cleanText(text = "") {
//   return (
//     text
//       .replace(/[#\*_]/g, "") // Removes Markdown symbols
//       .replace(/\$+/g, "") // Removes LaTeX $ symbols
//       .replace(/\\left|\\right/g, "")

//       // --- ADDED: MATRICES SUPPORT ---
//       // Matches \begin{matrix} ... \end{matrix} or bmatrix/vmatrix
//       .replace(
//         /\\begin{(?:matrix|bmatrix|vmatrix)}([\s\S]*?)\\end{(?:matrix|bmatrix|vmatrix)}/g,
//         (_, inner) => {
//           const rows = inner.trim().split(/\\\\/);
//           const formattedRows = rows.map(
//             (row) => `[ ${row.replace(/&/g, "  ").trim()} ]`,
//           );
//           return "\n" + formattedRows.join("\n") + "\n";
//         },
//       )

//       // --- ADDED: LOGARITHM SUPPORT ---
//       // Matches \log_{base}{value} or \log(value)
//       .replace(/\\log_?{?([^}]*)}?(\(?[\d\w]*\)?)?/g, (_, base, value) => {
//         const subMaps = {
//           0: "₀",
//           1: "₁",
//           2: "₂",
//           3: "₃",
//           4: "₄",
//           5: "₅",
//           6: "₆",
//           7: "₇",
//           8: "₈",
//           9: "₉",
//           a: "ₐ",
//           b: "♭",
//           x: "ₓ",
//         };
//         const subscriptBase = base
//           .split("")
//           .map((c) => subMaps[c] || c)
//           .join("");
//         return `log${subscriptBase}${value || ""}`;
//       })
//       .replace(/\\ln/g, "ln")
//       // Geometry & Science Symbols
//       .replace(/\\overline{([A-Z]+)}/g, "$1\u0305")
//       .replace(/\\triangle/g, "△")
//       .replace(/\\angle/g, "∠")
//       .replace(/\\pi/g, "π")
//       .replace(/\\sin|\\cos|\\tan|\\sec|\\csc|\\cot|\\theta/g, (m) =>
//         m.replace("\\", ""),
//       ) // Added common trig
//       .replace(/\\degree|\\circ|\^°/g, "°")

//       // Fractions & Algebra
//       .replace(/\\frac{([^}]+)}{([^}]+)}/g, "$1/$2")
//       .replace(/\\sqrt{([^}]+)}/g, "√$1")
//       .replace(/\\times/g, "×")
//       .replace(/\\cdot/g, "·")
//       .replace(/\\pm/g, "±")
//       .replace(/\\neq/g, "≠")
//       .replace(/\\approx/g, "≈")
//       // Superscripts/Subscripts
//       .replace(/\^(\d+|[nxy])/g, (_, exp) => {
//         const maps = {
//           0: "⁰",
//           1: "¹",
//           2: "²",
//           3: "³",
//           4: "⁴",
//           5: "⁵",
//           6: "⁶",
//           7: "⁷",
//           8: "⁸",
//           9: "⁹",
//           n: "ⁿ",
//           x: "ˣ",
//           y: "ʸ",
//         };
//         return exp
//           .split("")
//           .map((c) => maps[c] || c)
//           .join("");
//       })
//       .replace(/_(\d+|[nxy])/g, (_, sub) => {
//         const maps = {
//           0: "₀",
//           1: "₁",
//           2: "₂",
//           3: "₃",
//           4: "₄",
//           5: "₅",
//           6: "₆",
//           7: "₇",
//           8: "₈",
//           9: "₉",
//           n: "ₙ",
//           x: "ₓ",
//           y: "ᵧ",
//         };
//         return sub
//           .split("")
//           .map((c) => maps[c] || c)
//           .join("");
//       })
//       .trim()
//   );
// }

/* ---------------------------------------------------
    1. THE "CLEANER": Strips all AI garbage & LaTeX
--------------------------------------------------- */
function cleanText(text = "") {
  return (
    text
      .replace(/[#\*_]/g, "") // Removes Markdown symbols
      .replace(/\$+/g, "") // Removes LaTeX $ symbols
      .replace(/\\left|\\right/g, "")

      // --- MATRICES SUPPORT (3x3 and larger) ---
      .replace(
        /\\begin{(?:matrix|bmatrix|vmatrix)}([\s\S]*?)\\end{(?:matrix|bmatrix|vmatrix)}/g,
        (_, inner) => {
          const rows = inner.trim().split(/\\\\/);
          const formattedRows = rows.map((row) => {
            const cols = row
              .split("&")
              .map((c) => c.trim())
              .join("\t"); // Using \t for better alignment in Word
            return `[  ${cols}  ]`;
          });
          return "\n" + formattedRows.join("\n") + "\n";
        },
      )
      // --- IMPROVED CHEMISTRY & ARROWS ---
      // Catch LaTeX arrows, plain word "arrow", and common chemistry markers
      .replace(/\\rightarrow|\\to|\sarrow\s/gi, " → ")
      .replace(/\\leftarrow/gi, " ← ")
      .replace(/\\rightleftharpoons/gi, " ⇌ ")
      .replace(/\\uparrow/gi, " ↑ ")
      .replace(/\\downarrow/gi, " ↓ ")
      .replace(/\\Delta/gi, "Δ")

      // Chemistry Subscripts (e.g., H2O -> H₂O, CO2 -> CO₂)
      // This looks for numbers following capital letters (elements)
      .replace(/([A-Z][a-z]?|(?<=\))|(?<=\]))(\d+)/g, (match, element, num) => {
        const subMaps = {
          0: "₀",
          1: "₁",
          2: "₂",
          3: "₃",
          4: "₄",
          5: "₅",
          6: "₆",
          7: "₇",
          8: "₈",
          9: "₉",
        };
        const subscript = num
          .split("")
          .map((n) => subMaps[n] || n)
          .join("");
        return element + subscript;
      })

      // --- LOGARITHM SUPPORT ---
      .replace(/\\log_?{?([^}]*)}?(\(?[\d\w]*\)?)?/g, (_, base, value) => {
        const subMaps = {
          0: "₀",
          1: "₁",
          2: "₂",
          3: "₃",
          4: "₄",
          5: "₅",
          6: "₆",
          7: "₇",
          8: "₈",
          9: "₉",
          a: "ₐ",
          b: "♭",
          x: "ₓ",
          y: "ᵧ",
          n: "ₙ",
        };
        const subscriptBase = base
          .split("")
          .map((c) => subMaps[c] || c)
          .join("");
        return `log${subscriptBase}${value || ""}`;
      })
      .replace(/\\ln/g, "ln")

      // Geometry & Science Symbols
      .replace(/\\overline{([A-Z]+)}/g, "$1\u0305")
      .replace(/\\triangle/g, "△")
      .replace(/\\angle/g, "∠")
      .replace(/\\pi/g, "π")
      .replace(
        /\\sin|\\cos|\\tan|\\sec|\\csc|\\cot|\\theta|\\alpha|\\beta|\\gamma/g,
        (m) => m.replace("\\", ""),
      )
      .replace(/\\degree|\\circ|\^°/g, "°")

      // Fractions & Algebra
      .replace(/\\frac{([^}]+)}{([^}]+)}/g, "$1/$2")
      .replace(/\\sqrt{([^}]+)}/g, "√$1")
      .replace(/\\times/g, "×")
      .replace(/\\cdot/g, "·")
      .replace(/\\pm/g, "±")
      .replace(/\\neq/g, "≠")
      .replace(/\\approx/g, "≈")

      // Superscripts/Subscripts
      .replace(/\^(\d+|[nxy\+\-])/g, (_, exp) => {
        const maps = {
          0: "⁰",
          1: "¹",
          2: "²",
          3: "³",
          4: "⁴",
          5: "⁵",
          6: "⁶",
          7: "⁷",
          8: "⁸",
          9: "⁹",
          n: "ⁿ",
          x: "ˣ",
          y: "ʸ",
          "+": "⁺",
          "-": "⁻",
        };
        return exp
          .split("")
          .map((c) => maps[c] || c)
          .join("");
      })
      .replace(/_(\d+|[nxy])/g, (_, sub) => {
        const maps = {
          0: "₀",
          1: "₁",
          2: "₂",
          3: "₃",
          4: "₄",
          5: "₅",
          6: "₆",
          7: "₇",
          8: "₈",
          9: "₉",
          n: "ₙ",
          x: "ₓ",
          y: "ᵧ",
        };
        return sub
          .split("")
          .map((c) => maps[c] || c)
          .join("");
      })
      .trim()
  );
}

const isUrdu = (text) => /[\u0600-\u06FF]/.test(text);

/* ---------------------------------------------------
   2. THE BUILDER: Board Standards
--------------------------------------------------- */
export async function POST(req) {
  try {
    const {
      content,
      subject,
      class: cls,
      totalMarks,
      duration,
    } = await req.json();
    const children = [];

    // Header Section
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                borders: { bottom: { style: BorderStyle.DOUBLE, size: 6 } },
                children: [
                  new Paragraph({
                    text: "GOVERNMENT HIGH SCHOOL MARDAN",
                    alignment: AlignmentType.CENTER,
                    heading: HeadingLevel.HEADING_1,
                  }),
                  new Paragraph({
                    text: "FINAL TERM EXAMINATION 2024",
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    text: `Subject: ${subject || "Mathematics"}`,
                    bold: true,
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: `Class: ${cls || "10th"}`,
                    alignment: AlignmentType.RIGHT,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    text: `Total Marks: ${totalMarks || "75"}`,
                    bold: true,
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: `Time Allowed: ${duration || "3 Hours"}`,
                    alignment: AlignmentType.RIGHT,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );

    children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // Automated Instruction Box
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: {
                  fill: "F2F2F2",
                  type: ShadingType.SOLID,
                  color: "auto",
                },
                children: [
                  new Paragraph({
                    text: "GENERAL INSTRUCTIONS:",
                    bold: true,
                    spacing: { before: 100, after: 100 },
                  }),
                  new Paragraph({
                    text: "1. Attempt all sections. 2. Scientific calculators are allowed. 3. Draw neat diagrams where necessary.",
                    spacing: { after: 100 },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );

    let mcqBuffer = [];
    const lines = Array.isArray(content) ? content : content.split("\n");

    lines.forEach((line) => {
      const text = line.trim();
      // Skip empty or decorative lines
      if (
        !text ||
        text.match(/^[-\*\#\s]{3,}$/) ||
        text.toLowerCase().includes("here is a sample")
      )
        return;

      const isOption = /^(\([A-D]\)|[A-D][\.\)])/.test(text);
      const isSection =
        text.toUpperCase().includes("SECTION") ||
        text.toUpperCase().startsWith("PART");

      if (isOption) {
        mcqBuffer.push(text);
        if (mcqBuffer.length === 4) {
          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [0, 1].map(
                    (i) =>
                      new TableCell({
                        borders: {
                          top: BorderStyle.NONE,
                          bottom: BorderStyle.NONE,
                          left: BorderStyle.NONE,
                          right: BorderStyle.NONE,
                        },
                        children: [
                          new Paragraph({
                            text: cleanText(mcqBuffer[i]),
                            font: "Cambria Math",
                            size: 22,
                          }),
                        ],
                      }),
                  ),
                }),
                new TableRow({
                  children: [2, 3].map(
                    (i) =>
                      new TableCell({
                        borders: {
                          top: BorderStyle.NONE,
                          bottom: BorderStyle.NONE,
                          left: BorderStyle.NONE,
                          right: BorderStyle.NONE,
                        },
                        children: [
                          new Paragraph({
                            text: cleanText(mcqBuffer[i]),
                            font: "Cambria Math",
                            size: 22,
                          }),
                        ],
                      }),
                  ),
                }),
              ],
            }),
          );
          mcqBuffer = [];
        }
      } else {
        // Flush MCQ buffer if a new question/section starts
        if (mcqBuffer.length > 0) {
          mcqBuffer = [];
        }

        const ur = isUrdu(text);
        children.push(
          new Paragraph({
            alignment: isSection
              ? AlignmentType.CENTER
              : ur
                ? AlignmentType.RIGHT
                : AlignmentType.LEFT,
            bidirectional: ur,
            spacing: { before: isSection ? 400 : 150, after: 150 },
            shading: isSection
              ? { fill: "D9D9D9", type: ShadingType.SOLID, color: "auto" }
              : undefined,
            border: isSection
              ? {
                  top: { style: BorderStyle.SINGLE, size: 4 },
                  bottom: { style: BorderStyle.SINGLE, size: 4 },
                }
              : undefined,
            children: [
              new TextRun({
                text: cleanText(text),
                bold: isSection || /^\d+\./.test(text),
                size: isSection ? 26 : 22,
                font: ur ? "Jameel Noori Nastaleeq" : "Cambria Math",
              }),
            ],
          }),
        );
      }
    });

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Examination_Paper.docx"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Export Error" }, { status: 500 });
  }
}
