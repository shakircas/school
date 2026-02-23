// import { NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";
// import Groq from "groq-sdk";

// export async function POST(req, { params }) {
//   try {
//     const { id } = await params;
//     const body = await req.json();
//     const { studentData } = body;

//     console.log(body);
//     if (!studentData) {
//       return NextResponse.json(
//         { error: "No student data provided" },
//         { status: 400 },
//       );
//     }

//     const systemInstruction = `
//       You are an AI Academic Analyst for the BISE Board.
//       Analyze the student's performance data and provide 4-5 specific, deep insights.
//       STRICT: Focus on the correlation between attendance, subject scores, and risk level.
//       STRICT: Use LaTeX for statistics where applicable.
//       STRICT: Return a JSON object with 'insights' (array of strings) and 'strategy' (array of strings).
//     `;

//     const prompt = `
//       ${systemInstruction}

//       DATA TO ANALYZE:
//       - Student: ${studentData.name}
//       - Risk Level: ${studentData.riskLevel}
//       - Attendance: ${studentData.attendanceScore}%
//       - Academic Average: ${studentData.academicScore}%
//       - Subject Breakdown: ${JSON.stringify(studentData.subjectBreakdown)}
//       - Withdrawal Reason: ${studentData.withdrawalReason || "None"}

//       Provide a deep-dive analysis.
//     `;

//     let aiResponse;

//     // Primary Provider: Groq (Fastest for JSON generation)
//     try {
//       const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
//       const completion = await groq.chat.completions.create({
//         messages: [{ role: "user", content: prompt }],
//         model: "llama-3.3-70b-versatile",
//         response_format: { type: "json_object" }, // Force JSON
//         temperature: 0.1,
//       });
//       aiResponse = JSON.parse(completion.choices[0].message.content);
//     } catch (err) {
//       // Fallback: Gemini
//       const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
//       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//       const result = await model.generateContent(
//         prompt + " (Return JSON format)",
//       );
//       const text = result.response.text();
//       aiResponse = JSON.parse(text.replace(/```json|```/g, ""));
//     }

//     return NextResponse.json({
//       studentId: id,
//       insights: aiResponse.insights,
//       recommendations: aiResponse.strategy,
//       analysisDate: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("AI Report Route Error:", error);
//     return NextResponse.json(
//       { error: "Failed to generate AI report" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { studentData } = body; // This is the 'profile' object from your JSON

    if (!studentData) {
      return NextResponse.json(
        { error: "No student data provided" },
        { status: 400 },
      );
    }

    const {
      student,
      subjectBreakdown,
      attendanceScore,
      academicScore,
      riskLevel,
      finalRiskScore,
    } = studentData;

    const systemInstruction = `
      You are the Lead Academic Intelligence Officer for the BISE Board.
      Analyze the student's performance data and provide 4 specific, deep-dive pedagogical insights.
      STRICT: Correlate attendance (${attendanceScore}%) with subject performance.
      STRICT: Use LaTeX for statistics and math ($...$).
      STRICT: Return a JSON object with 'insights' (array of strings) and 'strategy' (array of strings).
    `;

    const prompt = `
      ${systemInstruction}
      
      DATASET FOR ${student?.name || "Student"}:
      - Current Risk: ${riskLevel} (${finalRiskScore}%)
      - Attendance: ${attendanceScore}%
      - Academic Average: ${academicScore}%
      - Subject Performance: ${JSON.stringify(subjectBreakdown)}
      - Withdrawal History: ${student?.withdrawalReason || "None"}
      
      Insights should be critical, technical, and actionable.
    `;

    let aiResponse;

    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.1,
      });
      aiResponse = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      const googleAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
      const model = googleAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(
        prompt + " (Return JSON format)",
      );
      aiResponse = JSON.parse(
        result.response.text().replace(/```json|```/g, ""),
      );
    }

    return NextResponse.json({
      insights: aiResponse.insights,
      strategy: aiResponse.strategy,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Report Route Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}