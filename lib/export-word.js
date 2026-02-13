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
  Math,
  MathRun,
  MathSuperScript,
  MathSubScript,
} from "docx";
import { saveAs } from "file-saver";

// --------------------------------------
// SAFE MATH BUILDER (NO CORRUPTION)
// --------------------------------------
const createMathParagraph = (line, isUrdu) => {
  const tokens = line.split(" ");

  const mathElements = [];

  tokens.forEach((token) => {
    // Superscript (x^2)
    if (token.includes("^")) {
      const [base, power] = token.split("^");

      mathElements.push(
        new MathSuperScript({
          base: new MathRun(base),
          superScript: new MathRun(power),
        }),
      );
    }

    // Subscript (H_2)
    else if (token.includes("_")) {
      const [base, sub] = token.split("_");

      mathElements.push(
        new MathSubScript({
          base: new MathRun(base),
          subScript: new MathRun(sub),
        }),
      );
    }

    // Chemistry Arrow
    else if (token === "->") {
      mathElements.push(new MathRun("→"));
    }

    // Normal math text
    else {
      mathElements.push(new MathRun(token));
    }

    // Add space between tokens
    mathElements.push(new MathRun(" "));
  });

  return new Paragraph({
    alignment: isUrdu ? AlignmentType.RIGHT : AlignmentType.LEFT,
    bidirectional: isUrdu,
    children: [
      new Math({
        children: mathElements,
      }),
    ],
  });
};

export const exportToWord = async (paper) => {
  if (!paper || !paper.content) return;

  const isUrdu = paper.language === "Urdu";
  console.log(paper);
  // ----------------------------
  // SAFE CONTENT PARSING
  // ----------------------------
  const parsedContent = paper.content
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const contentParagraphs = parsedContent.map((line) => {
    const isHeading =
      line.startsWith("#") ||
      line.toUpperCase().includes("SECTION") ||
      line.includes("حصہ");

    const hasMath = /[\^_+=→-]/.test(line);

    // If contains math symbols → render as equation
    if (hasMath) {
      return createMathParagraph(line, isUrdu);
    }

    return new Paragraph({
      alignment: isUrdu ? AlignmentType.RIGHT : AlignmentType.LEFT,
      bidirectional: isUrdu,
      heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
      spacing: { before: 150, after: 150 },
      children: [
        new TextRun({
          text: line.replace(/[#*]/g, ""),
          bold: isHeading,
          size: isHeading ? 28 : 22,
        }),
      ],
    });
  });

  // ----------------------------
  // HEADER TABLE
  // ----------------------------
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 3,
            borders: {
              bottom: { style: BorderStyle.DOUBLE, size: 4 },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "GOVERNMENT HIGH SCHOOL MARDAN",
                    bold: true,
                    size: 30,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${paper.title} - SESSION 2026`,
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(`Class: ${paper.class}`)],
          }),
          new TableCell({
            children: [new Paragraph(`Subject: ${paper.subject}`)],
          }),
          new TableCell({
            children: [new Paragraph(`Time: ${paper.duration}`)],
          }),
        ],
      }),
    ],
  });

  // ----------------------------
  // CREATE DOCUMENT
  // ----------------------------
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          headerTable,
          new Paragraph({ text: "" }),
          ...contentParagraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${paper.subject}_${paper.class}_${paper.language}.docx`);
};
