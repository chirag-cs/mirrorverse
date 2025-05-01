
import { useState } from "react";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export interface MirrorPersona {
  title: string;
  backstory: string;
  tone: string;
  aesthetic: string;
  popCulture: string;
  scene: string;
  inputPrompt: string;
  imageUrl?: string;
}

export const useMirrorverseAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState<string>("");

  const generatePersonaStreamed = async (userInput: string): Promise<MirrorPersona> => {
    setLoading(true);
    setError(null);
    setStreamedText("");

    const prompt = `
You are a poetic narrative AI that creates vivid and emotionally rich mirror personas.
Respond ONLY in a valid JSON object with the following fields, and nothing else.
Make sure to include all fields and escape characters properly.

{
  "title": "<short mysterious name>",
  "backstory": "<emotionally and psychologically rich backstory>",
  "tone": "<core personality, e.g. stoic, chaotic, seductive>",
  "aesthetic": "<visual vibe: face, clothes, aura>",
  "popCulture": "<related pop culture or cinematic icons>",
  "scene": "<cinematic scene they would be found in>",
  "inputPrompt": "<user input>",
}

Input: "${userInput}"
`;

    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: "You are a poetic AI that generates vivid fictional personas in structured JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.9,
          stream: true,
        }),
      });

      if (!res.body) throw new Error("No response body from stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim().startsWith("data:"));

        for (const line of lines) {
          const json = line.replace("data: ", "");
          if (json === "[DONE]") continue;

          try {
            const parsed = JSON.parse(json);
            const contentChunk = parsed.choices?.[0]?.delta?.content;
            if (contentChunk) {
              fullText += contentChunk;
              setStreamedText((prev) => prev + contentChunk);
            }
          } catch (e) {
            console.warn("Streaming parse error:", e);
          }
        }
      }

      const personaData = JSON.parse(fullText);

      const persona: MirrorPersona = {
        title: personaData.title || "Untitled",
        backstory: personaData.backstory || "No backstory provided.",
        tone: personaData.tone || "No tone provided.",
        aesthetic: personaData.aesthetic || "No aesthetic provided.",
        popCulture: personaData.popCulture || "No references provided.",
        scene: personaData.scene || "No scene provided.",
        inputPrompt: userInput || "No input provided.",
      };

    
      return persona;
    } catch (err: any) {
      console.error("Streaming error:", err);
      setError("Failed to stream persona.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

 
  const generateImageFromPersona = async (prompt: string): Promise<string> => {
    try {
      
      const createRes = await fetch("http://localhost:5000/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const imageUrl = await createRes.json();

      console.log("Image URL:", imageUrl);
      return imageUrl.imageUrl || "";

    } catch (error) {
      console.error("Error generating image:", error);
      return "";
    }
  };




  return {
    generatePersonaStreamed,
    streamedText,
    loading,
    error,
    generateImageFromPersona
  };
};


