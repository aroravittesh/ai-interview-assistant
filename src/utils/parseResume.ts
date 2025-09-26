import * as pdfjsLib from "pdfjs-dist"
import mammoth from "mammoth"
import client from "./openaiClient"

// ✅ Import worker correctly for Vite
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url"
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "pdf") {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ""
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((it: any) => it.str).join(" ") + "\n"
    }
    return text
  }

  if (ext === "docx") {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  throw new Error("Unsupported file format")
}

export async function extractFieldsWithAI(text: string) {
  const prompt = `
  Extract the candidate's Name, Email, and Phone number from this resume text.
  Return ONLY valid JSON in this format:
  {"name": "...", "email": "...", "phone": "..."}

  Resume text:
  ${text}
  `

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    })

    let content = response.choices[0].message?.content || "{}"

    // ✅ Strip markdown code fences if present
    content = content.replace(/```json|```/g, "").trim()

    return JSON.parse(content)
  } catch (err) {
    console.error("AI extraction error", err)
    return { name: "", email: "", phone: "" }
  }
}

