import { Badge } from "@/components/ui/badge";

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
];

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

export const getGradeBadge = (percentage) => {
  // Top tier: 80% and above
  if (percentage >= 80) return <Badge className="bg-green-600">A+</Badge>;

  // Standard tiers shifted down
  if (percentage >= 70) return <Badge className="bg-green-500">A</Badge>;
  if (percentage >= 60) return <Badge className="bg-blue-500">B</Badge>;
  if (percentage >= 50)
    return <Badge className="bg-yellow-500 text-white">C</Badge>;
  if (percentage >= 40)
    return <Badge className="bg-orange-500 text-white">D</Badge>;

  // Failing tier
  return <Badge variant="destructive">F</Badge>;
};

export const getGradeColor = (grade) => {
  const colors = {
    "A+": "bg-emerald-100 text-emerald-700 border-emerald-200",
    A: "bg-green-100 text-green-700 border-green-200",
    B: "bg-blue-100 text-blue-700 border-blue-200",
    C: "bg-yellow-100 text-yellow-700 border-yellow-200",
    F: "bg-red-100 text-red-700 border-red-200",
  };
  return colors[grade] || "bg-slate-100 border-slate-200";
};

// export const subjectsKPK = [
//   { value: "urdu", label: "Urdu", code: "URD" },
//   { value: "english", label: "English", code: "ENG" },
//   { value: "mathematics", label: "Mathematics", code: "MATH" },
//   { value: "physics", label: "Physics", code: "PHY" },
//   { value: "chemistry", label: "Chemistry", code: "CHEM" },
//   { value: "biology", label: "Biology", code: "BIO" },
//   { value: "islamiyat", label: "Islamiyat", code: "ISL" },
//   { value: "pak_studies", label: "Pakistan Studies", code: "PAK" },
//   { value: "drawing", label: "Drawing", code: "DRAW" },
//   { value: "computer_science", label: "Computer Science", code: "CS" },
//   { value: "geography", label: "Geography", code: "GEO" },
//   { value: "history", label: "History", code: "HIST" },
//   { value: "Mutala_Quran", label: "Mutala Quran", code: "MQ" },
// ];

export const subjectsKPK = [
  {
    value: "urdu",
    label: "Urdu",
    code: "URD",
    chapters: [
      "Hamd",
      "Naat",
      "Hijrat-e-Nabwi",
      "Nazaria-e-Pakistan",
      "Urdu Adab mein Eid-ul-Fitar",
    ],
  },
  {
    value: "english",
    label: "English",
    code: "ENG",
    chapters: [
      "The Prophet (PBUH) Justice",
      "The Old Man and the Sea",
      "Daffodils",
      "Tolerance of the Holy Prophet",
      "Quaid-a-Azam's Vision",
    ],
  },
  {
    value: "mathematics",
    label: "Mathematics",
    code: "MATH",
    chapters: [
      "Matrices and Determinants",
      "Real and Complex Numbers",
      "Logarithms",
      "Algebraic Expressions",
      "Linear Equations",
    ],
  },
  {
    value: "physics",
    label: "Physics",
    code: "PHY",
    chapters: [
      "Physical Quantities and Measurement",
      "Kinematics",
      "Dynamics",
      "Turning Effect of Forces",
      "Gravitation",
      "Work and Energy",
      "Properties of Matter",
      "Thermal Properties of Matter",
      "Transfer of Heat",
    ],
  },
  {
    value: "chemistry",
    label: "Chemistry",
    code: "CHEM",
    chapters: [
      "Fundamentals of Chemistry",
      "Structure of Atoms",
      "Periodic Table & Periodicity",
      "Structure of Molecules",
      "Physical States of Matter",
      "Solutions",
      "Electrochemistry",
      "Chemical Reactivity",
    ],
  },
  {
    value: "biology",
    label: "Biology",
    code: "BIO",
    chapters: [
      "Introduction to Biology",
      "Solving a Biological Problem",
      "Biodiversity",
      "Cells and Tissues",
      "Cell Cycle",
      "Enzymes",
      "Bioenergetics",
    ],
  },
  {
    value: "islamiyat",
    label: "Islamiyat",
    code: "ISL",
    chapters: [
      "Surah Al-Anfal",
      "Ahadith",
      "Aqeda-e-Tawheed",
      "Namaz-e-Janaza",
      "Zakat",
    ],
  },
  {
    value: "pak_studies",
    label: "Pakistan Studies",
    code: "PAK",
    chapters: [
      "Ideological Basis of Pakistan",
      "Making of Pakistan",
      "Land and Environment",
      "History of Pakistan (Part 1)",
    ],
  },
  {
    value: "computer_science",
    label: "Computer Science",
    code: "CS",
    chapters: [
      "Problem Solving",
      "Data Types",
      "Input/Output Statements",
      "Control Structures",
      "Computer Logic and Gates",
    ],
  },
  {
    value: "Mutala_Quran",
    label: "Mutala Quran",
    code: "MQ",
    chapters: [
      "Surah Al-Baqarah (Introduction)",
      "Surah Al-Imran (Verses 1-20)",
      "Ethics in Quran",
    ],
  },
];


export const languages = [
  { value: "Urdu", label: "Urdu", code: "URD" },
  { value: "English", label: "English", code: "ENG" },
]