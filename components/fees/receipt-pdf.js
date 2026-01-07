import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";


export async function generateReceiptPDF({
  schoolName,
  studentName,
  rollNo,
  className,
  receiptNo,
  date,
  paymentMethod,
  amount,
  collectedBy,
}) {
  const doc = new jsPDF();

  /* ================= HEADER ================= */

  doc.setFontSize(16);
  doc.text(schoolName, 105, 15, { align: "center" });

  doc.setFontSize(10);
  doc.text("Fee Payment Receipt", 105, 22, { align: "center" });

  doc.line(15, 25, 195, 25);

  /* ================= META ================= */

  doc.setFontSize(10);
  doc.text(`Receipt No: ${receiptNo}`, 15, 32);
  doc.text(`Date: ${date}`, 150, 32);

  doc.text(`Student: ${studentName}`, 15, 40);
  doc.text(`Roll No: ${rollNo}`, 15, 46);
  doc.text(`Class: ${className}`, 15, 52);

  /* ================= TABLE ================= */

  autoTable(doc, {
    startY: 60,
    head: [["Description", "Amount (Rs.)"]],
    body: [["Fee Payment", amount.toLocaleString()]],
    styles: { halign: "right" },
    headStyles: { halign: "center" },
  });

  /* ================= FOOTER ================= */

  doc.text(
    `Payment Method: ${paymentMethod}`,
    15,
    doc.lastAutoTable.finalY + 10
  );
  doc.text(
    `Collected By: ${collectedBy || "-"}`,
    15,
    doc.lastAutoTable.finalY + 16
  );

  doc.line(15, 270, 195, 270);
  doc.text("This is a computer generated receipt", 105, 278, {
    align: "center",
  });

 /* ================= QR CODE ================= */

  const verifyUrl = `${window.location.origin}/verify-receipt/${receiptNo}`;

  const qrDataUrl = await QRCode.toDataURL(verifyUrl);

  doc.addImage(qrDataUrl, "PNG", 150, 230, 35, 35);

  doc.setFontSize(8);
  doc.text("Scan to verify receipt", 152, 270);

  doc.save(`Receipt-${receiptNo}.pdf`);
}