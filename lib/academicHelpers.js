import Result from "@/models/Result";

export async function getStudentAcademicStats(
  studentId,
  academicYear
) {
  const results = await Result.find({
    student: studentId,
    academicYear,
    published: true,
  })
    .populate("exam")
    .sort({ createdAt: 1 });

  if (!results.length) {
    return {
      average: 0,
      trend: 50,
      results,
    };
  }

  const average =
    results.reduce((acc, r) => acc + r.percentage, 0) /
    results.length;

  // Trend calculation
  let trend = 50;

  if (results.length >= 2) {
    const first = results[0].percentage;
    const last = results[results.length - 1].percentage;
    const diff = last - first;

    if (diff > 5) trend = 100;
    else if (diff < -5) trend = 30;
    else trend = 60;
  }

  return {
    average,
    trend,
    results,
  };
}
