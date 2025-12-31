export function normalizeStudentRow(raw) {
  const errors = [];

  const row = {
    name: raw.Name?.toString().trim(),
    rollNumber: raw["Roll Number"]?.toString().trim(),
    registrationNumber: raw["Registration Number"]?.toString().trim(),
    fatherName: raw["Father Name"]?.toString().trim(),
    email: raw.Email?.toString().trim(),
    phone: raw.Phone?.toString().trim(),
    admissionClass: raw.Class?.toString().trim(),
    sectionId: raw.Section?.toString().trim(),
    gender: raw.Gender || "Male",
    dateOfBirth: raw["Date Of Birth"]
      ? new Date(raw["Date Of Birth"])
      : new Date("2010-01-01"),
  };

  // REQUIRED FIELD CHECKS
  if (!row.name) errors.push("Name missing");
  if (!row.rollNumber) errors.push("Roll Number missing");
  if (!row.registrationNumber) errors.push("Registration Number missing");
  if (!row.fatherName) errors.push("Father Name missing");
  if (!row.admissionClass) errors.push("Class missing");
  if (!row.sectionId) errors.push("Section missing");

  return { row, errors };
}
