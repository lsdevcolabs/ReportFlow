import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    console.warn("No Gemini API keys configured. Ensure they are set in the environment.");
    // Return empty so the runtime can handle it, or throw.
    // It's safer to throw here because it's called inside generateWithGemini
    throw new Error("No Gemini API keys configured. Set GEMINI_API_KEY_1, _2, _3 in environment.");
  }
  return keys;
}

let currentKeyIndex = 0;

export async function generateWithGemini(prompt: string): Promise<string> {
  const apiKeys = getApiKeys();
  const startIndex = currentKeyIndex;

  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const keyIndex = (startIndex + attempt) % apiKeys.length;
    const apiKey = apiKeys[keyIndex];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.7,
          topP: 0.9,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from Gemini");
      }

      currentKeyIndex = (keyIndex + 1) % apiKeys.length;

      return text.trim();

    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.toLowerCase().includes("quota") ||
        error?.message?.toLowerCase().includes("rate limit") ||
        error?.message?.toLowerCase().includes("resource_exhausted");

      if (isRateLimit && attempt < apiKeys.length - 1) {
        console.warn(
          `[Gemini] Key ${keyIndex + 1} rate limited (429). Trying key ${((keyIndex + 1) % apiKeys.length) + 1}...`
        );
        continue;
      }

      if (attempt === apiKeys.length - 1) {
        console.error("[Gemini] All API keys exhausted or encountered errors:", error?.message);
        throw new Error("AI generation temporarily unavailable. All API keys are at their limit. Please try again later.");
      }

      throw error;
    }
  }

  throw new Error("AI generation failed unexpectedly.");
}
