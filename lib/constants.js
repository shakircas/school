export const KP_DESIGNATIONS = [
  "CT (Certified Teacher)",
  "AT (Arabic Teacher)",
  "DM (Drawing Master)",
  "PET (Physical Education Teacher)",

  "SST (General)",
  "SST (Biology)",
  "SST (Physics)",
  "SST (Chemistry)",
  "SST (Mathematics)",
  "SST (English)",
  "SST (Urdu)",
  "SST (Islamiyat)",
  "SST (Computer Science)",

  "Head Teacher (HT)",
  "Head Master (HM)",
  "Principal",
  "Vice Principal",
];

export const ACADEMIC_QUALIFICATIONS = [
  "Matric",
  "Intermediate",
  "BA",
  "BSc",
  "BS",
  "MA",
  "MSc",
  "B.Ed",
  "M.Ed",
  "MPhil",
  "PhD",
];

export function getMonthName(number) {
    if (number == 1) {
      return "January";
    }
    if (number == 2) {
      return "February";
    }
    if (number == 3) {
      return "March";
    }
    if (number == 4) {
      return "April";
    }
    if (number == 5) {
      return "May";
    }
    if (number == 6) {
      return "June";
    }
    if (number == 7) {
      return "July";
    }
    if (number == 8) {
      return "August";
    }
    if (number == 9) {
      return "September";
    }
    if (number == 10) {
      return "October";
    }
    if (number == 11) {
      return "November";
    }
    if (number == 12) {
      return "December";
    }
    return "Invalid month number";
  }

  export const academicYears = [
    "2022-2023",
    "2023-2024",
    "2024-2025",
    "2025-2026",
    "2026-2027",
    "2027-2028",
    "2028-2029",
    "2029-2030",
    "2030-2031",
  ]

  export const PROFESSIONAL_QUALIFICATIONS = [
    "PTC", // Primary Teaching Certificate
    "CT", // Certificate of Teaching
    "AT", // Arabic Teaching
    "DM", // Drawing Master
    "TT", // Theology Teacher
    "B.Ed",
    "ADE", // Associate Degree in Education
    "M.Ed",
    "Special Education Diploma",
  ];

  export const KP_DEPARTMENTS = [
    "Primary Education",
    "Elementary Education",
    "Secondary Education",
    "Higher Secondary Education",
    "Computer Science",
    "Physical Education",
    "Special Education",
  ];