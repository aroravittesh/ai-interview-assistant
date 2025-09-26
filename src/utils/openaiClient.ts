import OpenAI from "openai"

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // keep key in .env
  dangerouslyAllowBrowser: true, // since we’re calling from frontend
})

export default client
