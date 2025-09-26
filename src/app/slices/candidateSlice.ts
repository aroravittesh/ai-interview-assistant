import { createSlice } from "@reduxjs/toolkit"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  answers: { question: string; answer: string; score?: number }[]
  finalScore?: number
  summary?: string
}

interface CandidateState {
  list: Candidate[]
}

const initialState: CandidateState = {
  list: [],
}

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      state.list.push(action.payload as Candidate)
    },
    updateCandidate: (state, action) => {
      const updated = action.payload as Candidate
      const index = state.list.findIndex(c => c.id === updated.id)
      if (index !== -1) {
        state.list[index] = updated
      }
    },
  },
})

export const { addCandidate, updateCandidate } = candidateSlice.actions
export default candidateSlice.reducer
