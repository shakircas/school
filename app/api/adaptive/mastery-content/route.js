import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { topic, studentId, subject } = await req.json();

    // 1. Context Preparation
    // Ensure you pull the student's Grade/Class here to keep it "To the point"
    const studentLevel = "Intermediate";

    const systemInstruction = `You are a high-performance academic coach for BISE Board standards. 
    Your goal is to provide a "one-stop" explanation so the student doesn't need to search elsewhere.`;

    const prompt = `
      TOPIC: "${topic}" (${subject})
      LEVEL: ${studentLevel}
      
      STRUCTURE:
      1. **Core Concept**: One sentence punchy explanation.
      2. **Definition**: Provide the formal definition followed by exactly 3 lines of simple explanation.
      3. **Key Mechanics**: 3 bullet points on how this works or its main components.
      4. **Exam Insight**: One "Golden Rule" for BISE exams (marking scheme tip or common mistake).
      5. **Self-Test**: Provide exactly 2 MCQs to verify understanding. 
        Format each as:
        Q: [Question]
        A) [Option] B) [Option] C) [Option] D) [Option]
        Correct: [Letter]

      CONSTRAINTS:
      - Start immediately with content. No intro/outro.
      - Use LaTeX for ALL math/science formulas (e.g., $E=mc^2$).
      - Use Markdown bolding for key terms.
      - Max 160 words total.
    `;

    let aiResponse = "";

    // 2. Primary: Groq (Ultra-fast for "on-the-spot" learning)
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3, // Lower temperature = more factual/stable definitions
      });
      aiResponse = completion.choices[0]?.message?.content || "";
    } catch (groqError) {
      console.warn("Groq failed, switching to Gemini...");

      // 3. Fallback: Google GenAI
      try {
        const googleAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        const model = googleAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
        const result = await model.generateContent(
          `${systemInstruction}\n\n${prompt}`,
        );
        aiResponse = result.response.text();
      } catch (geminiError) {
        throw new Error("ALL_AI_PROVIDERS_OFFLINE");
      }
    }

    return NextResponse.json({ content: aiResponse });
  } catch (error) {
    return NextResponse.json(
      { error: "Briefing unavailable." },
      { status: 500 },
    );
  }
}
