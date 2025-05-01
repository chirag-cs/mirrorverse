import axios from "axios";

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post("http://localhost:4000/api/generate-image", {
      prompt,
    });

    return response.data.image;
  } catch (err: any) {
    console.error("Frontend image generation error:", err.message);
    throw new Error("Failed to generate image");
  }
};
