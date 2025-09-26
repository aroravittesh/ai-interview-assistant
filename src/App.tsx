import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import Interviewee from "./pages/Interviewee"
import Interviewer from "./pages/Interviewer"
import type { RootState } from "./app/store"

function Navbar() {
  const location = useLocation()
  const session = useSelector((state: RootState) => state.session)

  const navItems = [
    { path: "/", label: "Interviewee" },
    { path: "/interviewer", label: "Interviewer" },
  ]

  return (
    // <nav className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
    //   <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">

    //     <h1 className="text-lg font-bold tracking-wide">FlexHire</h1>

    
    //     <div className="flex gap-6 items-center">
    //       {navItems.map(item => (
    //         <Link
    //           key={item.path}
    //           to={item.path}
    //           className={`relative font-medium transition ${
    //             location.pathname === item.path
    //               ? "text-yellow-300"
    //               : "text-white hover:text-yellow-200"
    //           }`}
    //         >
    //           {item.label}
            
    //           {location.pathname === item.path && (
    //             <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-yellow-300 rounded-full" />
    //           )}
    //         </Link>
    //       ))}

       
    //       {session?.name && (
    //         <span className="ml-6 text-sm bg-white/20 px-3 py-1 rounded-full">
    //           User: {session.name}
    //         </span>
    //       )}
    //     </div>
    //   </div>
    // </nav>
    <nav className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 backdrop-blur-lg shadow-[0_4px_20px_rgba(0,255,255,0.08)] border-b border-cyan-400/20 sticky top-0 z-50">
  <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
    {/* Brand / Logo */}
    <h1 className="text-xl font-extrabold tracking-wide text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
      FlexHire
    </h1>

    {/* Navigation Links */}
    <div className="flex gap-8 items-center">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`relative font-medium transition-all duration-300 ${
            location.pathname === item.path
              ? "text-cyan-300"
              : "text-gray-300 hover:text-cyan-200"
          }`}
        >
          {item.label}
          {/* underline indicator for active link */}
          {location.pathname === item.path && (
            <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)] transition-all" />
          )}
        </Link>
      ))}

      {/* Candidate Name (only if available) */}
      {session?.name && (
        <span className="ml-6 text-sm bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-400/30 shadow-[0_0_6px_rgba(0,255,255,0.3)]">
          User: {session.name}
        </span>
      )}
    </div>
  </div>
</nav>


  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-950">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Interviewee />} />
            <Route path="/interviewer" element={<Interviewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
