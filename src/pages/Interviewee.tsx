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

// return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-sky-50">
//       {/* Resume Modal — light theme */}
//       <AnimatePresence>
//         {showResumeModal && (
//           <motion.div
//             className="fixed inset-0 z-50 grid place-items-center bg-black/20 backdrop-blur-sm"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="w-full max-w-lg rounded-2xl bg-white/95 border border-slate-200 shadow-2xl p-8"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//             >
//               <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Interview?</h3>
//               <p className="mt-2 text-slate-600 leading-relaxed">
//                 You had an unfinished interview. Do you want to continue where you left off?
//               </p>
//               <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
//                 <button
//                   className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
//                   onClick={() => {
//                     dispatch(clearSession());
//                     setShowResumeModal(false);
//                   }}
//                 >
//                   Start New
//                 </button>
//                 <button
//                   className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition shadow-sm"
//                   onClick={() => {
//                     setStep("interview");
//                     setShowResumeModal(false);
//                   }}
//                 >
//                   Continue
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Warning Dialog — light theme */}
//       <AnimatePresence>
//         {showWarningModal && (
//           <motion.div
//             className="fixed inset-0 z-50 grid place-items-center bg-black/20 backdrop-blur-sm"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="w-full max-w-sm rounded-2xl bg-white/95 border border-slate-200 p-6 shadow-xl text-center"
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//             >
//               <h3 className="text-xl font-bold text-amber-700">⚠️ Warning</h3>
//               <p className="mt-2 text-slate-700">{warningMsg}</p>

//               {warnings <= 3 && (
//                 <button
//                   className="mt-6 w-full px-5 py-2.5 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition shadow-sm"
//                   onClick={() => setShowWarningModal(false)}
//                 >
//                   Continue Interview
//                 </button>
//               )}

//               {warnings > 3 && (
//                 <button
//                   className="mt-6 w-full px-5 py-2.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 transition shadow-sm"
//                   onClick={() => setShowWarningModal(false)}
//                 >
//                   Finish Interview
//                 </button>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <main className="flex-1 p-6 sm:p-8">
//         {/* Step 1: Candidate Info — container switched to light card */}
//         {step === "details" && (
//           <motion.div
//             className="space-y-8 max-w-3xl mx-auto bg-white/95 p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-lg"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.45 }}
//           >
//             <div className="text-center space-y-2">
//               <h1 className="text-4xl font-bold text-slate-900">Welcome to Your Assessment</h1>
//               <p className="text-slate-600 text-lg">Please upload your resume and confirm your details to begin.</p>
//             </div>

//             {/* Resume Upload — REPLACED BOX with inline strip (no panel) */}
//             <div className="relative">
//               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//                 <div className="flex items-center gap-3">
//                   <div className="h-9 w-9 grid place-items-center rounded-full bg-cyan-50 ring-1 ring-cyan-200">
//                     <svg className="w-5 h-5 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M6 20h12a2 2 0 002-2V8.5A2.5 2.5 0 0017.5 6H15l-1.2-1.6A2 2 0 0012.25 3h-2.5a2 2 0 00-1.55.74L6 6H4.5" />
//                     </svg>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-slate-700">Attach your resume</p>
//                     <p className="text-xs text-slate-500">PDF or DOCX • Max 5 MB</p>
//                   </div>
//                 </div>

//                 <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 cursor-pointer transition">
//                   <span className="text-sm font-semibold">{file ? file.name : "Choose file"}</span>
//                   <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
//                 </label>

               
//               </div>

//               {/* subtle divider underline to suggest area without a box */}
//               <div className="mt-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
//               {loading && <p className="mt-2 text-slate-500 italic">Extracting info from your resume...</p>}
//             </div>

//             {/* Inputs */}
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
//                 <input
//                   className="border border-slate-300 bg-white text-slate-900 p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Enter your full name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
//                 <input
//                   className="border border-slate-300 bg-white text-slate-900 p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
//                 <input
//                   className="border border-slate-300 bg-white text-slate-900 p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder="Enter your phone number"
//                 />
//               </div>
//             </div>

//             {error && <p className="text-rose-600 font-medium">{error}</p>}

//             <div className="text-center">
//               <button
//                 onClick={handleStart}
//                 className="px-10 py-3 bg-cyan-600 text-white rounded-lg font-semibold text-lg shadow-sm hover:bg-cyan-500 transition"
//               >
//                 {loading ? "Preparing Questions..." : "Start Interview"}
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {/* Step 2: Interview — light surfaces */}
//         {step === "interview" && (
//           <motion.div
//             className="space-y-8 max-w-4xl mx-auto"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.4 }}
//           >
//             {/* Sticky Header */}
//             <div className="sticky top-0 bg-white/95 border border-slate-200 py-3 px-4 rounded-md shadow-sm z-20 backdrop-blur-sm flex justify-between items-center">
//               <span className="text-slate-700 font-medium">
//                 Question {currentQ + 1} of {questions.length}
//               </span>
//               <span className="font-semibold text-rose-600">{timeLeft}s left</span>
//             </div>

//             {/* Progress Bar */}
//             <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-200">
//               <motion.div
//                 className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 h-2"
//                 initial={{ width: "100%" }}
//                 animate={{ width: `${(timeLeft / questions[currentQ].time) * 100}%` }}
//                 transition={{ ease: "linear", duration: 1 }}
//               />
//             </div>

//             {/* Question Card */}
//             <motion.div
//               key={currentQ}
//               className="space-y-6 bg-white/95 border border-slate-200 p-8 rounded-xl shadow-lg select-none"
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4 }}
//               draggable={false}
//               onCopy={(e) => e.preventDefault()}
//               onContextMenu={(e) => e.preventDefault()}
//               onDragStart={(e) => e.preventDefault()}
//             >
//               <h2 className="text-2xl font-semibold text-slate-900">
//                 Q{currentQ + 1}: <span className="text-cyan-700">{questions[currentQ].question}</span>
//               </h2>

//               <textarea
//                 value={answer}
//                 onChange={(e) => setAnswer(e.target.value)}
//                 onPaste={(e) => e.preventDefault()}
//                 onCopy={(e) => e.preventDefault()}
//                 onCut={(e) => e.preventDefault()}
//                 onDrop={(e) => e.preventDefault()}
//                 onContextMenu={(e) => e.preventDefault()}
//                 className="border border-slate-300 bg-white text-slate-900 rounded-lg w-full p-4 focus:ring-2 focus:ring-cyan-500 placeholder-slate-400"
//                 rows={6}
//                 placeholder="Type your answer here..."
//               />

//               <button
//                 onClick={handleSubmit}
//                 className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-500 transition font-semibold shadow-sm"
//               >
//                 Submit Answer
//               </button>
//             </motion.div>
//           </motion.div>
//         )}

//         {/* Step 3: Done — light success card */}
//         {step === "done" && (
//           <motion.div
//             className="flex items-center justify-center min-h-[60vh] px-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <motion.div
//               className="text-center space-y-6 max-w-lg w-full bg-white/95 border border-slate-200 p-12 rounded-2xl shadow-xl"
//               initial={{ scale: 0.98, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.5 }}
//             >
//               <div className="flex justify-center">
//                 <div className="h-20 w-20 grid place-items-center rounded-full bg-cyan-50 ring-1 ring-cyan-200 text-4xl">
//                   🎉
//                 </div>
//               </div>
//               <h3 className="text-4xl font-extrabold text-slate-900">Interview Finished</h3>
//               {loading ? (
//                 <p className="text-slate-600 italic text-lg">Evaluating answers...</p>
//               ) : (
//                 <p className="text-slate-700 text-lg">Your results have been submitted successfully. Thank you for completing the assessment!</p>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </main>
//     </div>
//   );
return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-100 via-white to-indigo-100">
    {/* Resume Modal */}
    <AnimatePresence>
      {showResumeModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-10 border border-indigo-100"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
          >
            <h3 className="text-3xl font-extrabold text-indigo-900">Resume Interview?</h3>
            <p className="mt-3 text-slate-600 leading-relaxed">
              You have a saved session from before. Would you like to continue or start fresh?
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-end">
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium"
                onClick={() => {
                  dispatch(clearSession());
                  setShowResumeModal(false);
                }}
              >
                Start New
              </button>
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition shadow-md"
                onClick={() => {
                  setStep("interview");
                  setShowResumeModal(false);
                }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Warning Modal */}
    <AnimatePresence>
      {showWarningModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl text-center border border-amber-100"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h3 className="text-xl font-bold text-amber-700 flex items-center justify-center gap-2">
              ⚠️ Warning
            </h3>
            <p className="mt-3 text-slate-700">{warningMsg}</p>

            {warnings <= 3 ? (
              <button
                className="mt-6 w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition shadow-md"
                onClick={() => setShowWarningModal(false)}
              >
                Continue Interview
              </button>
            ) : (
              <button
                className="mt-6 w-full px-6 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-500 transition shadow-md"
                onClick={() => setShowWarningModal(false)}
              >
                Finish Interview
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <main className="flex-1 p-6 sm:p-10">
      {/* Step 1: Candidate Info */}
      {step === "details" && (
        <motion.div
          className="space-y-10 max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 sm:p-14"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-extrabold text-indigo-900">Start Your Assessment</h1>
            <p className="text-slate-600 text-lg">Upload your resume and confirm details to begin.</p>
          </div>

          {/* Resume Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-200">
                <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16V8m0 0l-3 3m3-3l3 3M6 20h12a2 2 0 002-2V8.5A2.5 2.5 0 0017.5 6H15l-1.2-1.6A2 2 0 0012.25 3h-2.5a2 2 0 00-1.55.74L6 6H4.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Attach Resume</p>
                <p className="text-xs text-slate-500">PDF or DOCX • Max 5 MB</p>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 cursor-pointer font-medium transition">
              <span>{file ? file.name : "Choose File"}</span>
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {loading && <p className="mt-2 text-slate-500 italic">Extracting info from resume...</p>}

          {/* Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                className="border border-slate-300 bg-white text-slate-900 px-4 py-3 rounded-xl w-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                className="border border-slate-300 bg-white text-slate-900 px-4 py-3 rounded-xl w-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
              <input
                className="border border-slate-300 bg-white text-slate-900 px-4 py-3 rounded-xl w-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {error && <p className="text-rose-600 font-medium">{error}</p>}

          <div className="text-center">
            <button
              onClick={handleStart}
              className="px-12 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-lg shadow-md hover:bg-indigo-500 transition"
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
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white/95 border border-slate-200 py-3 px-5 rounded-lg shadow-md z-20 backdrop-blur-md flex justify-between items-center">
            <span className="text-slate-700 font-medium">
              Question {currentQ + 1} of {questions.length}
            </span>
            <span className="font-bold text-indigo-600">{timeLeft}s</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-400 h-2"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / questions[currentQ].time) * 100}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQ}
            className="space-y-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-lg select-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Q{currentQ + 1}:{" "}
              <span className="text-indigo-700">{questions[currentQ].question}</span>
            </h2>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              className="border border-slate-300 bg-slate-50 text-slate-900 rounded-xl w-full p-4 focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              rows={6}
              placeholder="Write your answer here..."
            />

            <button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-10 py-3 rounded-xl hover:bg-indigo-500 transition font-semibold shadow-md"
            >
              Submit Answer
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Step 3: Done */}
      {step === "done" && (
        <motion.div
          className="flex items-center justify-center min-h-[60vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-center space-y-6 max-w-lg w-full bg-white p-12 rounded-3xl shadow-2xl border border-slate-100"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center">
              <div className="h-24 w-24 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-200 text-5xl">
                🎉
              </div>
            </div>
            <h3 className="text-4xl font-extrabold text-indigo-900">Interview Complete</h3>
            {loading ? (
              <p className="text-slate-600 italic text-lg">Evaluating your answers...</p>
            ) : (
              <p className="text-slate-700 text-lg">
                Your responses were submitted successfully. Thank you for completing the assessment!
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </main>
  </div>
);

}


export default Interviewee