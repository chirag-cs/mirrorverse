import axios from "axios";
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/generate-image";


export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}api/generate-image`, {
      prompt,
    });

    return response.data.image;
  } catch (err: any) {
    console.error("Frontend image generation error:", err.message);
    throw new Error("Failed to generate image");
  }
};
