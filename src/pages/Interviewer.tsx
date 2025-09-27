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

//   return (
    // <div className="p-6 min-h-screen bg-gray-50">
    //   <h2 className="text-2xl font-bold text-[--color-primary] mb-6">
    //     Interviewer Dashboard
    //   </h2>


    //   {!selected && (
    //     <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
    //       <input
    //         type="text"
    //         placeholder="Search by name or email..."
    //         value={search}
    //         onChange={e => setSearch(e.target.value)}
    //         className="border p-2 rounded w-full md:w-1/2"
    //       />
    //       <select
    //         value={sortBy}
    //         onChange={e => setSortBy(e.target.value as "name" | "score")}
    //         className="border p-2 rounded"
    //       >
    //         <option value="score">Sort by Score</option>
    //         <option value="name">Sort by Name</option>
    //       </select>
    //     </div>
    //   )}


    //   {!selected && (
    //     <div className="grid md:grid-cols-2 gap-6">
    //       <AnimatePresence>
    //         {filtered.length === 0 ? (
    //           <p className="text-gray-500">No candidates found.</p>
    //         ) : (
    //           filtered.map(c => (
    //             <motion.div
    //               key={c.id}
    //               layout
    //               initial={{ opacity: 0, y: 20 }}
    //               animate={{ opacity: 1, y: 0 }}
    //               exit={{ opacity: 0 }}
    //               className="p-6 border rounded-xl shadow bg-white cursor-pointer hover:shadow-lg transition"
    //               onClick={() => setSelectedId(c.id)}
    //             >
    //               <h3 className="text-lg font-semibold">{c.name}</h3>
    //               <p className="text-gray-600">{c.email}</p>
    //               <p className="mt-2 text-sm">
    //                 <span className="font-bold">Score:</span>{" "}
    //                 {c.finalScore ?? "Pending"}
    //               </p>
    //               <p className="text-sm text-gray-700 mt-1 line-clamp-2">
    //                 {c.summary ?? "No summary yet"}
    //               </p>
    //             </motion.div>
    //           ))
    //         )}
    //       </AnimatePresence>
    //     </div>
    //   )}


    //   {selected && selected.answers && (
    //     <motion.div
    //       initial={{ opacity: 0 }}
    //       animate={{ opacity: 1 }}
    //       className="bg-white p-6 rounded-xl shadow space-y-6"
    //     >
    //       <button
    //         className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    //         onClick={() => setSelectedId(null)}
    //       >
    //         ← Back to Dashboard
    //       </button>

    //       <div>
    //         <h3 className="text-xl font-bold">{selected.name} — Interview</h3>
    //         <p className="text-sm text-gray-600">Email: {selected.email}</p>
    //         <p className="text-sm text-gray-600">Score: {selected.finalScore}</p>
    //         <p className="text-sm text-gray-600 mb-4">
    //           Summary: {selected.summary}
    //         </p>
    //       </div>

    
    //       <div className="space-y-6">
    //         {selected.answers.map((a: any, i: number) => (
    //           <motion.div
    //             key={i}
    //             initial={{ opacity: 0, x: -30 }}
    //             animate={{ opacity: 1, x: 0 }}
    //             transition={{ delay: i * 0.1 }}
    //             className="space-y-3"
    //           >

    //             <div className="flex items-start">
    //               <div className="bg-gray-200 text-black rounded-xl px-4 py-2 max-w-[70%]">
    //                 <strong>Q{i + 1}:</strong> {a.question}
    //               </div>
    //             </div>


    //             <div className="flex justify-end">
    //               <div className="bg-blue-600 text-white rounded-xl px-4 py-2 max-w-[70%]">
    //                 {a.answer}
    //               </div>
    //             </div>

   
    //             {a.remark && (
    //               <div className="flex items-start">
    //                 <div className="bg-green-100 text-black rounded-xl px-4 py-2 max-w-[70%]">
    //                   <strong>Remark:</strong> {a.remark} (Score: {a.score}/10)
    //                 </div>
    //               </div>
    //             )}
    //           </motion.div>
    //         ))}
    //       </div>
    //     </motion.div>
    //   )}
    // </div>
//     <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-gray-200">
//   <h2 className="text-3xl font-bold text-cyan-400 mb-8 drop-shadow">
//     Interviewer Dashboard
//   </h2>

//   {/* Search + Sort */}
//   {!selected && (
//     <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8">
//       <input
//         type="text"
//         placeholder="Search by name or email..."
//         value={search}
//         onChange={e => setSearch(e.target.value)}
//         className="border border-gray-700 bg-gray-800 text-gray-200 p-3 rounded-lg w-full md:w-1/2 focus:ring-2 focus:ring-cyan-500"
//       />
//       <select
//         value={sortBy}
//         onChange={e => setSortBy(e.target.value as "name" | "score")}
//         className="border border-gray-700 bg-gray-800 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500"
//       >
//         <option value="score">Sort by Score</option>
//         <option value="name">Sort by Name</option>
//       </select>
//     </div>
//   )}

//   {/* Candidate list */}
//   {!selected && (
//     <div className="grid md:grid-cols-2 gap-6">
//       <AnimatePresence>
//         {filtered.length === 0 ? (
//           <p className="text-gray-400">No candidates found.</p>
//         ) : (
//           filtered.map(c => (
//             <motion.div
//               key={c.id}
//               layout
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="p-6 border border-gray-800 rounded-2xl bg-gray-900/80 shadow-[0_0_25px_rgba(0,255,255,0.15)] cursor-pointer hover:shadow-[0_0_35px_rgba(0,255,255,0.25)] transition"
//               onClick={() => setSelectedId(c.id)}
//             >
//               <h3 className="text-lg font-semibold text-white">{c.name}</h3>
//               <p className="text-gray-400">{c.email}</p>
//               <p className="mt-2 text-sm">
//                 <span className="font-bold text-cyan-300">Score:</span>{" "}
//                 {c.finalScore ?? "Pending"}
//               </p>
//               <p className="text-sm text-gray-300 mt-1 line-clamp-2">
//                 {c.summary ?? "No summary yet"}
//               </p>
//             </motion.div>
//           ))
//         )}
//       </AnimatePresence>
//     </div>
//   )}

//   {/* Candidate chat view */}
//   {selected && selected.answers && (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="bg-gray-900/90 border border-gray-800 p-8 rounded-2xl shadow-[0_0_35px_rgba(0,255,255,0.2)] space-y-8"
//     >
//       <button
//         className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition text-gray-300"
//         onClick={() => setSelectedId(null)}
//       >
//         ← Back to Dashboard
//       </button>

//       <div>
//         <h3 className="text-2xl font-bold text-white">
//           {selected.name} — <span className="text-cyan-400">Interview</span>
//         </h3>
//         <p className="text-sm text-gray-400">Email: {selected.email}</p>
//         <p className="text-sm text-gray-400">Score: {selected.finalScore}</p>
//         <p className="text-sm text-gray-400 mt-1">
//           Summary: {selected.summary}
//         </p>
//       </div>

//       {/* Chat bubbles */}
//       <div className="space-y-6">
//         {selected.answers.map((a: any, i: number) => (
//           <motion.div
//             key={i}
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: i * 0.1 }}
//             className="space-y-3"
//           >
//             {/* Interviewer bubble */}
//             <div className="flex items-start">
//               <div className="bg-gray-800 text-gray-200 border border-gray-700 rounded-xl px-4 py-3 max-w-[70%] shadow-sm">
//                 <strong className="text-cyan-300">Q{i + 1}:</strong> {a.question}
//               </div>
//             </div>

//             {/* Candidate bubble */}
//             <div className="flex justify-end">
//               <div className="bg-cyan-500 text-black font-medium rounded-xl px-4 py-3 max-w-[70%] shadow-[0_0_12px_rgba(0,255,255,0.4)]">
//                 {a.answer}
//               </div>
//             </div>

//             {/* Remark bubble */}
//             {a.remark && (
//               <div className="flex items-start">
//                 <div className="bg-green-500/20 text-green-300 border border-green-500/40 rounded-xl px-4 py-3 max-w-[70%] shadow-[0_0_12px_rgba(0,255,0,0.3)]">
//                   <strong>Remark:</strong> {a.remark}{" "}
//                   <span className="text-sm">(Score: {a.score}/10)</span>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         ))}
//       </div>
//     </motion.div>
//   )}
// </div>

//   )
// }

return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-800">
      <h2 className="text-3xl font-bold text-cyan-700 mb-8 drop-shadow-sm">
        Interviewer Dashboard
      </h2>

      {/* Search + Sort */}
      {!selected && (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 bg-white text-slate-800 p-3 rounded-lg w-full md:w-1/2 focus:ring-2 focus:ring-cyan-500"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as "name" | "score")}
            className="border border-slate-300 bg-white text-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500"
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
              <p className="text-slate-500">No candidates found.</p>
            ) : (
              filtered.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 border border-slate-200 rounded-2xl bg-white/95 shadow-sm hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedId(c.id)}
                >
                  <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
                  <p className="text-slate-600">{c.email}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-bold text-cyan-700">Score:</span>{" "}
                    {c.finalScore ?? "Pending"}
                  </p>
                  <p className="text-sm text-slate-700 mt-1 line-clamp-2">
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/95 border border-slate-200 p-8 rounded-2xl shadow-lg space-y-8"
        >
          <button
            className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition text-slate-700"
            onClick={() => setSelectedId(null)}
          >
            ← Back to Dashboard
          </button>

          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {selected.name} — <span className="text-cyan-700">Interview</span>
            </h3>
            <p className="text-sm text-slate-600">Email: {selected.email}</p>
            <p className="text-sm text-slate-600">Score: {selected.finalScore}</p>
            <p className="text-sm text-slate-600 mt-1">
              Summary: {selected.summary}
            </p>
          </div>

          {/* Chat bubbles */}
          <div className="space-y-6">
            {selected.answers.map((a:any, i:number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3"
              >
                {/* Interviewer bubble */}
                <div className="flex items-start">
                  <div className="bg-slate-100 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 max-w-[70%] shadow-sm">
                    <strong className="text-cyan-700">Q{i + 1}:</strong> {a.question}
                  </div>
                </div>

                {/* Candidate bubble */}
                <div className="flex justify-end">
                  <div className="bg-cyan-600 text-white font-medium rounded-xl px-4 py-3 max-w-[70%] shadow-sm">
                    {a.answer}
                  </div>
                </div>

                {/* Remark bubble */}
                {a.remark && (
                  <div className="flex items-start">
                    <div className="bg-green-50 text-green-800 border border-green-200 rounded-xl px-4 py-3 max-w-[70%] shadow-sm">
                      <strong>Remark:</strong> {a.remark}{" "}
                      <span className="text-sm">(Score: {a.score}/10)</span>
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
