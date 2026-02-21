/**
 * Calculates a unified student risk score.
 * @param {number} attendance - Percentage (0-100)
 * @param {number} academic - Average percentage (0-100)
 * @param {number} trend - Score (20: Dropping, 60: Stable, 100: Improving)
 */
export function calculateRisk({ attendance, academic, trend }) {
  // 1. Convert Performance to Risk (Inverse)
  // Higher performance = Lower risk
  const attendanceRisk = 100 - attendance;
  const academicRisk = 100 - academic;

  // Trend is already risk-mapped: 20 (Improving) -> 100 (Dropping)
  // We flip your trend score to match: 100 (Improving) becomes 0 Risk
  const trendRisk = 100 - trend;

  // 2. Apply Weights
  // We prioritize Academic (50%), then Attendance (30%), then Trend (20%)
  let finalScore = attendanceRisk * 0.3 + academicRisk * 0.5 + trendRisk * 0.2;

  // 3. Critical Failure "Short-circuits"
  // If attendance is below 40% or academics below 30%, force High Risk
  const isCriticallyLowAttendance = attendance < 40;
  const isCriticallyLowAcademic = academic < 35;

  if (isCriticallyLowAttendance || isCriticallyLowAcademic) {
    finalScore = Math.max(finalScore, 85); // Force into High Risk territory
  }

  // 4. Determine Level based on RISK (0 = Safe, 100 = Critical)
  let level = "Low";
  if (finalScore >= 70) {
    level = "High";
  } else if (finalScore >= 40) {
    level = "Medium";
  }

  return {
    score: Math.round(finalScore),
    level,
  };
}
