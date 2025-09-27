import { useSelector } from "react-redux"
import type { RootState } from "../app/store"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

function Interviewer() {
  const candidates = useSelector((state: RootState) => state.candidates.list) || []
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "score">("score")

  const filtered = [...candidates]
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return (b.finalScore || 0) - (a.finalScore || 0) // score desc
    })

  const selected = candidates.find(c => c.id === selectedId)

// return (
//     <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-800">
//       <h2 className="text-3xl font-bold text-cyan-700 mb-8 drop-shadow-sm">
//         Interviewer Dashboard
//       </h2>

//       {/* Search + Sort */}
//       {!selected && (
//         <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8">
//           <input
//             type="text"
//             placeholder="Search by name or email..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="border border-slate-300 bg-white text-slate-800 p-3 rounded-lg w-full md:w-1/2 focus:ring-2 focus:ring-cyan-500"
//           />
//           <select
//             value={sortBy}
//             onChange={e => setSortBy(e.target.value as "name" | "score")}
//             className="border border-slate-300 bg-white text-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500"
//           >
//             <option value="score">Sort by Score</option>
//             <option value="name">Sort by Name</option>
//           </select>
//         </div>
//       )}

//       {/* Candidate list */}
//       {!selected && (
//         <div className="grid md:grid-cols-2 gap-6">
//           <AnimatePresence>
//             {filtered.length === 0 ? (
//               <p className="text-slate-500">No candidates found.</p>
//             ) : (
//               filtered.map((c) => (
//                 <motion.div
//                   key={c.id}
//                   layout
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="p-6 border border-slate-200 rounded-2xl bg-white/95 shadow-sm hover:shadow-lg transition cursor-pointer"
//                   onClick={() => setSelectedId(c.id)}
//                 >
//                   <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
//                   <p className="text-slate-600">{c.email}</p>
//                   <p className="mt-2 text-sm">
//                     <span className="font-bold text-cyan-700">Score:</span>{" "}
//                     {c.finalScore ?? "Pending"}
//                   </p>
//                   <p className="text-sm text-slate-700 mt-1 line-clamp-2">
//                     {c.summary ?? "No summary yet"}
//                   </p>
//                 </motion.div>
//               ))
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Candidate chat view */}
//       {selected && selected.answers && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="bg-white/95 border border-slate-200 p-8 rounded-2xl shadow-lg space-y-8"
//         >
//           <button
//             className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition text-slate-700"
//             onClick={() => setSelectedId(null)}
//           >
//             ← Back to Dashboard
//           </button>

//           <div>
//             <h3 className="text-2xl font-bold text-slate-900">
//               {selected.name} — <span className="text-cyan-700">Interview</span>
//             </h3>
//             <p className="text-sm text-slate-600">Email: {selected.email}</p>
//             <p className="text-sm text-slate-600">Score: {selected.finalScore}</p>
//             <p className="text-sm text-slate-600 mt-1">
//               Summary: {selected.summary}
//             </p>
//           </div>

//           {/* Chat bubbles */}
//           <div className="space-y-6">
//             {selected.answers.map((a:any, i:number) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, x: -30 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: i * 0.1 }}
//                 className="space-y-3"
//               >
//                 {/* Interviewer bubble */}
//                 <div className="flex items-start">
//                   <div className="bg-slate-100 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 max-w-[70%] shadow-sm">
//                     <strong className="text-cyan-700">Q{i + 1}:</strong> {a.question}
//                   </div>
//                 </div>

//                 {/* Candidate bubble */}
//                 <div className="flex justify-end">
//                   <div className="bg-cyan-600 text-white font-medium rounded-xl px-4 py-3 max-w-[70%] shadow-sm">
//                     {a.answer}
//                   </div>
//                 </div>

//                 {/* Remark bubble */}
//                 {a.remark && (
//                   <div className="flex items-start">
//                     <div className="bg-green-50 text-green-800 border border-green-200 rounded-xl px-4 py-3 max-w-[70%] shadow-sm">
//                       <strong>Remark:</strong> {a.remark}{" "}
//                       <span className="text-sm">(Score: {a.score}/10)</span>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
return (
  <div className="p-8 min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 text-slate-800">
    <h2 className="text-4xl font-extrabold text-indigo-900 mb-10 drop-shadow-sm">
      Interviewer Dashboard
    </h2>

    {/* Search + Sort */}
    {!selected && (
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-10">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 bg-white px-4 py-3 rounded-xl w-full md:w-1/2 focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "score")}
          className="border border-slate-300 bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="score">Sort by Score</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>
    )}

    {/* Candidate list */}
    {!selected && (
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <p className="text-slate-500 italic">No candidates found.</p>
          ) : (
            filtered.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 border border-slate-200 rounded-2xl bg-white shadow-md hover:shadow-xl transition cursor-pointer"
                onClick={() => setSelectedId(c.id)}
              >
                <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                <p className="text-slate-600">{c.email}</p>
                <p className="mt-3 text-sm">
                  <span className="font-semibold text-indigo-600">Score:</span>{" "}
                  {c.finalScore ?? "Pending"}
                </p>
                <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                  {c.summary ?? "No summary yet"}
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    )}

    {/* Candidate chat view */}
    {selected && selected.answers && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 p-10 rounded-3xl shadow-2xl space-y-8"
      >
        <button
          className="px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition text-slate-700 font-medium"
          onClick={() => setSelectedId(null)}
        >
          ← Back to Dashboard
        </button>

        <div className="space-y-1">
          <h3 className="text-2xl font-extrabold text-indigo-900">
            {selected.name} — <span className="text-indigo-600">Interview</span>
          </h3>
          <p className="text-sm text-slate-600">Email: {selected.email}</p>
          <p className="text-sm text-slate-600">Score: {selected.finalScore}</p>
          <p className="text-sm text-slate-600">Summary: {selected.summary}</p>
        </div>

        {/* Chat bubbles */}
        <div className="space-y-8">
          {selected.answers.map((a: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="space-y-3"
            >
              {/* Interviewer bubble */}
              <div className="flex items-start">
                <div className="bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl px-5 py-3 max-w-[70%] shadow-sm">
                  <strong className="text-indigo-700">Q{i + 1}:</strong> {a.question}
                </div>
              </div>

              {/* Candidate bubble */}
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white rounded-2xl px-5 py-3 max-w-[70%] shadow-md font-medium">
                  {a.answer}
                </div>
              </div>

              {/* Remark bubble */}
              {a.remark && (
                <div className="flex items-start">
                  <div className="bg-green-50 text-green-800 border border-green-200 rounded-2xl px-5 py-3 max-w-[70%] shadow-sm">
                    <strong>Remark:</strong> {a.remark}{" "}
                    <span className="text-sm text-slate-600">(Score: {a.score}/10)</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    )}
  </div>
);

}

export default Interviewer
