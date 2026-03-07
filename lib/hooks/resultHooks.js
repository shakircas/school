import { calculateStudentFeatures } from "../ml/calculateStudentFeatures";

export async function updateFeaturesFromResult(doc) {
  const studentId = doc.student;

  const exam = await doc.populate("exam");

  const academicYear = exam.exam.academicYear;

  await calculateStudentFeatures(studentId, academicYear);
}
