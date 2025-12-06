import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { type, subject, classLevel, topic, count, difficulty } = await request.json()

    let prompt = ""

    switch (type) {
      case "mcqs":
        prompt = `Generate ${count || 10} multiple choice questions for ${subject} class ${classLevel} on the topic "${topic}". 
        Difficulty level: ${difficulty || "Medium"}.
        
        Format each question as JSON with the following structure:
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The correct option text",
          "explanation": "Brief explanation of why this is correct"
        }
        
        Return only a JSON array of questions, no additional text.`
        break

      case "exam-paper":
        prompt = `Create a comprehensive exam paper for ${subject} class ${classLevel} on "${topic}".
        
        Include:
        - 10 MCQs (1 mark each)
        - 5 Short answer questions (3 marks each)
        - 3 Long answer questions (5 marks each)
        
        Format as a structured exam paper with clear sections and marking scheme.`
        break

      case "notes":
        prompt = `Generate comprehensive study notes for ${subject} class ${classLevel} on the topic "${topic}".
        
        Include:
        - Key concepts and definitions
        - Important formulas (if applicable)
        - Examples
        - Summary points
        - Practice questions
        
        Format in a clear, student-friendly manner.`
        break

      default:
        return NextResponse.json({ error: "Invalid generation type" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Try to parse as JSON for MCQs
    if (type === "mcqs") {
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0])
          return NextResponse.json({ questions })
        }
      } catch (e) {
        // Return as text if JSON parsing fails
      }
    }

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
