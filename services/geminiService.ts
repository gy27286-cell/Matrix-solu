import { GoogleGenAI } from "@google/genai";

// Note: In a real app, we might handle the key differently, but adhering to the prompt format:
// We expect process.env.API_KEY or we will handle the error gracefully if missing.
// Since we are running in a simulated browser env (React), process.env might not be populated 
// without a bundler setup. We will assume the user has a key or the environment is set up.

export const generateBikeDescription = async (
  brand: string, 
  model: string, 
  year: number, 
  condition: string
): Promise<string> => {
  
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return "Great condition bike, well maintained. Contact for details.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Write a short, catchy, sales-oriented description (max 50 words) for a used motorcycle. 
    Details: ${year} ${brand} ${model}. Condition: ${condition}. 
    Highlight reliability and style. Do not use hashtags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini generation failed", error);
    return "Great condition bike, well maintained. Contact for details.";
  }
};
