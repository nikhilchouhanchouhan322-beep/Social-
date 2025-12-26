
import { GoogleGenAI } from "@google/genai";

const API_KEY = (process.env.API_KEY || '');
const ai = new GoogleGenAI({ apiKey: API_KEY });

const GeminiService = {
  /**
   * Generates a poetic "Golden Thought" for the user's feed.
   */
  async generateGoldThought(): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a single, short, profound, and luxurious social media post (max 20 words) about gold, brilliance, or excellence. No hashtags.",
        config: {
          temperature: 0.9,
          topP: 0.95,
        }
      });
      return response.text?.trim() || "Silence is golden, but brilliance is the true currency of the universe.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "True brilliance cannot be forced; it radiates from within.";
    }
  }
};

export default GeminiService;
