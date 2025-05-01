# Mirrorverse — AI Reflections of You and Others 🪞🤖

**Mirrorverse** is a creative AI experience that allows users to generate, evolve, and interact with alternate versions of themselves or others. Describe a hypothetical version of yourself, and the AI will generate a vivid backstory, personality traits, tone, and a matching visual persona using generative image APIs.

---

## 🧠 Thought Process

The core idea behind Mirrorverse is to give users an imaginative space to explore alternate identities, fictional personas, or "what-if" versions of themselves powered by AI. Instead of static character generators, Mirrorverse lets you:

- Evolve personas with one click
- Chat with them
- See what they might look like
- Remix or build on AI suggestions

All personas persist client-side for a seamless, explorative UX.

---

## 🛠️ Tech Stack

| Area        | Technology            |
|-------------|------------------------|
| Frontend    | React + TypeScript (Vite) |
| Styling     | Tailwind CSS          |
| State Mgmt  | React hooks + `useReducer` |
| Backend     | Node.js + Express     |
| Image Gen   | DeepAI / StarryAI (via server API proxy) |
| AI Model    | Groq + LLaMA 3         |
| Storage     | LocalStorage (for saved personas) |

---

## 🚀 Project Structure

mirrorverse/ ├── client/ # React frontend ├── server/ # Express backend 


---

## 📦 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/chirag-cs/mirrorverse.git
cd mirrorverse

Backend Setup (server/)

cd server
pnpm install
# Create a .env file
touch .env

node index.js

Server will start on http://localhost:5000

Frontend Setup (client/)

cd client
pnpm install
pnpm run dev

The app will run at http://localhost:5173

💡 Features
🔮 Generate AI personas based on user input

🔁 Evolve them further to explore alternate versions

🖼️ See AI-generated images of personas

💬 Chat with your persona in a separate modal

💾 All personas persist in localStorage

🎭 Designed for mobile-first but responsive

⚡ Smooth transitions and feedback for generation/chat

🔒 Secure image generation via backend proxy (no client-side API key exposure)



⚔️ Challenges I Faced

1.) Multiple GitHub Accounts on One Machine
Needed to set up SSH config to manage separate personal and organization accounts.

2.) Persona Evolution State Management
Keeping track of evolving persona input vs original was tricky. Solved it by getting the previous prompt as a response and using it again.

3.) Image Generation via 3rd-Party APIs
CORS issues and API key protection required moving calls to Express backend and proxying them securely.

4.) Modal Chat Scrolling
Ensuring the chat modal always scrolls to latest message involved useRef and scrollIntoView() tweaks.

5.)Managing Smooth UX Across Async Operations
Carefully handled loading states and errors for AI generation, evolution, image fetch, and chat in a way that didn’t interrupt user flow.

6.) Polling for Image ID 
Carefully handled the polling of image rcursively and to wait for the Creation Id so i can fetch the image corresponding to that Id.