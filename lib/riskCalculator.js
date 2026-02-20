// export function calculateRisk(attendance, academic, trend) {
//   const score = attendance * 0.3 + academic * 0.5 + trend * 0.2;

//   let level = "LOW";

//   if (score < 50) level = "HIGH";
//   else if (score < 70) level = "MEDIUM";

//   return { score, level };
// }

export function calculateRisk({ attendance, academic, trend }) {
  const score = attendance * 0.3 + academic * 0.5 + trend * 0.2;

  let level = "LOW";

  if (score < 50) level = "HIGH";
  else if (score < 70) level = "MEDIUM";

  return { score, level };
}
