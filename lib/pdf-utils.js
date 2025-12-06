import { jsPDF } from "jspdf"
import "jspdf-autotable"

export function generatePDF(options) {
  const { title, subtitle, headers, data, filename, orientation = "portrait", footer } = options

  const doc = new jsPDF(orientation)
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(title, pageWidth / 2, 20, { align: "center" })

  // Subtitle
  if (subtitle) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(subtitle, pageWidth / 2, 30, { align: "center" })
  }

  // Table
  doc.autoTable({
    head: [headers],
    body: data,
    startY: subtitle ? 40 : 30,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Footer
  if (footer) {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(footer, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" })
    }
  }

  doc.save(`${filename}.pdf`)
  return doc
}

export function generateDMC(studentData, results) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("DETAILED MARKS CERTIFICATE", pageWidth / 2, 25, { align: "center" })

  // School info
  doc.setFontSize(14)
  doc.text("EduManage Pro School", pageWidth / 2, 35, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Academic Year 2024-2025", pageWidth / 2, 42, { align: "center" })

  // Line separator
  doc.setLineWidth(0.5)
  doc.line(20, 48, pageWidth - 20, 48)

  // Student details
  doc.setFontSize(11)
  let y = 58
  const leftCol = 25
  const rightCol = pageWidth / 2 + 10

  doc.setFont("helvetica", "bold")
  doc.text("Student Details:", leftCol, y)
  y += 10

  doc.setFont("helvetica", "normal")
  doc.text(`Name: ${studentData.name}`, leftCol, y)
  doc.text(`Roll No: ${studentData.rollNumber}`, rightCol, y)
  y += 7
  doc.text(`Class: ${studentData.class}`, leftCol, y)
  doc.text(`Section: ${studentData.section}`, rightCol, y)
  y += 7
  doc.text(`Father's Name: ${studentData.fatherName}`, leftCol, y)
  doc.text(`Date of Birth: ${studentData.dateOfBirth}`, rightCol, y)

  // Results table
  y += 15
  const tableData = results.map((r, index) => [index + 1, r.subject, r.totalMarks, r.obtainedMarks, r.grade, r.remarks])

  doc.autoTable({
    head: [["S.No", "Subject", "Total Marks", "Obtained", "Grade", "Remarks"]],
    body: tableData,
    startY: y,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Summary
  const totalObtained = results.reduce((sum, r) => sum + r.obtainedMarks, 0)
  const totalMax = results.reduce((sum, r) => sum + r.totalMarks, 0)
  const percentage = ((totalObtained / totalMax) * 100).toFixed(2)

  const finalY = doc.lastAutoTable.finalY + 15
  doc.setFont("helvetica", "bold")
  doc.text(`Total Marks: ${totalObtained}/${totalMax}`, leftCol, finalY)
  doc.text(`Percentage: ${percentage}%`, rightCol, finalY)

  // Result
  const result = percentage >= 33 ? "PASSED" : "FAILED"
  doc.setFontSize(14)
  doc.text(`Result: ${result}`, pageWidth / 2, finalY + 15, { align: "center" })

  // Signatures
  const sigY = doc.internal.pageSize.getHeight() - 40
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("_________________", 30, sigY)
  doc.text("Class Teacher", 35, sigY + 7)

  doc.text("_________________", pageWidth / 2 - 20, sigY)
  doc.text("Principal", pageWidth / 2 - 10, sigY + 7)

  doc.text("_________________", pageWidth - 60, sigY)
  doc.text("Exam Controller", pageWidth - 55, sigY + 7)

  return doc
}

export function generateRollNumberSlip(studentData, examData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("ROLL NUMBER SLIP", pageWidth / 2, 25, { align: "center" })

  doc.setFontSize(14)
  doc.text("EduManage Pro School", pageWidth / 2, 35, { align: "center" })

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`${examData.name}`, pageWidth / 2, 45, { align: "center" })

  // Line
  doc.setLineWidth(0.5)
  doc.line(20, 52, pageWidth - 20, 52)

  // Photo placeholder
  doc.rect(pageWidth - 55, 60, 35, 40)
  doc.setFontSize(8)
  doc.text("Photo", pageWidth - 42, 82)

  // Student info
  let y = 65
  const leftCol = 25

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(`Roll Number: ${studentData.rollNumber}`, leftCol, y)
  y += 10

  doc.setFont("helvetica", "normal")
  doc.text(`Name: ${studentData.name}`, leftCol, y)
  y += 8
  doc.text(`Father's Name: ${studentData.fatherName}`, leftCol, y)
  y += 8
  doc.text(`Class: ${studentData.class} - ${studentData.section}`, leftCol, y)
  y += 8
  doc.text(`Date of Birth: ${studentData.dateOfBirth}`, leftCol, y)

  // Exam schedule
  y = 115
  doc.setFont("helvetica", "bold")
  doc.text("Examination Schedule:", leftCol, y)
  y += 10

  const scheduleData = examData.schedule.map((s, i) => [i + 1, s.subject, s.date, s.time, s.venue])

  doc.autoTable({
    head: [["S.No", "Subject", "Date", "Time", "Venue"]],
    body: scheduleData,
    startY: y,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Instructions
  const instrY = doc.lastAutoTable.finalY + 15
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Instructions:", leftCol, instrY)

  doc.setFont("helvetica", "normal")
  const instructions = [
    "1. Bring this slip to every examination.",
    "2. No electronic devices allowed in examination hall.",
    "3. Report 30 minutes before the exam.",
    "4. Carry your school ID card.",
  ]

  instructions.forEach((inst, i) => {
    doc.text(inst, leftCol, instrY + 8 + i * 6)
  })

  // Signature
  const sigY = doc.internal.pageSize.getHeight() - 30
  doc.text("_________________", pageWidth - 60, sigY)
  doc.text("Principal Signature", pageWidth - 60, sigY + 7)

  return doc
}
