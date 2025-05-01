import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const STARRY_API_KEY = process.env.VITE_STARRYAI_API_KEY;
const VITE_GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";


const clientDistPath = path.join(__dirname, "client-dist");
app.use(express.static(clientDistPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// app.get("*", (req, res) => {
//   res.sendFile(path.join(clientDistPath, "index.html"));
// });

app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;

  try {
    const creationResponse = await axios.request({
      method: 'POST',
      url: 'https://api.starryai.com/creations/',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-API-Key': STARRY_API_KEY
      },
      data: {
        model: 'lyra',
        aspectRatio: 'square',
        highResolution: false,
        images: 1,
        steps: 20,
        prompt: prompt,
      }
    });

    let creationId = creationResponse.data?.id;

    
    if (!creationId) {
      console.log('creationId missing, retrying...');
      creationId = await waitForCreationId(prompt);
    }

    if (!creationId) {
      return res.status(500).json({ error: 'Failed to obtain creation ID' });
    }

    const imageUrl = await pollUntilImageReady(creationId);

    if (!imageUrl) {
      return res.status(504).json({ error: 'Image generation timed out.' });
    }

    res.json({ imageUrl });

  } catch (err) {
    console.error('Error creating image:', err.message);
    res.status(500).json({ error: 'Error during image generation' });
  }
});

async function waitForCreationId(prompt) {
  const maxAttempts = 5;
  const delay = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Attempt ${i + 1} to fetch creationId...`);

    try {
      const response = await axios.request({
        method: 'POST',
        url: 'https://api.starryai.com/creations/',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'X-API-Key': STARRY_API_KEY
        },
        data: {
          model: 'lyra',
          aspectRatio: 'square',
          highResolution: false,
          images: 1,
          steps: 20,
          prompt: prompt,
        }
      });

      const creationId = response.data?.id;
      if (creationId) return creationId;

    } catch (err) {
      console.log('Retrying creation ID...');
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return null;
}

async function pollUntilImageReady(creationId) {
  const maxAttempts = 20;
  const interval = 3000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.request({
        method: 'GET',
        url: `https://api.starryai.com/creations/${creationId}`,
        headers: {
          accept: 'application/json',
          'X-API-Key': STARRY_API_KEY
        }
      });

      const data = response.data;
      const image = data?.images?.[0];
      if (data.status === 'completed' && image?.url) {
        return image.url;
      }
    } catch (e) {
      console.log(`Polling attempt ${attempt + 1} failed`);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return null;
}

app.post("/chat", async (req, res) => {
  const { personaDescription, chatHistory } = req.body;

  if (!chatHistory || !personaDescription) {
    return res
      .status(400)
      .json({ error: "Missing chatHistory or personaDescription" });
  }

  try {
    const formattedHistory = chatHistory
      .map((msg) =>
        msg.sender === "user"
          ? `User: ${msg.text}`
          : `Persona: ${msg.text}`
      )
      .join("\n");

    const fullPrompt = `
You are now roleplaying as a character with the following persona:
${personaDescription}

Below is the conversation so far. Continue it by replying **in character** as the persona.

${formattedHistory}
Persona:
`;

    const aiResponse = await axios.post(
      GROQ_ENDPOINT,
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a character AI. Only reply as the persona. Keep responses concise — around 4 lines max.",
          },
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        temperature: 0.9,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VITE_GROQ_API_KEY}`,
        },
      }
    );

    const personaReply = aiResponse.data.choices[0].message.content.trim();
    res.json({ reply: personaReply });
  } catch (error) {
    console.error("Chat error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
