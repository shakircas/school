import * as XLSX from "xlsx";

export function exportToExcel(rows, fileName = "corrected_students.xlsx") {
  // Remove internal fields
//   const cleanRows = rows.map(({ __error, ...rest }) => rest);
const cleanRows = rows.map((r) => ({
  RollNumber: r.rollNumber,
  Name: r.name,
  Class: r.class,
  Section: r.section,
}));


  const worksheet = XLSX.utils.json_to_sheet(cleanRows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  XLSX.writeFile(workbook, fileName);
}
