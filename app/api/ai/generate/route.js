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
    // const {
    //   type,
    //   subject,
    //   class: classLevel,
    //   topic,
    //   details,
    //   notesType,
    //   count = 10,
    //   difficulty = "Medium",
    //   language = "English",
    // } = body;

    // Destructure the new fields from your frontend
    const {
      type,
      subject,
      class: classLevel,
      topic,
      details,
      notesType,
      count = 10,
      chapterRange,
      examType,
      difficulty,
      cognitiveLevel,
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
        prompt = `
        Act as a Senior Paper Setter for BISE Mardan. 
        Generate a professional ${examType} Exam Paper.
        
        SPECIFICATIONS:
        - Subject: ${subject}
        - Class: ${classLevel}
        - Syllabus: ${chapterRange}
        - Cognitive Focus: ${cognitiveLevel} (Strictly follow SLO standards)
        - Difficulty: ${difficulty}
        - Language: ${language}
        - Total Marks: ${scheme.totalMarks}

        STRUCTURE RULES:
        1. Section A: ${scheme.mcqs} MCQs (1 Mark each). Provide options A, B, C, D.
        2. Section B: Short Questions. Provide ${scheme.short.questions} questions. (Attempt any ${scheme.short.attempt}). Each carries ${scheme.short.marksEach} marks.
        3. Section C: Long Questions. Provide ${scheme.long.questions} descriptive questions. (Attempt any ${scheme.long.attempt}). Include parts (a) and (b) where applicable.

        FORMATTING:
        - Use professional Markdown.
        - Bold the Section Headers (e.g., **SECTION-A**).
        - Use a numbered list for questions.
        - Ensure all content is relevant to the ${classLevel} grade curriculum.
      `;
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
      // Return the response object to match what the frontend expects
      return NextResponse.json({
        paper: {
          title: `${examType}`,
          subject: subject,
          class: classLevel,
          totalMarks: getPaperScheme(subject, classLevel).totalMarks,
          content: text,
          duration: body.duration || "3 Hours",
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
