import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { answers, questions, totalMarks } = await request.json()

    const prompt = `You are an exam grader. Grade the following answers against the questions and provide marks.
    
    Questions and Answers:
    ${questions
      .map(
        (q, i) => `
    Q${i + 1}: ${q.question}
    Expected Answer: ${q.correctAnswer || q.expectedAnswer}
    Student Answer: ${answers[i] || "Not answered"}
    Marks: ${q.marks}
    `,
      )
      .join("\n")}
    
    Total Marks: ${totalMarks}
    
    Provide grading in JSON format:
    {
      "results": [
        {
          "questionNumber": 1,
          "marksObtained": number,
          "maxMarks": number,
          "feedback": "Brief feedback"
        }
      ],
      "totalObtained": number,
      "percentage": number,
      "grade": "A/B/C/D/E/F",
      "overallFeedback": "Overall performance feedback"
    }`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return NextResponse.json(result)
      }
    } catch (e) {
      // Return raw text if parsing fails
    }

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error("AI marking error:", error)
    return NextResponse.json({ error: "Failed to mark answers" }, { status: 500 })
  }
}
