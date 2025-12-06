"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle, XCircle, RotateCcw, Play, ChevronRight, Trophy } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function MCQPracticeContent() {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [questionCount, setQuestionCount] = useState("10")
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [stats, setStats] = useState({ correct: 0, wrong: 0, skipped: 0 })

  const { data: mcqs, isLoading } = useSWR(
    selectedClass && selectedSubject ? `/api/mcqs?class=${selectedClass}&subject=${selectedSubject}` : null,
    fetcher,
  )

  const startPractice = () => {
    if (!mcqs?.data?.length) {
      toast.error("No questions available for selected criteria")
      return
    }

    const shuffled = [...mcqs.data].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Number.parseInt(questionCount))
    setQuestions(selected)
    setStarted(true)
    setCurrentIndex(0)
    setAnswers({})
    setShowAnswer(false)
    setCompleted(false)
    setStats({ correct: 0, wrong: 0, skipped: 0 })
  }

  const handleAnswer = (value) => {
    if (showAnswer) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: Number.parseInt(value) }))
  }

  const checkAnswer = () => {
    const currentQuestion = questions[currentIndex]
    const userAnswer = answers[currentIndex]
    const isCorrect = userAnswer === currentQuestion.correctAnswer

    setStats((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (userAnswer !== undefined && !isCorrect ? 1 : 0),
      skipped: prev.skipped + (userAnswer === undefined ? 1 : 0),
    }))

    setShowAnswer(true)
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setShowAnswer(false)
    } else {
      setCompleted(true)
    }
  }

  const resetPractice = () => {
    setStarted(false)
    setCompleted(false)
    setQuestions([])
    setAnswers({})
    setStats({ correct: 0, wrong: 0, skipped: 0 })
  }

  if (!started) {
    return (
      <div className="space-y-6">
        <PageHeader title="MCQ Practice Mode" description="Test your knowledge with practice questions" />

        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Start Practice</CardTitle>
            <CardDescription>Select your preferences to begin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                    <SelectItem key={cls} value={cls.toString()}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="urdu">Urdu</SelectItem>
                  <SelectItem value="islamiat">Islamiat</SelectItem>
                  <SelectItem value="computer">Computer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading && <LoadingSpinner />}
            {mcqs?.data && <p className="text-sm text-muted-foreground">{mcqs.data.length} questions available</p>}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={startPractice}
              disabled={!selectedClass || !selectedSubject || isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Practice
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (completed) {
    const totalAnswered = stats.correct + stats.wrong
    const percentage = totalAnswered > 0 ? ((stats.correct / totalAnswered) * 100).toFixed(0) : 0

    return (
      <div className="space-y-6">
        <PageHeader title="Practice Complete" description="Here are your results" />

        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className={`h-16 w-16 ${percentage >= 70 ? "text-yellow-500" : "text-muted-foreground"}`} />
            </div>
            <CardTitle className="text-3xl">{percentage}%</CardTitle>
            <CardDescription>Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.wrong}</div>
                <p className="text-sm text-muted-foreground">Wrong</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.skipped}</div>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={resetPractice}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Practice
            </Button>
            <Button className="flex-1" onClick={startPractice}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const userAnswer = answers[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      <PageHeader title="MCQ Practice" description={`${selectedSubject} - Class ${selectedClass}`}>
        <Button variant="outline" onClick={resetPractice}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </PageHeader>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">
              Question {currentIndex + 1} of {questions.length}
            </Badge>
            <div className="flex gap-2">
              <Badge className="bg-green-500">{stats.correct} Correct</Badge>
              <Badge variant="destructive">{stats.wrong} Wrong</Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            <h3 className="text-xl font-medium">{currentQuestion.question}</h3>

            <RadioGroup
              value={userAnswer?.toString()}
              onValueChange={handleAnswer}
              className="space-y-3"
              disabled={showAnswer}
            >
              {currentQuestion.options.map((option, index) => {
                let optionClass = "hover:bg-muted"
                if (showAnswer) {
                  if (index === currentQuestion.correctAnswer) {
                    optionClass = "bg-green-50 dark:bg-green-950 border-green-500"
                  } else if (index === userAnswer && index !== currentQuestion.correctAnswer) {
                    optionClass = "bg-red-50 dark:bg-red-950 border-red-500"
                  }
                } else if (userAnswer === index) {
                  optionClass = "bg-primary/10 border-primary"
                }

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${optionClass}`}
                    onClick={() => !showAnswer && handleAnswer(index.toString())}
                  >
                    <RadioGroupItem value={index.toString()} id={`practice-opt-${index}`} disabled={showAnswer} />
                    <Label htmlFor={`practice-opt-${index}`} className="flex-1 cursor-pointer">
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Label>
                    {showAnswer && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {showAnswer && index === userAnswer && index !== currentQuestion.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!showAnswer ? (
            <Button onClick={checkAnswer} disabled={userAnswer === undefined}>
              Check Answer
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
