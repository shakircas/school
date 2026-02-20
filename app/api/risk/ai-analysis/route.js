import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai"; // Latest SDK version
import Groq from "groq-sdk";

export async function POST(req) {
  try {
    // 1. Configuration Check
    if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
      throw new Error("Missing AI Credentials.");
    }

    const body = await req.json();
    const {
      classData,
      className,
      subjectSummary,
      analyticsType = "general",
    } = body;

    if (!classData || !Array.isArray(classData)) {
      return NextResponse.json(
        { error: "Invalid student data provided" },
        { status: 400 },
      );
    }

    // 2. Advanced System Instruction for BISE Standards
    const systemInstruction = `
      You are the Lead Academic Intelligence Officer for the BISE Board.
      Your goal is to provide data-driven pedagogical insights.
      STRICT: Use LaTeX for math/stats ($...$ for inline, $$...$$ for blocks).
      STRICT: Use clean Markdown with H2 and H3 headers.
    `;

    const prompt = `
      ${systemInstruction}
      
      DATASET:
      - Class Identifier: ${className || "N/A"}
      - Performance Matrix: ${JSON.stringify(classData)}
      - Curriculum Stats: ${JSON.stringify(subjectSummary || [])}

      GENERATE REPORT SECTIONS:
      1. **Class Health Index**: Calculate a theoretical class health percentage using $$H = \\frac{\\sum (100 - R_i)}{N}$$.
      2. **Risk Distribution**: Group students into Critical (>70%), Warning (40-70%), and Stable (<40%).
      3. **Subject Vulnerabilities**: Identify which subjects are driving the risk scores.
      4. **Actionable Remediation**: Suggest specific board-aligned teaching strategies.
      
      REPORT TYPE: ${analyticsType.toUpperCase()}
    `;

    let aiResponse = "";
    let providerUsed = "";

    // 3. Execution Strategy: Groq (Primary) -> Google (Fallback)
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2, // Low for analytical accuracy
      });
      aiResponse = completion.choices[0]?.message?.content || "";
      providerUsed = "Groq (Llama-3.3)";
    } catch (groqError) {
      console.warn("Groq failed, initiating Google GenAI fallback...");

      // 4. Using the Latest GoogleGenAI Package Structure
      const googleAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
      const model = googleAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      aiResponse = response.text();
      providerUsed = "Google Gemini";
    }

    if (!aiResponse) throw new Error("AI Providers returned empty content");

    // 5. Success Response
    return NextResponse.json({
      report: aiResponse,
      meta: {
        provider: providerUsed,
        timestamp: new Date().toISOString(),
        criticalCount: classData.filter((s) => s.riskScore >= 70).length,
      },
    });
  } catch (error) {
    console.error("Analysis Route Error:", error);
    return NextResponse.json(
      { error: "Generation failed: " + error.message },
      { status: 500 },
    );
  }
}
