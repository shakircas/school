import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  try {
    const { image, answerKey, type } = await req.json();

    const bubblePrompt = `
TASK: OMR SCANNING (KPK BOARD STYLE)

1. Parse this Solution Manual:
${answerKey}

2. Detect shaded circles in the image.
3. Extract Student Name and Roll Number from the top of the sheet.

RETURN JSON ONLY:
{
  "studentName": "Name",
  "rollNo": "123",
  "paperCode": "A",
  "score": 15,
  "total": 20,
  "results": [
    { "q": 1, "correct": true, "comment": "A" }
  ]
}
`;

    const subjectivePrompt = `
TASK: HANDWRITTEN PAPER GRADING

Grade based on this Marking Scheme:
${answerKey}

RETURN JSON ONLY:
{
  "studentName": "Name",
  "rollNo": "123",
  "totalMarks": 0,
  "total": 100,
  "feedback": "",
  "breakdown": [
    { "question": 1, "marksObtained": 5, "comment": "Excellent proof" }
  ]
}
`;

    const prompt = type === "bubble" ? bubblePrompt : subjectivePrompt;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: image, // base64 WITHOUT data:image/jpeg;base64,
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
    });

    const text = response.candidates[0].content.parts[0].text;

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON returned by Gemini");
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("Grading Error:", error);
    return NextResponse.json(
      { error: "Grading failed", details: error.message },
      { status: 500 }
    );
  }
}
