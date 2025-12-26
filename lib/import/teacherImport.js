import * as XLSX from "xlsx";

export const parseTeacherFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  return rows.map((row) => ({
    name: row["Name"]?.trim(),
    email: row["Email"]?.toLowerCase(),
    phone: row["Phone"],
    nic: row["NIC"],
    personalNo: row["Personal No"],
    gender: row["Gender"],
    designation: row["Designation"],
    qualification: row["Qualification"],
    professionalQualification: row["Professional Qualification"]
      ? row["Professional Qualification"].split(",").map((s) => s.trim())
      : [],
    specialization: row["Specialization"] || "",
    experience: Number(row["Experience (Years)"]) || 0,
    subjects: row["Subjects"]
      ? row["Subjects"].split(",").map((s) => s.trim())
      : [],
    joiningDate: row["Joining Date"]
      ? new Date(row["Joining Date"])
      : new Date(),
    status: row["Status"] || "Active",
  }));
};
