import { calculateStudentFeatures } from "../ml/calculateStudentFeatures";

export async function updateFeaturesFromAttendance(doc) {
  const academicYear = doc.academicYear;

  const studentIds = doc.records.map((r) => r.personId);

  for (const studentId of studentIds) {
    await calculateStudentFeatures(studentId, academicYear);
  }
}
