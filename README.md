# 🤖 AI Interview Platform 🚀

This project is an AI-powered interview platform designed to streamline the hiring process for technical roles. It automates resume parsing, generates relevant interview questions, evaluates candidate answers using AI, and provides a comprehensive assessment of their skills. This platform aims to make the interview process more efficient, objective, and data-driven.

## ✨ Key Features

- **Resume Parsing:** Extracts text and key information (name, email, phone) from PDF and DOCX resumes.
- **AI-Powered Question Generation:** Generates tailored interview questions based on the candidate's resume and the target role (Full-Stack Developer - React + Node.js).
- **Real-time Answer Evaluation:** Evaluates candidate answers using AI, providing scores, remarks, and a final summary.
- **Proctoring:** Monitors the interview environment for suspicious activity (e.g., window focus changes) and issues warnings.
- **Session Management:** Persists interview sessions, allowing candidates to resume interviews where they left off.
- **Candidate Management:** Stores candidate data, including answers, scores, and summaries, for easy access and comparison.
- **Interviewer Dashboard:** Provides a centralized view of all candidates, with search, sorting, and detailed information.
- **Redux Store Persistence:** Uses `redux-persist` to save the application state in local storage, ensuring data persistence across browser sessions.

## 🛠️ Tech Stack

- **Frontend:**
    - React
    - React Router DOM
    - Redux Toolkit
    - Redux Persist
    - Tailwind CSS
    - Framer Motion
- **Backend/AI:**
    - OpenAI API
- **Utilities:**
    - pdfjs-dist
    - mammoth
- **Build Tool:**
    - Vite
- **Languages:**
    - TypeScript
    - JavaScript

## 📦 Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (version >= 18)
- npm or yarn
- OpenAI API Key (set as an environment variable `VITE_OPENAI_API_KEY`)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/aroravittesh/ai-interview-assistant
    cd ai-interview-assistant
    ```

2.  Install dependencies:

    ```bash
    npm install # or yarn install
    ```

3.  Set up environment variables:

    Create a `.env` file in the root directory and add your OpenAI API key:

    ```
    VITE_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

### Running Locally

1.  Start the development server:

    ```bash
    npm run dev # or yarn dev
    ```

    This will start the Vite development server, and you can access the application in your browser at `http://localhost:5173` (or the port specified by Vite).

## 📂 Project Structure

```
├── .gitignore
├── README.md
├── index.html
├── package.json
├── public
│   └── vite.svg
├── src
│   ├── App.tsx
│   ├── app
│   │   ├── slices
│   │   │   ├── candidateSlice.ts
│   │   │   └── sessionSlice.ts
│   │   └── store.ts
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   └── Navbar.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── pages
│   │   ├── Interviewee.tsx
│   │   └── Interviewer.tsx
│   ├── utils
│   │   ├── interviewAI.ts
│   │   ├── openaiClient.ts
│   │   └── parseResume.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 💻 Usage

1.  **Interviewee:**
    - Upload your resume (PDF or DOCX).
    - Verify the extracted information (name, email, phone).
    - Answer the generated interview questions.
    - The AI will evaluate your answers and provide a final score and summary.

2.  **Interviewer:**
    - Access the interviewer dashboard to view a list of candidates.
    - Search and sort candidates based on name or score.
    - Select a candidate to view detailed information, including answers, scores, and summaries.






