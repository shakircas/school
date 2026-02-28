import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

export async function generateAIStudyPlan(studentName, weakTopics) {
  // 1. Configuration Check
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    throw new Error("Missing AI Credentials.");
  }

  const formattedTopics = weakTopics
    .map(
      (t) => `Subject: ${t.subject}, Chapter: ${t.chapter}, Topic: ${t.topic}`,
    )
    .join("\n");

  const systemInstruction = `
    You are an expert school academic planner specialized in BISE Board standards.
    Your goal is to create a data-driven 7-day study plan.
    STRICT: Return ONLY a valid JSON object.
    STRICT: Use LaTeX for any formulas or statistical references within tasks.
  `;

  const prompt = `
    ${systemInstruction}

    Student Name: ${studentName}
    Weak Topics identified for remediation:
    ${formattedTopics}

    Create a 7-day structured study plan.
    Rules:
    - Assign 1–2 topics per day.
    - Include clear task descriptions and practice strategies.
    - Return ONLY JSON in this format:
    {
      "days": [
        {
          "day": 1,
          "subject": "Subject Name",
          "topic": "Topic Name",
          "taskDescription": "Specific task with practice strategy"
        }
      ]
    }
  `;

  let aiResponse = "";

  // 2. Primary Provider: Groq (Llama 3.3 70B)
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    aiResponse = completion.choices[0]?.message?.content || "";
  } catch (groqError) {
    console.warn("Groq Study Plan failed, initiating Google GenAI fallback...");

    // 3. Fallback Provider: Google GenAI (@google/genai)
    try {
      // Adjusted for the @google/genai structure
      const googleAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
      const model = googleAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(
        prompt + " (Ensure output is valid JSON)",
      );
      const response = await result.response;
      aiResponse = response.text();
    } catch (geminiError) {
      console.error("All AI providers failed:", geminiError);
      return null;
    }
  }

  // 4. Safe JSON Parsing
  try {
    const jsonStart = aiResponse.indexOf("{");
    const jsonEnd = aiResponse.lastIndexOf("}") + 1;
    const cleanJson = aiResponse.slice(jsonStart, jsonEnd);
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("AI Study Plan Parsing Error:", err);
    return null;
  }
}
