// app/ml/[id]/page.tsx
import { notFound } from "next/navigation";
import Student from "@/models/Student";
import StudentFeature from "@/models/StudentFeature";
import { predictFinalExam } from "@/lib/ml/predictFinalExam";
import { getActiveAcademicYear } from "@/lib/getAcademicYear";
import { MainLayout } from "@/components/layout/main-layout";
import PredictionClientWrapper from "./PredictionClientWrapper";
import { calculateStudentFeatures } from "@/lib/ml/calculateStudentFeatures";
import "@/models/Class"; // IMPORTANT

export default async function ScorePredictedPage({ params }) {
  const { id } = await params;
  const academicYear = await getActiveAcademicYear();

  const MAE = 3.58;
  const PASS_MARK = 50;

  const student = await Student.findById(id)
    .select("name rollNumber classId")
    .populate("classId")
    .lean();

  if (!student) return notFound();

  // let featuresDoc = await StudentFeature.findOne({ student: id });
  // if (!featuresDoc) {
  //   featuresDoc = await calculateStudentFeatures(id, academicYear);
  // }

  const featuresDoc = await calculateStudentFeatures(id, academicYear);

  const features = {
    attendance: featuresDoc.attendance || 0,
    midterm: featuresDoc.midterm || 0,
    unit_avg: featuresDoc.unit_avg || 0,
    previous_exam: featuresDoc.previous_exam || 0,
  };

  const predictionData = await predictFinalExam(features);

  // Package data for the Client Component
  const stats = {
    student: {
      name: student.name,
      rollNumber: student.rollNumber,
      id: student._id.toString(),
    },
    features,
    predictedScore: predictionData?.prediction ?? 0,
    contributions: predictionData?.contributions ?? {
      attendance: 0,
      midterm: 0,
      unit_avg: 0,
      previous_exam: 0,
    },
    MAE,
    PASS_MARK,
  };

  console.log(predictionData);

  return (
    <MainLayout>
      <PredictionClientWrapper stats={stats} />
    </MainLayout>
  );
}
