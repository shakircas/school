// import { generateText } from "ai";
// import { openai } from "@ai-sdk/openai";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const { type, subject, classLevel, topic, count, difficulty } =
//       await request.json();

//     let prompt = "";

//     switch (type) {
//       case "mcqs":
//         prompt = `Generate ${
//           count || 10
//         } multiple choice questions for ${subject} class ${classLevel} on the topic "${topic}".
//         Difficulty level: ${difficulty || "Medium"}.

//         Format each question as JSON with the following structure:
//         {
//           "question": "Question text",
//           "options": ["Option A", "Option B", "Option C", "Option D"],
//           "correctAnswer": "The correct option text",
//           "explanation": "Brief explanation of why this is correct"
//         }

//         Return only a JSON array of questions, no additional text.`;
//         break;

//       case "exam-paper":
//         prompt = `Create a comprehensive exam paper for ${subject} class ${classLevel} on "${topic}".

//         Include:
//         - 10 MCQs (1 mark each)
//         - 5 Short answer questions (3 marks each)
//         - 3 Long answer questions (5 marks each)

//         Format as a structured exam paper with clear sections and marking scheme.`;
//         break;

//       case "notes":
//         prompt = `Generate comprehensive study notes for ${subject} class ${classLevel} on the topic "${topic}".

//         Include:
//         - Key concepts and definitions
//         - Important formulas (if applicable)
//         - Examples
//         - Summary points
//         - Practice questions

//         Format in a clear, student-friendly manner.`;
//         break;

//       default:
//         return NextResponse.json(
//           { error: "Invalid generation type" },
//           { status: 400 }
//         );
//     }

//     const { text } = await generateText({
//       model: openai("gpt-3.5-turbo"),
//       prompt,
//     });

//     // Try to parse as JSON for MCQs
//     if (type === "mcqs") {
//       try {
//         const jsonMatch = text.match(/\[[\s\S]*\]/);
//         if (jsonMatch) {
//           const questions = JSON.parse(jsonMatch[0]);
//           return NextResponse.json({ questions });
//         }
//       } catch (e) {
//         // Return as text if JSON parsing fails
//       }
//     }

//     return NextResponse.json({
//       paper: {
//         title: `${subject} ${type}`,
//         class: classLevel,
//         subject,
//         totalMarks: "100",
//         duration: "3 hours",
//         content: text,
//       },
//     });
//   } catch (error) {
//     console.error("AI generation error:", error);
//     return NextResponse.json(
//       { error: "Failed to generate content" },
//       { status: 500 }
//     );
//   }
// }

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

function getPaperScheme(subject, classLevel) {
  const s = subject.toLowerCase();

  if (["biology", "physics", "chemistry"].includes(s)) {
    return {
      totalMarks: 65,
      mcqs: 12, // 1 mark each
      short: { questions: 11, attempt: 8, marksEach: 4 },
      long: { questions: 4, attempt: 3, parts: ["a", "b"], marksEachPart: 4 },
    };
  }

  if (["pakstudies", "pak study", "islamiat"].includes(s)) {
    return {
      totalMarks: 50,
      mcqs: 10,
      short: { questions: 8, attempt: 5, marksEach: 4 },
      long: { questions: 3, attempt: 2, parts: ["a", "b"], marksEachPart: 4 },
    };
  }

  // English, Urdu, Math, Computer, etc.
  return {
    totalMarks: 75,
    mcqs: 15,
    short: { questions: 12, attempt: 9, marksEach: 4 },
    long: { questions: 5, attempt: 3, parts: ["a", "b"], marksEachPart: 5 },
  };
}

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ------------------------------
// Utility
// ------------------------------
function safe(text = "", max = 6000) {
  return text.length > max ? text.slice(0, max) : text;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      type,
      subject,
      class: classLevel,
      topic,
      details,
      notesType,
      count = 10,
      difficulty = "Medium",
      language = "English",
    } = body;
    console.log("REQUEST BODY:", body);

    // ------------------------------
    // Validation
    // ------------------------------
    if (!type || !subject || !classLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let prompt = "";

    // ------------------------------
    // Prompt Builder
    // ------------------------------
    switch (type) {
      case "mcqs":
        prompt = `
You are an experienced school teacher.

Generate ${count} Multiple Choice Questions for:
• Subject: ${subject}
• Class: ${classLevel}
• Topic: ${topic || "Relevant syllabus"}
• Difficulty: ${difficulty}

STRICT RULES:
• Output ONLY valid JSON array
• No markdown
• No explanation outside JSON

JSON format:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Short explanation"
  }
]
`;
        break;

      case "mcq":
        prompt = `
You are an experienced school MCQ examiner.

Generate EXACTLY ONE Multiple Choice Question.

Subject: ${subject}
Class: ${classLevel}
Topic: ${topic}
Difficulty: ${difficulty}
Language: ${language}

STRICT RULES:
• Output ONLY valid JSON object
• No markdown
• No extra text
• Exactly 4 options
• correctAnswer MUST be a number (0–3)

JSON FORMAT:
{
  "question": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 2,
  "explanation": "Short explanation",
  "marks": 1
}
`;
        break;

      case "quiz": {
        prompt = `
You are an experienced school teacher.

Generate ${count} Multiple Choice Questions for a QUIZ.

• Subject: ${subject}
• Class: ${classLevel}
• Difficulty: ${difficulty}
• Topic: ${topic || "Relevant syllabus"}

STRICT RULES:
• Output ONLY valid JSON array
• No markdown
• No explanation outside JSON
• correctAnswer MUST be index (0,1,2,3)

JSON format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]
`;
        break;
      }

      case "notes":
        prompt = `
You are a senior subject teacher.

Write ${notesType || "comprehensive"} notes for:
• Subject: ${subject}
• Class: ${classLevel}
• Topic: ${topic}

Additional instructions:
${details || "None"}

====================================
MARKDOWN FORMAT RULES (STRICT)
====================================
- Use ONLY markdown headings and lists

Include:
• Definitions
• Key concepts
• Examples
• Bullet points
• Short summary
• 5 practice questions

Language must be simple and clear.
`;
        break;

      case "exam-paper": {
        const scheme = getPaperScheme(subject, classLevel);
        const isUrdu = subject.toLowerCase() === "urdu";
        const isIslamiat = subject.toLowerCase() === "islamiat";
        prompt = `
You are a professional BISE examination paper setter.

Generate a COMPLETE SCHOOL EXAM PAPER in PURE MARKDOWN.

====================================
PAPER DETAILS
====================================
Subject: ${subject}
Class: ${classLevel}
Total Marks: ${scheme.totalMarks}
Time Allowed: 3 Hours
Syllabus: ${topic || "Complete syllabus"}

${isUrdu || isIslamiat ? "LANGUAGE: URDU ONLY" : "LANGUAGE: ENGLISH"}

====================================
MARKDOWN FORMAT RULES (STRICT)
====================================
- Use ONLY markdown headings and lists
- Use ## for section headings
- Each question MUST be numbered
- Use **bold** for marks
- NO paragraphs
- NO explanations
- NO introductions
- NO extra commentary

====================================
REQUIRED STRUCTURE
====================================

## SECTION A – MCQs **(${scheme.mcqs} Marks)**

Generate ${scheme.mcqs} MCQs.

Format:
1. Question  
   a) Option  
   b) Option  
   c) Option  
   d) Option  

------------------------------------

## SECTION B – SHORT QUESTIONS **(${
          scheme.short.attempt * scheme.short.marksEach
        } Marks)**

Attempt ANY ${scheme.short.attempt} out of ${scheme.short.questions}.  
Each question carries **${scheme.short.marksEach} Marks**.

1. Question  
2. Question  

------------------------------------

## SECTION C – LONG QUESTIONS **(${
          scheme.long.attempt *
          scheme.long.parts.length *
          scheme.long.marksEachPart
        } Marks)**

Attempt ANY ${scheme.long.attempt} out of ${scheme.long.questions}.  
Each question has TWO parts **(a & b)**.  
Each part carries **${scheme.long.marksEachPart} Marks**.

1. (a) Question  
   (b) Question  

------------------------------------

OUTPUT ONLY MARKDOWN.
`;
        break;
      }

      case "notes":
        prompt = `
You are a senior subject teacher.

Write ${notesType || "comprehensive"} notes for:
• Subject: ${subject}
• Class: ${classLevel}
• Topic: ${topic}

Additional instructions:
${details || "None"}

Format rules:
• Use headings (##, ###) for sections
• Use bullet points for key concepts
• Use bold for keywords
• Include short examples
• Include 5 practice questions at the end, numbered

Output in **markdown**
Language must be simple and clear.
`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid generation type" },
          { status: 400 }
        );
    }

    // ------------------------------
    // Gemini Call
    // ------------------------------
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: safe(prompt) }],
        },
      ],
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 500 }
      );
    }

    if (type === "quiz") {
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("JSON not found");

        const questions = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ questions });
      } catch (err) {
        return NextResponse.json(
          { error: "Failed to parse quiz questions", raw: text },
          { status: 500 }
        );
      }
    }

    // ------------------------------
    // MCQs → JSON Parsing
    // ------------------------------
    if (type === "mcqs") {
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("JSON not found");

        const questions = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ questions });
      } catch (err) {
        return NextResponse.json(
          {
            error: "Failed to parse MCQs JSON",
            raw: text,
          },
          { status: 500 }
        );
      }
    }

    // ------------------------------
    // Exam / Notes Response
    // ------------------------------

    if (type === "notes") {
      return NextResponse.json({
        notes: {
          topic,
          class: classLevel,
          subject,
          content: text,
        },
      });
    }
    return NextResponse.json({
      paper: {
        title: `${subject} - ${type.replace("-", " ").toUpperCase()}`,
        class: classLevel,
        subject,
        totalMarks: "100",
        duration: "3 Hours",
        content: text,
      },
    });
  } catch (err) {
    console.error("Gemini generation error →", err);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
