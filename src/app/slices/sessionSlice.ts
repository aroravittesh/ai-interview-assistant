import { createSlice } from "@reduxjs/toolkit"

interface QA {
  q: string
  a: string
}

interface SessionState {
  inProgress: boolean
  name: string
  email: string
  phone: string
  questions: any[]
  currentQ: number
  timeLeft: number
  answers: QA[]
  warnings: number
}

const initialState: SessionState = {
  inProgress: false,
  name: "",
  email: "",
  phone: "",
  questions: [],
  currentQ: 0,
  timeLeft: 0,
  answers: [],
  warnings: 0,
}

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    startSession(action: { payload: Omit<SessionState, "inProgress"> }) {
      return { ...action.payload, inProgress: true }
    },
    updateSession(state, action: { payload: Partial<SessionState> }) {
      return { ...state, ...action.payload }
    },
    updateWarnings(state, action: { payload: number }) {
      state.warnings = action.payload
    },
    clearSession() {
      return initialState
    },
  },
})

export const { startSession, updateSession, updateWarnings, clearSession } = sessionSlice.actions
export default sessionSlice.reducer
