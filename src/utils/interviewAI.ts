import client from "./openaiClient"

export async function generateQuestionsAI() {
  const prompt = `
  Generate 6 interview questions for a Full-Stack Developer (React + Node.js).
  Difficulty levels:
  - 2 Easy
  - 2 Medium
  - 2 Hard

  Return ONLY JSON array with objects:
  [
    {"question": "...", "difficulty": "easy", "time": 20},
    {"question": "...", "difficulty": "easy", "time": 20},
    {"question": "...", "difficulty": "medium", "time": 60},
    {"question": "...", "difficulty": "medium", "time": 60},
    {"question": "...", "difficulty": "hard", "time": 120},
    {"question": "...", "difficulty": "hard", "time": 120}
  ]
  `

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  })

  let content = res.choices[0].message?.content || "[]"
  content = content.replace(/```json|```/g, "").trim()
  return JSON.parse(content)
}

export async function evaluateAnswersAI(qa: { q: string; a: string }[]) {
  const prompt = `
  You are an interviewer. Evaluate the candidate's answers.
  For each Q&A, give a score (0–10) and a short remark.
  Then, calculate FINAL SCORE (0–60) and provide a 2–3 line SUMMARY.

  Candidate Q&A:
  ${JSON.stringify(qa, null, 2)}

  Return ONLY JSON:
  {
    "results": [
      {"question": "...", "answer": "...", "score": 0, "remark": "..."},
      ...
    ],
    "finalScore": 0,
    "summary": "..."
  }
  `

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  })

  let content = res.choices[0].message?.content || "{}"
  content = content.replace(/```json|```/g, "").trim()
  return JSON.parse(content)
}
