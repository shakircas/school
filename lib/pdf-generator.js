// import { jsPDF } from "jspdf"
// import "jspdf-autotable"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// School info constant
const SCHOOL_INFO = {
  name: "EduManage Pro School",
  address: "123 Education Street, Knowledge City",
  phone: "+92 300 1234567",
  email: "info@edumanagepro.com",
  website: "www.edumanagepro.com",
};

// Helper to add header to all PDFs
function addHeader(doc, title, subtitle = "") {
  const pageWidth = doc.internal.pageSize.getWidth();

  // School name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246); // Primary blue
  doc.text(SCHOOL_INFO.name, pageWidth / 2, 20, { align: "center" });

  // Address and contact
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(SCHOOL_INFO.address, pageWidth / 2, 27, { align: "center" });
  doc.text(
    `Phone: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`,
    pageWidth / 2,
    32,
    { align: "center" }
  );

  // Line separator
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(15, 36, pageWidth - 15, 36);

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(title, pageWidth / 2, 45, { align: "center" });

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(subtitle, pageWidth / 2, 52, { align: "center" });
    return 58;
  }

  return 52;
}

// Helper to add footer
function addFooter(doc, showPageNumbers = true) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    // Generated date
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-US", {
        dateStyle: "long",
      })}`,
      15,
      pageHeight - 10
    );

    // Page numbers
    if (showPageNumbers && pageCount > 1) {
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 10, {
        align: "right",
      });
    }

    // Website
    doc.text(SCHOOL_INFO.website, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }
}

// Generate Student List PDF
export function generateStudentListPDF(students, options = {}) {
  const doc = new jsPDF("landscape");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const tableWidth = pageWidth - margin * 2;

  const startY = addHeader(
    doc,
    "Student List",
    options.subtitle || `Total Students: ${students.length}`
  );

  autoTable(doc, {
    head: [
      ["Roll No", "Name", "Class", "Section", "Father Name", "Phone", "Status"],
    ],

    body: students.map((s) => [
      s.rollNumber || "-",
      s.name || "-",
      s.classId?.name || "-",
      s.sectionId || "-",
      s.fatherName || "-",
      s.phone || s.fatherPhone || "-",
      s.status || "Active",
    ]),

    startY,
    margin: { left: margin, right: margin },
    tableWidth, // 🔥 critical fix

    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: "middle",
      overflow: "linebreak",
    },

    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },

    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },

    columnStyles: {
      0: { cellWidth: 25, halign: "center" }, // Roll
      1: { cellWidth: 45, halign: "left" }, // Name
      2: { cellWidth: 30, halign: "center" }, // Class
      3: { cellWidth: 25, halign: "center" }, // Section
      4: { cellWidth: 45, halign: "left" }, // Father
      5: { cellWidth: 30, halign: "center" }, // Phone
      6: { cellWidth: 30, halign: "center" }, // Status
    },
  });

  addFooter(doc);
  return doc;
}


// Generate Teacher List PDF
export function generateTeacherListPDF(teachers, options = {}) {
  const doc = new jsPDF(options.orientation || "landscape");
  const startY = addHeader(
    doc,
    "Teacher List",
    options.subtitle || `Total Teachers: ${teachers.length}`
  );

  const headers = [
    "ID",
    "Name",
    "Designation",
    "Department",
    "Phone",
    "Email",
    "Status",
  ];
  const data = teachers.map((t) => [
    t.employeeId,
    t.name,
    t.designation,
    t.department,
    t.phone || "-",
    t.email || "-",
    t.status,
  ]);

  doc.autoTable({
    head: [headers],
    body: data,
    startY,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [245, 250, 247],
    },
  });

  addFooter(doc);
  return doc;
}

// Generate DMC (Detailed Marks Certificate)
export function generateDMCPDF(student, results, examName) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Decorative border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, doc.internal.pageSize.getHeight() - 24);

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text(SCHOOL_INFO.name, pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(SCHOOL_INFO.address, pageWidth / 2, 38, { align: "center" });

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("DETAILED MARKS CERTIFICATE", pageWidth / 2, 52, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(examName || "Annual Examination 2024", pageWidth / 2, 60, {
    align: "center",
  });

  // Student photo placeholder
  doc.setDrawColor(150);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(pageWidth - 50, 70, 35, 42, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Photo", pageWidth - 32.5, 93, { align: "center" });

  // Student details
  let y = 75;
  const leftCol = 20;
  const valueCol = 60;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  const details = [
    ["Roll Number:", student.rollNumber],
    ["Student Name:", student.name],
    ["Father Name:", student.fatherName],
    ["Class & Section:", `${student.class} - ${student.section}`],
    [
      "Date of Birth:",
      student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString()
        : "-",
    ],
  ];

  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftCol, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", valueCol, y);
    y += 8;
  });

  // Results table
  y += 10;
  const tableData = results.map((r, i) => [
    i + 1,
    r.subject,
    r.totalMarks,
    r.obtainedMarks,
    ((r.obtainedMarks / r.totalMarks) * 100).toFixed(1) + "%",
    r.grade || getGrade(r.obtainedMarks, r.totalMarks),
    r.remarks || "-",
  ]);

  doc.autoTable({
    head: [
      ["#", "Subject", "Total", "Obtained", "Percentage", "Grade", "Remarks"],
    ],
    body: tableData,
    startY: y,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "center", cellWidth: 22 },
      4: { halign: "center", cellWidth: 25 },
      5: { halign: "center", cellWidth: 18 },
    },
    margin: { left: 20, right: 20 },
  });

  // Summary
  const totalObtained = results.reduce(
    (sum, r) => sum + (r.obtainedMarks || 0),
    0
  );
  const totalMax = results.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
  const percentage =
    totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;
  const overallGrade = getGrade(totalObtained, totalMax);
  const result = percentage >= 33 ? "PASSED" : "FAILED";

  const summaryY = doc.lastAutoTable.finalY + 15;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, summaryY - 5, pageWidth - 40, 35, 3, 3, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`Total Marks: ${totalObtained} / ${totalMax}`, 30, summaryY + 5);
  doc.text(`Percentage: ${percentage}%`, 30, summaryY + 15);
  doc.text(`Grade: ${overallGrade}`, pageWidth / 2, summaryY + 5);

  doc.setFontSize(14);
  doc.setTextColor(result === "PASSED" ? [16, 185, 129] : [239, 68, 68]);
  doc.text(`Result: ${result}`, pageWidth / 2, summaryY + 20);

  // Signatures
  const sigY = doc.internal.pageSize.getHeight() - 45;
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");

  doc.line(25, sigY, 65, sigY);
  doc.text("Class Teacher", 35, sigY + 8);

  doc.line(pageWidth / 2 - 20, sigY, pageWidth / 2 + 20, sigY);
  doc.text("Exam Controller", pageWidth / 2 - 5, sigY + 8);

  doc.line(pageWidth - 65, sigY, pageWidth - 25, sigY);
  doc.text("Principal", pageWidth - 50, sigY + 8);

  return doc;
}

// Generate Roll Number Slip
export function generateRollNumberSlipPDF(student, exam) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pageWidth - 20, 140);

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text(SCHOOL_INFO.name, pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text("ROLL NUMBER SLIP", pageWidth / 2, 38, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(exam.name || "Annual Examination 2024", pageWidth / 2, 46, {
    align: "center",
  });

  // Photo box
  doc.setDrawColor(150);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(pageWidth - 50, 55, 35, 42, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Paste Photo", pageWidth - 32.5, 78, { align: "center" });

  // Student details
  let y = 60;
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const fields = [
    ["Roll Number:", student.rollNumber],
    ["Name:", student.name],
    ["Father's Name:", student.fatherName],
    ["Class:", `${student.class} - ${student.section}`],
  ];

  fields.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", 60, y);
    y += 10;
  });

  // Exam schedule
  if (exam.schedule && exam.schedule.length) {
    y += 5;
    doc.autoTable({
      head: [["Date", "Subject", "Time"]],
      body: exam.schedule.map((s) => [s.date, s.subject, s.time]),
      startY: y,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });
  }

  // Instructions
  const instrY = 125;
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "Instructions: Bring this slip daily. No electronic devices allowed.",
    20,
    instrY
  );

  // Signature
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.line(pageWidth - 60, 140, pageWidth - 20, 140);
  doc.text("Principal", pageWidth - 45, 147);

  return doc;
}

// Generate Admission List
export function generateAdmissionListPDF(admissions, options = {}) {
  const doc = new jsPDF("landscape");
  const startY = addHeader(
    doc,
    "Admission List",
    options.subtitle || `Academic Year 2024-25`
  );

  const headers = [
    "S.No",
    "Reg. No",
    "Name",
    "Father Name",
    "Class",
    "Section",
    "Admission Date",
    "Previous School",
  ];
  const data = admissions.map((a, i) => [
    i + 1,
    a.registrationNumber,
    a.name,
    a.fatherName,
    a.class,
    a.section,
    a.admissionDate ? new Date(a.admissionDate).toLocaleDateString() : "-",
    a.previousSchool || "-",
  ]);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  addFooter(doc);
  return doc;
}

// Generate Fee Report
export function generateFeeReportPDF(feeData, options = {}) {
  const doc = new jsPDF();
  const startY = addHeader(
    doc,
    "Fee Collection Report",
    options.subtitle || options.period || "Monthly Report"
  );

  const headers = [
    "Roll No",
    "Name",
    "Class",
    "Total Fee",
    "Paid",
    "Pending",
    "Status",
  ];
  const data = feeData.map((f) => [
    f.rollNumber,
    f.studentName,
    f.class,
    `Rs. ${f.totalFee?.toLocaleString()}`,
    `Rs. ${f.paidAmount?.toLocaleString()}`,
    `Rs. ${f.pendingAmount?.toLocaleString()}`,
    f.status,
  ]);

  doc.autoTable({
    head: [headers],
    body: data,
    startY,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      6: {
        cellWidth: 25,
        fontStyle: "bold",
      },
    },
    didParseCell: (data) => {
      if (data.column.index === 6 && data.section === "body") {
        if (data.cell.raw === "Paid") {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (data.cell.raw === "Pending") {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  // Summary
  const summaryY = doc.lastAutoTable.finalY + 15;
  const totalCollected = feeData.reduce(
    (sum, f) => sum + (f.paidAmount || 0),
    0
  );
  const totalPending = feeData.reduce(
    (sum, f) => sum + (f.pendingAmount || 0),
    0
  );

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(
    15,
    summaryY,
    doc.internal.pageSize.getWidth() - 30,
    25,
    3,
    3,
    "F"
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total Collected: Rs. ${totalCollected.toLocaleString()}`,
    25,
    summaryY + 10
  );
  doc.text(
    `Total Pending: Rs. ${totalPending.toLocaleString()}`,
    25,
    summaryY + 20
  );

  addFooter(doc);
  return doc;
}

// Helper function for grade calculation
function getGrade(obtained, total) {
  const percentage = (obtained / total) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 33) return "E";
  return "F";
}

// Export all generators
export const PDFGenerator = {
  studentList: generateStudentListPDF,
  teacherList: generateTeacherListPDF,
  dmc: generateDMCPDF,
  rollSlip: generateRollNumberSlipPDF,
  admissionList: generateAdmissionListPDF,
  feeReport: generateFeeReportPDF,
};
