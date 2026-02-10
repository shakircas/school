import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";

export const exportToWord = async (paper) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // --- BOARD HEADER TABLE ---
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 3,
                  borders: { bottom: { style: BorderStyle.DOUBLE, size: 3 } },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "GOVERNMENT HIGH SCHOOL MARDAN", bold: true, size: 28 }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: `${paper.title.toUpperCase()} - SESSION 2026`, bold: true, size: 20 }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(`Class: ${paper.class}`)] }),
                new TableCell({ children: [new Paragraph(`Subject: ${paper.subject}`)] }),
                new TableCell({ children: [new Paragraph(`Time: ${paper.duration}`)] }),
              ],
            }),
          ],
        }),

        new Paragraph({ text: "", spacing: { after: 200 } }),

        // --- CONTENT ---
        // Note: For a production app, use a markdown-to-docx parser. 
        // For now, we split by lines to preserve basic structure.
        ...paper.content.split("\n").map((line) => {
          const isHeading = line.startsWith("#") || line.includes("SECTION");
          return new Paragraph({
            heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
            children: [
              new TextRun({
                text: line.replace(/#/g, "").trim(),
                bold: isHeading,
                size: isHeading ? 24 : 22,
              }),
            ],
            spacing: { before: 120, after: 120 },
          });
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${paper.subject}_Class${paper.class}_${paper.title}.docx`);
};