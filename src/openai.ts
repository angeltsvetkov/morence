import OpenAI from 'openai';

// IMPORTANT: Replace with your actual OpenAI API key.
// It's recommended to use an environment variable for this.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "YOUR_OPENAI_API_KEY";

if (!apiKey || apiKey === "YOUR_OPENAI_API_KEY") {
  console.warn("OpenAI API key is not set. Please set VITE_OPENAI_API_KEY in your .env file.");
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // This is required for client-side usage
});

export default openai;
