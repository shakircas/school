// import { GoogleGenAI } from "@google/genai";
// import { NextResponse } from "next/server";

// function getPaperScheme(subject, classLevel) {
//   const s = subject.toLowerCase();

//   if (["biology", "physics", "chemistry"].includes(s)) {
//     return {
//       totalMarks: 65,
//       mcqs: 12, // 1 mark each
//       short: { questions: 11, attempt: 8, marksEach: 4 },
//       long: { questions: 4, attempt: 3, parts: ["a", "b"], marksEachPart: 4 },
//     };
//   }

//   if (["pakstudies", "pak study", "islamiat"].includes(s)) {
//     return {
//       totalMarks: 50,
//       mcqs: 10,
//       short: { questions: 8, attempt: 5, marksEach: 4 },
//       long: { questions: 3, attempt: 2, parts: ["a", "b"], marksEachPart: 4 },
//     };
//   }

//   // English, Urdu, Math, Computer, etc.
//   return {
//     totalMarks: 75,
//     mcqs: 15,
//     short: { questions: 12, attempt: 9, marksEach: 4 },
//     long: { questions: 5, attempt: 3, parts: ["a", "b"], marksEachPart: 5 },
//   };
// }

// const client = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// // ------------------------------
// // Utility
// // ------------------------------
// function safe(text = "", max = 6000) {
//   return text.length > max ? text.slice(0, max) : text;
// }

// export async function POST(req) {
//   try {
//     const body = await req.json();

//     const {
//       type,
//       subject,
//       class: classLevel,
//       topic,
//       details,
//       notesType,
//       count = 10,
//       difficulty = "Medium",
//       language = "English",
//     } = body;
//     console.log("REQUEST BODY:", body);

//     // ------------------------------
//     // Validation
//     // ------------------------------
//     if (!type || !subject || !classLevel) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     let prompt = "";

//     // ------------------------------
//     // Prompt Builder
//     // ------------------------------
//     switch (type) {
//       case "mcqs":
//         prompt = `
// You are an experienced school teacher.

// Generate ${count} Multiple Choice Questions for:
// • Subject: ${subject}
// • Class: ${classLevel}
// • Topic: ${topic || "Relevant syllabus"}
// • Difficulty: ${difficulty}

// STRICT RULES:
// • Output ONLY valid JSON array
// • No markdown
// • No explanation outside JSON

// JSON format:
// [
//   {
//     "question": "Question text",
//     "options": ["A", "B", "C", "D"],
//     "correctAnswer": "A",
//     "explanation": "Short explanation"
//   }
// ]
// `;
//         break;

//       case "mcq":
//         prompt = `
// You are an experienced school MCQ examiner.

// Generate EXACTLY ONE Multiple Choice Question.

// Subject: ${subject}
// Class: ${classLevel}
// Topic: ${topic}
// Difficulty: ${difficulty}
// Language: ${language}

// STRICT RULES:
// • Output ONLY valid JSON object
// • No markdown
// • No extra text
// • Exactly 4 options
// • correctAnswer MUST be a number (0–3)

// JSON FORMAT:
// {
//   "question": "Question text",
//   "options": ["A", "B", "C", "D"],
//   "correctAnswer": 2,
//   "explanation": "Short explanation",
//   "marks": 1
// }
// `;
//         break;

//       case "quiz": {
//         prompt = `
// You are an experienced school teacher.

// Generate ${count} Multiple Choice Questions for a QUIZ.

// • Subject: ${subject}
// • Class: ${classLevel}
// • Difficulty: ${difficulty}
// • Topic: ${topic || "Relevant syllabus"}

// STRICT RULES:
// • Output ONLY valid JSON array
// • No markdown
// • No explanation outside JSON
// • correctAnswer MUST be index (0,1,2,3)

// JSON format:
// [
//   {
//     "question": "Question text",
//     "options": ["Option A", "Option B", "Option C", "Option D"],
//     "correctAnswer": 0
//   }
// ]
// `;
//         break;
//       }

//       case "notes":
//         prompt = `
// You are a senior subject teacher.

// Write ${notesType || "comprehensive"} notes for:
// • Subject: ${subject}
// • Class: ${classLevel}
// • Topic: ${topic}

// Additional instructions:
// ${details || "None"}

// ====================================
// MARKDOWN FORMAT RULES (STRICT)
// ====================================
// - Use ONLY markdown headings and lists

// Include:
// • Definitions
// • Key concepts
// • Examples
// • Bullet points
// • Short summary
// • 5 practice questions

// Language must be simple and clear.
// `;
//         break;

//       case "exam-paper": {
//         const scheme = getPaperScheme(subject, classLevel);
//         const isUrdu = subject.toLowerCase() === "urdu";
//         const isIslamiat = subject.toLowerCase() === "islamiat";
//         prompt = `
// You are a professional BISE examination paper setter.

// Generate a COMPLETE SCHOOL EXAM PAPER in PURE MARKDOWN.

// ====================================
// PAPER DETAILS
// ====================================
// Subject: ${subject}
// Class: ${classLevel}
// Total Marks: ${scheme.totalMarks}
// Time Allowed: 3 Hours
// Syllabus: ${topic || "Complete syllabus"}

// ${isUrdu || isIslamiat ? "LANGUAGE: URDU ONLY" : "LANGUAGE: ENGLISH"}

// ====================================
// MARKDOWN FORMAT RULES (STRICT)
// ====================================
// - Use ONLY markdown headings and lists
// - Use ## for section headings
// - Each question MUST be numbered
// - Use **bold** for marks
// - NO paragraphs
// - NO explanations
// - NO introductions
// - NO extra commentary

// ====================================
// REQUIRED STRUCTURE
// ====================================

// ## SECTION A – MCQs **(${scheme.mcqs} Marks)**

// Generate ${scheme.mcqs} MCQs.

// Format:
// 1. Question
//    a) Option
//    b) Option
//    c) Option
//    d) Option

// ------------------------------------

// ## SECTION B – SHORT QUESTIONS **(${
//           scheme.short.attempt * scheme.short.marksEach
//         } Marks)**

// Attempt ANY ${scheme.short.attempt} out of ${scheme.short.questions}.
// Each question carries **${scheme.short.marksEach} Marks**.

// 1. Question
// 2. Question

// ------------------------------------

// ## SECTION C – LONG QUESTIONS **(${
//           scheme.long.attempt *
//           scheme.long.parts.length *
//           scheme.long.marksEachPart
//         } Marks)**

// Attempt ANY ${scheme.long.attempt} out of ${scheme.long.questions}.
// Each question has TWO parts **(a & b)**.
// Each part carries **${scheme.long.marksEachPart} Marks**.

// 1. (a) Question
//    (b) Question

// ------------------------------------

// OUTPUT ONLY MARKDOWN.
// `;
//         break;
//       }

//       case "notes":
//         prompt = `
// You are a senior subject teacher.

// Write ${notesType || "comprehensive"} notes for:
// • Subject: ${subject}
// • Class: ${classLevel}
// • Topic: ${topic}

// Additional instructions:
// ${details || "None"}

// Format rules:
// • Use headings (##, ###) for sections
// • Use bullet points for key concepts
// • Use bold for keywords
// • Include short examples
// • Include 5 practice questions at the end, numbered

// Output in **markdown**
// Language must be simple and clear.
// `;
//         break;

//       default:
//         return NextResponse.json(
//           { error: "Invalid generation type" },
//           { status: 400 }
//         );
//     }

//     // ------------------------------
//     // Gemini Call
//     // ------------------------------
//     const response = await client.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: safe(prompt) }],
//         },
//       ],
//     });

//     const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//     if (!text) {
//       return NextResponse.json(
//         { error: "Empty response from Gemini" },
//         { status: 500 }
//       );
//     }

//     if (type === "quiz") {
//       try {
//         const jsonMatch = text.match(/\[[\s\S]*\]/);
//         if (!jsonMatch) throw new Error("JSON not found");

//         const questions = JSON.parse(jsonMatch[0]);

//         return NextResponse.json({ questions });
//       } catch (err) {
//         return NextResponse.json(
//           { error: "Failed to parse quiz questions", raw: text },
//           { status: 500 }
//         );
//       }
//     }

//     // ------------------------------
//     // MCQs → JSON Parsing
//     // ------------------------------
//     if (type === "mcqs") {
//       try {
//         const jsonMatch = text.match(/\[[\s\S]*\]/);
//         if (!jsonMatch) throw new Error("JSON not found");

//         const questions = JSON.parse(jsonMatch[0]);
//         return NextResponse.json({ questions });
//       } catch (err) {
//         return NextResponse.json(
//           {
//             error: "Failed to parse MCQs JSON",
//             raw: text,
//           },
//           { status: 500 }
//         );
//       }
//     }

//     // ------------------------------
//     // Exam / Notes Response
//     // ------------------------------

//     if (type === "notes") {
//       return NextResponse.json({
//         notes: {
//           topic,
//           class: classLevel,
//           subject,
//           content: text,
//         },
//       });
//     }
//     return NextResponse.json({
//       paper: {
//         title: `${subject} - ${type.replace("-", " ").toUpperCase()}`,
//         class: classLevel,
//         subject,
//         totalMarks: "100",
//         duration: "3 Hours",
//         content: text,
//       },
//     });
//   } catch (err) {
//     console.error("Gemini generation error →", err);
//     return NextResponse.json(
//       { error: "Failed to generate content" },
//       { status: 500 }
//     );
//   }
// }

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// 1. Official Paper Scheme Logic for BISE Standard
function getPaperScheme(subject, classLevel) {
  const s = subject?.toLowerCase();
  if (["biology", "physics", "chemistry"].includes(s)) {
    return {
      totalMarks: 65,
      mcqs: 12,
      short: { questions: 11, attempt: 8, marksEach: 4 },
      long: { questions: 4, attempt: 3, parts: ["a", "b"], marksEachPart: 4 },
    };
  }
  if (["pakstudies", "islamiat"].includes(s)) {
    return {
      totalMarks: 50,
      mcqs: 10,
      short: { questions: 8, attempt: 5, marksEach: 4 },
      long: { questions: 3, attempt: 2, parts: ["a", "b"], marksEachPart: 4 },
    };
  }
  return {
    totalMarks: 75,
    mcqs: 15,
    short: { questions: 12, attempt: 9, marksEach: 4 },
    long: { questions: 5, attempt: 3, parts: ["a", "b"], marksEachPart: 5 },
  };
}

// Initializing with your preferred client

export async function POST(req) {
  try {
    // ✅ ENV SAFETY CHECK
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    // ✅ INITIALIZE CLIENT AT RUNTIME
    const client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

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

    let prompt = "";

    console.log("type", type);
    console.log("REQUEST BODY:", body);

    // 2. Optimized Prompt Matrix
    switch (type) {
      case "mcqs":
        prompt = `Act as a senior BISE examiner. Generate ${count} MCQs for Class ${classLevel} ${subject} on Topic: ${topic}. 
        Difficulty Level: ${difficulty}. 
        Language: ${language}.
        STRICT RULE: Return ONLY a raw JSON array. No markdown blocks. 
        Format: [{"question": "...", "options": ["", "", "", ""], "correctAnswer": 0, "explanation": "..."}]`;
        break;

      case "notes":
        prompt = `As a subject expert, write ${
          notesType || "comprehensive"
        } notes for Class ${classLevel} ${subject}. 
        Topic: ${topic}. 
        Include: Definitions, Key Points, and Examples. 
        Format: Professional Markdown. Language: ${language}.`;
        break;

      case "exam-paper":
      case "paper":
        const scheme = getPaperScheme(subject, classLevel);
        prompt = `Generate a formal BISE Exam Paper for Class ${classLevel} ${subject}. 
        Total Marks: ${scheme.totalMarks}. Syllabus: ${topic}.
        Structure:
        - Section A: ${scheme.mcqs} MCQs (1 Mark each).
        - Section B: Short Qs (Attempt ${scheme.short.attempt} out of ${scheme.short.questions}, ${scheme.short.marksEach} Marks each).
        - Section C: Long Qs (Attempt ${scheme.long.attempt} out of ${scheme.long.questions}, Parts a & b).
        Format: Pure Markdown. Language: ${language}.`;
        break;

      case "worksheet":
        prompt = `Create a classroom worksheet for Class ${classLevel} ${subject} on ${topic}. 
        Include: Matching Columns, Fill in the blanks, and 2 Concept diagrams descriptions. 
        Format: Markdown.`;
        break;

      case "quiz":
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

      // Add this case inside your switch(type) in the POST function
      // Below is an exam paper for Class ${classLevel} ${subject}.

      case "solution-manual":
        prompt = `
    You are the Head Examiner for the BISE Mardan Board.
    
    
    PAPER CONTENT:
    ${details} // Here 'details' will contain the generated paper text

    TASK:
    Generate a professional SOLUTION MANUAL and MARKING SCHEME.
    
    STRUCTURE:
    1. **Section A (MCQs):** Provide a simple numbered list with the Correct Option Letter and the Answer Text.
    2. **Section B (Short Qs):** Provide concise, model answers (3-4 lines each) that would secure full marks. 
    3. **Section C (Long Qs):** Provide a breakdown of marks (e.g., "Definition: 1 Mark, Labelled Diagram: 2 Marks, Derivation: 2 Marks").
    
    FORMAT: Pure Markdown. Use high contrast headings.
  `;
        break;

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // List your models in order of preference
    // 1. Preferred Model, 2. Backup Model
    // const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

    // let response;
    // let lastError;

    // for (const modelName of modelsToTry) {
    //   try {
    //     console.log(`Attempting generation with: ${modelName}`);

    //     response = await client.models.generateContent({
    //       model: modelName,
    //       contents: [{ role: "user", parts: [{ text: prompt }] }],
    //     });

    //     // If successful, break the loop
    //     if (response) break;
    //   } catch (err) {
    //     lastError = err;
    //     // Check if the error is a Rate Limit (429)
    //     // Adjust this check based on how @google/genai surfaces the status
    //     if (
    //       err.status === 429 ||
    //       err.message?.includes("429") ||
    //       err.message?.includes("quota")
    //     ) {
    //       console.warn(`${modelName} quota full, switching to next model...`);
    //       continue; // Move to the next model in the array
    //     } else {
    //       // If it's a different error (like a syntax error), throw it immediately
    //       throw err;
    //     }
    //   }
    // }

    // if (!response) {
    //   throw lastError || new Error("All models failed to respond.");
    // }

    // const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 3. Using your requested client.models.generateContent structure
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      // model: "gemini-2.5-flash-lite",
      // model: "gemini-3-flash-preview",

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 },
      );
    }

    // 4. Clean Parsing & Response Formatting
    if (type === "mcqs") {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const questions = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return NextResponse.json({ questions });
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
          { status: 500 },
        );
      }
    }

    if (type === "notes") {
      return NextResponse.json({
        notes: { topic, content: text, subject, class: classLevel },
      });
    }

    if (type === "worksheet") {
      return NextResponse.json({
        worksheet: {
          topic,
          content: text,
          subject,
          class: classLevel,
        },
      });
    }

    if (type === "exam-paper" || type === "paper") {
      return NextResponse.json({
        paper: {
          title: `${subject} - Class ${classLevel} Assessment`,
          totalMarks: getPaperScheme(subject, classLevel).totalMarks,
          content: text,
        },
      });
    }

    if (type === "solution-manual") {
      return NextResponse.json({
        paper: {
          title: `${subject} - Class ${classLevel} Assessment`,
          totalMarks: getPaperScheme(subject, classLevel).totalMarks,
          content: text,
        },
      });
    }

    // Combined Paper and Exam-Paper logic
    return NextResponse.json({
      paper: {
        title: `${subject} - Class ${classLevel} Assessment`,
        totalMarks: getPaperScheme(subject, classLevel).totalMarks,
        content: text,
      },
    });
  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
