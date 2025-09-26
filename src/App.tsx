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
    <nav className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Brand / Logo */}
        <h1 className="text-lg font-bold tracking-wide">FlexHire</h1>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative font-medium transition ${
                location.pathname === item.path
                  ? "text-yellow-300"
                  : "text-white hover:text-yellow-200"
              }`}
            >
              {item.label}
              {/* underline indicator for active link */}
              {location.pathname === item.path && (
                <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-yellow-300 rounded-full" />
              )}
            </Link>
          ))}

          {/* Candidate Name (only if available) */}
          {session?.name && (
            <span className="ml-6 text-sm bg-white/20 px-3 py-1 rounded-full">
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
      <div className="min-h-screen flex flex-col">
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
