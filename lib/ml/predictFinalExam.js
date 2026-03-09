// export async function predictFinalExam(studentData) {
//   try {
//     const response = await fetch("http://127.0.0.1:8000/predict", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         attendance: studentData.attendance,
//         midterm: studentData.midterm,
//         unit_avg: studentData.unit_avg, // Fixed mapping
//         previous_exam: studentData.previous_exam, // Fixed mapping
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Backend responded with status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.predicted_final_exam;
//   } catch (error) {
//     console.error("Prediction API Error:", error);
//     return null; // Return default value or handle error
//   }
// }

// lib/ml/predictFinalExam.js
export async function predictFinalExam(features) {
  try {
    // Add a timeout signal to prevent hanging production builds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    // const response = await fetch(`${process.env.ML_API_URL}/predict`, {
    const response = await fetch(`${process.env.ML_PUBLIC_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    // const data = await response.json();
    // console.log(data);
    // return data;

    return response.json();
  } catch (error) {
    console.error("ML Prediction Error:", error.message);
    return null;
  }
}
