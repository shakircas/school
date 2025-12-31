// import * as XLSX from "xlsx";

// export function downloadStudentTemplate(classes = []) {
//   const sheetData = [
//     {
//       rollNumber: "",
//       registrationNumber: "",
//       name: "",
//       classId: "", // MUST be ObjectId
//       sectionId: "", // A, B, C
//       fatherName: "",
//       phone: "",
//       email: "",
//       gender: "Male",
//       dateOfBirth: "2010-01-01",
//     },
//   ];

//   const worksheet = XLSX.utils.json_to_sheet(sheetData);
//   const workbook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

//   XLSX.writeFile(workbook, "student-import-template.xlsx");
// }
import * as XLSX from "xlsx";

export function downloadStudentTemplate(classes) {
  const headers = [
    [
      "rollNumber",
      "registrationNumber",
      "name",
      "class",
      "section",
      "fatherName",
      "phone",
      "email",
      "gender",
      "dateOfBirth",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(headers);

  /* ===============================
     CLASS DROPDOWN
  =============================== */

  const classNames = classes.map((c) => c.name);

  ws["!dataValidation"] = [
    {
      type: "list",
      allowBlank: false,
      sqref: "D2:D1000", // class column
      formula1: `"${classNames.join(",")}"`,
    },
    {
      type: "list",
      allowBlank: false,
      sqref: "E2:E1000", // section column
      formula1: `"A,B,C,D"`,
    },
    {
      type: "list",
      allowBlank: true,
      sqref: "I2:I1000", // gender
      formula1: `"Male,Female,Other"`,
    },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");

  XLSX.writeFile(wb, "student_import_template.xlsx");
}
