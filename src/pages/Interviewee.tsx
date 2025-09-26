// import { useState, useEffect, useCallback, useRef } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { motion, AnimatePresence } from "framer-motion"
// import { addCandidate } from "../app/slices/candidateSlice"
// import { extractTextFromFile, extractFieldsWithAI } from "../utils/parseResume"
// import { generateQuestionsAI, evaluateAnswersAI } from "../utils/interviewAI"
// import { startSession, updateSession, clearSession } from "../app/slices/sessionSlice"
// import type { RootState } from "../app/store"

// function Interviewee() {
//   const dispatch = useDispatch()
//   const session = useSelector((state: RootState) => state.session)

//   const [showResumeModal, setShowResumeModal] = useState(false)
//   const [step, setStep] = useState<"details" | "interview" | "done">("details")

//   // Candidate info
//   const [file, setFile] = useState<File | null>(null)
//   const [name, setName] = useState(session.name || "")
//   const [email, setEmail] = useState(session.email || "")
//   const [phone, setPhone] = useState(session.phone || "")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string>("")

//   // Interview state
//   const [questions, setQuestions] = useState<any[]>(session.questions || [])
//   const [currentQ, setCurrentQ] = useState(session.currentQ || 0)
//   const [timeLeft, setTimeLeft] = useState(session.timeLeft || 0)
//   const [answer, setAnswer] = useState("")
//   const [answers, setAnswers] = useState<{ q: string; a: string }[]>(session.answers || [])

//   // Proctoring
//   const [warnings, setWarnings] = useState(0)
//   const [warnBanner, setWarnBanner] = useState<string>("")
//   const lastPenaltyRef = useRef(0)
//   const PENALTY_COOLDOWN_MS = 1200 // dedupe blur + visibilitychange fired together

//   // Resume session check
//   useEffect(() => {
//     if (session.inProgress && step === "details") setShowResumeModal(true)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   // File upload + parse
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const uploaded = e.target.files[0]
//       if (!uploaded.name.endsWith(".pdf") && !uploaded.name.endsWith(".docx")) {
//         setError("Invalid file type. Please upload a PDF or DOCX.")
//         return
//       }

//       setFile(uploaded)
//       setError("")
//       setLoading(true)

//       try {
//         const text = await extractTextFromFile(uploaded)
//         const fields = await extractFieldsWithAI(text)
//         if (fields.name) setName(fields.name)
//         if (fields.email) setEmail(fields.email)
//         if (fields.phone) setPhone(fields.phone)
//       } catch (err) {
//         console.error("Error parsing resume", err)
//         setError("Failed to extract info from resume. Please enter details manually.")
//       } finally {
//         setLoading(false)
//       }
//     }
//   }

//   // Start Interview (with validation)
//   const handleStart = async () => {
//     if (!name || !email || !phone) {
//       setError("Please complete all fields before starting.")
//       return
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(email)) {
//       setError("Invalid email format.")
//       return
//     }
//     const cleanedPhone = phone.replace(/[^\d]/g, "")
//     if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
//       setError("Invalid phone number. Please enter a valid international number.")
//       return
//     }

//     setError("")
//     setLoading(true)
//     try {
//       const qs = await generateQuestionsAI()
//       setQuestions(qs)
//       setStep("interview")
//       setCurrentQ(0)
//       setTimeLeft(qs[0].time)
//       setWarnings(0)
//       setWarnBanner("")
//       lastPenaltyRef.current = 0

//       dispatch(
//         startSession({
//           name,
//           email,
//           phone,
//           questions: qs,
//           currentQ: 0,
//           timeLeft: qs[0].time,
//           answers: [],
//         })
//       )
//     } catch (err) {
//       console.error("Question generation failed", err)
//       setError("Could not generate questions. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Submit current question and move ahead (or finish)
//   const handleSubmit = useCallback(async () => {
//     const q = questions[currentQ]
//     if (!q) return
//     const updatedAnswers = [...answers, { q: q.question, a: answer || "(No answer)" }]
//     setAnswers(updatedAnswers)
//     setAnswer("")

//     if (currentQ + 1 < questions.length) {
//       setCurrentQ(currentQ + 1)
//       const nextTime = questions[currentQ + 1].time
//       setTimeLeft(nextTime)
//       dispatch(
//         updateSession({
//           answers: updatedAnswers,
//           currentQ: currentQ + 1,
//           timeLeft: nextTime,
//         })
//       )
//     } else {
//       setStep("done")
//       setLoading(true)
//       try {
//         const result = await evaluateAnswersAI(updatedAnswers)
//         dispatch(
//           addCandidate({
//             id: Date.now().toString(),
//             name,
//             email,
//             phone,
//             answers: result.results,
//             finalScore: result.finalScore,
//             summary: result.summary,
//           })
//         )
//       } catch (err) {
//         console.error("Evaluation failed", err)
//       } finally {
//         setLoading(false)
//         dispatch(clearSession())
//       }
//     }
//   }, [answer, answers, currentQ, dispatch, email, name, phone, questions])

//   // Force submit entire test after 3 warnings
//   const handleForceSubmit = useCallback(async () => {
//     const base = [...answers]
//     const current = questions[currentQ]
//     if (current) base.push({ q: current.question, a: answer || "(No answer)" })
//     for (let i = currentQ + 1; i < questions.length; i++) {
//       base.push({ q: questions[i].question, a: "(Unanswered)" })
//     }

//     setStep("done")
//     setLoading(true)
//     try {
//       const result = await evaluateAnswersAI(base)
//       dispatch(
//         addCandidate({
//           id: Date.now().toString(),
//           name,
//           email,
//           phone,
//           answers: result.results,
//           finalScore: result.finalScore,
//           summary: result.summary,
//         })
//       )
//     } catch (err) {
//       console.error("Evaluation failed", err)
//     } finally {
//       setLoading(false)
//       dispatch(clearSession())
//     }
//   }, [answer, answers, currentQ, dispatch, email, name, phone, questions])

//   // Timer logic
//   useEffect(() => {
//     if (step !== "interview") return
//     if (timeLeft <= 0) {
//       handleSubmit()
//       return
//     }
//     const timer = setTimeout(() => {
//       setTimeLeft((t) => {
//         const next = t - 1
//         dispatch(updateSession({ timeLeft: next }))
//         return next
//       })
//     }, 1000)
//     return () => clearTimeout(timer)
//   }, [timeLeft, step, dispatch, handleSubmit])

//   // Proctoring: tab/app switches (3 warnings -> auto submit) with dedupe
// useEffect(() => {
//   if (step !== "interview") return

//   const penalizeOnce = () => {
//     setWarnings((prev) => {
//       const next = prev + 1
//       if (next <= 3) {
//         setWarnBanner(`Warning ${next}/3: Please keep this tab active.`)
//       } else if (next === 4) {
//         setWarnBanner("Limit reached. Submitting your test now…")
//         handleForceSubmit()
//       }
//       return next
//     })
//   }

//   const onVisibility = () => {
//     if (document.hidden) penalizeOnce()
//   }

//   document.addEventListener("visibilitychange", onVisibility)

//   return () => {
//     document.removeEventListener("visibilitychange", onVisibility)
//   }
// }, [step, handleForceSubmit])

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
//       {/* Resume Modal */}
//       <AnimatePresence>
//         {showResumeModal && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white p-8 rounded-xl shadow-2xl space-y-4 max-w-md w-full"
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//             >
//               <h3 className="text-2xl font-bold text-gray-800">Resume Interview?</h3>
//               <p className="text-gray-600">
//                 You had an unfinished interview. Do you want to continue where you left off?
//               </p>
//               <div className="flex gap-4 justify-end">
//                 <button
//                   className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
//                   onClick={() => {
//                     dispatch(clearSession())
//                     setShowResumeModal(false)
//                   }}
//                 >
//                   Start New
//                 </button>
//                 <button
//                   className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                   onClick={() => {
//                     setStep("interview")
//                     setShowResumeModal(false)
//                   }}
//                 >
//                   Continue
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Proctoring banner */}
//       <AnimatePresence>
//         {step === "interview" && warnBanner && (
//           <motion.div
//             className="sticky top-0 z-30 w-full bg-yellow-100 text-yellow-900 border border-yellow-300 px-4 py-2 text-center"
//             initial={{ y: -50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -50, opacity: 0 }}
//           >
//             {warnBanner}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <main className="flex-1 p-8">
//         {/* Step 1: Candidate Info */}
//         {step === "details" && (
//           <motion.div
//             className="space-y-10 max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-md"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="text-center space-y-2">
//               <h1 className="text-4xl font-bold text-gray-900">Welcome to Your Assessment</h1>
//               <p className="text-gray-600 text-lg">
//                 Please upload your resume and confirm your details to begin.
//               </p>
//             </div>

//             {/* Resume Upload */}
//             <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl p-10 text-center hover:bg-blue-100 transition cursor-pointer">
//               <label className="flex flex-col items-center justify-center cursor-pointer">
//                 <svg
//                   className="w-14 h-14 text-blue-600 mb-3"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4h10v12h4l-9 7-9-7h4z" />
//                 </svg>
//                 <span className="text-blue-700 font-medium text-lg">
//                   {file ? file.name : "Click to upload your resume (.pdf, .docx)"}
//                 </span>
//                 <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
//               </label>
//               {loading && <p className="mt-2 text-gray-500 italic">Extracting info from your resume...</p>}
//             </div>

//             {/* Inputs */}
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
//                 <input
//                   className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Enter your full name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
//                 <input
//                   className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
//                 <input
//                   className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder="Enter your phone number"
//                 />
//               </div>
//             </div>

//             {error && <p className="text-red-600 font-medium">{error}</p>}

//             <div className="text-center">
//               <button
//                 onClick={handleStart}
//                 className="px-10 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg shadow-md hover:bg-green-700 transition"
//               >
//                 {loading ? "Preparing Questions..." : "Start Interview"}
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {/* Step 2: Interview */}
//         {step === "interview" && (
//           <motion.div
//             className="space-y-8 max-w-4xl mx-auto"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.4 }}
//           >
//             <div className="sticky top-0 bg-white py-3 px-4 shadow flex justify-between items-center rounded-md z-20">
//               <span className="text-gray-700 font-medium">Question {currentQ + 1} of {questions.length}</span>
//               <span className="font-semibold text-red-600">{timeLeft}s left</span>
//             </div>

//             <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//               <motion.div
//                 className="bg-gradient-to-r from-green-500 to-blue-600 h-2"
//                 initial={{ width: "100%" }}
//                 animate={{ width: `${(timeLeft / questions[currentQ].time) * 100}%` }}
//                 transition={{ ease: "linear", duration: 1 }}
//               />
//             </div>

//             {/* Question (copy disabled) */}
//             <motion.div
//               key={currentQ}
//               className="space-y-6 bg-white p-8 rounded-xl shadow-md select-none"
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4 }}
//               draggable={false}
//               onCopy={(e) => e.preventDefault()}
//               onContextMenu={(e) => e.preventDefault()}
//               onDragStart={(e) => e.preventDefault()}
//             >
//               <h2 className="text-2xl font-semibold text-gray-900">
//                 Q{currentQ + 1}: {questions[currentQ].question}
//               </h2>

//               {/* Answer box (copy/paste/cut/drop disabled) */}
//               <textarea
//                 value={answer}
//                 onChange={(e) => setAnswer(e.target.value)}
//                 onPaste={(e) => e.preventDefault()}
//                 onCopy={(e) => e.preventDefault()}
//                 onCut={(e) => e.preventDefault()}
//                 onDrop={(e) => e.preventDefault()}
//                 onContextMenu={(e) => e.preventDefault()}
//                 className="border rounded-lg w-full p-4 shadow-sm focus:ring-2 focus:ring-blue-500"
//                 rows={6}
//                 placeholder="Type your answer here..."
//               />

//               <button
//                 onClick={handleSubmit}
//                 className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-medium"
//               >
//                 Submit Answer
//               </button>
//             </motion.div>
//           </motion.div>
//         )}

//         {/* Step 3: Done */}
//         {step === "done" && (
//           <motion.div
//             className="text-center space-y-6 max-w-2xl mx-auto bg-white p-10 rounded-xl shadow-md"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.4 }}
//           >
//             <h3 className="text-3xl font-bold text-green-600">Interview Finished 🎉</h3>
//             {loading ? (
//               <p className="text-gray-500">Evaluating answers...</p>
//             ) : (
//               <p className="text-gray-700 text-lg">Your results have been submitted successfully.</p>
//             )}
//           </motion.div>
//         )}
//       </main>
//     </div>
//   )
// }

// export default Interviewee


import { useState, useEffect, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { addCandidate } from "../app/slices/candidateSlice"
import { extractTextFromFile, extractFieldsWithAI } from "../utils/parseResume"
import { generateQuestionsAI, evaluateAnswersAI } from "../utils/interviewAI"
import { startSession, updateSession, clearSession } from "../app/slices/sessionSlice"
import type { RootState } from "../app/store"

function Interviewee() {
  const dispatch = useDispatch()
  const session = useSelector((state: RootState) => state.session)
  const warnings = session.warnings

  const [showResumeModal, setShowResumeModal] = useState(false)
  const [step, setStep] = useState<"details" | "interview" | "done">("details")

  // Candidate info
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState(session.name || "")
  const [email, setEmail] = useState(session.email || "")
  const [phone, setPhone] = useState(session.phone || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Interview state
  const [questions, setQuestions] = useState<any[]>(session.questions || [])
  const [currentQ, setCurrentQ] = useState(session.currentQ || 0)
  const [timeLeft, setTimeLeft] = useState(session.timeLeft || 0)
  const [answer, setAnswer] = useState("")
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>(session.answers || [])

  // Warning modal
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningMsg, setWarningMsg] = useState("")

  const lastPenaltyRef = useRef(0)
  const PENALTY_COOLDOWN_MS = 1000 // avoid double triggers

  // Resume session check
  useEffect(() => {
    if (session.inProgress && step === "details") setShowResumeModal(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // File upload + parse
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploaded = e.target.files[0]
      if (!uploaded.name.endsWith(".pdf") && !uploaded.name.endsWith(".docx")) {
        setError("Invalid file type. Please upload a PDF or DOCX.")
        return
      }

      setFile(uploaded)
      setError("")
      setLoading(true)

      try {
        const text = await extractTextFromFile(uploaded)
        const fields = await extractFieldsWithAI(text)
        if (fields.name) setName(fields.name)
        if (fields.email) setEmail(fields.email)
        if (fields.phone) setPhone(fields.phone)
      } catch (err) {
        console.error("Error parsing resume", err)
        setError("Failed to extract info from resume. Please enter details manually.")
      } finally {
        setLoading(false)
      }
    }
  }

  // Start Interview
  const handleStart = async () => {
    if (!name || !email || !phone) {
      setError("Please complete all fields before starting.")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Invalid email format.")
      return
    }
    const cleanedPhone = phone.replace(/[^\d]/g, "")
    if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
      setError("Invalid phone number. Please enter a valid international number.")
      return
    }

    setError("")
    setLoading(true)
    try {
      const qs = await generateQuestionsAI()
      setQuestions(qs)
      setStep("interview")
      setCurrentQ(0)
      setTimeLeft(qs[0].time)

      dispatch(
        startSession({
          name,
          email,
          phone,
          questions: qs,
          currentQ: 0,
          timeLeft: qs[0].time,
          answers: [],
          warnings: 0,
        })
      )
    } catch (err) {
      console.error("Question generation failed", err)
      setError("Could not generate questions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Submit current Q
  const handleSubmit = useCallback(async () => {
    const q = questions[currentQ]
    if (!q) return
    const updatedAnswers = [...answers, { q: q.question, a: answer || "(No answer)" }]
    setAnswers(updatedAnswers)
    setAnswer("")

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1)
      const nextTime = questions[currentQ + 1].time
      setTimeLeft(nextTime)
      dispatch(
        updateSession({
          answers: updatedAnswers,
          currentQ: currentQ + 1,
          timeLeft: nextTime,
        })
      )
    } else {
      setStep("done")
      setLoading(true)
      try {
        const result = await evaluateAnswersAI(updatedAnswers)
        dispatch(
          addCandidate({
            id: Date.now().toString(),
            name,
            email,
            phone,
            answers: result.results,
            finalScore: result.finalScore,
            summary: result.summary,
          })
        )
      } catch (err) {
        console.error("Evaluation failed", err)
      } finally {
        setLoading(false)
        dispatch(clearSession())
      }
    }
  }, [answer, answers, currentQ, dispatch, email, name, phone, questions])

  // Force submit after 3 warnings
  const handleForceSubmit = useCallback(async () => {
    const base = [...answers]
    const current = questions[currentQ]
    if (current) base.push({ q: current.question, a: answer || "(No answer)" })
    for (let i = currentQ + 1; i < questions.length; i++) {
      base.push({ q: questions[i].question, a: "(Unanswered)" })
    }

    setStep("done")
    setLoading(true)
    try {
      const result = await evaluateAnswersAI(base)
      dispatch(
        addCandidate({
          id: Date.now().toString(),
          name,
          email,
          phone,
          answers: result.results,
          finalScore: result.finalScore,
          summary: result.summary,
        })
      )
    } catch (err) {
      console.error("Evaluation failed", err)
    } finally {
      setLoading(false)
      dispatch(clearSession())
    }
  }, [answer, answers, currentQ, dispatch, email, name, phone, questions])

  // Timer
  useEffect(() => {
    if (step !== "interview") return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setTimeout(() => {
      setTimeLeft((t) => {
        const next = t - 1
        dispatch(updateSession({ timeLeft: next }))
        return next
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, step, dispatch])

  // Proctoring
  useEffect(() => {
    if (step !== "interview") return

    const penalizeOnce = () => {
      const now = Date.now()
      if (now - lastPenaltyRef.current < PENALTY_COOLDOWN_MS) return
      lastPenaltyRef.current = now

      const updated = warnings + 1
      dispatch(updateSession({ warnings: updated }))

      if (updated <= 3) {
        setWarningMsg(`Warning ${updated}/3: Please keep this tab active.`)
        setShowWarningModal(true)
      } else if (updated === 4) {
        setWarningMsg("Limit reached. Submitting your test now…")
        setShowWarningModal(true)
        handleForceSubmit()
      }
    }

    const onVisibility = () => {
      if (document.hidden) penalizeOnce()
    }

    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [step, warnings, dispatch, handleForceSubmit])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Resume Modal */}
      <AnimatePresence>
        {showResumeModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-2xl space-y-4 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-gray-800">Resume Interview?</h3>
              <p className="text-gray-600">
                You had an unfinished interview. Do you want to continue where you left off?
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  onClick={() => {
                    dispatch(clearSession())
                    setShowResumeModal(false)
                  }}
                >
                  Start New
                </button>
                <button
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={() => {
                    setStep("interview")
                    setShowResumeModal(false)
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Dialog */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center space-y-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-xl font-bold text-red-600">⚠️ Warning</h3>
              <p className="text-gray-700">{warningMsg}</p>
              {warnings <= 3 && (
                <button
                  className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => setShowWarningModal(false)}
                >
                  Continue Interview
                </button>
              )}
              {warnings > 3 && (
                <button
                  className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => setShowWarningModal(false)}
                >
                  Finish Interview
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-8">
        {/* Step 1: Candidate Info */}
        {step === "details" && (
          <motion.div
            className="space-y-10 max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">Welcome to Your Assessment</h1>
              <p className="text-gray-600 text-lg">
                Please upload your resume and confirm your details to begin.
              </p>
            </div>
            {/* Resume Upload */}
            <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl p-10 text-center hover:bg-blue-100 transition cursor-pointer">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <svg
                  className="w-14 h-14 text-blue-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4h10v12h4l-9 7-9-7h4z" />
                </svg>
                <span className="text-blue-700 font-medium text-lg">
                  {file ? file.name : "Click to upload your resume (.pdf, .docx)"}
                </span>
                <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
              </label>
              {loading && <p className="mt-2 text-gray-500 italic">Extracting info from your resume...</p>}
            </div>
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  className="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            {error && <p className="text-red-600 font-medium">{error}</p>}
            <div className="text-center">
              <button
                onClick={handleStart}
                className="px-10 py-3 bg-green-600 text-white rounded-lg font-semibold text-lg shadow-md hover:bg-green-700 transition"
              >
                {loading ? "Preparing Questions..." : "Start Interview"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Interview */}
        {step === "interview" && (
          <motion.div
            className="space-y-8 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="sticky top-0 bg-white py-3 px-4 shadow flex justify-between items-center rounded-md z-20">
              <span className="text-gray-700 font-medium">Question {currentQ + 1} of {questions.length}</span>
              <span className="font-semibold text-red-600">{timeLeft}s left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-blue-600 h-2"
                initial={{ width: "100%" }}
                animate={{ width: `${(timeLeft / questions[currentQ].time) * 100}%` }}
                transition={{ ease: "linear", duration: 1 }}
              />
            </div>
            {/* Question */}
            <motion.div
              key={currentQ}
              className="space-y-6 bg-white p-8 rounded-xl shadow-md select-none"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              draggable={false}
              onCopy={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Q{currentQ + 1}: {questions[currentQ].question}
              </h2>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="border rounded-lg w-full p-4 shadow-sm focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Type your answer here..."
              />
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Submit Answer
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <motion.div
            className="text-center space-y-6 max-w-2xl mx-auto bg-white p-10 rounded-xl shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-3xl font-bold text-green-600">Interview Finished 🎉</h3>
            {loading ? (
              <p className="text-gray-500">Evaluating answers...</p>
            ) : (
              <p className="text-gray-700 text-lg">Your results have been submitted successfully.</p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default Interviewee
